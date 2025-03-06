package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.Sprint;
import com.springboot.MyTodoList.service.SprintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

/**
 * CONTROLADOR REST PARA GESTIÓN DE SPRINTS
 * 
 * Este controlador expone una API REST para gestionar sprints del sistema
 * Proporciona endpoints para listar, buscar, crear, actualizar y eliminar sprints
 * Utiliza el servicio SprintService para delegar la lógica de negocio
 */
@RestController
public class SprintController {
    
    @Autowired
    private SprintService sprintService;
    
    /**
     * LISTAR TODOS LOS SPRINTS
     * 
     * Devuelve una lista con todos los sprints activos registrados en el sistema
     * Endpoint: GET /sprints
     */
    //@CrossOrigin
    @GetMapping(value = "/sprints")
    public List<Sprint> getAllSprints() {
        return sprintService.findAll();
    }
    
    /**
     * BUSCAR SPRINT POR ID
     * 
     * Devuelve un sprint específico identificado por su ID
     * Retorna estado 200 (OK) si el sprint existe, o 404 (NOT FOUND) si no se encuentra
     * Endpoint: GET /sprints/{id}
     */
    //@CrossOrigin
    @GetMapping(value = "/sprints/{id}")
    public ResponseEntity<Sprint> getSprintById(@PathVariable int id) {
        try {
            ResponseEntity<Sprint> responseEntity = sprintService.getSprintById(id);
            return new ResponseEntity<Sprint>(responseEntity.getBody(), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    /**
     * CREAR NUEVO SPRINT
     * 
     * Añade un nuevo sprint al sistema con los datos proporcionados
     * Devuelve la ubicación del recurso creado en la cabecera HTTP "location"
     * Endpoint: POST /sprints
     */
    //@CrossOrigin
    @PostMapping(value = "/sprints")
    public ResponseEntity<?> addSprint(@RequestBody Sprint sprint) {
        try {
            Sprint newSprint = sprintService.addSprint(sprint);
            HttpHeaders responseHeaders = new HttpHeaders();
            responseHeaders.set("location", "" + newSprint.getSprintId());
            responseHeaders.set("Access-Control-Expose-Headers", "location");
            
            return ResponseEntity.ok()
                    .headers(responseHeaders).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error al crear el sprint: " + e.getMessage());
        }
    }
    
    /**
     * ACTUALIZAR SPRINT EXISTENTE
     * 
     * Actualiza los datos de un sprint existente identificado por su ID
     * Devuelve el sprint actualizado y estado 200 (OK), o 404 (NOT FOUND) si no existe
     * Endpoint: PUT /sprints/{id}
     */
    //@CrossOrigin
    @PutMapping(value = "/sprints/{id}")
    public ResponseEntity<?> updateSprint(@RequestBody Sprint sprint, @PathVariable int id) {
        try {
            Sprint updatedSprint = sprintService.updateSprint(id, sprint);
            if (updatedSprint != null) {
                return new ResponseEntity<>(updatedSprint, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>("Error al actualizar el sprint: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
    
    /**
     * ELIMINAR SPRINT
     * 
     * Elimina lógicamente un sprint del sistema por su ID
     * Retorna true y estado 200 (OK) si la eliminación es exitosa, o 404 (NOT FOUND) si falla
     * Endpoint: DELETE /sprints/{id}
     */
    //@CrossOrigin
    @DeleteMapping(value = "/sprints/{id}")
    public ResponseEntity<Boolean> deleteSprint(@PathVariable("id") int id) {
        Boolean flag = false;
        try {
            flag = sprintService.deleteSprint(id);
            return new ResponseEntity<>(flag, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(flag, HttpStatus.NOT_FOUND);
        }
    }
    
    /**
     * BUSCAR SPRINTS POR PROYECTO
     * 
     * Devuelve todos los sprints asociados a un proyecto específico
     * Endpoint: GET /sprints/proyecto/{proyectoId}
     */
    //@CrossOrigin
    @GetMapping(value = "/sprints/proyecto/{proyectoId}")
    public List<Sprint> getSprintsByProyecto(@PathVariable int proyectoId) {
        return sprintService.getSprintsByProyecto(proyectoId);
    }
    
    /**
     * BUSCAR SPRINTS POR ESTADO
     * 
     * Devuelve todos los sprints con un estado específico
     * Endpoint: GET /sprints/estado/{status}
     */
    //@CrossOrigin
    @GetMapping(value = "/sprints/estado/{status}")
    public List<Sprint> getSprintsByStatus(@PathVariable String status) {
        return sprintService.getSprintsByStatus(status);
    }
    
    /**
     * BUSCAR SPRINTS ACTIVOS
     * 
     * Devuelve todos los sprints que están actualmente en curso
     * Endpoint: GET /sprints/activos
     */
    //@CrossOrigin
    @GetMapping(value = "/sprints/activos")
    public List<Sprint> getActiveSprints() {
        return sprintService.getActiveSprints();
    }
    
    /**
     * BUSCAR SPRINTS POR NOMBRE
     * 
     * Busca sprints que coincidan con el texto de búsqueda en su nombre
     * Endpoint: GET /sprints/buscar?name={searchName}
     */
    //@CrossOrigin
    @GetMapping(value = "/sprints/buscar")
    public List<Sprint> searchSprints(@RequestParam("name") String name) {
        return sprintService.searchSprintsByName(name);
    }
}