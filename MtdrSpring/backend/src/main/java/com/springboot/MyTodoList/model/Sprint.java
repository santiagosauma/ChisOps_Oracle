package com.springboot.MyTodoList.model;

import javax.persistence.*;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import java.util.Date;
import java.util.List;

/**
 * MODELO DE SPRINT
 * 
 * Esta clase representa los sprints ágiles del sistema y mapea a la tabla ADMIN.SPRINT
 * en la base de datos Oracle. Contiene la información detallada de cada sprint,
 * incluyendo nombre, fechas de inicio y fin, estado y relación con el proyecto.
 */
@Entity
@Table(name = "SPRINT")
public class Sprint {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SPRINT_ID")
    private int sprintId;
    
    @Column(name = "NAME", nullable = false)
    private String name;
    
    @Column(name = "START_DATE", nullable = false)
    @Temporal(TemporalType.DATE)
    private Date startDate;
    
    @Column(name = "END_DATE", nullable = false)
    @Temporal(TemporalType.DATE)
    private Date endDate;
    
    @Column(name = "STATUS", nullable = false)
    private String status;
    
    @ManyToOne
    @JoinColumn(name = "PROJECT_ID", nullable = false)
    @JsonManagedReference("project-sprint")
    private Proyecto proyecto;
    
    @Column(name = "DELETED", nullable = false)
    private int deleted;
    
    @OneToMany(mappedBy = "sprint", cascade = CascadeType.ALL)
    @JsonBackReference("sprint-tarea")  // Añadir esta anotación con un identificador
    private List<Tarea> tareas;

    
    /**
     * Constructor vacío requerido por JPA
     */
    public Sprint() {
    }
    
    /**
     * Constructor completo para crear un sprint con todos sus atributos
     */
    public Sprint(int sprintId, String name, Date startDate, Date endDate, 
                 String status, Proyecto proyecto, int deleted) {
        this.sprintId = sprintId;
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
        this.proyecto = proyecto;
        this.deleted = deleted;
    }
    
    // Getters y Setters
    
    public int getSprintId() {
        return sprintId;
    }
    
    public void setSprintId(int sprintId) {
        this.sprintId = sprintId;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
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
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public Proyecto getProyecto() {
        return proyecto;
    }
    
    public void setProyecto(Proyecto proyecto) {
        this.proyecto = proyecto;
    }
    
    public int getDeleted() {
        return deleted;
    }
    
    public void setDeleted(int deleted) {
        this.deleted = deleted;
    }
    
    public List<Tarea> getTareas() {
        return tareas;
    }
    
    public void setTareas(List<Tarea> tareas) {
        this.tareas = tareas;
    }
    
    /**
     * Método para obtener una representación en cadena del sprint
     * Útil para depuración y registros
     */
    @Override
    public String toString() {
        return "Sprint{" +
                "sprintId=" + sprintId +
                ", name='" + name + '\'' +
                ", startDate=" + startDate +
                ", endDate=" + endDate +
                ", status='" + status + '\'' +
                ", projectId=" + (proyecto != null ? proyecto.getProjectId() : null) +
                ", deleted=" + deleted +
                '}';
    }
}