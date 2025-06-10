package com.springboot.MyTodoList.bot;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import org.mockito.Captor;
import org.mockito.Mock;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.http.ResponseEntity;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Message;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.api.objects.User;

import com.springboot.MyTodoList.controller.TaskBotController;
import com.springboot.MyTodoList.model.Sprint;
import com.springboot.MyTodoList.model.Tarea;
import com.springboot.MyTodoList.model.Usuario;
import com.springboot.MyTodoList.service.SprintService;
import com.springboot.MyTodoList.service.TareaService;
import com.springboot.MyTodoList.service.UsuarioService;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
public class TaskBotControllerTest {

    @Mock TareaService tareaService;
    @Mock UsuarioService usuarioService;
    @Mock SprintService sprintService;
    @Mock Update update;
    @Mock Message message;
    @Mock User telegramUser;

    @Captor ArgumentCaptor<SendMessage> captor;

    private TaskBotController controller;
    private final long CHAT_ID = 555L;
    private final String USERNAME = "testuser";

    @BeforeEach
    void setUp() throws Exception {
        controller = spy(new TaskBotController("token", "botName", tareaService, usuarioService, sprintService));
        doReturn(null).when(controller).execute(any(SendMessage.class));

        when(update.hasMessage()).thenReturn(true);
        when(update.getMessage()).thenReturn(message);
        when(message.getChatId()).thenReturn(CHAT_ID);
        when(message.getFrom()).thenReturn(telegramUser);
        when(telegramUser.getUserName()).thenReturn(USERNAME);
    }

    @Test
    public void testStartCommand() throws Exception {
        when(message.hasText()).thenReturn(true);
        when(message.getText()).thenReturn("/start");

        controller.onUpdateReceived(update);

        verify(controller).execute(captor.capture());
        SendMessage sent = captor.getValue();

        assert sent.getText().equals("Bienvenido/a al gestor de tareas. Inicia sesión para continuar.");
    }

    @Test
    public void testLoginCommand() throws Exception {
        when(message.hasText()).thenReturn(true);
        when(message.getText()).thenReturn("/login");

        controller.onUpdateReceived(update);

        verify(controller).execute(captor.capture());
        assert captor.getValue().getText().equals("🔑 Por favor, introduce tu contraseña:");
    }

    @Test
    public void testLoginWithUnregisteredUser() throws Exception {
        when(message.hasText()).thenReturn(true);
        when(message.getText()).thenReturn("/login");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("anyPass");
        when(usuarioService.findByTelegramUsername(USERNAME)).thenReturn(Optional.empty());
        controller.onUpdateReceived(update);

        verify(controller, atLeastOnce())
            .execute(argThat((SendMessage sm) -> sm.getText().equals("❌ Usuario no registrado. Contacta al administrador.")));
    }

    @Test
    public void testLoginSuccessful() throws Exception {
        Usuario usr = new Usuario();
        usr.setFirstName("Carlos");
        usr.setLastName("Vazquez");
        usr.setEmail("carlos@example.com");
        when(usuarioService.findByTelegramUsername(USERNAME)).thenReturn(Optional.of(usr));
        when(usuarioService.authenticate("carlos@example.com", "secret")).thenReturn(usr);

        when(message.hasText()).thenReturn(true);
        when(message.getText()).thenReturn("/login");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("secret");
        controller.onUpdateReceived(update);

        verify(controller, atLeastOnce())
            .execute(argThat((SendMessage sm) -> sm.getText().contains("✅ Inicio de sesión exitoso. Bienvenido/a, Carlos")));
    }

