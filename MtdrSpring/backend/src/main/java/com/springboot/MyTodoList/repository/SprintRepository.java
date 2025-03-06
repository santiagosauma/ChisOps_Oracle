package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.Sprint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

/**
 * REPOSITORIO DE SPRINTS
 * 
 * Esta interfaz proporciona métodos para acceder y manipular datos de sprints en la base de datos.
 * Extiende JpaRepository para heredar operaciones CRUD básicas y añade consultas personalizadas.
 */
@Repository
public interface SprintRepository extends JpaRepository<Sprint, Integer> {
    
    /**
     * Busca sprints activos (no eliminados)
     * 
     * @return Lista de sprints no eliminados
     */
    @Query("SELECT s FROM Sprint s WHERE s.deleted = 0")
    List<Sprint> findActiveSprints();
    
    /**
     * Busca sprints por proyecto
     * 
     * @param projectId ID del proyecto
     * @return Lista de sprints asociados al proyecto
     */
    @Query("SELECT s FROM Sprint s WHERE s.proyecto.projectId = :projectId AND s.deleted = 0")
    List<Sprint> findByProyecto(@Param("projectId") int projectId);
    
    /**
     * Busca sprints por estado
     * 
     * @param status Estado del sprint (ej: "planificado", "en progreso", "completado")
     * @return Lista de sprints con el estado especificado
     */
    List<Sprint> findByStatusAndDeleted(String status, int deleted);
    
    /**
     * Busca sprints que inician en un rango de fechas
     * 
     * @param startDate Fecha de inicio del rango
     * @param endDate Fecha de fin del rango
     * @return Lista de sprints que inician en el rango especificado
     */
    @Query("SELECT s FROM Sprint s WHERE s.startDate BETWEEN :startDate AND :endDate AND s.deleted = 0")
    List<Sprint> findByStartDateBetween(@Param("startDate") Date startDate, @Param("endDate") Date endDate);
    
    /**
     * Busca sprints que finalizan en un rango de fechas
     * 
     * @param startDate Fecha de inicio del rango
     * @param endDate Fecha de fin del rango
     * @return Lista de sprints que finalizan en el rango especificado
     */
    @Query("SELECT s FROM Sprint s WHERE s.endDate BETWEEN :startDate AND :endDate AND s.deleted = 0")
    List<Sprint> findByEndDateBetween(@Param("startDate") Date startDate, @Param("endDate") Date endDate);
    
    /**
     * Busca sprints actualmente en curso
     * 
     * @param currentDate Fecha actual
     * @return Lista de sprints en curso a la fecha especificada
     */
    @Query("SELECT s FROM Sprint s WHERE :currentDate BETWEEN s.startDate AND s.endDate AND s.deleted = 0")
    List<Sprint> findActiveSprintsByDate(@Param("currentDate") Date currentDate);
    
    /**
     * Busca sprints por nombre (coincidencia parcial)
     * 
     * @param name Nombre o parte del nombre del sprint
     * @return Lista de sprints que coinciden con el nombre
     */
    @Query("SELECT s FROM Sprint s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :name, '%')) AND s.deleted = 0")
    List<Sprint> findByNameContaining(@Param("name") String name);
}
