/**
 * CONFIGURACIÓN DE CONEXIÓN A ORACLE DATABASE
 * 
 * Esta clase configura el DataSource para la conexión a Oracle Database.
 * Puede usar variables de entorno del contenedor Docker para entornos de producción
 * o la configuración local desde DbSettings para pruebas locales.
 * 
 * @author: peter.song@oracle.com
 */
package com.springboot.MyTodoList.config;


import oracle.jdbc.pool.OracleDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;


import javax.sql.DataSource;
import java.sql.SQLException;

@Configuration
public class OracleConfiguration {
    Logger logger = LoggerFactory.getLogger(DbSettings.class);
    @Autowired
    private DbSettings dbSettings;
    @Autowired
    private Environment env;
    
    /**
     * CREAR DATA SOURCE PARA ORACLE
     * 
     * Configura y devuelve un OracleDataSource con los parámetros de conexión.
     * Actualmente usa variables de entorno del sistema/contenedor.
     * También incluye (comentado) código para usar configuración local de pruebas.
     * Registra información de conexión en logs para diagnóstico.
     * 
     * @return DataSource configurado para Oracle
     * @throws SQLException si ocurre un error en la configuración del datasource
     */
    @Bean
    public DataSource dataSource() throws SQLException{
        OracleDataSource ds = new OracleDataSource();
        // Configuración usando variables de entorno (para producción/Docker)
        ds.setDriverType(env.getProperty("driver_class_name"));
        logger.info("Using Driver " + env.getProperty("driver_class_name"));
        ds.setURL(env.getProperty("db_url"));
        logger.info("Using URL: " + env.getProperty("db_url"));
        ds.setUser(env.getProperty("db_user"));
        logger.info("Using Username " + env.getProperty("db_user"));
        ds.setPassword(env.getProperty("dbpassword"));
        
//        // Configuración para pruebas locales (comentada)
//        ds.setDriverType(dbSettings.getDriver_class_name());
//        logger.info("Using Driver " + dbSettings.getDriver_class_name());
//        ds.setURL(dbSettings.getUrl());
//        logger.info("Using URL: " + dbSettings.getUrl());
//        ds.setUser(dbSettings.getUsername());
//        logger.info("Using Username: " + dbSettings.getUsername());
//        ds.setPassword(dbSettings.getPassword());
        
        return ds;
    }
}