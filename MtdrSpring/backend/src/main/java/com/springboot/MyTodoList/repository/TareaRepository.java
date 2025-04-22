package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.Tarea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

/**
 * REPOSITORIO DE TAREAS
 * 
 * Esta interfaz proporciona métodos para acceder y manipular datos de tareas en la base de datos.
 * Extiende JpaRepository para heredar operaciones CRUD básicas y añade consultas personalizadas.
 */
@Repository
public interface TareaRepository extends JpaRepository<Tarea, Integer> {
    
    /**
     * Busca tareas activas (no eliminadas)
     * 
     * @return Lista de tareas no eliminadas
     */
    @Query("SELECT t FROM Tarea t WHERE t.deleted = 0")
    List<Tarea> findActiveTareas();
    
    /**
     * Busca tareas asignadas a un usuario específico
     * 
     * @param userId ID del usuario
     * @return Lista de tareas asignadas al usuario
     */
    @Query("SELECT t FROM Tarea t WHERE t.usuario.userId = :userId AND t.deleted = 0")
    List<Tarea> findByUsuario(@Param("userId") int userId);
    
    /**
     * Busca tareas por sprint
     * 
     * @param sprintId ID del sprint
     * @return Lista de tareas asociadas al sprint
     */
    @Query("SELECT t FROM Tarea t WHERE t.sprint.sprintId = :sprintId AND t.deleted = 0")
    List<Tarea> findBySprint(@Param("sprintId") int sprintId);
    
    /**
     * Busca tareas por estado
     * 
     * @param status Estado de la tarea (ej: "pendiente", "en progreso", "completada")
     * @return Lista de tareas con el estado especificado
     */
    List<Tarea> findByStatusAndDeleted(String status, int deleted);
    
    /**
     * Busca tareas por prioridad
     * 
     * @param priority Prioridad de la tarea (ej: "alta", "media", "baja")
     * @return Lista de tareas con la prioridad especificada
     */
    List<Tarea> findByPriorityAndDeleted(String priority, int deleted);
    
    /**
     * Busca tareas por tipo
     * 
     * @param type Tipo de tarea (ej: "bug", "feature", "improvement")
     * @return Lista de tareas del tipo especificado
     */
    List<Tarea> findByTypeAndDeleted(String type, int deleted);
    
    /**
     * Busca tareas que vencen en un rango de fechas
     * 
     * @param startDate Fecha de inicio del rango
     * @param endDate Fecha de fin del rango
     * @return Lista de tareas con fecha de vencimiento en el rango
     */
    @Query("SELECT t FROM Tarea t WHERE t.endDate BETWEEN :startDate AND :endDate AND t.deleted = 0")
    List<Tarea> findByEndDateBetween(@Param("startDate") Date startDate, @Param("endDate") Date endDate);
    
    /**
     * Busca tareas por título o descripción (coincidencia parcial)
     * 
     * @param searchTerm Término de búsqueda
     * @return Lista de tareas que coinciden con el término
     */
    @Query("SELECT t FROM Tarea t WHERE (LOWER(t.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(t.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND t.deleted = 0")
    List<Tarea> searchByTitleOrDescription(@Param("searchTerm") String searchTerm);

    /**
     * Busca tareas por usuario y sprint
     * 
     * userId ID del usuario
     * sprintId ID del sprint
     * return Lista de tareas asignadas al usuario en el sprint específico
     */
    @Query("SELECT t FROM Tarea t WHERE t.usuario.userId = :userId AND t.sprint.sprintId = :sprintId AND t.deleted = 0")
    List<Tarea> findByUsuarioAndSprint(@Param("userId") int userId, @Param("sprintId") int sprintId);
}