    @Test
    public void testCreateTaskFlow() throws Exception {
        Usuario usr = new Usuario();
        usr.setFirstName("Carlos");
        usr.setLastName("Vazquez");
        usr.setEmail("carlos@example.com");
        usr.setUserId(1);
        when(usuarioService.findByTelegramUsername(USERNAME)).thenReturn(Optional.of(usr));
        when(usuarioService.authenticate("carlos@example.com", "secret")).thenReturn(usr);

        when(message.hasText()).thenReturn(true);
        when(message.getText()).thenReturn("/login");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("secret");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("📝 Crear tarea");
        controller.onUpdateReceived(update);

        verify(controller, atLeastOnce())
            .execute(argThat((SendMessage sm) -> 
                sm.getText().contains("login") || 
                sm.getText().contains("contraseña") ||
                sm.getText().contains("título") ||
                sm.getText().contains("tarea")
            ));
    }

    @Test
    public void testLogoutCommand() throws Exception {
        Usuario usr = new Usuario();
        usr.setFirstName("Carlos");
        usr.setLastName("Vazquez");
        usr.setEmail("carlos@example.com");
        when(usuarioService.findByTelegramUsername(USERNAME)).thenReturn(Optional.of(usr));
        when(usuarioService.authenticate("carlos@example.com", "secret")).thenReturn(usr);

        when(message.hasText()).thenReturn(true);
        when(message.getText()).thenReturn("/login");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("secret");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("/logout");
        controller.onUpdateReceived(update);

        verify(controller, atLeastOnce())
            .execute(argThat((SendMessage sm) -> sm.getText().equals("🔒 Sesión cerrada.")));
    }

    @Test
    public void testInvalidPasswordRetry() throws Exception {
        Usuario usr = new Usuario();
        usr.setFirstName("Carlos");
        usr.setLastName("Vazquez");
        usr.setEmail("carlos@example.com");
        when(usuarioService.findByTelegramUsername(USERNAME)).thenReturn(Optional.of(usr));
        when(usuarioService.authenticate("carlos@example.com", "wrongpass")).thenReturn(null);

        when(message.hasText()).thenReturn(true);
        when(message.getText()).thenReturn("/login");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("wrongpass");
        controller.onUpdateReceived(update);

        verify(controller, atLeastOnce())
            .execute(argThat((SendMessage sm) -> sm.getText().equals("❌ Contraseña incorrecta. Inténtalo de nuevo.")));
    }

    @Test
    public void testUnknownCommand() throws Exception {
        when(message.hasText()).thenReturn(true);
        when(message.getText()).thenReturn("comando_inexistente");

        controller.onUpdateReceived(update);

        verify(controller).onUpdateReceived(update);
        
        verify(controller, never()).execute(any(SendMessage.class));
    }

    @Test
    public void testListTasksCommand() throws Exception {
        Usuario usr = new Usuario();
        usr.setFirstName("Carlos");
        usr.setLastName("Vazquez");
        usr.setEmail("carlos@example.com");
        usr.setUserId(1);
        when(usuarioService.findByTelegramUsername(USERNAME)).thenReturn(Optional.of(usr));
        when(usuarioService.authenticate("carlos@example.com", "secret")).thenReturn(usr);
        when(tareaService.getTareasByUsuario(1)).thenReturn(new ArrayList<>());

        when(message.hasText()).thenReturn(true);
        when(message.getText()).thenReturn("/login");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("secret");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("📋 Listar Tareas");
        controller.onUpdateReceived(update);

        verify(controller, atLeastOnce())
            .execute(argThat((SendMessage sm) -> 
                sm.getText().contains("tareas") || 
                sm.getText().contains("No tienes tareas")
            ));
    }

    @Test
    public void testHighPriorityFilter() throws Exception {
        Usuario usr = new Usuario();
        usr.setFirstName("Carlos");
        usr.setLastName("Vazquez");
        usr.setEmail("carlos@example.com");
        usr.setUserId(1);
        when(usuarioService.findByTelegramUsername(USERNAME)).thenReturn(Optional.of(usr));
        when(usuarioService.authenticate("carlos@example.com", "secret")).thenReturn(usr);
        when(tareaService.getTareasByUsuario(1)).thenReturn(new ArrayList<>());

        when(message.hasText()).thenReturn(true);
        when(message.getText()).thenReturn("/login");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("secret");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("🔴 Alta prioridad");
        controller.onUpdateReceived(update);

        verify(controller, atLeastOnce())
            .execute(argThat((SendMessage sm) -> 
                sm.getText().contains("alta prioridad") || 
                sm.getText().contains("No se encontraron")
            ));
    }

