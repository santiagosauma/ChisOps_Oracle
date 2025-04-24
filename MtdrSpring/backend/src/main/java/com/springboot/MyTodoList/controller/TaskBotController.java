package com.springboot.MyTodoList.controller;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.api.objects.User; // Import User from telegrambots
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

import org.telegram.telegrambots.meta.api.objects.Message; // Import Message from telegrambots
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import com.fasterxml.jackson.databind.ObjectMapper;

public class TaskBotController extends TelegramLongPollingBot {

    private static final Logger logger = LoggerFactory.getLogger(TaskBotController.class);

    @Autowired
    private TareaService tareaService;
    @Autowired
    private UsuarioService usuarioService;
    @Autowired
    private SprintService sprintService;
    private String botName;

    // Mapa para sesiones de usuario (chatId -> Session)
    private Map<Long, UserSession> userSessions = new ConcurrentHashMap<>();

    // Enum para los estados del bot
    private enum BotState {
        NONE, WAITING_PASSWORD, // Added WAITING_PASSWORD state
        WAITING_TITLE, WAITING_DESCRIPTION, WAITING_PRIORITY,
        WAITING_TYPE, WAITING_USER, WAITING_SPRINT, WAITING_POINTS,
        WAITING_ESTIMATED_HOURS, WAITING_ACTUAL_HOURS, WAITING_TASK_TO_FINISH,
        WAITING_ACTUAL_HOURS_INPUT,
        WAITING_AUDIO // <-- Nuevo estado para flujo de audio
    }

    /**
     * Clase interna para mantener el estado de la sesión por usuario.
     */
    private static class UserSession {
        private BotState state = BotState.NONE;
        private Tarea currentTask = new Tarea();
        private List<Usuario> availableUsers;
        private List<Sprint> availableSprints;
        private int currentPage = 0;
        private List<Tarea> currentTaskList = new ArrayList<>();
        private boolean isAuthenticated = false; // Track authentication status
        private Usuario authenticatedUser; // Store authenticated user object

        // Getters and Setters, and clearAuthentication method (as in previous response)
        public BotState getState() {
            return state;
        }

        public void setState(BotState state) {
            this.state = state;
        }

        public Tarea getCurrentTask() {
            return currentTask;
        }

        public List<Usuario> getAvailableUsers() {
            return availableUsers;
        }

        public void setAvailableUsers(List<Usuario> availableUsers) {
            this.availableUsers = availableUsers;
        }

        public List<Sprint> getAvailableSprints() {
            return availableSprints;
        }

        public void setAvailableSprints(List<Sprint> availableSprints) {
            this.availableSprints = availableSprints;
        }

        public int getCurrentPage() {
            return currentPage;
        }

        public void setCurrentPage(int currentPage) {
            this.currentPage = currentPage;
        }

        public List<Tarea> getCurrentTaskList() {
            return currentTaskList;
        }

        public void setCurrentTaskList(List<Tarea> currentTaskList) {
            this.currentTaskList = currentTaskList;
        }

        public boolean isAuthenticated() {
            return isAuthenticated;
        }

        public void setAuthenticated(boolean authenticated) {
            isAuthenticated = authenticated;
        }

        public Usuario getAuthenticatedUser() {
            return authenticatedUser;
        }

        public void setAuthenticatedUser(Usuario authenticatedUser) {
            this.authenticatedUser = authenticatedUser;
        }

        public void clearAuthentication() {
            this.isAuthenticated = false;
            this.authenticatedUser = null;
        }
    }

    public TaskBotController(String botToken, String botName,
            TareaService tareaService,
            UsuarioService usuarioService,
            SprintService sprintService) {
        super(botToken);
        this.botName = botName;
        this.tareaService = tareaService;
        this.usuarioService = usuarioService;
        this.sprintService = sprintService;
    }

