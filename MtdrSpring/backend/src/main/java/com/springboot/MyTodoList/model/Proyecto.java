package com.springboot.MyTodoList.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import javax.persistence.*;
import java.util.Date;
import java.util.List;

/**
 * MODELO DE PROYECTO
 * 
 * Esta clase representa los proyectos del sistema y mapea a la tabla ADMIN.PROYECTO
 * en la base de datos Oracle. Contiene la información detallada de cada proyecto,
 * incluyendo nombre, descripción, fechas de inicio y fin, estado y el usuario responsable.
 */
@Entity
@Table(name = "PROYECTO")
public class Proyecto {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PROJECT_ID")
    private int projectId;
    
    @Column(name = "NAME", nullable = false)
    private String name;
    
    @Column(name = "DESCRIPTION", nullable = false)
    private String description;
    
    @Column(name = "START_DATE", nullable = false)
    @Temporal(TemporalType.DATE)
    private Date startDate;
    
    @Column(name = "END_DATE", nullable = false)
    @Temporal(TemporalType.DATE)
    private Date endDate;
    
    @Column(name = "STATUS", nullable = false)
    private String status;
    
    @ManyToOne
    @JoinColumn(name = "USER_ID", nullable = false)
    private Usuario usuario;
    
    @Column(name = "DELETED", nullable = false)
    private int deleted;
    
    @OneToMany(mappedBy = "proyecto", cascade = CascadeType.ALL)
    @JsonBackReference("project-sprint")
    private List<Sprint> sprints;
    
    /**
     * Constructor vacío requerido por JPA
     */
    public Proyecto() {
    }
    
    /**
     * Constructor completo para crear un proyecto con todos sus atributos
     */
    public Proyecto(int projectId, String name, String description, Date startDate, 
                   Date endDate, String status, Usuario usuario, int deleted) {
        this.projectId = projectId;
        this.name = name;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
        this.usuario = usuario;
        this.deleted = deleted;
    }
    
    // Getters y Setters
    
    public int getProjectId() {
        return projectId;
    }
    
    public void setProjectId(int projectId) {
        this.projectId = projectId;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
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
    
    public List<Sprint> getSprints() {
        return sprints;
    }
    
    public void setSprints(List<Sprint> sprints) {
        this.sprints = sprints;
    }
    
    /**
     * Método para obtener una representación en cadena del proyecto
     * Útil para depuración y registros
     */
    @Override
    public String toString() {
        return "Proyecto{" +
                "projectId=" + projectId +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", startDate=" + startDate +
                ", endDate=" + endDate +
                ", status='" + status + '\'' +
                ", userId=" + (usuario != null ? usuario.getUserId() : null) +
                ", deleted=" + deleted +
                '}';
    }
}