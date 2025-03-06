/**
 * CONTROLADOR DE BOT DE TELEGRAM PARA GESTIÓN DE TAREAS PENDIENTES
 * 
 * Esta clase implementa un bot de Telegram que permite a los usuarios gestionar
 * sus tareas pendientes (ToDoItems) directamente desde la aplicación de mensajería.
 * Ofrece funcionalidades para listar, crear, marcar como completadas y eliminar tareas
 * mediante una interfaz conversacional con teclados personalizados.
 */
package com.springboot.MyTodoList.controller;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardRemove;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardRow;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

import com.springboot.MyTodoList.model.ToDoItem;
import com.springboot.MyTodoList.service.ToDoItemService;
import com.springboot.MyTodoList.util.BotCommands;
import com.springboot.MyTodoList.util.BotHelper;
import com.springboot.MyTodoList.util.BotLabels;
import com.springboot.MyTodoList.util.BotMessages;

public class ToDoItemBotController extends TelegramLongPollingBot {

    private static final Logger logger = LoggerFactory.getLogger(ToDoItemBotController.class);
    private ToDoItemService toDoItemService;
    private String botName;

    /**
     * CONSTRUCTOR DEL CONTROLADOR
     * 
     * Inicializa el bot con el token y nombre específicos, y establece el servicio
     * que se utilizará para las operaciones con las tareas
     * 
     * @param botToken Token de autenticación para la API de Telegram
     * @param botName Nombre del bot en Telegram
     * @param toDoItemService Servicio para gestionar las tareas en la base de datos
     */
    public ToDoItemBotController(String botToken, String botName, ToDoItemService toDoItemService) {
        super(botToken);
        logger.info("Bot Token: " + botToken);
        logger.info("Bot name: " + botName);
        this.toDoItemService = toDoItemService;
        this.botName = botName;
    }

