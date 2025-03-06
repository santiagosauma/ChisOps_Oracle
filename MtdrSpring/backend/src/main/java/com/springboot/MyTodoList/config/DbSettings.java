/**
 * CONFIGURACIÓN DE CONEXIÓN A BASE DE DATOS
 * 
 * Esta clase captura y encapsula los parámetros de conexión a la base de datos
 * definidos en application.properties o application.yml con el prefijo "spring.datasource".
 * Proporciona acceso programático a estas propiedades para pruebas locales.
 */
package com.springboot.MyTodoList.config;


import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

// This is only used for local testing.
@Configuration
@ConfigurationProperties(prefix = "spring.datasource")
public class DbSettings {
    private String url;
    private String username;
    private String password;
    private String driver_class_name;

    /**
     * OBTENER URL DE CONEXIÓN
     * 
     * Devuelve la URL JDBC de conexión a la base de datos
     * 
     * @return String con la URL de conexión
     */
    public String getUrl() {
        return url;
    }

    /**
     * ESTABLECER URL DE CONEXIÓN
     * 
     * Establece la URL JDBC para conectarse a la base de datos
     * 
     * @param url String con la URL de conexión
     */
    public void setUrl(String url) {
        this.url = url;
    }

    /**
     * OBTENER NOMBRE DE USUARIO
     * 
     * Devuelve el nombre de usuario para la autenticación en la base de datos
     * 
     * @return String con el nombre de usuario
     */
    public String getUsername() {
        return username;
    }

    /**
     * ESTABLECER NOMBRE DE USUARIO
     * 
     * Establece el nombre de usuario para la autenticación en la base de datos
     * 
     * @param username String con el nombre de usuario
     */
    public void setUsername(String username) {
        this.username = username;
    }

    /**
     * OBTENER CONTRASEÑA
     * 
     * Devuelve la contraseña para la autenticación en la base de datos
     * 
     * @return String con la contraseña
     */
    public String getPassword() {
        return password;
    }

    /**
     * ESTABLECER CONTRASEÑA
     * 
     * Establece la contraseña para la autenticación en la base de datos
     * 
     * @param password String con la contraseña
     */
    public void setPassword(String password) {
        this.password = password;
    }

    /**
     * OBTENER CLASE DEL DRIVER
     * 
     * Devuelve el nombre completo de la clase del driver JDBC
     * 
     * @return String con el nombre de la clase del driver
     */
    public String getDriver_class_name() {
        return driver_class_name;
    }

    /**
     * ESTABLECER CLASE DEL DRIVER
     * 
     * Establece el nombre completo de la clase del driver JDBC
     * 
     * @param driver_class_name String con el nombre de la clase del driver
     */
    public void setDriver_class_name(String driver_class_name) {
        this.driver_class_name = driver_class_name;
    }
}