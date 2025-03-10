package com.springboot.MyTodoList.controller;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardRemove;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardRow;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

import com.springboot.MyTodoList.model.Sprint;
import com.springboot.MyTodoList.model.Tarea;
import com.springboot.MyTodoList.model.Usuario;
import com.springboot.MyTodoList.service.SprintService;
import com.springboot.MyTodoList.service.TareaService;
import com.springboot.MyTodoList.service.UsuarioService;
import com.springboot.MyTodoList.util.BotCommands;
import com.springboot.MyTodoList.util.BotLabels;
import com.springboot.MyTodoList.util.BotMessages;

public class TaskBotController extends TelegramLongPollingBot {

    private static final Logger logger = LoggerFactory.getLogger(TaskBotController.class);
    
    private TareaService tareaService;
    private UsuarioService usuarioService;
    private SprintService sprintService;
    private String botName;
    
    // Mapa para almacenar el estado de la conversación de cada usuario
    private Map<Long, UserTaskSession> userSessions = new HashMap<>();
    
    /**
     * Clase para mantener el estado de la sesión de creación de tareas para cada usuario
     */
    private static class UserTaskSession {
        private enum CreationState {
            NONE, WAITING_TITLE, WAITING_DESCRIPTION, WAITING_PRIORITY, 
            WAITING_TYPE, WAITING_USER, WAITING_SPRINT, WAITING_POINTS
        }
        
        private CreationState state = CreationState.NONE;
        private Tarea currentTask = new Tarea();
        private List<Usuario> availableUsers;
        private List<Sprint> availableSprints;
        
        public UserTaskSession() {
            // Inicializar la tarea con valores predeterminados
            currentTask.setDeleted(0);
            // Establecer fechas predeterminadas (hoy para inicio, hoy + 7 días para fin)
            Calendar cal = Calendar.getInstance();
            currentTask.setStartDate(cal.getTime());
            cal.add(Calendar.DAY_OF_MONTH, 7);
            currentTask.setEndDate(cal.getTime());
            // Estado predeterminado
            currentTask.setStatus("Pendiente");
        }
    }

    /**
     * Constructor del controlador
     */
    public TaskBotController(String botToken, String botName, 
                           TareaService tareaService,
                           UsuarioService usuarioService,
                           SprintService sprintService) {
        super(botToken);
        logger.info("Bot Token: " + botToken);
        logger.info("Bot name: " + botName);
        this.botName = botName;
        this.tareaService = tareaService;
        this.usuarioService = usuarioService;
        this.sprintService = sprintService;
    }

