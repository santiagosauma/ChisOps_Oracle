package com.springboot.MyTodoList.bot;

import java.util.ArrayList;
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
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Message;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.api.objects.User;

import com.springboot.MyTodoList.controller.TaskBotController;
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
    public void testCreateTaskByVoicePrompt() throws Exception {
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

        when(message.getText()).thenReturn("🎤 Crear tarea por voz");
        controller.onUpdateReceived(update);

        verify(controller, atLeastOnce())
            .execute(argThat((SendMessage sm) -> 
                sm.getText().contains("Creación de tarea por voz") || 
                sm.getText().contains("graba una nota de voz") ||
                sm.getText().contains("Título") ||
                sm.getText().contains("Descripción")
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
}