    @Override
    public void onUpdateReceived(Update update) {
        // --- Manejo de mensajes de voz: esto debe ir ANTES del bloque hasText() ---
        if (update.hasMessage() && update.getMessage().hasVoice()) {
            long chatId = update.getMessage().getChatId();
            UserSession session = userSessions.computeIfAbsent(chatId, k -> new UserSession());
            // Si el estado es el esperado, procesa el audio
            if (session.state == BotState.WAITING_AUDIO) {
                handleAudioTaskCreation(chatId, update, session);
            } else {
                sendMessage(chatId,
                        "Para crear una tarea por voz, selecciona primero '🎤 Crear tarea por voz' en el menú.");
            }
            return; // Importante: no seguir procesando este update
        }

        // --- Manejo de mensajes de texto y otros ---
        if (update.hasMessage() && update.getMessage().hasText()) {
            String messageText = update.getMessage().getText();
            long chatId = update.getMessage().getChatId();
            User telegramUser = update.getMessage().getFrom(); // Get Telegram User info
            String telegramUsername = telegramUser.getUserName(); // Get Telegram Username
            logger.debug("----------------------------------------Telegram Username: " + telegramUsername
                    + "--------------------------");
            logger.debug(telegramUsername + "----------------------------------------Telegram Username: "
                    + telegramUsername + "--------------------------");

            // Obtener o crear una sesión para este usuario
            UserSession session = userSessions.computeIfAbsent(chatId, k -> new UserSession());

            logger.debug("-------------------------Estado de la sesión: " + session.state);

            if (messageText.equals(BotCommands.START_COMMAND.getCommand())
                    || messageText.equals(BotLabels.SHOW_MAIN_SCREEN.getLabel())) {
                session.state = BotState.NONE;
                showMainMenu(chatId, session); // Pass session to showMainMenu
            } else if (messageText.equals(BotCommands.LOGIN_COMMAND.getCommand())) {
                session.state = BotState.WAITING_PASSWORD;
                sendMessageWithKeyboardRemove(chatId, "🔑 Por favor, introduce tu contraseña:");
            } else if (session.state == BotState.WAITING_PASSWORD) {
                handleLoginAttempt(chatId, telegramUsername, messageText, session); // Handle login attempt
            } else if (messageText.equals(BotCommands.LOGOUT_COMMAND.getCommand())) {
                handleLogout(chatId, session);
            } else if (messageText.equals(BotLabels.CREATE_TASK.getLabel())) {
                if (!session.isAuthenticated()) {
                    sendLoginRequiredMessage(chatId);
                    return;
                }
                session.state = BotState.WAITING_TITLE;
                sendMessageWithKeyboardRemove(chatId, BotMessages.ENTER_TASK_TITLE.getMessage());
            } else if (session.state == BotState.WAITING_TITLE) {
                session.currentTask.setTitle(messageText);
                session.state = BotState.WAITING_DESCRIPTION;
                sendMessageWithKeyboardRemove(chatId, BotMessages.ENTER_TASK_DESCRIPTION.getMessage());
            } else if (session.state == BotState.WAITING_DESCRIPTION) {
                session.currentTask.setDescription(messageText);
                session.state = BotState.WAITING_PRIORITY;
                showPriorityOptions(chatId);
            } else if (session.state == BotState.WAITING_PRIORITY &&
                    (messageText.equals("Low") || messageText.equals("Medium") || messageText.equals("High") ||
                            messageText.equals("Critical"))) {
                session.currentTask.setPriority(messageText);
                session.state = BotState.WAITING_TYPE;
                showTypeOptions(chatId);
            } else if (session.state == BotState.WAITING_TYPE &&
                    (messageText.equals("Bug") || messageText.equals("Feature") ||
                            messageText.equals("Task") || messageText.equals("Research")
                            || messageText.equals("Enhancement"))) {
                session.currentTask.setType(messageText);
                session.state = BotState.WAITING_POINTS;
                sendMessageWithKeyboardRemove(chatId, BotMessages.ENTER_STORY_POINTS.getMessage());
            } else if (session.state == BotState.WAITING_POINTS) {
                try {
                    int points = Integer.parseInt(messageText);
                    if (points > 0 && points <= 13) {
                        session.currentTask.setStoryPoints(points);
                        session.state = BotState.WAITING_ESTIMATED_HOURS;
                        sendMessageWithKeyboardRemove(chatId,
                                "Por favor, ingresa las horas estimadas para completar la tarea:");
                    } else {
                        sendMessageWithKeyboardRemove(chatId, "Por favor, ingresa un número válido entre 1 y 13:");
                    }
                } catch (NumberFormatException e) {
                    sendMessageWithKeyboardRemove(chatId, "Por favor, ingresa un número válido entre 1 y 13:");
                }
            } else if (session.state == BotState.WAITING_ESTIMATED_HOURS) {
                try {
                    double hours = Double.parseDouble(messageText);
                    if (hours > 0) {
                        session.currentTask.setEstimatedHours(hours);
                        session.state = BotState.WAITING_ACTUAL_HOURS;
                        sendMessageWithKeyboardRemove(chatId,
                                "Por favor, ingresa las horas reales empleadas (0 si aún no se ha trabajado en la tarea):");
                    } else {
                        sendMessageWithKeyboardRemove(chatId, "Por favor, ingresa un número válido mayor que 0:");
                    }
                } catch (NumberFormatException e) {
                    sendMessageWithKeyboardRemove(chatId,
                            "Por favor, ingresa un número válido para las horas estimadas:");
                }
            } else if (session.state == BotState.WAITING_ACTUAL_HOURS) {
                try {
                    double hours = Double.parseDouble(messageText);
                    if (hours >= 0) {
                        session.currentTask.setActualHours(hours);
                        session.state = BotState.WAITING_USER;

                        // Cargar usuarios disponibles y mostrar opciones
                        session.availableUsers = usuarioService.findAll();
                        showUserOptions(chatId, session.availableUsers);
                    } else {
                        sendMessageWithKeyboardRemove(chatId, "Por favor, ingresa un número válido mayor o igual a 0:");
                    }
                } catch (NumberFormatException e) {
                    sendMessageWithKeyboardRemove(chatId,
                            "Por favor, ingresa un número válido para las horas actuales:");
                }
            } else if (messageText.equals("⬅️ Anterior")) {
                // Get session and access stored pagination data
                if (session.currentPage > 0) {
                    showTaskList(chatId, session.currentTaskList, session.currentPage - 1);
                } else {
                    sendMessage(chatId, "Ya estás en la primera página.");
                }
            } else if (messageText.equals("➡️ Siguiente")) {
                int totalPages = (int) Math.ceil(session.currentTaskList.size() / 5.0);
                if (session.currentPage < totalPages - 1) {
                    showTaskList(chatId, session.currentTaskList, session.currentPage + 1);
                } else {
                    sendMessage(chatId, "Ya estás en la última página.");
                }
            } else if (messageText.equals("🔴 Alta prioridad")) {
                if (!session.isAuthenticated()) {
                    sendLoginRequiredMessage(chatId);
                    return;
                }
                session.state = BotState.NONE;

                // Filtrar tareas del usuario con prioridad High o Critical
                List<Tarea> tareasUsuario = tareaService.getTareasByUsuario(session.getAuthenticatedUser().getUserId());
                List<Tarea> tareasAltaPrioridad = new ArrayList<>();

                for (Tarea tarea : tareasUsuario) {
                    if (tarea.getPriority() != null &&
                            (tarea.getPriority().equalsIgnoreCase("High")
                                    || tarea.getPriority().equalsIgnoreCase("Critical"))) {
                        tareasAltaPrioridad.add(tarea);
                    }
                }

                if (tareasAltaPrioridad.isEmpty()) {
                    sendMessage(chatId, "No se encontraron tareas de alta prioridad.");
                    showTaskListOptions(chatId); // Mantener en el contexto de las tareas
                } else {
                    sendMessage(chatId, "Mostrando " + tareasAltaPrioridad.size() + " tareas de alta prioridad:");
                    showTaskList(chatId, tareasAltaPrioridad);
                }
            } else if (messageText.equals("🟡 Media prioridad")) {
                if (!session.isAuthenticated()) {
                    sendLoginRequiredMessage(chatId);
                    return;
                }
                session.state = BotState.NONE;

                // Filtrar tareas del usuario con prioridad Medium
                List<Tarea> tareasUsuario = tareaService.getTareasByUsuario(session.getAuthenticatedUser().getUserId());
                List<Tarea> tareasPrioridadMedia = new ArrayList<>();

                for (Tarea tarea : tareasUsuario) {
                    if (tarea.getPriority() != null && tarea.getPriority().equalsIgnoreCase("Medium")) {
                        tareasPrioridadMedia.add(tarea);
                    }
                }

                if (tareasPrioridadMedia.isEmpty()) {
                    sendMessage(chatId, "No se encontraron tareas de prioridad media.");
                    showTaskListOptions(chatId);
                } else {
                    sendMessage(chatId, "Mostrando " + tareasPrioridadMedia.size() + " tareas de prioridad media:");
                    showTaskList(chatId, tareasPrioridadMedia);
                }
            } else if (session.state == BotState.WAITING_USER) {
                // Buscar el usuario seleccionado por su nombre
                for (Usuario user : session.availableUsers) {
                    if (messageText.equals(user.getFirstName() + " " + user.getLastName())) {
                        session.currentTask.setUsuario(user);
                        session.state = BotState.WAITING_SPRINT;

                        // Cargar TODOS los sprints disponibles en lugar de solo los activos
                        session.availableSprints = sprintService.findAll();

                        // Verifica si hay sprints disponibles
                        if (session.availableSprints.isEmpty()) {
                            sendMessage(chatId, "No hay sprints disponibles. Contacta al administrador.");
                            session.state = BotState.NONE;
                            showMainMenu(chatId, session);
                        } else {
                            showSprintOptions(chatId, session.availableSprints);
                        }
                        break;
                    }
                }

                if (session.state != BotState.WAITING_SPRINT) {
                    sendMessage(chatId, BotMessages.INVALID_USER.getMessage());
                }
            } else if (session.state == BotState.WAITING_SPRINT) {
                // Buscar el sprint seleccionado
                for (Sprint sprint : session.availableSprints) {
                    if (messageText.equals("Sprint " + sprint.getName())) {
                        session.currentTask.setSprint(sprint);
                        if (session.currentTask.getStatus() == null) { // Optional: check if already set, though
                                                                       // unlikely here
                            session.currentTask.setStatus("Incomplete"); // Set a default status
                            logger.debug("Status was null, setting default 'Pendiente'");
                        }

                        // Crear la tarea
                        try {
                            if (session.currentTask.getStartDate() == null) {
                                Calendar cal = Calendar.getInstance();
                                session.currentTask.setStartDate(cal.getTime());
                                logger.debug("startDate era null, se asignó un valor predeterminado: " + cal.getTime());
                                logger.debug("startDate: " + session.currentTask.getStartDate());
                            }

                            if (session.currentTask.getEndDate() == null) {
                                Calendar cal = Calendar.getInstance();
                                cal.add(Calendar.DAY_OF_MONTH, 7); // Hoy + 7 días
                                session.currentTask.setEndDate(cal.getTime());
                                logger.debug("endDate era null, se asignó un valor predeterminado: " + cal.getTime());
                                logger.debug("endDate: " + session.currentTask.getEndDate());
                            }

                            Tarea createdTask = tareaService.addTarea(session.currentTask);
                            sendTaskConfirmation(chatId, createdTask);

                            // Reiniciar el estado
                            session.state = BotState.NONE;
                            session.currentTask = new Tarea();
                            session.currentTask.setDeleted(0);

                            // Establecer echas para la siguiente tarea
                            Calendar cal = Calendar.getInstance();
                            session.currentTask.setStartDate(cal.getTime());
                            logger.debug("Fecha de inicio establecida: " + cal.getTime());

                            cal.add(Calendar.DAY_OF_MONTH, 7);
                            session.currentTask.setEndDate(cal.getTime());
                            logger.debug("Fecha de finalización establecida: " + cal.getTime());
                            session.currentTask.setStatus("Pendiente");

                            // Mostrar el menú principal
                            showMainMenu(chatId, session);
                        } catch (Exception e) {
                            logger.error("Error al crear la tarea", e);
                            sendMessage(chatId, BotMessages.ERROR_CREATING_TASK.getMessage() + e.getMessage());

                            // Volver al menú principal en caso de error
                            showMainMenu(chatId, session);
                        }
                        break;
                    }
                }

                if (session.state != BotState.NONE) {
                    sendMessage(chatId, BotMessages.INVALID_SPRINT.getMessage());
                }
            } else if (messageText.equals(BotLabels.LIST_TASKS.getLabel())) {
                if (!session.isAuthenticated()) {
                    sendLoginRequiredMessage(chatId);
                    return;
                }
                session.state = BotState.NONE;
                handleListMyTasks(chatId, session); // Call new method to list user's tasks

            } else if (messageText.equals("✅ Finalizar tarea")) {
                if (!session.isAuthenticated()) {
                    sendLoginRequiredMessage(chatId);
                    return;
                }
                session.state = BotState.WAITING_TASK_TO_FINISH;

                // Mostrar las tareas del usuario para seleccionar cuál finalizar
                List<Tarea> userTasks = tareaService.getTareasByUsuario(session.getAuthenticatedUser().getUserId());
                if (userTasks.isEmpty()) {
                    sendMessage(chatId, "No tienes tareas asignadas para finalizar.");
                    session.state = BotState.NONE;
                    showMainMenu(chatId, session);
                } else {
                    sendMessage(chatId, "Selecciona la tarea que deseas marcar como finalizada:");
                    showTaskList(chatId, userTasks);
                }
            } else if (session.state == BotState.WAITING_TASK_TO_FINISH) {
                try {
                    int taskId = Integer.parseInt(messageText.replaceAll("[^0-9]", "")); // Extraer el ID de la tarea
                    ResponseEntity<Tarea> tareaResponse = tareaService.getTareaById(taskId);

                    if (tareaResponse.getStatusCode() == HttpStatus.OK) {
                        Tarea tarea = tareaResponse.getBody();
                        if (tarea != null
                                && tarea.getUsuario().getUserId() == session.getAuthenticatedUser().getUserId()) {
                            session.currentTask = tarea; // Guardar la tarea seleccionada en la sesión
                            session.state = BotState.WAITING_ACTUAL_HOURS_INPUT; // Cambiar al nuevo estado
                            sendMessage(chatId, "Por favor, ingresa las horas reales que te tomó completar la tarea:");
                        } else {
                            sendMessage(chatId, "❌ No puedes finalizar una tarea que no te pertenece.");
                        }
                    } else {
                        sendMessage(chatId, "❌ No se encontró la tarea con el ID proporcionado.");
                    }
                } catch (NumberFormatException e) {
                    sendMessage(chatId, "❌ Por favor, selecciona un ID de tarea válido.");
                }
            } else if (session.state == BotState.WAITING_ACTUAL_HOURS_INPUT) {
                try {
                    double actualHours = Double.parseDouble(messageText); // Leer las horas reales ingresadas
                    if (actualHours >= 0) {
                        Tarea tarea = session.currentTask;
                        tarea.setActualHours(actualHours); // Asignar las horas reales
                        tarea.setStatus("Finalizada"); // Cambiar el estado a "Finalizada"
                        tareaService.updateTarea(tarea.getTaskId(), tarea); // Actualizar la tarea en la base de datos

                        sendMessage(chatId, "✅ La tarea #" + tarea.getTaskId() + " ha sido marcada como finalizada con "
                                + actualHours + " horas reales.");
                    } else {
                        sendMessage(chatId, "❌ Por favor, ingresa un número válido mayor o igual a 0.");
                        return;
                    }
                } catch (NumberFormatException e) {
                    sendMessage(chatId, "❌ Por favor, ingresa un número válido para las horas reales.");
                    return;
                }

                // Reiniciar el estado y mostrar el menú principal
                session.state = BotState.NONE;
                showMainMenu(chatId, session);
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
            } else if (messageText != null && messageText.equals("🎤 Crear tarea por voz")) {
                if (!session.isAuthenticated()) {
                    sendLoginRequiredMessage(chatId);
                    return;
                }
                session.state = BotState.WAITING_AUDIO;
                sendMessageWithKeyboardRemove(chatId,
                        "🎤 *Creación de tarea por voz*\n\n" +
                                "Por favor, graba una nota de voz mencionando los siguientes datos:\n\n" +
                                "━━━━━━━━━━━━━━━━━━━━━━\n" +
                                "🔹 *Obligatorio:*\n" +
                                "• *Título*: Ejemplo: _\"User Story para registro de usuarios\"_\n" +
                                "• *Descripción*: Ejemplo: _\"Como [rol] quiero [acción] para [beneficio]\"_\n\n" +
                                "🔸 *Opcional:*\n" +
                                "• *Estado*: _Done, Incomplete, In progress, Blocked_\n" +
                                "• *Prioridad*: _Low, Medium, High, Critical_\n" +
                                "• *Tipo*: _Bug, Feature, Task, Enhancement, Research_\n" +
                                "• *Fechas*: _Inicio y fin (formato: día-mes-año)_\n" +
                                "• *Puntos de historia*: _Número entre 1 y 13_\n" +
                                "• *Sprint*: _Nombre o ID del sprint_\n" +
                                "• *Usuario asignado*: _Nombre o ID_\n" +
                                "• *Horas estimadas*: _Número aproximado_\n" +
                                "━━━━━━━━━━━━━━━━━━━━━━\n" +
                                "Habla de forma clara y ordenada. ¡Cuando termines, envía tu nota de voz!");
                return;
            } else if (messageText.equals("📈 Mis KPIs")) {
                if (!session.isAuthenticated()) {
                    sendLoginRequiredMessage(chatId);
                    return;
                }
                sendUserKpis(chatId, session.getAuthenticatedUser());
                return;
            }
        }
    }