    @Override
    public void onUpdateReceived(Update update) {
        if (update.hasMessage() && update.getMessage().hasText()) {
            String messageText = update.getMessage().getText();
            long chatId = update.getMessage().getChatId();
            logger.debug("Mensaje recibido: " + messageText);

            
            // Obtener o crear una sesión para este usuario
            UserTaskSession session = userSessions.getOrDefault(chatId, new UserTaskSession());
            userSessions.put(chatId, session);

            logger.debug("-------------------------Estado de la sesión: " + session.state);
            logger.debug("-------------------------Estado de la sesión: " + session.state);
            logger.debug("-------------------------Estado de la sesión: " + session.state);
            
            if (messageText.equals(BotCommands.START_COMMAND.getCommand()) 
                    || messageText.equals(BotLabels.SHOW_MAIN_SCREEN.getLabel())) {
                session.state = UserTaskSession.CreationState.NONE;
                showMainMenu(chatId);
                
            } else if (messageText.equals(BotLabels.CREATE_TASK.getLabel())) {
                
                // Iniciar el proceso de creación de tarea
                session.state = UserTaskSession.CreationState.WAITING_TITLE;
                sendMessageWithKeyboardRemove(chatId, BotMessages.ENTER_TASK_TITLE.getMessage());

                
            } else if (session.state == UserTaskSession.CreationState.WAITING_TITLE) {
                
                session.currentTask.setTitle(messageText);
                session.state = UserTaskSession.CreationState.WAITING_DESCRIPTION;
                sendMessageWithKeyboardRemove(chatId, BotMessages.ENTER_TASK_DESCRIPTION.getMessage());
                
            } else if (session.state == UserTaskSession.CreationState.WAITING_DESCRIPTION) {
                
                session.currentTask.setDescription(messageText);
                session.state = UserTaskSession.CreationState.WAITING_PRIORITY;
                showPriorityOptions(chatId);
                
            } else if (session.state == UserTaskSession.CreationState.WAITING_PRIORITY &&
                       (messageText.equals("ALTA") || messageText.equals("MEDIA") || messageText.equals("BAJA"))) {
                
                session.currentTask.setPriority(messageText);
                session.state = UserTaskSession.CreationState.WAITING_TYPE;
                showTypeOptions(chatId);
                
            } else if (session.state == UserTaskSession.CreationState.WAITING_TYPE &&
                       (messageText.equals("FEATURE") || messageText.equals("BUG") || 
                        messageText.equals("MEJORA") || messageText.equals("DOCUMENTACION"))) {
                
                session.currentTask.setType(messageText);
                session.state = UserTaskSession.CreationState.WAITING_POINTS;
                sendMessageWithKeyboardRemove(chatId, BotMessages.ENTER_STORY_POINTS.getMessage());
                
            } else if (session.state == UserTaskSession.CreationState.WAITING_POINTS) {
                
                try {
                    int points = Integer.parseInt(messageText);
                    if (points > 0 && points <= 13) {
                        session.currentTask.setStoryPoints(points);
                        session.state = UserTaskSession.CreationState.WAITING_USER;
                        
                        // Cargar usuarios disponibles y mostrar opciones
                        session.availableUsers = usuarioService.findAll();
                        showUserOptions(chatId, session.availableUsers);
                    } else {
                        sendMessageWithKeyboardRemove(chatId, "Por favor, ingresa un número válido entre 1 y 13:");
                    }
                } catch (NumberFormatException e) {
                    sendMessageWithKeyboardRemove(chatId, "Por favor, ingresa un número válido entre 1 y 13:");
                }
                
            } else if (session.state == UserTaskSession.CreationState.WAITING_USER) {
                
                // Buscar el usuario seleccionado por su nombre
                for (Usuario user : session.availableUsers) {
                    if (messageText.equals(user.getFirstName() + " " + user.getLastName())) {
                        session.currentTask.setUsuario(user);
                        session.state = UserTaskSession.CreationState.WAITING_SPRINT;
                        
                        // Cargar TODOS los sprints disponibles en lugar de solo los activos
                        session.availableSprints = sprintService.findAll();
                        
                        // Verifica si hay sprints disponibles
                        if (session.availableSprints.isEmpty()) {
                            sendMessage(chatId, "No hay sprints disponibles. Contacta al administrador.");
                            session.state = UserTaskSession.CreationState.NONE;
                            showMainMenu(chatId);
                        } else {
                            showSprintOptions(chatId, session.availableSprints);
                        }
                        break;
                    }
                }
                
                if (session.state != UserTaskSession.CreationState.WAITING_SPRINT) {
                    sendMessage(chatId, BotMessages.INVALID_USER.getMessage());

                }
                
            } else if (session.state == UserTaskSession.CreationState.WAITING_SPRINT) {
                
                // Buscar el sprint seleccionado
                for (Sprint sprint : session.availableSprints) {
                    if (messageText.equals("Sprint " + sprint.getName())) {
                        session.currentTask.setSprint(sprint);
                        
                        // Crear la tarea
                        try {
                            Tarea createdTask = tareaService.addTarea(session.currentTask);
                            sendTaskConfirmation(chatId, createdTask);
                            
                            // Reiniciar el estado
                            session.state = UserTaskSession.CreationState.NONE;
                            session.currentTask = new Tarea();
                            session.currentTask.setDeleted(0);

                            // Establecer echas para la siguiente tarea 
                            Calendar cal = Calendar.getInstance();
                            session.currentTask.setStartDate(cal.getTime());
                            cal.add(Calendar.DAY_OF_MONTH, 7);
                            session.currentTask.setEndDate(cal.getTime());
                            session.currentTask.setStatus("Pendiente");
                            
                            // Mostrar el menú principal
                            showMainMenu(chatId);
                        } catch (Exception e) {
                            logger.error("Error al crear la tarea", e);
                            sendMessage(chatId, BotMessages.ERROR_CREATING_TASK.getMessage() + e.getMessage());
                            
                            // Volver al menú principal en caso de error
                            showMainMenu(chatId);
                        }
                        break;
                    }
                }
                
                if (session.state != UserTaskSession.CreationState.NONE) {
                    sendMessage(chatId, BotMessages.INVALID_SPRINT.getMessage());
                }
                
            } else if (messageText.equals(BotLabels.LIST_TASKS.getLabel())) {
                
                session.state = UserTaskSession.CreationState.NONE;
                // Mostrar lista de tareas
                List<Tarea> tareas = tareaService.findAll();
                showTaskList(chatId, tareas);
                
            } else if (messageText.equals(BotLabels.HIDE_MAIN_SCREEN.getLabel())) {
                
                // Ocultar teclado
                SendMessage message = new SendMessage();
                message.setChatId(chatId);
                message.setText("¡Hasta pronto! Escribe /start para volver a interactuar con el bot.");
                ReplyKeyboardRemove keyboardRemove = new ReplyKeyboardRemove(true);
                message.setReplyMarkup(keyboardRemove);
                
                try {
                    execute(message);
                } catch (TelegramApiException e) {
                    logger.error("Error al enviar mensaje", e);
                }
            }
        }
    }
    