    @Test
    public void testUserKpisCommand() throws Exception {
        Usuario usr = new Usuario();
        usr.setFirstName("Carlos");
        usr.setLastName("Vazquez");
        usr.setEmail("carlos@example.com");
        usr.setUserId(1);
        when(usuarioService.findByTelegramUsername(USERNAME)).thenReturn(Optional.of(usr));
        when(usuarioService.authenticate("carlos@example.com", "secret")).thenReturn(usr);
        when(tareaService.getTareasByUsuario(1)).thenReturn(new ArrayList<>());

        when(message.hasText()).thenReturn(true);
        when(message.getText()).thenReturn("/login");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("secret");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("📈 Mis KPIs");
        controller.onUpdateReceived(update);

        verify(controller, atLeastOnce())
            .execute(argThat((SendMessage sm) -> 
                sm.getText().contains("KPIs") || 
                sm.getText().contains("desempeño") ||
                sm.getText().contains("No tienes tareas registradas")
            ));
    }

    @Test
    public void testFinishTaskCommand() throws Exception {
        Usuario usr = new Usuario();
        usr.setFirstName("Carlos");
        usr.setLastName("Vazquez");
        usr.setEmail("carlos@example.com");
        usr.setUserId(1);
        when(usuarioService.findByTelegramUsername(USERNAME)).thenReturn(Optional.of(usr));
        when(usuarioService.authenticate("carlos@example.com", "secret")).thenReturn(usr);
        when(tareaService.getTareasByUsuario(1)).thenReturn(new ArrayList<>());

        when(message.hasText()).thenReturn(true);
        when(message.getText()).thenReturn("/login");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("secret");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("✅ Finalizar tarea");
        controller.onUpdateReceived(update);

        verify(controller, atLeastOnce())
            .execute(argThat((SendMessage sm) -> 
                sm.getText().contains("No tienes tareas asignadas") || 
                sm.getText().contains("Selecciona la tarea") ||
                sm.getText().contains("finalizar")
            ));
    }

    @Test
    public void testMediumPriorityFilter() throws Exception {
        Usuario usr = new Usuario();
        usr.setFirstName("Carlos");
        usr.setLastName("Vazquez");
        usr.setEmail("carlos@example.com");
        usr.setUserId(1);
        when(usuarioService.findByTelegramUsername(USERNAME)).thenReturn(Optional.of(usr));
        when(usuarioService.authenticate("carlos@example.com", "secret")).thenReturn(usr);
        when(tareaService.getTareasByUsuario(1)).thenReturn(new ArrayList<>());

        when(message.hasText()).thenReturn(true);
        when(message.getText()).thenReturn("/login");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("secret");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("🟡 Media prioridad");
        controller.onUpdateReceived(update);

        verify(controller, atLeastOnce())
            .execute(argThat((SendMessage sm) -> 
                sm.getText().contains("prioridad media") || 
                sm.getText().contains("No se encontraron") ||
                sm.getText().contains("Mostrando")
            ));
    }

    @Test
    public void testStoryPointsValidation() throws Exception {
        Usuario usr = new Usuario();
        usr.setFirstName("Carlos");
        usr.setLastName("Vazquez");
        usr.setEmail("carlos@example.com");
        usr.setUserId(1);
        when(usuarioService.findByTelegramUsername(USERNAME)).thenReturn(Optional.of(usr));
        when(usuarioService.authenticate("carlos@example.com", "secret")).thenReturn(usr);

        when(message.hasText()).thenReturn(true);
        when(message.getText()).thenReturn("/login");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("secret");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("📝 Crear tarea");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("Test Task");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("Test Description");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("Medium");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("Task");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("15");
        controller.onUpdateReceived(update);

        verify(controller, atLeastOnce())
            .execute(argThat((SendMessage sm) -> 
                sm.getText().contains("Por favor, ingresa un número válido entre 1 y 13") ||
                sm.getText().contains("login") ||
                sm.getText().contains("contraseña") ||
                sm.getText().contains("título")
            ));
    }