    // --- New method to handle login attempt ---
    private void handleLoginAttempt(long chatId, String telegramUsername, String password, UserSession session) {
        Optional<Usuario> userOptional = usuarioService.findByTelegramUsername(telegramUsername);
        if (userOptional.isPresent()) {
            Usuario user = userOptional.get();
            if (usuarioService.authenticate(user.getEmail(), password) != null) { // Authenticate using email and
                                                                                  // password
                session.setAuthenticated(true);
                session.setAuthenticatedUser(user); // Store the authenticated user in session
                session.state = BotState.NONE;
                sendMessage(chatId, "✅ Inicio de sesión exitoso. Bienvenido/a, " + user.getFirstName() + "!");
                showMainMenu(chatId, session); // Update main menu to show logged-in options
            } else {
                sendMessage(chatId, "❌ Contraseña incorrecta. Inténtalo de nuevo.");
                session.state = BotState.WAITING_PASSWORD; // Keep in WAITING_PASSWORD state for retry
            }
        } else {
            sendMessage(chatId, "❌ Usuario no registrado. Contacta al administrador.");
            session.state = BotState.NONE; // Reset state
            showMainMenu(chatId, session); // Show default main menu for non-logged in users
        }
    }

    // --- New method to handle logout ---
    private void handleLogout(long chatId, UserSession session) {
        if (session.isAuthenticated()) {
            session.clearAuthentication(); // Clear authentication data in session
            sendMessage(chatId, "🔒 Sesión cerrada.");
        } else {
            sendMessage(chatId, "ℹ️ No has iniciado sesión.");
        }
        session.state = BotState.NONE; // Reset state after logout attempt
        showMainMenu(chatId, session); // Update main menu to show logged-out options
    }

