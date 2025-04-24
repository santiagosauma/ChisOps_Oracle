package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.Proyecto;
import com.springboot.MyTodoList.model.Sprint;
import com.springboot.MyTodoList.model.Tarea;
import com.springboot.MyTodoList.repository.ProyectoRepository;
import com.springboot.MyTodoList.service.SprintService;
import com.springboot.MyTodoList.service.TareaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * CONTROLADOR REST PARA GESTIÓN DE TAREAS
 * 
 * Este controlador expone una API REST para gestionar tareas del sistema
 * Proporciona endpoints para listar, buscar, crear, actualizar y eliminar tareas
 * Utiliza el servicio TareaService para delegar la lógica de negocio
 */
@RestController
public class TareaController {
    
    @Autowired
    private TareaService tareaService;
    @Autowired
    private SprintService sprintService;

    @Autowired
    private ProyectoRepository proyectoRepository;
    
    
    /**
     * LISTAR TODAS LAS TAREAS
     * 
     * Devuelve una lista con todas las tareas activas registradas en el sistema
     * Endpoint: GET /tareas
     */
    //@CrossOrigin
    @GetMapping(value = "/tareas")
    public List<Tarea> getAllTareas() {
        return tareaService.findAll();
    }
    
    /**
     * BUSCAR TAREA POR ID
     * 
     * Devuelve una tarea específica identificada por su ID
     * Retorna estado 200 (OK) si la tarea existe, o 404 (NOT FOUND) si no se encuentra
     * Endpoint: GET /tareas/{id}
     */
    //@CrossOrigin
    @GetMapping(value = "/tareas/{id}")
    public ResponseEntity<Tarea> getTareaById(@PathVariable int id) {
        try {
            ResponseEntity<Tarea> responseEntity = tareaService.getTareaById(id);
            return new ResponseEntity<Tarea>(responseEntity.getBody(), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    /**
     * CREAR NUEVA TAREA
     * 
     * Añade una nueva tarea al sistema con los datos proporcionados
     * Devuelve la ubicación del recurso creado en la cabecera HTTP "location"
     * Endpoint: POST /tareas
     */
    //@CrossOrigin
    @PostMapping(value = "/tareas")
    public ResponseEntity<?> addTarea(@RequestBody Tarea tarea) {
        try {
            Tarea newTarea = tareaService.addTarea(tarea);
            HttpHeaders responseHeaders = new HttpHeaders();
            responseHeaders.set("location", "" + newTarea.getTaskId());
            responseHeaders.set("Access-Control-Expose-Headers", "location");
            
            return ResponseEntity.ok()
                    .headers(responseHeaders).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error al crear la tarea: " + e.getMessage());
        }
    }
    
    /**
     * ACTUALIZAR TAREA EXISTENTE
     * 
     * Actualiza los datos de una tarea existente identificada por su ID
     * Devuelve la tarea actualizada y estado 200 (OK), o 404 (NOT FOUND) si no existe
     * Endpoint: PUT /tareas/{id}
     */
    //@CrossOrigin
    @PutMapping(value = "/tareas/{id}")
    public ResponseEntity<?> updateTarea(@RequestBody Tarea tarea, @PathVariable int id) {
        try {
            Tarea updatedTarea = tareaService.updateTarea(id, tarea);
            if (updatedTarea != null) {
                return new ResponseEntity<>(updatedTarea, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>("Error al actualizar la tarea: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
    
    /**
     * ELIMINAR TAREA
     * 
     * Elimina lógicamente una tarea del sistema por su ID
     * Retorna true y estado 200 (OK) si la eliminación es exitosa, o 404 (NOT FOUND) si falla
     * Endpoint: DELETE /tareas/{id}
     */
    //@CrossOrigin
    @DeleteMapping(value = "/tareas/{id}")
    public ResponseEntity<Boolean> deleteTarea(@PathVariable("id") int id) {
        Boolean flag = false;
        try {
            flag = tareaService.deleteTarea(id);
            return new ResponseEntity<>(flag, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(flag, HttpStatus.NOT_FOUND);
        }
    }
    
    /**
     * BUSCAR TAREAS POR USUARIO
     * 
     * Devuelve todas las tareas asignadas a un usuario específico
     * Endpoint: GET /tareas/usuario/{userId}
     */
    //@CrossOrigin
    @GetMapping(value = "/tareas/usuario/{userId}")
    public List<Tarea> getTareasByUsuario(@PathVariable int userId) {
        return tareaService.getTareasByUsuario(userId);
    }
    
    /**
     * BUSCAR TAREAS POR SPRINT
     * 
     * Devuelve todas las tareas asociadas a un sprint específico
     * Endpoint: GET /tareas/sprint/{sprintId}
     */
    //@CrossOrigin
    @GetMapping(value = "/tareas/sprint/{sprintId}")
    public List<Tarea> getTareasBySprint(@PathVariable int sprintId) {
        return tareaService.getTareasBySprint(sprintId);
    }
    
    /**
     * BUSCAR TAREAS POR ESTADO
     * 
     * Devuelve todas las tareas con un estado específico
     * Endpoint: GET /tareas/estado/{status}
     */
    //@CrossOrigin
    @GetMapping(value = "/tareas/estado/{status}")
    public List<Tarea> getTareasByStatus(@PathVariable String status) {
        return tareaService.getTareasByStatus(status);
    }
    
    /**
     * BUSCAR TAREAS POR PRIORIDAD
     * 
     * Devuelve todas las tareas con una prioridad específica
     * Endpoint: GET /tareas/prioridad/{priority}
     */
    //@CrossOrigin
    @GetMapping(value = "/tareas/prioridad/{priority}")
    public List<Tarea> getTareasByPriority(@PathVariable String priority) {
        return tareaService.getTareasByPriority(priority);
    }
    
    /**
     * BUSCAR TAREAS POR TIPO
     * 
     * Devuelve todas las tareas de un tipo específico
     * Endpoint: GET /tareas/tipo/{type}
     */
    //@CrossOrigin
    @GetMapping(value = "/tareas/tipo/{type}")
    public List<Tarea> getTareasByType(@PathVariable String type) {
        return tareaService.getTareasByType(type);
    }
    
    /**
     * BUSCAR TAREAS POR TEXTO
     * 
     * Busca tareas que contengan el texto de búsqueda en su título o descripción
     * Endpoint: GET /tareas/buscar?term={searchTerm}
     */
    //@CrossOrigin
    @GetMapping(value = "/tareas/buscar")
    public List<Tarea> searchTareas(@RequestParam("term") String searchTerm) {
        return tareaService.searchTareas(searchTerm);
    }
    
    /**
     * BUSCAR TAREAS POR USUARIO Y SPRINT
     * 
     * Devuelve todas las tareas asignadas a un usuario específico en un sprint específico
     * Endpoint: GET /tareas/usuario/{userId}/sprint/{sprintId}
     */
    //@CrossOrigin
    @GetMapping(value = "/tareas/usuario/{userId}/sprint/{sprintId}")
    public List<Tarea> getTareasByUsuarioAndSprint(@PathVariable int userId, @PathVariable int sprintId) {
        return tareaService.getTareasByUsuarioAndSprint(userId, sprintId);
    }

    /**
 * OBTENER TAREAS DE USUARIO POR PROYECTO ORGANIZADAS POR SPRINT
 * 
 * Devuelve un mapa de sprints con sus tareas para un usuario en un proyecto específico
 * Endpoint: GET /tareas/usuario/{userId}/proyecto/{proyectoId}/organizadas
 */
        @GetMapping(value = "/tareas/usuario/{userId}/proyecto/{proyectoId}/organizadas")
        public ResponseEntity<Map<String, Object>> getTareasOrganizadasPorSprint(
                @PathVariable int userId, 
                @PathVariable int proyectoId) {
            
            try {
                // 1. Obtener todos los sprints del proyecto
                List<Sprint> sprints = sprintService.getSprintsByProyecto(proyectoId);
                
                // 2. Estructura para la respuesta
                Map<String, Object> response = new HashMap<>();
                List<Map<String, Object>> sprintsData = new ArrayList<>();
                
                // 3. Procesar cada sprint
                for (Sprint sprint : sprints) {
                    if (sprint.getDeleted() == 0) { // Solo sprints activos
                        // Obtener tareas del usuario en este sprint
                        List<Tarea> tareas = tareaService.getTareasByUsuarioAndSprint(userId, sprint.getSprintId());
                        
                        // Convertir tareas a formato simplificado
                        List<Map<String, Object>> tareasSimplificadas = tareas.stream()
                            .filter(t -> t.getDeleted() == 0) // Solo tareas activas
                            .map(t -> {
                                Map<String, Object> tareaMap = new HashMap<>();
                                tareaMap.put("taskId", t.getTaskId());
                                tareaMap.put("title", t.getTitle());
                                tareaMap.put("description", t.getDescription());
                                tareaMap.put("status", t.getStatus());
                                tareaMap.put("priority", t.getPriority());
                                tareaMap.put("type", t.getType());
                                tareaMap.put("startDate", t.getStartDate());
                                tareaMap.put("endDate", t.getEndDate());
                                tareaMap.put("storyPoints", t.getStoryPoints());
                                tareaMap.put("estimatedHours", t.getEstimatedHours());
                                tareaMap.put("actualHours", t.getActualHours());
                                return tareaMap;
                            })
                            .collect(Collectors.toList());
                        
                        // Agregar datos del sprint
                        Map<String, Object> sprintData = new HashMap<>();
                        sprintData.put("sprintId", sprint.getSprintId());
                        sprintData.put("sprintName", sprint.getName());
                        sprintData.put("tasks", tareasSimplificadas);
                        sprintsData.add(sprintData);
                    }
                }
                
                // 4. Agregar información del proyecto
                Optional<Proyecto> proyecto = proyectoRepository.findById(proyectoId);
                if (proyecto.isPresent() && proyecto.get().getDeleted() == 0) {
                    response.put("projectId", proyectoId);
                    response.put("projectName", proyecto.get().getName());
                }
                
                response.put("sprints", sprintsData);
                
                return new ResponseEntity<>(response, HttpStatus.OK);
                
            } catch (Exception e) {
                return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
}