    private void showMainMenu(long chatId) {
        SendMessage message = new SendMessage();
        message.setChatId(chatId);
        message.setText("Bienvenido al gestor de tareas. ¿Qué deseas hacer?");
        
        ReplyKeyboardMarkup keyboardMarkup = new ReplyKeyboardMarkup();
        List<KeyboardRow> keyboard = new ArrayList<>();
        
        // Primera fila
        KeyboardRow row = new KeyboardRow();
        row.add(BotLabels.CREATE_TASK.getLabel());
        row.add(BotLabels.LIST_TASKS.getLabel());
        keyboard.add(row);
        
        // Segunda fila
        row = new KeyboardRow();
        row.add(BotLabels.HIDE_MAIN_SCREEN.getLabel());
        keyboard.add(row);
        
        keyboardMarkup.setKeyboard(keyboard);
        keyboardMarkup.setResizeKeyboard(true);
        message.setReplyMarkup(keyboardMarkup);
        
        try {
            execute(message);
        } catch (TelegramApiException e) {
            logger.error("Error al enviar mensaje", e);
        }
    }
    
    private void showPriorityOptions(long chatId) {
        SendMessage message = new SendMessage();
        message.setChatId(chatId);
        message.setText("Selecciona la prioridad de la tarea:");
        
        ReplyKeyboardMarkup keyboardMarkup = new ReplyKeyboardMarkup();
        List<KeyboardRow> keyboard = new ArrayList<>();
        
        // Opciones de prioridad
        KeyboardRow row = new KeyboardRow();
        row.add("ALTA");
        row.add("MEDIA");
        row.add("BAJA");
        keyboard.add(row);
        
        keyboardMarkup.setKeyboard(keyboard);
        keyboardMarkup.setOneTimeKeyboard(true);
        keyboardMarkup.setResizeKeyboard(true);
        message.setReplyMarkup(keyboardMarkup);
        
        try {
            execute(message);
        } catch (TelegramApiException e) {
            logger.error("Error al enviar mensaje", e);
        }
    }
    
    private void showTypeOptions(long chatId) {
        SendMessage message = new SendMessage();
        message.setChatId(chatId);
        message.setText("Selecciona el tipo de tarea:");
        
        ReplyKeyboardMarkup keyboardMarkup = new ReplyKeyboardMarkup();
        List<KeyboardRow> keyboard = new ArrayList<>();
        
        // Opciones de tipo
        KeyboardRow row1 = new KeyboardRow();
        row1.add("FEATURE");
        row1.add("BUG");
        keyboard.add(row1);
        
        KeyboardRow row2 = new KeyboardRow();
        row2.add("MEJORA");
        row2.add("DOCUMENTACION");
        keyboard.add(row2);
        
        keyboardMarkup.setKeyboard(keyboard);
        keyboardMarkup.setOneTimeKeyboard(true);
        keyboardMarkup.setResizeKeyboard(true);
        message.setReplyMarkup(keyboardMarkup);
        
        try {
            execute(message);
        } catch (TelegramApiException e) {
            logger.error("Error al enviar mensaje", e);
        }
    }
    
    private void showUserOptions(long chatId, List<Usuario> users) {
        SendMessage message = new SendMessage();
        message.setChatId(chatId);
        message.setText("Selecciona el usuario asignado a la tarea:");
        
        ReplyKeyboardMarkup keyboardMarkup = new ReplyKeyboardMarkup();
        List<KeyboardRow> keyboard = new ArrayList<>();
        
        // Añadir cada usuario como una opción
        for (Usuario user : users) {
            KeyboardRow row = new KeyboardRow();
            row.add(user.getFirstName() + " " + user.getLastName());
            keyboard.add(row);
        }
        
        keyboardMarkup.setKeyboard(keyboard);
        keyboardMarkup.setOneTimeKeyboard(true);
        keyboardMarkup.setResizeKeyboard(true);
        message.setReplyMarkup(keyboardMarkup);
        
        try {
            execute(message);
        } catch (TelegramApiException e) {
            logger.error("Error al enviar mensaje", e);
        }
    }
    