    /**
     * PROCESAR MENSAJES ENTRANTES
     * 
     * Maneja todas las actualizaciones (mensajes) recibidas del chat de Telegram
     * Implementa la lógica conversacional del bot según el comando o texto recibido
     * 
     * @param update Objeto de actualización que contiene el mensaje recibido y su contexto
     */
    @Override
    public void onUpdateReceived(Update update) {

        if (update.hasMessage() && update.getMessage().hasText()) {

            String messageTextFromTelegram = update.getMessage().getText();
            long chatId = update.getMessage().getChatId();

            if (messageTextFromTelegram.equals(BotCommands.START_COMMAND.getCommand())
                    || messageTextFromTelegram.equals(BotLabels.SHOW_MAIN_SCREEN.getLabel())) {

                // MOSTRAR PANTALLA PRINCIPAL
                // Crea un mensaje de bienvenida con un teclado personalizado que muestra
                // las principales opciones del bot (listar tareas, añadir nuevas, etc.)
                
                SendMessage messageToTelegram = new SendMessage();
                messageToTelegram.setChatId(chatId);
                messageToTelegram.setText(BotMessages.HELLO_MYTODO_BOT.getMessage());

                ReplyKeyboardMarkup keyboardMarkup = new ReplyKeyboardMarkup();
                List<KeyboardRow> keyboard = new ArrayList<>();

                // first row
                KeyboardRow row = new KeyboardRow();
                row.add(BotLabels.LIST_ALL_ITEMS.getLabel());
                row.add(BotLabels.ADD_NEW_ITEM.getLabel());
                // Add the first row to the keyboard
                keyboard.add(row);

                // second row
                row = new KeyboardRow();
                row.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
                row.add(BotLabels.HIDE_MAIN_SCREEN.getLabel());
                keyboard.add(row);

                // Set the keyboard
                keyboardMarkup.setKeyboard(keyboard);

                // Add the keyboard markup
                messageToTelegram.setReplyMarkup(keyboardMarkup);

                try {
                    execute(messageToTelegram);
                } catch (TelegramApiException e) {
                    logger.error(e.getLocalizedMessage(), e);
                }

            } else if (messageTextFromTelegram.indexOf(BotLabels.DONE.getLabel()) != -1) {

                // MARCAR TAREA COMO COMPLETADA
                // Extrae el ID de la tarea del mensaje y la marca como completada
                
                String done = messageTextFromTelegram.substring(0,
                        messageTextFromTelegram.indexOf(BotLabels.DASH.getLabel()));
                Integer id = Integer.valueOf(done);

                try {

                    ToDoItem item = getToDoItemById(id).getBody();
                    item.setDone(true);
                    updateToDoItem(item, id);
                    BotHelper.sendMessageToTelegram(chatId, BotMessages.ITEM_DONE.getMessage(), this);

                } catch (Exception e) {
                    logger.error(e.getLocalizedMessage(), e);
                }

            } else if (messageTextFromTelegram.indexOf(BotLabels.UNDO.getLabel()) != -1) {

                // DESMARCAR TAREA COMPLETADA
                // Extrae el ID de la tarea y la marca como no completada (la reactiva)
                
                String undo = messageTextFromTelegram.substring(0,
                        messageTextFromTelegram.indexOf(BotLabels.DASH.getLabel()));
                Integer id = Integer.valueOf(undo);

                try {

                    ToDoItem item = getToDoItemById(id).getBody();
                    item.setDone(false);
                    updateToDoItem(item, id);
                    BotHelper.sendMessageToTelegram(chatId, BotMessages.ITEM_UNDONE.getMessage(), this);

                } catch (Exception e) {
                    logger.error(e.getLocalizedMessage(), e);
                }

            } else if (messageTextFromTelegram.indexOf(BotLabels.DELETE.getLabel()) != -1) {

                // ELIMINAR TAREA
                // Extrae el ID de la tarea y la elimina permanentemente
                
                String delete = messageTextFromTelegram.substring(0,
                        messageTextFromTelegram.indexOf(BotLabels.DASH.getLabel()));
                Integer id = Integer.valueOf(delete);

                try {

                    deleteToDoItem(id).getBody();
                    BotHelper.sendMessageToTelegram(chatId, BotMessages.ITEM_DELETED.getMessage(), this);

                } catch (Exception e) {
                    logger.error(e.getLocalizedMessage(), e);
                }

            } else if (messageTextFromTelegram.equals(BotCommands.HIDE_COMMAND.getCommand())
                    || messageTextFromTelegram.equals(BotLabels.HIDE_MAIN_SCREEN.getLabel())) {

                // OCULTAR TECLADO
                // Oculta el teclado personalizado y muestra un mensaje de despedida
                
                BotHelper.sendMessageToTelegram(chatId, BotMessages.BYE.getMessage(), this);

            } else if (messageTextFromTelegram.equals(BotCommands.TODO_LIST.getCommand())
                    || messageTextFromTelegram.equals(BotLabels.LIST_ALL_ITEMS.getLabel())
                    || messageTextFromTelegram.equals(BotLabels.MY_TODO_LIST.getLabel())) {

                // MOSTRAR LISTA DE TAREAS
                // Obtiene todas las tareas y crea un teclado dinámico con opciones
                // para cada tarea (marcar como completada, desmarcar, eliminar)
                
                List<ToDoItem> allItems = getAllToDoItems();
                ReplyKeyboardMarkup keyboardMarkup = new ReplyKeyboardMarkup();
                List<KeyboardRow> keyboard = new ArrayList<>();

                // command back to main screen
                KeyboardRow mainScreenRowTop = new KeyboardRow();
                mainScreenRowTop.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
                keyboard.add(mainScreenRowTop);

                KeyboardRow firstRow = new KeyboardRow();
                firstRow.add(BotLabels.ADD_NEW_ITEM.getLabel());
                keyboard.add(firstRow);

                KeyboardRow myTodoListTitleRow = new KeyboardRow();
                myTodoListTitleRow.add(BotLabels.MY_TODO_LIST.getLabel());
                keyboard.add(myTodoListTitleRow);

                List<ToDoItem> activeItems = allItems.stream().filter(item -> item.isDone() == false)
                        .collect(Collectors.toList());

                for (ToDoItem item : activeItems) {

                    KeyboardRow currentRow = new KeyboardRow();
                    currentRow.add(item.getDescription());
                    currentRow.add(item.getID() + BotLabels.DASH.getLabel() + BotLabels.DONE.getLabel());
                    keyboard.add(currentRow);
                }

                List<ToDoItem> doneItems = allItems.stream().filter(item -> item.isDone() == true)
                        .collect(Collectors.toList());

                for (ToDoItem item : doneItems) {
                    KeyboardRow currentRow = new KeyboardRow();
                    currentRow.add(item.getDescription());
                    currentRow.add(item.getID() + BotLabels.DASH.getLabel() + BotLabels.UNDO.getLabel());
                    currentRow.add(item.getID() + BotLabels.DASH.getLabel() + BotLabels.DELETE.getLabel());
                    keyboard.add(currentRow);
                }

                // command back to main screen
                KeyboardRow mainScreenRowBottom = new KeyboardRow();
                mainScreenRowBottom.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
                keyboard.add(mainScreenRowBottom);

                keyboardMarkup.setKeyboard(keyboard);

                SendMessage messageToTelegram = new SendMessage();
                messageToTelegram.setChatId(chatId);
                messageToTelegram.setText(BotLabels.MY_TODO_LIST.getLabel());
                messageToTelegram.setReplyMarkup(keyboardMarkup);

                try {
                    execute(messageToTelegram);
                } catch (TelegramApiException e) {
                    logger.error(e.getLocalizedMessage(), e);
                }

            } else if (messageTextFromTelegram.equals(BotCommands.ADD_ITEM.getCommand())
                    || messageTextFromTelegram.equals(BotLabels.ADD_NEW_ITEM.getLabel())) {
                    
                // PREPARAR AÑADIR NUEVA TAREA
                // Solicita al usuario que escriba la descripción de la nueva tarea
                
                try {
                    SendMessage messageToTelegram = new SendMessage();
                    messageToTelegram.setChatId(chatId);
                    messageToTelegram.setText(BotMessages.TYPE_NEW_TODO_ITEM.getMessage());
                    // hide keyboard
                    ReplyKeyboardRemove keyboardMarkup = new ReplyKeyboardRemove(true);
                    messageToTelegram.setReplyMarkup(keyboardMarkup);

                    // send message
                    execute(messageToTelegram);

                } catch (Exception e) {
                    logger.error(e.getLocalizedMessage(), e);
                }

            }

            else {
                // AÑADIR NUEVA TAREA
                // Cualquier otro texto se interpreta como descripción de nueva tarea
                
                try {
                    ToDoItem newItem = new ToDoItem();
                    newItem.setDescription(messageTextFromTelegram);
                    newItem.setCreation_ts(OffsetDateTime.now());
                    newItem.setDone(false);
                    ResponseEntity entity = addToDoItem(newItem);

                    SendMessage messageToTelegram = new SendMessage();
                    messageToTelegram.setChatId(chatId);
                    messageToTelegram.setText(BotMessages.NEW_ITEM_ADDED.getMessage());

                    execute(messageToTelegram);
                } catch (Exception e) {
                    logger.error(e.getLocalizedMessage(), e);
                }
            }
        }
    }