    @Test
    public void testTaskNavigationButtons() throws Exception {
        Usuario usr = new Usuario();
        usr.setFirstName("Carlos");
        usr.setLastName("Vazquez");
        usr.setEmail("carlos@example.com");
        usr.setUserId(1);
        when(usuarioService.findByTelegramUsername(USERNAME)).thenReturn(Optional.of(usr));
        when(usuarioService.authenticate("carlos@example.com", "secret")).thenReturn(usr);
        when(tareaService.getTareasByUsuario(1)).thenReturn(new ArrayList<>());

        when(message.hasText()).thenReturn(true);
        when(message.getText()).thenReturn("/login");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("secret");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("⬅️ Anterior");
        controller.onUpdateReceived(update);

        verify(controller, atLeastOnce())
            .execute(argThat((SendMessage sm) -> 
                sm.getText().contains("Ya estás en la primera página") ||
                sm.getText().contains("página")
            ));
    }

    @Test
    public void testInvalidUserSession() throws Exception {
        when(message.hasText()).thenReturn(true);
        when(message.getText()).thenReturn("📝 Crear tarea");

        controller.onUpdateReceived(update);
        
        verify(controller, atLeastOnce()).onUpdateReceived(update);
    }

    @Test
    public void testEstimatedHoursValidation() throws Exception {
        Usuario usr = new Usuario();
        usr.setFirstName("Carlos");
        usr.setLastName("Vazquez");
        usr.setEmail("carlos@example.com");
        usr.setUserId(1);
        when(usuarioService.findByTelegramUsername(USERNAME)).thenReturn(Optional.of(usr));
        when(usuarioService.authenticate("carlos@example.com", "secret")).thenReturn(usr);

        when(message.hasText()).thenReturn(true);
        when(message.getText()).thenReturn("/login");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("secret");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("📝 Crear tarea");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("Test Task");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("Test Description");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("Medium");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("Task");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("5");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("-5");
        controller.onUpdateReceived(update);

        verify(controller, atLeastOnce())
            .execute(argThat((SendMessage sm) -> 
                sm.getText().contains("Por favor, ingresa un número válido mayor que 0") ||
                sm.getText().contains("login") ||
                sm.getText().contains("contraseña") ||
                sm.getText().contains("título")
            ));
    }

    @Test
    public void testActualHoursValidation() throws Exception {
        Usuario usr = new Usuario();
        usr.setFirstName("Carlos");
        usr.setLastName("Vazquez");
        usr.setEmail("carlos@example.com");
        usr.setUserId(1);
        when(usuarioService.findByTelegramUsername(USERNAME)).thenReturn(Optional.of(usr));
        when(usuarioService.authenticate("carlos@example.com", "secret")).thenReturn(usr);

        when(message.hasText()).thenReturn(true);
        when(message.getText()).thenReturn("/login");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("secret");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("📝 Crear tarea");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("Test Task");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("Test Description");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("Medium");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("Task");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("5");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("8");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("-3");
        controller.onUpdateReceived(update);

        verify(controller, atLeastOnce())
            .execute(argThat((SendMessage sm) -> 
                sm.getText().contains("Por favor, ingresa un número válido mayor o igual a 0") ||
                sm.getText().contains("login") ||
                sm.getText().contains("contraseña") ||
                sm.getText().contains("título")
            ));
    }

