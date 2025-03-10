package com.springboot.MyTodoList.util;

public enum BotMessages {
    
    HELLO_MYTODO_BOT("¡Bienvenido al gestor de tareas! ¿Qué deseas hacer?"),
    TYPE_NEW_TODO_ITEM("Por favor, ingresa el título de la tarea:"),
    NEW_ITEM_ADDED("✅ ¡Tarea creada correctamente!"),
    ITEM_DONE("✅ Tarea marcada como completada"),
    ITEM_UNDONE("⏮️ Tarea marcada como pendiente"),
    ITEM_DELETED("🗑️ Tarea eliminada correctamente"),
    BYE("¡Hasta pronto! Escribe /start para volver a interactuar con el bot."),
    // Mensajes adicionales para TaskBotController
    TASK_CREATED("✅ ¡Tarea creada correctamente!"),
    ENTER_TASK_TITLE("Por favor, ingresa el título de la tarea:"),
    ENTER_TASK_DESCRIPTION("Ingresa la descripción de la tarea:"),
    SELECT_PRIORITY("Selecciona la prioridad de la tarea:"),
    SELECT_TYPE("Selecciona el tipo de tarea:"),
    ENTER_STORY_POINTS("Ingresa los puntos de historia (1-13):"),
    SELECT_USER("Selecciona el usuario asignado a la tarea:"),
    SELECT_SPRINT("Selecciona el sprint para la tarea:"),
    INVALID_STORY_POINTS("Por favor, ingresa un número válido entre 1 y 13:"),
    INVALID_USER("Usuario no válido. Por favor, selecciona un usuario de la lista:"),
    INVALID_SPRINT("Sprint no válido. Por favor, selecciona un sprint de la lista:"),
    ERROR_CREATING_TASK("Error al crear la tarea:"),
    NO_TASKS("No hay tareas registradas."),
    TASK_LIST_HEADER("📋 *LISTA DE TAREAS*"),
    BOT_REGISTERED_STARTED("Bot registrado y en funcionamiento correctamente");
    
    private final String message;
    
    BotMessages(String message) {
        this.message = message;
    }
    
    public String getMessage() {
        return message;
    }
}