    /**
     * OBTENER NOMBRE DEL BOT
     * 
     * Devuelve el nombre del bot para la API de Telegram
     * 
     * @return Nombre del bot configurado
     */
    @Override
    public String getBotUsername() {		
        return botName;
    }

    /**
     * OBTENER TODAS LAS TAREAS
     * 
     * Recupera todas las tareas pendientes del sistema
     * 
     * @return Lista de todas las tareas
     */
    public List<ToDoItem> getAllToDoItems() { 
        return toDoItemService.findAll();
    }

    /**
     * BUSCAR TAREA POR ID
     * 
     * Busca una tarea específica por su identificador
     * 
     * @param id ID de la tarea a buscar
     * @return ResponseEntity con la tarea encontrada o error 404
     */
    public ResponseEntity<ToDoItem> getToDoItemById(@PathVariable int id) {
        try {
            ResponseEntity<ToDoItem> responseEntity = toDoItemService.getItemById(id);
            return new ResponseEntity<ToDoItem>(responseEntity.getBody(), HttpStatus.OK);
        } catch (Exception e) {
            logger.error(e.getLocalizedMessage(), e);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * AÑADIR NUEVA TAREA
     * 
     * Guarda una nueva tarea en la base de datos
     * 
     * @param todoItem Tarea a añadir
     * @return ResponseEntity con la ubicación del recurso creado
     * @throws Exception Si hay errores en el proceso
     */
    public ResponseEntity addToDoItem(@RequestBody ToDoItem todoItem) throws Exception {
        ToDoItem td = toDoItemService.addToDoItem(todoItem);
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.set("location", "" + td.getID());
        responseHeaders.set("Access-Control-Expose-Headers", "location");
        // URI location = URI.create(""+td.getID())

        return ResponseEntity.ok().headers(responseHeaders).build();
    }

    /**
     * ACTUALIZAR TAREA
     * 
     * Actualiza los datos de una tarea existente
     * 
     * @param toDoItem Nuevos datos de la tarea
     * @param id ID de la tarea a actualizar
     * @return ResponseEntity con la tarea actualizada o error 404
     */
    public ResponseEntity updateToDoItem(@RequestBody ToDoItem toDoItem, @PathVariable int id) {
        try {
            ToDoItem toDoItem1 = toDoItemService.updateToDoItem(id, toDoItem);
            System.out.println(toDoItem1.toString());
            return new ResponseEntity<>(toDoItem1, HttpStatus.OK);
        } catch (Exception e) {
            logger.error(e.getLocalizedMessage(), e);
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * ELIMINAR TAREA
     * 
     * Elimina permanentemente una tarea del sistema
     * 
     * @param id ID de la tarea a eliminar
     * @return ResponseEntity con resultado true/false y código HTTP correspondiente
     */
    public ResponseEntity<Boolean> deleteToDoItem(@PathVariable("id") int id) {
        Boolean flag = false;
        try {
            flag = toDoItemService.deleteToDoItem(id);
            return new ResponseEntity<>(flag, HttpStatus.OK);
        } catch (Exception e) {
            logger.error(e.getLocalizedMessage(), e);
            return new ResponseEntity<>(flag, HttpStatus.NOT_FOUND);
        }
    }
}