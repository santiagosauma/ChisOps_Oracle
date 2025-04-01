package com.springboot.MyTodoList.model;

import javax.persistence.*;

/**
 * MODELO DE USUARIO
 * 
 * Esta clase representa a los usuarios del sistema y mapea a la tabla ADMIN.USUARIO
 * en la base de datos Oracle. Contiene la información personal y de autenticación
 * de cada usuario, así como su rol y estado.
 */
@Entity
@Table(name = "USUARIO")
public class Usuario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "USER_ID")
    private int userId;
    
    @Column(name = "FIRST_NAME", nullable = false)
    private String firstName;
    
    @Column(name = "LAST_NAME", nullable = false)
    private String lastName;
    
    @Column(name = "EMAIL", nullable = false)
    private String email;
    
    @Column(name = "PHONE", nullable = false)
    private String phone;
    
    @Column(name = "PASSWORD_HASH", nullable = false, length = 72) // Match DB VARCHAR2(72)
    private String passwordHash;
    
    @Column(name = "ROL", nullable = false)
    private String rol;
    
    @Column(name = "DELETED", nullable = false)
    private int deleted;

    @Column(name = "TELEGRAM_USERNAME", nullable = false)
    private String telegramUsername;
    
    /**
     * Constructor vacío requerido por JPA
     */
    public Usuario() {
    }
    
    /**
     * Constructor completo para crear un usuario con todos sus atributos
     */
    public Usuario(int userId, String firstName, String lastName, String email, 
                  String phone, String passwordHash, String rol, int deleted, String telegramUsername) {
        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.passwordHash = passwordHash; 
        this.rol = rol;
        this.deleted = deleted;
        this.telegramUsername = telegramUsername;
    }
    
    // Getters y Setters
    
    public int getUserId() {
        return userId;
    }
    
    public void setUserId(int userId) {
        this.userId = userId;
    }
    
    public String getFirstName() {
        return firstName;
    }
    
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }
    
    public String getRol() {
        return rol;
    }
    
    public void setRol(String rol) {
        this.rol = rol;
    }
    
    public int getDeleted() {
        return deleted;
    }
    
    public void setDeleted(int deleted) {
        this.deleted = deleted;
    }

    public String getTelegramUsername() {
        return telegramUsername;
    }

    public void setTelegramUsername(String telegramUsername) {
        this.telegramUsername = telegramUsername;
    }
    
    /**
     * Método para obtener una representación en cadena del usuario
     * Útil para depuración y registros
     */
    @Override
    public String toString() {
        return "Usuario{" +
                "userId=" + userId +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", email='" + email + '\'' +
                ", phone='" + phone + '\'' +
                ", rol='" + rol + '\'' +
                ", deleted=" + deleted +
                ", telegramUsername='" + telegramUsername + '\'' +
                '}';
    }
}