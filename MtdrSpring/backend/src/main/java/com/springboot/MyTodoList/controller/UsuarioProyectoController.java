package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.Proyecto;
import com.springboot.MyTodoList.model.Usuario;
import com.springboot.MyTodoList.model.UsuarioProyecto;
import com.springboot.MyTodoList.service.UsuarioProyectoService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * CONTROLADOR REST PARA GESTIÓN DE RELACIONES USUARIO-PROYECTO
 * 
 * Este controlador expone una API REST para gestionar las asignaciones de usuarios a proyectos
 * Proporciona endpoints para listar, asignar y desasignar usuarios de proyectos
 */
@RestController
public class UsuarioProyectoController {
    
    @Autowired
    private UsuarioProyectoService usuarioProyectoService;
    
    /**
     * LISTAR TODAS LAS ASIGNACIONES
     * 
     * Devuelve una lista con todas las asignaciones de usuarios a proyectos
     * Endpoint: GET /usuarios-proyectos
     */
    @GetMapping(value = "/usuarios-proyectos")
    public List<UsuarioProyecto> getAllUsuarioProyecto() {
        return usuarioProyectoService.findAll();
    }
    
    /**
     * LISTAR PROYECTOS DE UN USUARIO
     * 
     * Devuelve todos los proyectos asignados a un usuario específico
     * Endpoint: GET /usuarios/{userId}/proyectos
     */
    @GetMapping(value = "/usuarios/{userId}/proyectos")
    public ResponseEntity<?> getProyectosByUsuario(@PathVariable int userId) {
        try {
            List<Proyecto> proyectos = usuarioProyectoService.findProyectosByUsuarioId(userId);
            return new ResponseEntity<>(proyectos, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * LISTAR USUARIOS DE UN PROYECTO (DESDE LA TABLA DE ASIGNACIÓN)
     * 
     * Devuelve todos los usuarios asignados a un proyecto específico
     * Endpoint: GET /proyectos/{projectId}/usuarios-asignados
     */
    @GetMapping(value = "/proyectos/{projectId}/usuarios-asignados")
    public ResponseEntity<?> getUsuariosByProyecto(@PathVariable int projectId) {
        try {
            List<Usuario> usuarios = usuarioProyectoService.findUsuariosByProyectoId(projectId);
            return new ResponseEntity<>(usuarios, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * ASIGNAR USUARIO A PROYECTO
     * 
     * Asigna un usuario a un proyecto con un rol específico
     * Endpoint: POST /usuarios-proyectos/asignar
     */
    @PostMapping(value = "/usuarios-proyectos/asignar")
    public ResponseEntity<?> assignUsuarioToProyecto(@RequestBody Map<String, Object> payload) {
        try {
            int userId = Integer.parseInt(payload.get("userId").toString());
            int projectId = Integer.parseInt(payload.get("projectId").toString());
            String role = payload.get("role").toString();
            
            UsuarioProyecto assignment = usuarioProyectoService.assignUsuarioToProyecto(userId, projectId, role);
            return new ResponseEntity<>(assignment, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
    
    /**
     * DESASIGNAR USUARIO DE PROYECTO
     * 
     * Elimina la asignación de un usuario a un proyecto
     * Endpoint: DELETE /usuarios-proyectos/eliminar
     */
    @DeleteMapping(value = "/usuarios-proyectos/eliminar")
    public ResponseEntity<?> removeUsuarioFromProyecto(@RequestParam int userId, @RequestParam int projectId) {
        try {
            boolean result = usuarioProyectoService.removeUsuarioFromProyecto(userId, projectId);
            if (result) {
                return new ResponseEntity<>(true, HttpStatus.OK);
            } else {
                return new ResponseEntity<>("No se encontró la asignación", HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * ACTUALIZAR ROL DE USUARIO EN PROYECTO
     * 
     * Actualiza el rol de un usuario en un proyecto específico
     * Endpoint: PUT /usuarios-proyectos/rol
     */
    @PutMapping(value = "/usuarios-proyectos/rol")
    public ResponseEntity<?> updateUsuarioRole(@RequestBody Map<String, Object> payload) {
        try {
            int userId = Integer.parseInt(payload.get("userId").toString());
            int projectId = Integer.parseInt(payload.get("projectId").toString());
            String role = payload.get("role").toString();
            
            UsuarioProyecto updated = usuarioProyectoService.updateUsuarioRole(userId, projectId, role);
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
    
    /**
     * LISTAR PROYECTOS SIMPLIFICADOS DE UN USUARIO
     * 
     * Endpoint mejorado con mejor manejo de errores y logging
     */
    @GetMapping(value = "/usuarios/{userId}/proyectos/simplificados")
    public ResponseEntity<?> getProyectosSimplificadosByUsuario(@PathVariable int userId) {
        try {
            List<Proyecto> proyectos = usuarioProyectoService.findProyectosByUsuarioId(userId);
            
            List<Map<String, Object>> proyectosSimplificados = proyectos.stream()
                .map(proyecto -> {
                    Map<String, Object> proyectoMap = new HashMap<>();
                    proyectoMap.put("projectId", proyecto.getProjectId());
                    proyectoMap.put("name", proyecto.getName());
                    proyectoMap.put("startDate", proyecto.getStartDate());
                    proyectoMap.put("endDate", proyecto.getEndDate());
                    proyectoMap.put("status", proyecto.getStatus());
                    usuarioProyectoService.findByUsuarioIdAndProyectoId(userId, proyecto.getProjectId())
                        .ifPresent(up -> proyectoMap.put("role", up.getRole()));
                    return proyectoMap;
                })
                .collect(Collectors.toList());
            
            return new ResponseEntity<>(proyectosSimplificados, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error obteniendo proyectos para usuario " + userId + ": " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