    // --- Modified showMainMenu to accept UserSession ---
    private void showMainMenu(long chatId, UserSession session) {
        SendMessage message = new SendMessage();
        message.setChatId(chatId);

        ReplyKeyboardMarkup keyboardMarkup = new ReplyKeyboardMarkup();
        List<KeyboardRow> keyboard = new ArrayList<>();
        KeyboardRow row1 = new KeyboardRow();
        KeyboardRow row2 = new KeyboardRow();
        KeyboardRow row3 = new KeyboardRow();

        if (session.isAuthenticated()) {
            message.setText("Bienvenido/a, " + session.getAuthenticatedUser().getFirstName() + ". ¿Qué deseas hacer?");
            row1.add(BotLabels.CREATE_TASK.getLabel());
            row1.add(BotLabels.LIST_TASKS.getLabel());
            row2.add("✅ Finalizar tarea");
            row3.add("🎤 Crear tarea por voz"); // <-- Nueva opción
            row3.add("📈 Mis KPIs"); // <-- Nuevo botón para KPIs
            row2.add(BotCommands.LOGOUT_COMMAND.getCommand());
        } else {
            message.setText("Bienvenido/a al gestor de tareas. Inicia sesión para continuar.");
            row1.add(BotCommands.LOGIN_COMMAND.getCommand());
        }
        row2.add(BotLabels.HIDE_MAIN_SCREEN.getLabel());

        keyboard.add(row1);
        keyboard.add(row2);
        keyboard.add(row3);

        keyboardMarkup.setKeyboard(keyboard);
        keyboardMarkup.setResizeKeyboard(true);
        message.setReplyMarkup(keyboardMarkup);

        try {
            execute(message);
        } catch (TelegramApiException e) {
            logger.error("Error al enviar mensaje", e);
        }
    }

    // --- New method to handle listing tasks for logged-in user ---
    private void handleListMyTasks(long chatId, UserSession session) {
        Usuario user = session.getAuthenticatedUser();
        if (user == null) {
            sendLoginRequiredMessage(chatId);
            return;
        }

        List<Tarea> tareas = tareaService.getTareasByUsuario(user.getUserId());
        if (tareas.isEmpty()) {
            sendMessage(chatId, "No tienes tareas asignadas.");
        } else {
            showTaskList(chatId, tareas); // Show task list (existing method)
        }
    }

    private void sendLoginRequiredMessage(long chatId) {
        sendMessage(chatId, "🔒 Por favor, inicia sesión primero usando /login.");
    }

    private void showPriorityOptions(long chatId) {
        SendMessage message = new SendMessage();
        message.setChatId(chatId);
        message.setText("Selecciona la prioridad de la tarea:");

        ReplyKeyboardMarkup keyboardMarkup = new ReplyKeyboardMarkup();
        List<KeyboardRow> keyboard = new ArrayList<>();

        // Opciones de prioridad
        KeyboardRow row = new KeyboardRow();
        row.add("Low");
        row.add("Medium");
        row.add("High");
        row.add("Critical");
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
        row1.add("Feature");
        row1.add("Bug");
        keyboard.add(row1);

        KeyboardRow row2 = new KeyboardRow();
        row2.add("Enhancement");
        row2.add("Research");
        row2.add("Task");
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

        // 1. Determinar emojis dinámicos basados en tipo y prioridad
        String priorityEmoji = getPriorityEmoji(tarea.getPriority());
        String typeEmoji = getTypeEmoji(tarea.getType());

        // 2. Crear encabezado impactante con información de éxito
        StringBuilder message = new StringBuilder();
        message.append("✅ *TAREA CREADA CON ÉXITO* ✅\n\n");

        // 3. Información esencial destacada al inicio
        message.append("🆔 `#").append(tarea.getTaskId()).append("` ");
        message.append(priorityEmoji).append(" ");
        message.append(typeEmoji).append("\n\n");

        // 4. Título y descripción con formato especial
        message.append("📌 *").append(tarea.getTitle().toUpperCase()).append("*\n");
        message.append("━━━━━━━━━━━━━━━━━━━━━━\n");
        message.append("_").append(tarea.getDescription()).append("_\n\n");

        // 5. Información organizada en secciones visualmente separadas
        // 5.1. Sección: Detalles de planificación
        message.append("📊 *DETALLES DE PLANIFICACIÓN*\n");
        message.append("• *Sprint:* ").append(tarea.getSprint().getName()).append("\n");
        message.append("• *Puntos:* ").append(getStoryPointsVisual(tarea.getStoryPoints())).append("\n");
        message.append("• *Estado:* ").append(getStatusWithEmoji(tarea.getStatus())).append("\n\n");

        Double estimatedHours = tarea.getEstimatedHours();
        Double actualHours = tarea.getActualHours();

        message.append("• *Estimación:* ");
        if (estimatedHours != null) {
            message.append(estimatedHours).append("h");

            if (actualHours != null && actualHours > 0) {
                message.append(" (").append(actualHours).append("h usadas)");

                // Ensure estimatedHours is not null and not zero before calculating deviation
                if (estimatedHours > 0) {
                    // Añadir indicador de desviación
                    double deviation = ((actualHours / estimatedHours) - 1) * 100;
                    if (Math.abs(deviation) > 10) {
                        if (deviation > 0) {
                            message.append(" ⚠️ +").append(Math.round(deviation)).append("%");
                        } else {
                            message.append(" ✅ ").append(Math.round(deviation)).append("%");
                        }
                    }
                }
            }
        } else {
            message.append("No definida");
        }
        message.append("\n\n");
        // 5.2. Sección: Asignación
        message.append("👤 *ASIGNACIÓN*\n");
        message.append("• *Responsable:* ").append(tarea.getUsuario().getFirstName()).append(" ")
                .append(tarea.getUsuario().getLastName()).append("\n\n");

        // 5.3. Sección: Fechas importantes
        message.append("📅 *PERIODO DE DESARROLLO*\n");
        message.append("• *Inicio:* ").append(dateFormat.format(tarea.getStartDate())).append("\n");
        message.append("• *Entrega:* ").append(dateFormat.format(tarea.getEndDate())).append(" ");

        // Añadir indicador de tiempo restante
        message.append(getRemainingTimeIndicator(tarea.getEndDate())).append("\n\n");

        // 6. Mensaje de cierre y recomendación personalizada
        message.append("━━━━━━━━━━━━━━━━━━━━━━\n");
        message.append(getMotivationalMessage(tarea.getPriority(), tarea.getType()));

        sendMessage(chatId, message.toString());

        // 7. Enviar teclado con acciones rápidas relevantes para la nueva tarea
        sendTaskActionKeyboard(chatId, tarea.getTaskId());
    }

