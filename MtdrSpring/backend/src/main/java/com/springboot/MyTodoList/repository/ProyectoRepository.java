package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.Proyecto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

/**
 * REPOSITORIO DE PROYECTOS
 * 
 * Esta interfaz proporciona métodos para acceder y manipular datos de proyectos en la base de datos.
 * Extiende JpaRepository para heredar operaciones CRUD básicas y añade consultas personalizadas.
 */
@Repository
public interface ProyectoRepository extends JpaRepository<Proyecto, Integer> {
    
    /**
     * Busca proyectos activos (no eliminados)
     * 
     * @return Lista de proyectos no eliminados
     */
    @Query("SELECT p FROM Proyecto p WHERE p.deleted = 0")
    List<Proyecto> findActiveProyectos();
    
    /**
     * Busca proyectos por usuario responsable
     * 
     * @param userId ID del usuario responsable
     * @return Lista de proyectos asignados al usuario
     */
    @Query("SELECT p FROM Proyecto p WHERE p.usuario.userId = :userId AND p.deleted = 0")
    List<Proyecto> findByUsuario(@Param("userId") int userId);
    
    /**
     * Busca proyectos por estado
     * 
     * @param status Estado del proyecto (ej: "planificado", "en progreso", "completado")
     * @return Lista de proyectos con el estado especificado
     */
    List<Proyecto> findByStatusAndDeleted(String status, int deleted);
    
    /**
     * Busca proyectos que inician en un rango de fechas
     * 
     * @param startDate Fecha de inicio del rango
     * @param endDate Fecha de fin del rango
     * @return Lista de proyectos que inician en el rango especificado
     */
    @Query("SELECT p FROM Proyecto p WHERE p.startDate BETWEEN :startDate AND :endDate AND p.deleted = 0")
    List<Proyecto> findByStartDateBetween(@Param("startDate") Date startDate, @Param("endDate") Date endDate);
    
    /**
     * Busca proyectos que finalizan en un rango de fechas
     * 
     * @param startDate Fecha de inicio del rango
     * @param endDate Fecha de fin del rango
     * @return Lista de proyectos que finalizan en el rango especificado
     */
    @Query("SELECT p FROM Proyecto p WHERE p.endDate BETWEEN :startDate AND :endDate AND p.deleted = 0")
    List<Proyecto> findByEndDateBetween(@Param("startDate") Date startDate, @Param("endDate") Date endDate);
    
    /**
     * Busca proyectos actualmente en curso
     * 
     * @param currentDate Fecha actual
     * @return Lista de proyectos en curso a la fecha especificada
     */
    @Query("SELECT p FROM Proyecto p WHERE :currentDate BETWEEN p.startDate AND p.endDate AND p.deleted = 0")
    List<Proyecto> findActiveProyectosByDate(@Param("currentDate") Date currentDate);
    
    /**
     * Busca proyectos por nombre o descripción (coincidencia parcial)
     * 
     * @param searchTerm Término de búsqueda
     * @return Lista de proyectos que coinciden con el término
     */
    @Query("SELECT p FROM Proyecto p WHERE (LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(p.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND p.deleted = 0")
    List<Proyecto> searchByNameOrDescription(@Param("searchTerm") String searchTerm);

    /**
     * Busca proyectos por ID de usuario responsable (sin eliminar)
     * 
     * @param userId ID del usuario
     * @return Lista de proyectos asignados al usuario
     */
    List<Proyecto> findByUsuario_UserId(int userId);
}