    private void showSprintOptions(long chatId, List<Sprint> sprints) {
        SendMessage message = new SendMessage();
        message.setChatId(chatId);
        message.setText("Selecciona el sprint para la tarea:");
        
        ReplyKeyboardMarkup keyboardMarkup = new ReplyKeyboardMarkup();
        List<KeyboardRow> keyboard = new ArrayList<>();
        
        // Añadir cada sprint como una opción
        for (Sprint sprint : sprints) {
            KeyboardRow row = new KeyboardRow();
            row.add("Sprint " + sprint.getName());
            keyboard.add(row);
        }
        
        keyboardMarkup.setKeyboard(keyboard);
        keyboardMarkup.setOneTimeKeyboard(true);
        keyboardMarkup.setResizeKeyboard(true);
        message.setReplyMarkup(keyboardMarkup);
        
        try {
            execute(message);
        } catch (TelegramApiException e) {
            logger.error("Error al enviar mensaje", e);
        }
    }
    
    private void sendTaskConfirmation(long chatId, Tarea tarea) {
        SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy");
        
        StringBuilder message = new StringBuilder();
        message.append("✅ ¡Tarea creada correctamente!\n\n");
        message.append("📌 *Título:* ").append(tarea.getTitle()).append("\n");
        message.append("📝 *Descripción:* ").append(tarea.getDescription()).append("\n");
        message.append("⚠️ *Prioridad:* ").append(tarea.getPriority()).append("\n");
        message.append("🏷️ *Tipo:* ").append(tarea.getType()).append("\n");
        message.append("📊 *Puntos:* ").append(tarea.getStoryPoints()).append("\n");
        message.append("👤 *Asignado:* ").append(tarea.getUsuario().getFirstName()).append(" ").append(tarea.getUsuario().getLastName()).append("\n");
        message.append("🏃 *Sprint:* ").append(tarea.getSprint().getName()).append("\n");
        message.append("📅 *Fecha inicio:* ").append(dateFormat.format(tarea.getStartDate())).append("\n");
        message.append("📅 *Fecha fin:* ").append(dateFormat.format(tarea.getEndDate())).append("\n");
        message.append("📌 *ID:* ").append(tarea.getTaskId());
        
        sendMessage(chatId, message.toString());
    }
    
    private void showTaskList(long chatId, List<Tarea> tareas) {
        if (tareas.isEmpty()) {
            sendMessage(chatId, "No hay tareas registradas.");
            showMainMenu(chatId);
            return;
        }
        
        StringBuilder message = new StringBuilder();
        message.append("📋 *LISTA DE TAREAS*\n\n");
        
        SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy");
        
        for (Tarea tarea : tareas) {
            message.append("🔹 *ID:* ").append(tarea.getTaskId()).append("\n");
            message.append("  *Título:* ").append(tarea.getTitle()).append("\n");
            message.append("  *Estado:* ").append(tarea.getStatus()).append("\n");
            message.append("  *Prioridad:* ").append(tarea.getPriority()).append("\n");
            message.append("  *Asignado:* ").append(tarea.getUsuario().getFirstName()).append(" ").append(tarea.getUsuario().getLastName()).append("\n");
            message.append("  *Sprint:* ").append(tarea.getSprint().getName()).append("\n");
            message.append("  *Fecha fin:* ").append(dateFormat.format(tarea.getEndDate())).append("\n\n");
        }
        
        sendMessage(chatId, message.toString());
        showMainMenu(chatId);
    }
    
    private void sendMessage(long chatId, String text) {
        SendMessage message = new SendMessage();
        message.setChatId(chatId);
        message.setText(text);
        message.enableMarkdown(true);
        
        try {
            execute(message);
        } catch (TelegramApiException e) {
            logger.error("Error al enviar mensaje", e);
        }
    }
    
    private void sendMessageWithKeyboardRemove(long chatId, String text) {
        SendMessage message = new SendMessage();
        message.setChatId(chatId);
        message.setText(text);
        
        ReplyKeyboardRemove keyboardRemove = new ReplyKeyboardRemove(true);
        message.setReplyMarkup(keyboardRemove);
        
        try {
            execute(message);
        } catch (TelegramApiException e) {
            logger.error("Error al enviar mensaje", e);
        }
    }

    @Override
    public String getBotUsername() {
        return this.botName;
    }
}