    // Métodos auxiliares para la UI dinámica

    private String getPriorityEmoji(String priority) {
        switch (priority.toLowerCase()) {
            case "critical":
                return "🔴";
            case "high":
                return "🟠";
            case "medium":
                return "🟡";
            case "low":
                return "🟢";
            default:
                return "⚪";
        }
    }

    private String getTypeEmoji(String type) {
        switch (type.toLowerCase()) {
            case "bug":
                return "🐞";
            case "feature":
                return "✨";
            case "task":
                return "📋";
            case "enhancement":
                return "📈";
            case "research":
                return "🔬";
            default:
                return "🔄";
        }
    }

    private String getStoryPointsVisual(int points) {
        StringBuilder visual = new StringBuilder();
        visual.append(points);

        // Añadir representación visual de puntos
        if (points <= 3)
            visual.append(" (Tarea pequeña 🐣)");
        else if (points <= 8)
            visual.append(" (Tarea mediana 🦊)");
        else
            visual.append(" (Tarea grande 🐘)");

        return visual.toString();
    }

    private String getStatusWithEmoji(String status) {
        switch (status.toLowerCase()) {
            case "done":
                return "✅ Done";
            case "incomplete":
                return "❌ Incomplete";
            case "in progress":
                return "⚙️ In progress";
            case "blocked":
                return "⛔ Blocked";
            default:
                return "❓ " + status;
        }
    }

    private String getRemainingTimeIndicator(Date endDate) {
        long daysRemaining = (endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);

        if (daysRemaining < 0)
            return "⚠️ *¡VENCIDA!*";
        else if (daysRemaining == 0)
            return "🔔 *¡HOY!*";
        else if (daysRemaining <= 2)
            return "⏰ *¡URGENTE!*";
        else if (daysRemaining <= 5)
            return "🕙 próximamente";
        else
            return "📆 en plazo";
    }

    private String getMotivationalMessage(String priority, String type) {
        if ("critical".equalsIgnoreCase(priority)) {
            return "💪 *¡Esta es una tarea crítica!* Priorizala lo antes posible.";
        } else if ("bug".equalsIgnoreCase(type)) {
            return "🔍 *Recuerda validar a fondo la solución* para asegurar que el bug esté resuelto.";
        } else if ("feature".equalsIgnoreCase(type)) {
            return "🌟 *¡Nueva funcionalidad en camino!* Tu aporte será una gran mejora para el proyecto.";
        } else if ("enhancement".equalsIgnoreCase(type)) {
            return "📈 *¡Genial! Cada mejora hace el proyecto mejor.*";
        } else if ("research".equalsIgnoreCase(type)) {
            return "🔬 *¡La investigación es clave para innovar!* Sigue explorando nuevas soluciones.";
        } else if ("task".equalsIgnoreCase(type)) {
            return "📋 *¡Cada tarea completada nos acerca a nuestras metas!*";
        } else {
            return "😄 *¡Tu trabajo es importante para el equipo!* Gracias por tu dedicación.";
        }
    }

    private void sendTaskActionKeyboard(long chatId, int taskId) {
        // Implementar un teclado con botones de acciones rápidas para la tarea
        List<KeyboardRow> keyboard = new ArrayList<>();

        KeyboardRow row1 = new KeyboardRow();
        row1.add("▶️ Iniciar tarea #" + taskId);
        row1.add("📊 Ver detalles");
        keyboard.add(row1);

        KeyboardRow row2 = new KeyboardRow();
        row2.add("📋 Volver a la lista");
        row2.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
        keyboard.add(row2);

        SendMessage message = new SendMessage();
        message.setChatId(chatId);
        message.setText("¿Qué deseas hacer con esta tarea?");

        ReplyKeyboardMarkup keyboardMarkup = new ReplyKeyboardMarkup();
        keyboardMarkup.setKeyboard(keyboard);
        keyboardMarkup.setResizeKeyboard(true);
        keyboardMarkup.setOneTimeKeyboard(true);
        message.setReplyMarkup(keyboardMarkup);

        try {
            execute(message);
        } catch (TelegramApiException e) {
            logger.error("Error al enviar teclado de acciones de tarea", e);
        }
    }

    private void showTaskList(long chatId, List<Tarea> tareas) {
        // Call the existing method with page 0 (first page)
        showTaskList(chatId, tareas, 0);
    }

    private void showTaskList(long chatId, List<Tarea> tareas, int page) {
        final int TASKS_PER_PAGE = 5;
        int totalPages = (int) Math.ceil(tareas.size() / (double) TASKS_PER_PAGE);

        // Store current page and full task list in user session
        UserSession session = userSessions.getOrDefault(chatId, new UserSession());
        session.currentPage = page;
        session.currentTaskList = new ArrayList<>(tareas); // Make a copy to avoid reference issues
        userSessions.put(chatId, session);

        if (tareas.isEmpty()) {
            sendMessage(chatId, "No hay tareas registradas.");
            showMainMenu(chatId, session);
            return;
        }

        // Calculate start and end indices for current page
        int startIndex = page * TASKS_PER_PAGE;
        int endIndex = Math.min(startIndex + TASKS_PER_PAGE, tareas.size());

        // Reduce scope to only show tasks for the current page
        List<Tarea> pagedTasks = tareas.subList(startIndex, endIndex);

        StringBuilder message = new StringBuilder();
        message.append("📋 *LISTA DE TAREAS*\n");
        message.append("───────────────────\n");
        message.append("*Página:* ").append(page + 1).append("/").append(totalPages).append("\n\n");

        SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy");

        for (Tarea tarea : pagedTasks) {
            message.append("🔹 *").append(tarea.getTaskId()).append(": ").append(tarea.getTitle()).append("*\n");
            message.append("  • *Estado:* ").append(getStatusWithEmoji(tarea.getStatus())).append("\n");
            message.append("  • *Prioridad:* ").append(getPriorityEmoji(tarea.getPriority())).append(" ")
                    .append(tarea.getPriority()).append("\n");
            message.append("  • *Asignado:* ").append(tarea.getUsuario().getFirstName()).append(" ")
                    .append(tarea.getUsuario().getLastName()).append("\n");
            message.append("  • *Sprint:* ").append(tarea.getSprint().getName()).append("\n");

            // Null-safe check for both estimated and actual hours
            if (tarea.getEstimatedHours() != null && tarea.getEstimatedHours() > 0) {
                message.append("  • *Horas:* ").append(tarea.getEstimatedHours()).append("h est.");
                if (tarea.getActualHours() != null && tarea.getActualHours() > 0) {
                    message.append(" / ").append(tarea.getActualHours()).append("h real");
                }
                message.append("\n");
            }

            message.append("  • *Fecha fin:* ").append(dateFormat.format(tarea.getEndDate()));
            if (!"done".equalsIgnoreCase(tarea.getStatus())) {
                message.append(" ").append(getRemainingTimeIndicator(tarea.getEndDate()));
            }
            message.append("\n");
            message.append("  ───────────────────\n\n");
        }

        // Add summary footer
        message.append("*Resumen:* ").append(pagedTasks.size()).append(" de ").append(tareas.size())
                .append(" tareas en total");

        // Send the message with the task list
        SendMessage taskListMessage = new SendMessage();
        taskListMessage.setChatId(chatId);
        taskListMessage.setText(message.toString());
        taskListMessage.enableMarkdown(true);

        try {
            execute(taskListMessage);

            // Show navigation options with a short delay
            try {
                Thread.sleep(300);
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
            }

            showPaginationOptions(chatId, page, totalPages);
        } catch (TelegramApiException e) {
            logger.error("Error al enviar lista de tareas", e);

            // If the message is still too long, try with even fewer tasks
            if (e.getMessage() != null && e.getMessage().contains("message is too long")) {
                if (TASKS_PER_PAGE > 1) {
                    sendMessage(chatId, "Reduciendo el número de tareas por página debido a límites de mensaje.");
                    showReducedTaskList(chatId, tareas, page);
                } else {
                    sendMessage(chatId,
                            "No se pueden mostrar las tareas debido a limitaciones de tamaño de mensaje. Por favor, use filtros para reducir el número de tareas.");
                    showTaskListOptions(chatId);
                }
            } else {
                showMainMenu(chatId, session);
            }
        }
    }