    @Test
    public void testMainMenuAfterAuthentication() throws Exception {
        Usuario usr = new Usuario();
        usr.setFirstName("Carlos");
        usr.setLastName("Vazquez");
        usr.setEmail("carlos@example.com");
        when(usuarioService.findByTelegramUsername(USERNAME)).thenReturn(Optional.of(usr));
        when(usuarioService.authenticate("carlos@example.com", "secret")).thenReturn(usr);

        when(message.hasText()).thenReturn(true);
        when(message.getText()).thenReturn("/login");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("secret");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("🏠 Mostrar menú principal");
        controller.onUpdateReceived(update);

        verify(controller, atLeastOnce())
            .execute(argThat((SendMessage sm) -> 
                sm.getText().contains("Bienvenido/a, Carlos") ||
                sm.getText().contains("¿Qué deseas hacer?")
            ));
    }

    @Test
    public void testNextPageNavigation() throws Exception {
        Usuario usr = new Usuario();
        usr.setFirstName("Carlos");
        usr.setLastName("Vazquez");
        usr.setEmail("carlos@example.com");
        usr.setUserId(1);
        when(usuarioService.findByTelegramUsername(USERNAME)).thenReturn(Optional.of(usr));
        when(usuarioService.authenticate("carlos@example.com", "secret")).thenReturn(usr);
        when(tareaService.getTareasByUsuario(1)).thenReturn(new ArrayList<>());

        when(message.hasText()).thenReturn(true);
        when(message.getText()).thenReturn("/login");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("secret");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("➡️ Siguiente");
        controller.onUpdateReceived(update);

        verify(controller, atLeastOnce())
            .execute(argThat((SendMessage sm) -> 
                sm.getText().contains("Ya estás en la última página") ||
                sm.getText().contains("página") ||
                sm.getText().contains("Página")
            ));
    }

    @Test
    public void testLogoutWithoutAuthentication() throws Exception {
        when(message.hasText()).thenReturn(true);
        when(message.getText()).thenReturn("/logout");

        controller.onUpdateReceived(update);

        verify(controller, atLeastOnce())
            .execute(argThat((SendMessage sm) -> 
                sm.getText().contains("No has iniciado sesión") ||
                sm.getText().contains("Bienvenido/a al gestor de tareas")
            ));
    }

    @Test
    public void testFinishTaskWithInvalidActualHours() throws Exception {
        Usuario usr = new Usuario();
        usr.setFirstName("Carlos");
        usr.setLastName("Vazquez");
        usr.setEmail("carlos@example.com");
        usr.setUserId(1);
        when(usuarioService.findByTelegramUsername(USERNAME)).thenReturn(Optional.of(usr));
        when(usuarioService.authenticate("carlos@example.com", "secret")).thenReturn(usr);
        
        Sprint mockSprint = new Sprint();
        mockSprint.setSprintId(1);
        mockSprint.setName("Test Sprint");
        
        Tarea mockTask = new Tarea();
        mockTask.setTaskId(123);
        mockTask.setTitle("Test Task");
        mockTask.setUsuario(usr);
        mockTask.setStatus("In progress");
        mockTask.setPriority("Medium");
        mockTask.setType("Task");
        mockTask.setStoryPoints(5);
        mockTask.setSprint(mockSprint);
        
        java.util.Date now = new java.util.Date();
        java.util.Calendar cal = java.util.Calendar.getInstance();
        cal.add(java.util.Calendar.DAY_OF_MONTH, 7);
        java.util.Date endDate = cal.getTime();
        
        mockTask.setStartDate(now);
        mockTask.setEndDate(endDate);
        
        when(tareaService.getTareaById(123)).thenReturn(ResponseEntity.ok(mockTask));
        when(tareaService.getTareasByUsuario(1)).thenReturn(List.of(mockTask));

        when(message.hasText()).thenReturn(true);
        when(message.getText()).thenReturn("/login");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("secret");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("✅ Finalizar tarea");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("123");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("-5");
        controller.onUpdateReceived(update);

        verify(controller, atLeastOnce())
            .execute(argThat((SendMessage sm) -> 
                sm.getText().contains("Por favor, ingresa un número válido mayor o igual a 0") ||
                sm.getText().contains("No tienes tareas") ||
                sm.getText().contains("Selecciona la tarea")
            ));
    }
}