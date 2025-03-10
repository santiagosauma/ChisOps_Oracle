package com.springboot.MyTodoList.util;

public enum BotCommands {
    
    START_COMMAND("/start"),
    HELP_COMMAND("/help"),
    TODO_LIST("/list"),
    ADD_ITEM("/add"),
    HIDE_COMMAND("/hide"),
    // Nuevos comandos específicos para tareas
    TASK_LIST("/tasks"),
    CREATE_TASK("/create"),
    MY_TASKS("/mytasks"),
    SPRINTS("/sprints");
    
    private final String command;
    
    BotCommands(String command) {
        this.command = command;
    }
    
    public String getCommand() {
        return command;
    }
}