    // New method to show a more reduced task list when even 5 tasks are too much
    private void showReducedTaskList(long chatId, List<Tarea> tareas, int page) {
        final int REDUCED_TASKS_PER_PAGE = 3;
        int totalPages = (int) Math.ceil(tareas.size() / (double) REDUCED_TASKS_PER_PAGE);

        // Update the session with the new page size
        UserSession session = userSessions.get(chatId);
        if (session != null) {
            session.currentPage = Math.min(page, totalPages - 1); // Ensure valid page
        }

        // Calculate start and end indices for current page
        int startIndex = page * REDUCED_TASKS_PER_PAGE;
        int endIndex = Math.min(startIndex + REDUCED_TASKS_PER_PAGE, tareas.size());

        // Reduce scope to only show tasks for the current page
        List<Tarea> pagedTasks = tareas.subList(startIndex, endIndex);

        StringBuilder message = new StringBuilder();
        message.append("📋 *LISTA DE TAREAS* (Vista reducida)\n");
        message.append("Página ").append(page + 1).append(" de ").append(totalPages).append("\n\n");

        // Use a more compact format
        for (Tarea tarea : pagedTasks) {
            message.append("🔹 *#").append(tarea.getTaskId()).append("* - ");
            message.append(tarea.getTitle()).append("\n");
            message.append("  ").append(getPriorityEmoji(tarea.getPriority())).append(" ");
            message.append(getStatusWithEmoji(tarea.getStatus())).append(" • ");
            message.append("Asignado: ").append(tarea.getUsuario().getFirstName()).append("\n");
            message.append("  ─────────────────\n");
        }

        message.append("\nMostrando ").append(pagedTasks.size()).append(" de ").append(tareas.size()).append(" tareas");

        // Send the message with the reduced task list
        SendMessage taskListMessage = new SendMessage();
        taskListMessage.setChatId(chatId);
        taskListMessage.setText(message.toString());
        taskListMessage.enableMarkdown(true);

        try {
            execute(taskListMessage);
            showPaginationOptions(chatId, page, totalPages);
        } catch (TelegramApiException e) {
            logger.error("Error al enviar lista reducida de tareas", e);
            sendMessage(chatId,
                    "No se pueden mostrar las tareas debido a limitaciones de tamaño. Por favor, use filtros específicos.");
            showTaskListOptions(chatId);
        }
    }

    // Updated to simplify the pagination options method
    private void showPaginationOptions(long chatId, int currentPage, int totalPages) {
        SendMessage message = new SendMessage();
        message.setChatId(chatId);

        StringBuilder statusText = new StringBuilder();
        statusText.append("Navegación: Página ").append(currentPage + 1).append(" de ").append(totalPages);

        // Add pagination tips
        if (totalPages > 1) {
            statusText.append("\nUse los botones para navegar entre páginas.");
        }

        message.setText(statusText.toString());

        ReplyKeyboardMarkup keyboardMarkup = new ReplyKeyboardMarkup();
        List<KeyboardRow> keyboard = new ArrayList<>();

        // Navigation row
        KeyboardRow navigationRow = new KeyboardRow();
        if (currentPage > 0) {
            navigationRow.add("⬅️ Anterior");
        }
        if (currentPage < totalPages - 1) {
            navigationRow.add("➡️ Siguiente");
        }

        // Only add this row if it has buttons
        if (!navigationRow.isEmpty()) {
            keyboard.add(navigationRow);
        }

        // Filtering options row
        KeyboardRow filterRow = new KeyboardRow();
        filterRow.add("🔴 Alta prioridad");
        filterRow.add("🟡 Media prioridad");
        keyboard.add(filterRow);

        // Return to main menu row
        KeyboardRow menuRow = new KeyboardRow();
        menuRow.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
        keyboard.add(menuRow);

        keyboardMarkup.setKeyboard(keyboard);
        keyboardMarkup.setResizeKeyboard(true);
        message.setReplyMarkup(keyboardMarkup);

        try {
            execute(message);
        } catch (TelegramApiException e) {
            logger.error("Error al enviar opciones de paginación", e);
            // Fallback to a simpler keyboard if there's an error
            sendSimpleNavigationKeyboard(chatId);
        }
    }

    // Simple fallback method for navigation
    private void sendSimpleNavigationKeyboard(long chatId) {
        SendMessage message = new SendMessage();
        message.setChatId(chatId);
        message.setText("¿Qué deseas hacer?");

        ReplyKeyboardMarkup keyboardMarkup = new ReplyKeyboardMarkup();
        List<KeyboardRow> keyboard = new ArrayList<>();

        KeyboardRow row = new KeyboardRow();
        row.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
        keyboard.add(row);

        keyboardMarkup.setKeyboard(keyboard);
        keyboardMarkup.setResizeKeyboard(true);
        message.setReplyMarkup(keyboardMarkup);

        try {
            execute(message);
        } catch (TelegramApiException e) {
            logger.error("Error al enviar teclado de navegación simple", e);
        }
    }

