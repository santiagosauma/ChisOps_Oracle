package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.Tarea;
import com.springboot.MyTodoList.service.TareaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

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
}