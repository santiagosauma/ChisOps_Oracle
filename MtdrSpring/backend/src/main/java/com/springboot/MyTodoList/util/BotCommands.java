package com.springboot.MyTodoList.util;

public enum BotCommands {
    
    START_COMMAND("/start", "Inicia la interacción con el bot"),
    HELP_COMMAND("/help", "Muestra la ayuda disponible"),
    TODO_LIST("/list", "Muestra la lista de tareas pendientes"),
    ADD_ITEM("/add", "Añade un nuevo elemento a la lista"),
    HIDE_COMMAND("/hide", "Oculta el teclado"),
    // Nuevos comandos específicos para tareas
    TASK_LIST("/tasks", "Lista todas las tareas"),
    CREATE_TASK("/create", "Crea una nueva tarea"),
    MY_TASKS("/mytasks", "Muestra mis tareas asignadas"),
    SPRINTS("/sprints", "Muestra los sprints disponibles"),
    // Comandos de autenticación
    LOGIN_COMMAND("/login", "Iniciar sesión"),
    LOGOUT_COMMAND("/logout", "Cerrar sesión");
    
    private final String command;
    private final String description;
    
    BotCommands(String command) {
        this.command = command;
        this.description = "";
    }
    
    BotCommands(String command, String description) {
        this.command = command;
        this.description = description;
    }
    
    public String getCommand() {
        return command;
    }
    
    public String getDescription() {
        return description;
    }
}