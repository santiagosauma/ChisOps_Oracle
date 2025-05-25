package com.springboot.MyTodoList.model;

import javax.persistence.*;
import java.util.Date;

/**
 * MODELO DE USUARIO_PROYECTO
 * 
 * Esta clase representa la relación muchos a muchos entre usuarios y proyectos.
 * Permite asignar múltiples usuarios a múltiples proyectos y viceversa.
 * Incluye información adicional sobre la relación, como el rol del usuario en el proyecto
 * y la fecha de asignación.
 */
@Entity
@Table(name = "USUARIO_PROYECTO")
public class UsuarioProyecto {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "USER_PROJECT_ID")
    private int userProjectId;
    
    @ManyToOne
    @JoinColumn(name = "USER_ID", nullable = false)
    private Usuario usuario;
    
    @ManyToOne
    @JoinColumn(name = "PROJECT_ID", nullable = false)
    private Proyecto proyecto;
    
    @Column(name = "ROLE")
    private String role;
    
    @Column(name = "ASSIGNMENT_DATE")
    @Temporal(TemporalType.DATE)
    private Date assignmentDate;
    
    @Column(name = "DELETED", nullable = false)
    private int deleted;
    
    /**
     * Constructor vacío requerido por JPA
     */
    public UsuarioProyecto() {
        this.deleted = 0;
    }
    
    /**
     * Constructor completo para crear una relación usuario-proyecto
     */
    public UsuarioProyecto(Usuario usuario, Proyecto proyecto, String role, Date assignmentDate) {
        this.usuario = usuario;
        this.proyecto = proyecto;
        this.role = role;
        this.assignmentDate = assignmentDate;
        this.deleted = 0;
    }
    
    // Getters y Setters
    
    public int getUserProjectId() {
        return userProjectId;
    }
    
    public void setUserProjectId(int userProjectId) {
        this.userProjectId = userProjectId;
    }
    
    public Usuario getUsuario() {
        return usuario;
    }
    
    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }
    
    public Proyecto getProyecto() {
        return proyecto;
    }
    
    public void setProyecto(Proyecto proyecto) {
        this.proyecto = proyecto;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
    
    public Date getAssignmentDate() {
        return assignmentDate;
    }
    
    public void setAssignmentDate(Date assignmentDate) {
        this.assignmentDate = assignmentDate;
    }
    
    public int getDeleted() {
        return deleted;
    }
    
    public void setDeleted(int deleted) {
        this.deleted = deleted;
    }
    
    /**
     * Método para obtener una representación en cadena de la relación usuario-proyecto
     */
    @Override
    public String toString() {
        return "UsuarioProyecto{" +
                "userProjectId=" + userProjectId +
                ", userId=" + (usuario != null ? usuario.getUserId() : null) +
                ", projectId=" + (proyecto != null ? proyecto.getProjectId() : null) +
                ", role='" + role + '\'' +
                ", assignmentDate=" + assignmentDate +
                ", deleted=" + deleted +
                '}';
    }
}
