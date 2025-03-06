/**
 * CONFIGURACIÓN DE CORS (Cross-Origin Resource Sharing)
 * 
 * Esta clase configura las políticas de CORS para la aplicación,
 * permitiendo que recursos de diferentes orígenes (dominios) accedan a la API.
 * Define qué métodos HTTP, orígenes y cabeceras están permitidos en las
 * solicitudes realizadas desde dominios externos.
 * 
 * @author: peter.song@oracle.com
 */
package com.springboot.MyTodoList.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;


import java.util.Collections;
import java.util.List;

@Configuration
public class CorsConfig {
    Logger logger = LoggerFactory.getLogger(CorsConfig.class);
    
    /**
     * FILTRO CORS
     * 
     * Crea y configura un filtro CORS personalizado que se aplicará a todas las peticiones HTTP
     * - Define orígenes permitidos (inicialmente específicos, luego todos con "*")
     * - Establece métodos HTTP permitidos (GET, POST, PUT, OPTIONS, DELETE, PATCH)
     * - Permite todas las cabeceras con "*"
     * - Expone la cabecera "location" para que sea accesible al cliente
     * - Aplica esta configuración a todas las rutas ("/**")
     * 
     * @return Un filtro CORS configurado según las necesidades de la aplicación
     */
    @Bean
    public CorsFilter corsFilter(){
        CorsConfiguration config = new CorsConfiguration();
        // Define orígenes específicos permitidos (nota: esta línea queda sobreescrita por la posterior)
        config.setAllowedOrigins(List.of("http://localhost:3000","https://objectstorage.us-phoenix-1.oraclecloud.com",
                "https://petstore.swagger.io"));
        // Define los métodos HTTP permitidos
        config.setAllowedMethods(List.of("GET","POST","PUT","OPTIONS","DELETE","PATCH"));
        // Permite todos los orígenes (esto sobreescribe la configuración anterior)
        config.setAllowedOrigins(Collections.singletonList("*"));
        // Permite todas las cabeceras HTTP
        config.addAllowedHeader("*");
        // Expone la cabecera "location" para que sea accesible por JavaScript cliente
        config.addExposedHeader("location");
        // Configura el filtro para aplicar estas reglas a todas las rutas
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        // Crea y devuelve el filtro CORS
        CorsFilter filter = new CorsFilter(source);
        return filter;
    }

}