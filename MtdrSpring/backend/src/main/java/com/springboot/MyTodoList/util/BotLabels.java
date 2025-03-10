package com.springboot.MyTodoList.util;

public enum BotLabels {
    
    SHOW_MAIN_SCREEN("📱 Menú Principal"),
    HIDE_MAIN_SCREEN("❌ Ocultar Teclado"),
    CREATE_TASK("➕ Crear Tarea"),
    LIST_TASKS("📋 Listar Tareas"),
    MY_TODO_LIST("📋 Mis Tareas"),
    DASH("-"),
    DONE("Completar"),
    UNDO("Desmarcar"),
    DELETE("Eliminar"),
    // Nuevas etiquetas para la gestión de tareas
    FILTER_PRIORITY_HIGH("🔴 Alta prioridad"),
    FILTER_PRIORITY_MEDIUM("🟠 Media prioridad"),
    FILTER_PRIORITY_LOW("🟢 Baja prioridad"),
    FILTER_BY_USER("👤 Filtrar por usuario"),
    FILTER_BY_SPRINT("🏃 Filtrar por sprint"),
    BACK("⬅️ Volver");
    
    private final String label;
    
    BotLabels(String label) {
        this.label = label;
    }
    
    public String getLabel() {
        return label;
    }
}