package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.Proyecto;
import com.springboot.MyTodoList.model.Sprint;
import com.springboot.MyTodoList.repository.ProyectoRepository;
import com.springboot.MyTodoList.repository.SprintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

/**
 * SERVICIO DE SPRINTS
 * 
 * Esta clase implementa la lógica de negocio para gestionar sprints.
 * Actúa como una capa intermedia entre el controlador y el repositorio,
 * proporcionando métodos para crear, leer, actualizar y eliminar sprints,
 * así como para realizar consultas específicas y validaciones.
 */
@Service
public class SprintService {
    
    @Autowired
    private SprintRepository sprintRepository;
    
    @Autowired
    private ProyectoRepository proyectoRepository;
    
    /**
     * Obtiene todos los sprints activos del sistema
     * 
     * @return Lista de sprints no eliminados
     */
    public List<Sprint> findAll() {
        return sprintRepository.findActiveSprints();
    }
    
    /**
     * Busca un sprint específico por su ID
     * 
     * @param id Identificador del sprint
     * @return ResponseEntity con el sprint si existe o NOT_FOUND si no
     */
    public ResponseEntity<Sprint> getSprintById(int id) {
        Optional<Sprint> sprintData = sprintRepository.findById(id);
        if (sprintData.isPresent() && sprintData.get().getDeleted() == 0) {
            return new ResponseEntity<>(sprintData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    /**
     * Añade un nuevo sprint al sistema
     * 
     * @param sprint Datos del nuevo sprint
     * @return Sprint creado con su ID generado
     * @throws Exception Si ocurre un error en la validación o creación
     */
    public Sprint addSprint(Sprint sprint) throws Exception {
        // Validar que el proyecto existe
        Optional<Proyecto> proyecto = proyectoRepository.findById(sprint.getProyecto().getProjectId());
        if (!proyecto.isPresent() || proyecto.get().getDeleted() == 1) {
            throw new Exception("Proyecto no encontrado o inactivo");
        }
        
        // Validar fechas
        if (sprint.getEndDate().before(sprint.getStartDate())) {
            throw new Exception("La fecha de fin no puede ser anterior a la fecha de inicio");
        }
        
        // Asignar proyecto encontrado
        sprint.setProyecto(proyecto.get());
        
        // Establecer marca de borrado a 0 (no borrado)
        sprint.setDeleted(0);
        
        return sprintRepository.save(sprint);
    }
    
    /**
     * Actualiza los datos de un sprint existente
     * 
     * @param id ID del sprint a actualizar
     * @param sprintDetails Nuevos datos del sprint
     * @return Sprint actualizado o null si no existe
     * @throws Exception Si hay error en validación de datos
     */
    public Sprint updateSprint(int id, Sprint sprintDetails) throws Exception {
        Optional<Sprint> sprintData = sprintRepository.findById(id);
        if (sprintData.isPresent() && sprintData.get().getDeleted() == 0) {
            Sprint sprint = sprintData.get();
            
            // Actualizar atributos básicos
            sprint.setName(sprintDetails.getName());
            sprint.setStatus(sprintDetails.getStatus());
            
            // Validar fechas
            if (sprintDetails.getStartDate() != null) {
                sprint.setStartDate(sprintDetails.getStartDate());
            }
            
            if (sprintDetails.getEndDate() != null) {
                sprint.setEndDate(sprintDetails.getEndDate());
            }
            
            if (sprint.getEndDate().before(sprint.getStartDate())) {
                throw new Exception("La fecha de fin no puede ser anterior a la fecha de inicio");
            }
            
            // Actualizar proyecto si se proporciona
            if (sprintDetails.getProyecto() != null && sprintDetails.getProyecto().getProjectId() > 0) {
                Optional<Proyecto> proyecto = proyectoRepository.findById(sprintDetails.getProyecto().getProjectId());
                if (proyecto.isPresent() && proyecto.get().getDeleted() == 0) {
                    sprint.setProyecto(proyecto.get());
                } else {
                    throw new Exception("Proyecto no encontrado o inactivo");
                }
            }
            
            return sprintRepository.save(sprint);
        } else {
            return null;
        }
    }
    
    /**
     * Elimina un sprint del sistema (borrado lógico)
     * 
     * @param id ID del sprint a eliminar
     * @return true si la eliminación fue exitosa, false en caso contrario
     */
    public boolean deleteSprint(int id) {
        try {
            Optional<Sprint> sprint = sprintRepository.findById(id);
            if (sprint.isPresent()) {
                Sprint sprintToDelete = sprint.get();
                // Realizamos un borrado lógico cambiando el flag 'deleted' a 1
                sprintToDelete.setDeleted(1);
                sprintRepository.save(sprintToDelete);
                return true;
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Busca sprints por proyecto
     * 
     * @param proyectoId ID del proyecto
     * @return Lista de sprints asociados al proyecto
     */
    public List<Sprint> getSprintsByProyecto(int proyectoId) {
        return sprintRepository.findByProyecto(proyectoId);
    }
    
    /**
     * Busca sprints por estado
     * 
     * @param status Estado del sprint
     * @return Lista de sprints con el estado especificado
     */
    public List<Sprint> getSprintsByStatus(String status) {
        return sprintRepository.findByStatusAndDeleted(status, 0);
    }
    
    /**
     * Busca sprints actualmente activos
     * 
     * @return Lista de sprints en curso a la fecha actual
     */
    public List<Sprint> getActiveSprints() {
        return sprintRepository.findActiveSprintsByDate(new Date());
    }
    
    /**
     * Busca sprints por nombre
     * 
     * @param name Nombre o parte del nombre del sprint
     * @return Lista de sprints que coinciden con el nombre
     */
    public List<Sprint> searchSprintsByName(String name) {
        return sprintRepository.findByNameContaining(name);
    }
}