package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.Proyecto;
import com.springboot.MyTodoList.service.ProyectoService;
import com.springboot.MyTodoList.model.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * CONTROLADOR REST PARA GESTIÓN DE PROYECTOS
 * 
 * Este controlador expone una API REST para gestionar proyectos del sistema
 * Proporciona endpoints para listar, buscar, crear, actualizar y eliminar proyectos
 * Utiliza el servicio ProyectoService para delegar la lógica de negocio
 */
@RestController
public class ProyectoController {
    
    @Autowired
    private ProyectoService proyectoService;
    
    /**
     * LISTAR TODOS LOS PROYECTOS
     * 
     * Devuelve una lista con todos los proyectos activos registrados en el sistema
     * Endpoint: GET /proyectos
     */
    //@CrossOrigin
    @GetMapping(value = "/proyectos")
    public List<Proyecto> getAllProyectos() {
        return proyectoService.findAll();
    }


    /**
     * OBTENER USUARIOS POR PROYECTO
     * 
     * Devuelve todos los usuarios asociados a un proyecto específico a través de sus tareas en los sprints
     * Endpoint: GET /proyectos/{proyectoId}/usuarios
     */
    @GetMapping(value = "/proyectos/{proyectoId}/usuarios")
    public ResponseEntity<?> getUsuariosByProyecto(@PathVariable int proyectoId) {
        try {
            List<Usuario> usuarios = proyectoService.getUsuariosByProyecto(proyectoId);
            return new ResponseEntity<>(usuarios, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>("Error al obtener usuarios del proyecto", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    
    /**
     * BUSCAR PROYECTO POR ID
     * 
     * Devuelve un proyecto específico identificado por su ID
     * Retorna estado 200 (OK) si el proyecto existe, o 404 (NOT FOUND) si no se encuentra
     * Endpoint: GET /proyectos/{id}
     */
    //@CrossOrigin
    @GetMapping(value = "/proyectos/{id}")
    public ResponseEntity<Proyecto> getProyectoById(@PathVariable int id) {
        try {
            ResponseEntity<Proyecto> responseEntity = proyectoService.getProyectoById(id);
            return new ResponseEntity<Proyecto>(responseEntity.getBody(), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    /**
     * CREAR NUEVO PROYECTO
     * 
     * Añade un nuevo proyecto al sistema con los datos proporcionados
     * Devuelve la ubicación del recurso creado en la cabecera HTTP "location"
     * Endpoint: POST /proyectos
     */
    //@CrossOrigin
    @PostMapping(value = "/proyectos")
    public ResponseEntity<?> addProyecto(@RequestBody Proyecto proyecto) {
        try {
            Proyecto newProyecto = proyectoService.addProyecto(proyecto);
            HttpHeaders responseHeaders = new HttpHeaders();
            responseHeaders.set("location", "" + newProyecto.getProjectId());
            responseHeaders.set("Access-Control-Expose-Headers", "location");
            
            return ResponseEntity.ok()
                    .headers(responseHeaders).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error al crear el proyecto: " + e.getMessage());
        }
    }
    
    /**
     * ACTUALIZAR PROYECTO EXISTENTE
     * 
     * Actualiza los datos de un proyecto existente identificado por su ID
     * Devuelve el proyecto actualizado y estado 200 (OK), o 404 (NOT FOUND) si no existe
     * Endpoint: PUT /proyectos/{id}
     */
    //@CrossOrigin
    @PutMapping(value = "/proyectos/{id}")
    public ResponseEntity<?> updateProyecto(@RequestBody Proyecto proyecto, @PathVariable int id) {
        try {
            Proyecto updatedProyecto = proyectoService.updateProyecto(id, proyecto);
            if (updatedProyecto != null) {
                return new ResponseEntity<>(updatedProyecto, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>("Error al actualizar el proyecto: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
    
    /**
     * ELIMINAR PROYECTO
     * 
     * Elimina lógicamente un proyecto del sistema por su ID
     * Retorna true y estado 200 (OK) si la eliminación es exitosa, o 404 (NOT FOUND) si falla
     * Endpoint: DELETE /proyectos/{id}
     */
    //@CrossOrigin
    @DeleteMapping(value = "/proyectos/{id}")
    public ResponseEntity<Boolean> deleteProyecto(@PathVariable("id") int id) {
        Boolean flag = false;
        try {
            flag = proyectoService.deleteProyecto(id);
            return new ResponseEntity<>(flag, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(flag, HttpStatus.NOT_FOUND);
        }
    }
    
    /**
     * BUSCAR PROYECTOS POR USUARIO
     * 
     * Devuelve todos los proyectos asignados a un usuario específico
     * Endpoint: GET /proyectos/usuario/{userId}
     */
    //@CrossOrigin
    @GetMapping(value = "/proyectos/usuario/{userId}")
    public List<Proyecto> getProyectosByUsuario(@PathVariable int userId) {
        return proyectoService.getProyectosByUsuario(userId);
    }

    /**
 * OBTENER PROYECTOS SIMPLIFICADOS POR USUARIO
 * 
 * Devuelve una lista de proyectos asociados a un usuario con solo información básica
 * Endpoint: GET /proyectos/usuario/{userId}/simplificados
 */
   @GetMapping(value = "/proyectos/usuario/{userId}/simplificados")
public ResponseEntity<List<Map<String, Object>>> getProyectosSimplificadosByUsuario(@PathVariable int userId) {
    List<Proyecto> proyectos = proyectoService.getProyectosByUsuario(userId);
    List<Map<String, Object>> proyectosSimplificados = proyectos.stream()
        .map((Proyecto proyecto) -> {
            Map<String, Object> proyectoMap = new HashMap<String, Object>();
            proyectoMap.put("projectId", proyecto.getProjectId());
            proyectoMap.put("name", proyecto.getName());
            proyectoMap.put("startDate", proyecto.getStartDate());
            proyectoMap.put("endDate", proyecto.getEndDate());
            proyectoMap.put("status", proyecto.getStatus());
            return proyectoMap;
        })
        .collect(Collectors.toList());
    return new ResponseEntity<>(proyectosSimplificados, HttpStatus.OK);
}



    
    /**
     * BUSCAR PROYECTOS POR ESTADO
     * 
     * Devuelve todos los proyectos con un estado específico
     * Endpoint: GET /proyectos/estado/{status}
     */
    //@CrossOrigin
    @GetMapping(value = "/proyectos/estado/{status}")
    public List<Proyecto> getProyectosByStatus(@PathVariable String status) {
        return proyectoService.getProyectosByStatus(status);
    }
    
    /**
     * BUSCAR PROYECTOS ACTIVOS
     * 
     * Devuelve todos los proyectos que están actualmente en curso
     * Endpoint: GET /proyectos/activos
     */
    //@CrossOrigin
    @GetMapping(value = "/proyectos/activos")
    public List<Proyecto> getActiveProyectos() {
        return proyectoService.getActiveProyectos();
    }
    
    /**
     * OBTENER PROYECTOS ACTIVOS DETALLADOS
     * 
     * Devuelve todos los proyectos con estado 'En progreso', 'In Progress', 'Activo' o 'Active' con información adicional
     * Endpoint: GET /proyectos/activos-detallados
     */
    @GetMapping(value = "/proyectos/activos-detallados")
    public ResponseEntity<?> getActiveProjectsDetailed() {
        try {
            List<Proyecto> allProjects = proyectoService.findAll();
            List<Proyecto> activeProjects = allProjects.stream()
                .filter(p -> "En progreso".equalsIgnoreCase(p.getStatus()) || 
                             "In Progress".equalsIgnoreCase(p.getStatus()) || 
                             "Activo".equalsIgnoreCase(p.getStatus()) ||
                             "Active".equalsIgnoreCase(p.getStatus()))
                .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("activeProjects", activeProjects);
            response.put("totalProjects", allProjects.size());
            response.put("activeCount", activeProjects.size());
            
            // Count by status for debugging
            Map<String, Long> statusCounts = allProjects.stream()
                .collect(Collectors.groupingBy(
                    Proyecto::getStatus,
                    Collectors.counting()
                ));
            response.put("statusCounts", statusCounts);
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Error retrieving active projects: " + e.getMessage(), 
                                        HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * BUSCAR PROYECTOS POR TEXTO
     * 
     * Busca proyectos que contengan el texto de búsqueda en su nombre o descripción
     * Endpoint: GET /proyectos/buscar?term={searchTerm}
     */
    //@CrossOrigin
    @GetMapping(value = "/proyectos/buscar")
    public List<Proyecto> searchProyectos(@RequestParam("term") String searchTerm) {
        return proyectoService.searchProyectos(searchTerm);
    }
}