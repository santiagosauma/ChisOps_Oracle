package com.springboot.MyTodoList.util;

import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardRemove;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardRow;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

public class BotHelper {

    private static final Logger logger = LoggerFactory.getLogger(BotHelper.class);

    public static void sendMessageToTelegram(Long chatId, String text, TelegramLongPollingBot bot) {
        try {
            // prepare message
            SendMessage messageToTelegram = new SendMessage();
            messageToTelegram.setChatId(chatId);
            messageToTelegram.setText(text);

            // hide keyboard
            ReplyKeyboardRemove keyboardMarkup = new ReplyKeyboardRemove(true);
            messageToTelegram.setReplyMarkup(keyboardMarkup);

            // send message
            bot.execute(messageToTelegram);

        } catch (Exception e) {
            logger.error(e.getLocalizedMessage(), e);
        }
    }
    
    // Nuevo método para enviar mensajes con teclado personalizado
    public static void sendMessageWithKeyboard(Long chatId, String text, List<List<String>> keyboardOptions, 
                                              boolean oneTimeKeyboard, TelegramLongPollingBot bot) {
        try {
            SendMessage message = new SendMessage();
            message.setChatId(chatId);
            message.setText(text);
            message.enableMarkdown(true);
            
            ReplyKeyboardMarkup keyboardMarkup = new ReplyKeyboardMarkup();
            List<KeyboardRow> keyboard = new ArrayList<>();
            
            // Convertir la lista de opciones en filas de teclado
            for (List<String> rowOptions : keyboardOptions) {
                KeyboardRow row = new KeyboardRow();
                for (String option : rowOptions) {
                    row.add(option);
                }
                keyboard.add(row);
            }
            
            keyboardMarkup.setKeyboard(keyboard);
            keyboardMarkup.setOneTimeKeyboard(oneTimeKeyboard);
            keyboardMarkup.setResizeKeyboard(true);
            message.setReplyMarkup(keyboardMarkup);
            
            bot.execute(message);
        } catch (TelegramApiException e) {
            logger.error("Error al enviar mensaje con teclado", e);
        }
    }
    
    // Método para enviar mensaje con formato markdown
    public static void sendMarkdownMessage(Long chatId, String text, TelegramLongPollingBot bot) {
        try {
            SendMessage message = new SendMessage();
            message.setChatId(chatId);
            message.setText(text);
            message.enableMarkdown(true);
            
            bot.execute(message);
        } catch (TelegramApiException e) {
            logger.error("Error al enviar mensaje markdown", e);
        }
    }
}