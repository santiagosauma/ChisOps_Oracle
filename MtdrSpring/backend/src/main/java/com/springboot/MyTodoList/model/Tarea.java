package com.springboot.MyTodoList.model;

import javax.persistence.*;
import java.util.Date;

/**
 * MODELO DE TAREA
 * 
 * Esta clase representa las tareas o actividades del sistema y mapea a la tabla ADMIN.TAREA
 * en la base de datos Oracle. Contiene la información detallada de cada tarea asignada,
 * incluyendo su descripción, estado, prioridad, fechas y relaciones con sprint y usuario.
 */
@Entity
@Table(name = "TAREA", schema = "ADMIN")
public class Tarea {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "TASK_ID")
    private int taskId;
    
    @Column(name = "TITLE", nullable = false)
    private String title;
    
    @Column(name = "DESCRIPTION", nullable = false)
    private String description;
    
    @Column(name = "STATUS", nullable = false)
    private String status;
    
    @Column(name = "PRIORITY", nullable = false)
    private String priority;
    
    @Column(name = "TYPE", nullable = false)
    private String type;
    
    @Column(name = "START_DATE", nullable = false)
    @Temporal(TemporalType.DATE)
    private Date startDate;
    
    @Column(name = "END_DATE", nullable = false)
    @Temporal(TemporalType.DATE)
    private Date endDate;
    
    @Column(name = "STORY_POINTS", nullable = false)
    private int storyPoints;
    
    @ManyToOne
    @JoinColumn(name = "SPRINT_ID", nullable = false)
    private Sprint sprint;
    
    @ManyToOne
    @JoinColumn(name = "USER_ID", nullable = false)
    private Usuario usuario;
    
    @Column(name = "DELETED", nullable = false)
    private int deleted;
    
    @Column(name = "ESTIMATED_HOURS", precision = 6, scale = 2)
    private Double estimatedHours;
    
    @Column(name = "ACTUAL_HOURS", precision = 6, scale = 2)
    private Double actualHours;
    
    /**
     * Constructor vacío requerido por JPA
     */
    public Tarea() {
    }
    
    /**
     * Constructor completo para crear una tarea con todos sus atributos
     */
    public Tarea(int taskId, String title, String description, String status, String priority,
                String type, Date startDate, Date endDate, int storyPoints,
                Sprint sprint, Usuario usuario, int deleted, Double estimatedHours, Double actualHours) {
        this.taskId = taskId;
        this.title = title;
        this.description = description;
        this.status = status;
        this.priority = priority;
        this.type = type;
        this.startDate = startDate;
        this.endDate = endDate;
        this.storyPoints = storyPoints;
        this.sprint = sprint;
        this.usuario = usuario;
        this.deleted = deleted;
        this.estimatedHours = estimatedHours;
        this.actualHours = actualHours;
    }
    
    // Getters y Setters
    
    public int getTaskId() {
        return taskId;
    }
    
    public void setTaskId(int taskId) {
        this.taskId = taskId;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getPriority() {
        return priority;
    }
    
    public void setPriority(String priority) {
        this.priority = priority;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public Date getStartDate() {
        return startDate;
    }
    
    public void setStartDate(Date startDate) {
        this.startDate = startDate;
    }
    
    public Date getEndDate() {
        return endDate;
    }
    
    public void setEndDate(Date endDate) {
        this.endDate = endDate;
    }
    
    public int getStoryPoints() {
        return storyPoints;
    }
    
    public void setStoryPoints(int storyPoints) {
        this.storyPoints = storyPoints;
    }
    
    public Sprint getSprint() {
        return sprint;
    }
    
    public void setSprint(Sprint sprint) {
        this.sprint = sprint;
    }
    
    public Usuario getUsuario() {
        return usuario;
    }
    
    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }
    
    public int getDeleted() {
        return deleted;
    }
    
    public void setDeleted(int deleted) {
        this.deleted = deleted;
    }
    
    public Double getEstimatedHours() {
        return estimatedHours;
    }
    
    public void setEstimatedHours(Double estimatedHours) {
        this.estimatedHours = estimatedHours;
    }
    
    public Double getActualHours() {
        return actualHours;
    }
    
    public void setActualHours(Double actualHours) {
        this.actualHours = actualHours;
    }
    
    /**
     * Método para obtener una representación en cadena de la tarea
     * Útil para depuración y registros
     */
    @Override
    public String toString() {
        return "Tarea{" +
                "taskId=" + taskId +
                ", title='" + title + '\'' +
                ", description='" + description + '\'' +
                ", status='" + status + '\'' +
                ", priority='" + priority + '\'' +
                ", type='" + type + '\'' +
                ", startDate=" + startDate +
                ", endDate=" + endDate +
                ", storyPoints=" + storyPoints +
                ", sprintId=" + (sprint != null ? sprint.getSprintId() : null) +
                ", userId=" + (usuario != null ? usuario.getUserId() : null) +
                ", deleted=" + deleted +
                ", estimatedHours=" + estimatedHours +
                ", actualHours=" + actualHours +
                '}';
    }
}