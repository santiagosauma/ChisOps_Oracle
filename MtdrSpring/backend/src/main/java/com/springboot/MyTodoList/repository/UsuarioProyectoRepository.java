package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.UsuarioProyecto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioProyectoRepository extends JpaRepository<UsuarioProyecto, Integer> {
    
    /**
     * Encuentra todas las relaciones usuario-proyecto para un usuario específico
     * donde deleted = 0 (no eliminadas)
     */
    @Query("SELECT up FROM UsuarioProyecto up WHERE up.usuario.userId = :userId AND up.deleted = 0")
    List<UsuarioProyecto> findByUsuarioId(@Param("userId") int userId);
    
    /**
     * Encuentra todas las relaciones usuario-proyecto para un proyecto específico
     * donde deleted = 0 (no eliminadas)
     */
    @Query("SELECT up FROM UsuarioProyecto up WHERE up.proyecto.projectId = :projectId AND up.deleted = 0")
    List<UsuarioProyecto> findByProyectoId(@Param("projectId") int projectId);
    
    /**
     * Encuentra una relación usuario-proyecto específica
     * donde deleted = 0 (no eliminada)
     */
    @Query("SELECT up FROM UsuarioProyecto up WHERE up.usuario.userId = :userId AND up.proyecto.projectId = :projectId AND up.deleted = 0")
    UsuarioProyecto findByUsuarioIdAndProyectoId(@Param("userId") int userId, @Param("projectId") int projectId);
    
    /**
     * Encuentra una relación usuario-proyecto específica
     * donde deleted = 0 (no eliminada)
     * devuelve un Optional para manejar más fácilmente los casos nulos
     */
    @Query("SELECT up FROM UsuarioProyecto up WHERE up.usuario.userId = :userId AND up.proyecto.projectId = :projectId AND up.deleted = 0")
    Optional<UsuarioProyecto> findOptionalByUsuarioIdAndProyectoId(@Param("userId") int userId, @Param("projectId") int projectId);
}
