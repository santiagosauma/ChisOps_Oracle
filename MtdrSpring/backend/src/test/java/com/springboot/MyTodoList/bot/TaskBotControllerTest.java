package com.springboot.MyTodoList.bot;

import com.springboot.MyTodoList.model.Usuario;
import com.springboot.MyTodoList.service.SprintService;
import com.springboot.MyTodoList.service.TareaService;
import com.springboot.MyTodoList.service.UsuarioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.doReturn;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.api.objects.User;
import org.telegram.telegrambots.meta.api.objects.Message;
import java.util.Optional;

import com.springboot.MyTodoList.controller.TaskBotController;

@ExtendWith(MockitoExtension.class)
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
        usr.setFirstName("John");
        usr.setLastName("Doe");
        usr.setEmail("john@example.com");
        when(usuarioService.findByTelegramUsername(USERNAME)).thenReturn(Optional.of(usr));
        when(usuarioService.authenticate("john@example.com", "secret")).thenReturn(usr);

        when(message.hasText()).thenReturn(true);
        when(message.getText()).thenReturn("/login");
        controller.onUpdateReceived(update);

        when(message.getText()).thenReturn("secret");
        controller.onUpdateReceived(update);

        verify(controller, atLeastOnce())
            .execute(argThat((SendMessage sm) -> sm.getText().contains("✅ Inicio de sesión exitoso. Bienvenido/a, John")));
    }

    @Test
    public void testCreateTaskFlow() throws Exception {
        Usuario usr = new Usuario();
        usr.setFirstName("John");
        usr.setLastName("Doe");
        usr.setEmail("john@example.com");
        usr.setUserId(1);
        when(usuarioService.findByTelegramUsername(USERNAME)).thenReturn(Optional.of(usr));
        when(usuarioService.authenticate("john@example.com", "secret")).thenReturn(usr);

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
        usr.setFirstName("John");
        usr.setLastName("Doe");
        usr.setEmail("john@example.com");
        when(usuarioService.findByTelegramUsername(USERNAME)).thenReturn(Optional.of(usr));
        when(usuarioService.authenticate("john@example.com", "secret")).thenReturn(usr);

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
}