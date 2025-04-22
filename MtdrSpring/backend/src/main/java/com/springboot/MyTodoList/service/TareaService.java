package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.Sprint;
import com.springboot.MyTodoList.model.Tarea;
import com.springboot.MyTodoList.model.Usuario;
import com.springboot.MyTodoList.repository.SprintRepository;
import com.springboot.MyTodoList.repository.TareaRepository;
import com.springboot.MyTodoList.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

/**
 * SERVICIO DE TAREAS
 * 
 * Esta clase implementa la lógica de negocio para gestionar tareas.
 * Actúa como una capa intermedia entre el controlador y el repositorio,
 * proporcionando métodos para crear, leer, actualizar y eliminar tareas,
 * así como para realizar consultas específicas y validaciones.
 */
@Service
public class TareaService {
    
    @Autowired
    private TareaRepository tareaRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private SprintRepository sprintRepository;
    
    /**
     * Obtiene todas las tareas activas del sistema
     * 
     * @return Lista de tareas no eliminadas
     */
    public List<Tarea> findAll() {
        return tareaRepository.findActiveTareas();
    }
    
    /**
     * Busca una tarea específica por su ID
     * 
     * @param id Identificador de la tarea
     * @return ResponseEntity con la tarea si existe o NOT_FOUND si no
     */
    public ResponseEntity<Tarea> getTareaById(int id) {
        Optional<Tarea> tareaData = tareaRepository.findById(id);
        if (tareaData.isPresent() && tareaData.get().getDeleted() == 0) {
            return new ResponseEntity<>(tareaData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    /**
     * Añade una nueva tarea al sistema
     * 
     * @param tarea Datos de la nueva tarea
     * @return Tarea creada con su ID generado
     * @throws Exception Si ocurre un error en la validación o creación
     */
    public Tarea addTarea(Tarea tarea) throws Exception {
        // Validar que el usuario existe
        Optional<Usuario> usuario = usuarioRepository.findById(tarea.getUsuario().getUserId());
        if (!usuario.isPresent() || usuario.get().getDeleted() == 1) {
            throw new Exception("Usuario no encontrado o inactivo");
        }
        
        // Validar que el sprint existe
        Optional<Sprint> sprint = sprintRepository.findById(tarea.getSprint().getSprintId());
        if (!sprint.isPresent() || sprint.get().getDeleted() == 1) {
            throw new Exception("Sprint no encontrado o inactivo");
        }
        
        // Asignar usuario y sprint encontrados
        tarea.setUsuario(usuario.get());
        tarea.setSprint(sprint.get());
        
        // Establecer marca de borrado a 0 (no borrado)
        tarea.setDeleted(0);
        
        return tareaRepository.save(tarea);
    }
    
    /**
     * Actualiza los datos de una tarea existente
     * 
     * @param id ID de la tarea a actualizar
     * @param tareaDetails Nuevos datos de la tarea
     * @return Tarea actualizada o null si no existe
     */
    public Tarea updateTarea(int id, Tarea tareaDetails) {
        Optional<Tarea> tareaData = tareaRepository.findById(id);
        if (tareaData.isPresent() && tareaData.get().getDeleted() == 0) {
            Tarea tarea = tareaData.get();
            
            // Actualizar atributos básicos
            tarea.setTitle(tareaDetails.getTitle());
            tarea.setDescription(tareaDetails.getDescription());
            tarea.setStatus(tareaDetails.getStatus());
            tarea.setPriority(tareaDetails.getPriority());
            tarea.setType(tareaDetails.getType());
            tarea.setStartDate(tareaDetails.getStartDate());
            tarea.setEndDate(tareaDetails.getEndDate());
            tarea.setStoryPoints(tareaDetails.getStoryPoints());
            tarea.setEstimatedHours(tareaDetails.getEstimatedHours());
            tarea.setActualHours(tareaDetails.getActualHours());
            
            // Actualizar referencias si se proporcionan
            if (tareaDetails.getUsuario() != null && tareaDetails.getUsuario().getUserId() > 0) {
                Optional<Usuario> usuario = usuarioRepository.findById(tareaDetails.getUsuario().getUserId());
                if (usuario.isPresent()) {
                    tarea.setUsuario(usuario.get());
                }
            }
            
            if (tareaDetails.getSprint() != null && tareaDetails.getSprint().getSprintId() > 0) {
                Optional<Sprint> sprint = sprintRepository.findById(tareaDetails.getSprint().getSprintId());
                if (sprint.isPresent()) {
                    tarea.setSprint(sprint.get());
                }
            }
            
            return tareaRepository.save(tarea);
        } else {
            return null;
        }
    }
    
    /**
     * Elimina una tarea del sistema (borrado lógico)
     * 
     * @param id ID de la tarea a eliminar
     * @return true si la eliminación fue exitosa, false en caso contrario
     */
    public boolean deleteTarea(int id) {
        try {
            Optional<Tarea> tarea = tareaRepository.findById(id);
            if (tarea.isPresent()) {
                Tarea tareaToDelete = tarea.get();
                // Realizamos un borrado lógico cambiando el flag 'deleted' a 1
                tareaToDelete.setDeleted(1);
                tareaRepository.save(tareaToDelete);
                return true;
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Busca tareas por usuario
     * 
     * @param userId ID del usuario
     * @return Lista de tareas asignadas al usuario
     */
    public List<Tarea> getTareasByUsuario(int userId) {
        return tareaRepository.findByUsuario(userId);
    }
    
    /**
     * Busca tareas por sprint
     * 
     * @param sprintId ID del sprint
     * @return Lista de tareas del sprint
     */
    public List<Tarea> getTareasBySprint(int sprintId) {
        return tareaRepository.findBySprint(sprintId);
    }
    
    /**
     * Busca tareas por estado
     * 
     * @param status Estado de la tarea
     * @return Lista de tareas con el estado especificado
     */
    public List<Tarea> getTareasByStatus(String status) {
        return tareaRepository.findByStatusAndDeleted(status, 0);
    }
    
    /**
     * Busca tareas por prioridad
     * 
     * @param priority Prioridad de la tarea
     * @return Lista de tareas con la prioridad especificada
     */
    public List<Tarea> getTareasByPriority(String priority) {
        return tareaRepository.findByPriorityAndDeleted(priority, 0);
    }
    
    /**
     * Busca tareas por tipo
     * 
     * @param type Tipo de tarea
     * @return Lista de tareas del tipo especificado
     */
    public List<Tarea> getTareasByType(String type) {
        return tareaRepository.findByTypeAndDeleted(type, 0);
    }
    
    /**
     * Busca tareas por texto en título o descripción
     * 
     * @param searchTerm Término de búsqueda
     * @return Lista de tareas que coinciden con el término
     */
    public List<Tarea> searchTareas(String searchTerm) {
        return tareaRepository.searchByTitleOrDescription(searchTerm);
    }
    
    /**
     * Busca tareas por usuario y sprint
     * 
     * @param userId ID del usuario
     * @param sprintId ID del sprint
     * @return Lista de tareas asignadas al usuario en el sprint específico
     */
    public List<Tarea> getTareasByUsuarioAndSprint(int userId, int sprintId) {
        return tareaRepository.findByUsuarioAndSprint(userId, sprintId);
    }
}