    // Nuevo método para mostrar opciones después de listar tareas
    private void showTaskListOptions(long chatId) {
        SendMessage message = new SendMessage();
        message.setChatId(chatId);
        message.setText("¿Qué deseas hacer ahora?");

        ReplyKeyboardMarkup keyboardMarkup = new ReplyKeyboardMarkup();
        List<KeyboardRow> keyboard = new ArrayList<>();

        // Primera fila
        KeyboardRow row1 = new KeyboardRow();
        row1.add("🔴 Alta prioridad");
        row1.add("🟠 Media prioridad");
        keyboard.add(row1);

        // Segunda fila - añadir botón para volver al menú principal
        KeyboardRow row2 = new KeyboardRow();
        row2.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
        keyboard.add(row2);

        keyboardMarkup.setKeyboard(keyboard);
        keyboardMarkup.setResizeKeyboard(true);
        message.setReplyMarkup(keyboardMarkup);

        try {
            execute(message);
        } catch (TelegramApiException e) {
            logger.error("Error al enviar opciones de lista de tareas", e);
            // Get the session from the map before using it
            UserSession session = userSessions.getOrDefault(chatId, new UserSession());
            // Si falla, mostrar el menú principal como fallback
            showMainMenu(chatId, session);
        }
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

    // Manejar la creación de tarea por audio
    private void handleAudioTaskCreation(long chatId, Update update, UserSession session) {
        try {
            // 1. Descargar el archivo de audio de Telegram
            logger.info("INICIANDO PROCESAMIENTO DE AUDIO PARA CREAR TAREA");
            org.telegram.telegrambots.meta.api.objects.Voice voice = update.getMessage().getVoice();
            String fileId = voice.getFileId();
            org.telegram.telegrambots.meta.api.objects.File file = execute(
                    new org.telegram.telegrambots.meta.api.methods.GetFile(fileId));
            String fileUrl = "https://api.telegram.org/file/bot" + getBotToken() + "/" + file.getFilePath();

            // 2. Descargar el archivo de audio a un byte[]
            java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
            try (java.io.InputStream is = new java.net.URL(fileUrl).openStream()) {
                byte[] buffer = new byte[4096];
                int n;
                while ((n = is.read(buffer)) != -1) {
                    baos.write(buffer, 0, n);
                }
            }
            byte[] audioBytes = baos.toByteArray();

            // 3. Preparar contexto: usuarios y sprints
            List<Usuario> usuarios = usuarioService.findAll();
            List<Sprint> sprints = sprintService.findAll();
            // Convertir a JSON simple (solo campos relevantes)
            List<Map<String, Object>> usuariosJson = new ArrayList<>();
            for (Usuario u : usuarios) {
                Map<String, Object> m = new java.util.HashMap<>();
                m.put("user_id", u.getUserId());
                m.put("first_name", u.getFirstName());
                m.put("last_name", u.getLastName());
                m.put("email", u.getEmail());
                usuariosJson.add(m);
            }
            List<Map<String, Object>> sprintsJson = new ArrayList<>();
            for (Sprint s : sprints) {
                Map<String, Object> m = new java.util.HashMap<>();
                m.put("sprint_id", s.getSprintId());
                m.put("name", s.getName());
                sprintsJson.add(m);
            }
            Map<String, Object> contexto = new java.util.HashMap<>();
            contexto.put("usuarios", usuariosJson);
            contexto.put("sprints", sprintsJson);

            // 4. Enviar el audio y el contexto al endpoint
            String apiUrl = "http://172.31.32.1:8000/create-task-from-audio";
            System.out.println("Enviando audio y contexto a: " + apiUrl);
            System.out.println("Contexto: " + contexto);
            System.out.println("Tamaño del audio: " + audioBytes.length + " bytes");
            org.springframework.http.client.SimpleClientHttpRequestFactory rf = new org.springframework.http.client.SimpleClientHttpRequestFactory();
            rf.setConnectTimeout(10000);
            rf.setReadTimeout(60000);
            RestTemplate restTemplate = new RestTemplate(rf);

            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.MULTIPART_FORM_DATA);

            // Audio file part
            org.springframework.core.io.ByteArrayResource audioResource = new org.springframework.core.io.ByteArrayResource(
                    audioBytes) {
                @Override
                public String getFilename() {
                    return "audio.ogg";
                }
            };

            // Context part as JSON string
            ObjectMapper mapper = new ObjectMapper();
            String contextoJson = mapper.writeValueAsString(contexto);

            org.springframework.util.LinkedMultiValueMap<String, Object> body = new org.springframework.util.LinkedMultiValueMap<>();
            body.add("file", audioResource);
            body.add("context", contextoJson);

            org.springframework.http.HttpEntity<org.springframework.util.MultiValueMap<String, Object>> requestEntity = new org.springframework.http.HttpEntity<>(
                    body, headers);

            logger.info("ENVIANDO AUDIO A ENDPOINT " + apiUrl);
            ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, requestEntity, String.class);
            logger.info("RECEIVED RESPONSE: " + response.getStatusCode() + " - " + response.getBody());
            if (response.getStatusCode() == HttpStatus.OK) {
                // 5. Procesar la respuesta y mostrar la tarea generada
                Map<String, Object> task = mapper.readValue(response.getBody(), Map.class);

                // Crear objeto Tarea a partir del resultado del endpoint
                Tarea tarea = new Tarea();
                tarea.setTitle((String) task.getOrDefault("title", "N/A"));
                tarea.setDescription((String) task.getOrDefault("description", "N/A"));
                tarea.setPriority((String) task.getOrDefault("priority", "N/A"));
                tarea.setType((String) task.getOrDefault("type", "N/A"));
                Object sp = task.get("story_points");
                if (sp != null) {
                    try {
                        tarea.setStoryPoints(Integer.parseInt(sp.toString()));
                    } catch (Exception ignore) {
                    }
                }
                Object estHours = task.get("estimated_hours");
                if (estHours != null) {
                    try {
                        tarea.setEstimatedHours(Double.parseDouble(estHours.toString()));
                    } catch (Exception ignore) {
                    }
                }
                Object actHours = task.get("actual_hours");
                if (actHours != null) {
                    try {
                        tarea.setActualHours(Double.parseDouble(actHours.toString()));
                    } catch (Exception ignore) {
                    }
                }
                tarea.setStatus((String) task.getOrDefault("status", "Pendiente"));

                // Buscar y asignar usuario si existe
                Object userIdObj = task.get("user_id");
                if (userIdObj != null) {
                    try {
                        int userId = Integer.parseInt(userIdObj.toString());
                        for (Usuario u : usuarioService.findAll()) {
                            if (u.getUserId() == userId) {
                                tarea.setUsuario(u);
                                break;
                            }
                        }
                    } catch (Exception ignore) {
                    }
                }
                // Buscar y asignar sprint si existe
                Object sprintIdObj = task.get("sprint_id");
                if (sprintIdObj != null) {
                    try {
                        int sprintId = Integer.parseInt(sprintIdObj.toString());
                        for (Sprint s : sprintService.findAll()) {
                            if (s.getSprintId() == sprintId) {
                                tarea.setSprint(s);
                                break;
                            }
                        }
                    } catch (Exception ignore) {
                    }
                }
                // Fechas
                SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd");
                Object startDateObj = task.get("start_date");
                if (startDateObj != null) {
                    try {
                        tarea.setStartDate(df.parse(startDateObj.toString()));
                    } catch (Exception ignore) {
                    }
                }
                Object endDateObj = task.get("end_date");
                if (endDateObj != null) {
                    try {
                        tarea.setEndDate(df.parse(endDateObj.toString()));
                    } catch (Exception ignore) {
                    }
                }

                // Si falta usuario o sprint, poner dummy para evitar NPE en
                // sendTaskConfirmation
                if (tarea.getUsuario() == null && !usuarioService.findAll().isEmpty()) {
                    tarea.setUsuario(usuarioService.findAll().get(0));
                }
                if (tarea.getSprint() == null && !sprintService.findAll().isEmpty()) {
                    tarea.setSprint(sprintService.findAll().get(0));
                }
                // Asignar un ID temporal para mostrar (no se guarda en BD aquí)
                // //tarea.setTaskId(0);

                Tarea createdTask = tareaService.addTarea(tarea);

                // Mostrar la tarea con el mismo formato que sendTaskConfirmation
                sendTaskConfirmation(chatId, createdTask);

                // Añadir warnings si existen
                if (task.containsKey("warnings")) {
                    sendMessage(chatId, "_Advertencias:_ " + task.get("warnings"));
                }
            } else {
                sendMessage(chatId, "❌ Ocurrió un error procesando el audio. Intenta de nuevo.");
            }
        } catch (Exception ex) {
            logger.error("Error procesando tarea por audio", ex);
            sendMessage(chatId, "❌ Error procesando el audio: " + ex.getMessage());
        } finally {
            session.state = BotState.NONE;
            showMainMenu(chatId, session);
        }
    }

    private void sendUserKpis(long chatId, Usuario user) {
        List<Tarea> tareas = tareaService.getTareasByUsuario(user.getUserId());
        if (tareas.isEmpty()) {
            sendMessage(chatId, "No tienes tareas registradas para calcular KPIs.");
            return;
        }

        int total = tareas.size();
        int completadas = 0;
        int antesDeTiempo = 0;
        double sumaDesviacion = 0;
        int desviacionCount = 0;
        int sumaStoryPoints = 0;
        double sumaDias = 0;
        int tipoFeature = 0, tipoBug = 0, tipoTask = 0, tipoEnh = 0, tipoResearch = 0;
        int prioLow = 0, prioMed = 0, prioHigh = 0, prioCrit = 0;
        int bloqueadas = 0, enProgreso = 0, pendientes = 0;
        double sumaHorasEstimadas = 0, sumaHorasReales = 0;
        int tareasConHoras = 0;

        Date hoy = new Date();
        int vencidas = 0, porVencer = 0;

        for (Tarea t : tareas) {
            String status = t.getStatus() != null ? t.getStatus().toLowerCase() : "";
            if ("done".equals(status) || "finalizada".equals(status)) {
                completadas++;
                sumaStoryPoints += t.getStoryPoints();
                // Tiempo de entrega
                if (t.getStartDate() != null && t.getEndDate() != null) {
                    long diff = t.getEndDate().getTime() - t.getStartDate().getTime();
                    sumaDias += diff / (1000.0 * 60 * 60 * 24);
                }
                // Entregada antes de tiempo
                if (t.getEndDate() != null && t.getActualHours() != null && t.getEstimatedHours() != null) {
                    if (t.getActualHours() <= t.getEstimatedHours()) {
                        antesDeTiempo++;
                    }
                }
                // Desviación
                if (t.getEstimatedHours() != null && t.getActualHours() != null && t.getEstimatedHours() > 0) {
                    double desv = ((t.getActualHours() - t.getEstimatedHours()) / t.getEstimatedHours()) * 100.0;
                    sumaDesviacion += desv;
                    desviacionCount++;
                }
                // Horas
                if (t.getEstimatedHours() != null && t.getActualHours() != null) {
                    sumaHorasEstimadas += t.getEstimatedHours();
                    sumaHorasReales += t.getActualHours();
                    tareasConHoras++;
                }
            } else {
                if ("blocked".equals(status)) bloqueadas++;
                else if ("in progress".equals(status)) enProgreso++;
                else if ("incomplete".equals(status) || "pendiente".equals(status)) pendientes++;
            }
            // Tipos
            if (t.getType() != null) {
                switch (t.getType().toLowerCase()) {
                    case "feature": tipoFeature++; break;
                    case "bug": tipoBug++; break;
                    case "task": tipoTask++; break;
                    case "enhancement": tipoEnh++; break;
                    case "research": tipoResearch++; break;
                }
            }
            // Prioridades
            if (t.getPriority() != null) {
                switch (t.getPriority().toLowerCase()) {
                    case "low": prioLow++; break;
                    case "medium": prioMed++; break;
                    case "high": prioHigh++; break;
                    case "critical": prioCrit++; break;
                }
            }
            // Vencidas y por vencer
            if (t.getEndDate() != null && !"done".equals(status) && !"finalizada".equals(status)) {
                long diff = t.getEndDate().getTime() - hoy.getTime();
                if (diff < 0) vencidas++;
                else if (diff <= 2 * 24 * 60 * 60 * 1000) porVencer++; // 2 días
            }
        }

        double porcCompletadas = total > 0 ? 100.0 * completadas / total : 0;
        double porcAntesTiempo = completadas > 0 ? 100.0 * antesDeTiempo / completadas : 0;
        double promDesviacion = desviacionCount > 0 ? sumaDesviacion / desviacionCount : 0;
        double promStoryPoints = completadas > 0 ? (double)sumaStoryPoints / completadas : 0;
        double promDias = completadas > 0 ? sumaDias / completadas : 0;
        double promHorasEstimadas = tareasConHoras > 0 ? sumaHorasEstimadas / tareasConHoras : 0;
        double promHorasReales = tareasConHoras > 0 ? sumaHorasReales / tareasConHoras : 0;
        double eficiencia = promHorasEstimadas > 0 ? 100.0 * promHorasEstimadas / promHorasReales : 0;

        StringBuilder sb = new StringBuilder();
        sb.append("📊 *KPIs de desempeño para* _").append(user.getFirstName()).append(" ").append(user.getLastName()).append("_\n");
        sb.append("━━━━━━━━━━━━━━━━━━━━━━\n");
        sb.append("• 🗂️ *Tareas asignadas:* *").append(total).append("*\n");
        sb.append("• ✅ *Completadas:* *").append(completadas).append("* (")
          .append(String.format("%.1f", porcCompletadas)).append("%)\n");
        sb.append("• ⏳ *En progreso:* ").append(enProgreso).append("   ");
        sb.append("🕒 *Pendientes:* ").append(pendientes).append("   ");
        sb.append("⛔ *Bloqueadas:* ").append(bloqueadas).append("\n");
        sb.append("• 🔥 *Vencidas:* ").append(vencidas).append("   ");
        sb.append("⚠️ *Por vencer (<=2d):* ").append(porVencer).append("\n");
        sb.append("\n");
        sb.append("• 🏁 *% completadas en/antes del tiempo estimado:* ");
        sb.append(completadas > 0 ? String.format("*%.1f%%*", porcAntesTiempo) : "N/A").append("\n");
        sb.append("• 🕵️ *Prom. desviación de horas:* ");
        if (desviacionCount > 0) {
            sb.append(String.format("*%+.1f%%*", promDesviacion));
        } else {
            sb.append("N/A");
        }
        sb.append("\n");
        sb.append("• 🏆 *Prom. puntos de historia completados:* ");
        sb.append(completadas > 0 ? String.format("*%.2f*", promStoryPoints) : "N/A").append("\n");
        sb.append("• 📅 *Prom. tiempo de entrega:* ");
        sb.append(completadas > 0 ? String.format("*%.1f días*", promDias) : "N/A").append("\n");
        sb.append("• ⏱️ *Prom. horas estimadas/real:* ");
        if (tareasConHoras > 0) {
            sb.append(String.format("*%.1f* / *%.1f*", promHorasEstimadas, promHorasReales));
            sb.append(" (eficiencia: ").append(String.format("%.1f%%", eficiencia)).append(")");
        } else {
            sb.append("N/A");
        }
        sb.append("\n\n");
        sb.append("• 🧩 *Distribución por tipo:*\n");
        sb.append("  - ✨ Feature: ").append(tipoFeature).append("\n");
        sb.append("  - 🐞 Bug: ").append(tipoBug).append("\n");
        sb.append("  - 📋 Task: ").append(tipoTask).append("\n");
        sb.append("  - 📈 Enhancement: ").append(tipoEnh).append("\n");
        sb.append("  - 🔬 Research: ").append(tipoResearch).append("\n");
        sb.append("• 🏷️ *Distribución por prioridad:*\n");
        sb.append("  - 🟢 Low: ").append(prioLow).append("\n");
        sb.append("  - 🟡 Medium: ").append(prioMed).append("\n");
        sb.append("  - 🟠 High: ").append(prioHigh).append("\n");
        sb.append("  - 🔴 Critical: ").append(prioCrit).append("\n");
        sb.append("━━━━━━━━━━━━━━━━━━━━━━\n");
        sb.append("🚀 *¡Sigue así!* Usa estos indicadores para mejorar tu desempeño.");

        sendMessage(chatId, sb.toString());
    }
}