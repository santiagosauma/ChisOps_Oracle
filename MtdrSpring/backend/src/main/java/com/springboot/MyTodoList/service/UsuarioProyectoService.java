package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.Proyecto;
import com.springboot.MyTodoList.model.Usuario;
import com.springboot.MyTodoList.model.UsuarioProyecto;
import com.springboot.MyTodoList.repository.ProyectoRepository;
import com.springboot.MyTodoList.repository.UsuarioProyectoRepository;
import com.springboot.MyTodoList.repository.UsuarioRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UsuarioProyectoService {
    
    @Autowired
    private UsuarioProyectoRepository usuarioProyectoRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private ProyectoRepository proyectoRepository;
    
    /**
     * Encuentra todas las asignaciones usuario-proyecto
     */
    public List<UsuarioProyecto> findAll() {
        return usuarioProyectoRepository.findAll().stream()
                .filter(up -> up.getDeleted() == 0)
                .collect(Collectors.toList());
    }
    
    /**
     * Encuentra todas las asignaciones para un usuario específico
     */
    public List<UsuarioProyecto> findByUsuarioId(int userId) {
        return usuarioProyectoRepository.findByUsuarioId(userId);
    }
    
    /**
     * Encuentra todos los proyectos asignados a un usuario específico
     */
    public List<Proyecto> findProyectosByUsuarioId(int userId) {
        return usuarioProyectoRepository.findByUsuarioId(userId)
                .stream()
                .map(UsuarioProyecto::getProyecto)
                .collect(Collectors.toList());
    }
    
    /**
     * Encuentra todas las asignaciones para un proyecto específico
     */
    public List<UsuarioProyecto> findByProyectoId(int projectId) {
        return usuarioProyectoRepository.findByProyectoId(projectId);
    }
    
    /**
     * Encuentra todos los usuarios asignados a un proyecto específico
     */
    public List<Usuario> findUsuariosByProyectoId(int projectId) {
        return usuarioProyectoRepository.findByProyectoId(projectId)
                .stream()
                .map(UsuarioProyecto::getUsuario)
                .collect(Collectors.toList());
    }
    
    /**
     * Asigna un usuario a un proyecto
     */
    public UsuarioProyecto assignUsuarioToProyecto(int userId, int projectId, String role) {
        // Verificar si el usuario existe
        Optional<Usuario> optUsuario = usuarioRepository.findById(userId);
        if (!optUsuario.isPresent()) {
            throw new RuntimeException("Usuario no encontrado con ID: " + userId);
        }
        
        // Verificar si el proyecto existe
        Optional<Proyecto> optProyecto = proyectoRepository.findById(projectId);
        if (!optProyecto.isPresent()) {
            throw new RuntimeException("Proyecto no encontrado con ID: " + projectId);
        }
        
        // Verificar si ya existe la asignación
        UsuarioProyecto existingAssignment = usuarioProyectoRepository.findByUsuarioIdAndProyectoId(userId, projectId);
        if (existingAssignment != null) {
            if (existingAssignment.getDeleted() == 1) {
                // Si estaba eliminado lógicamente, lo reactivamos
                existingAssignment.setDeleted(0);
                existingAssignment.setRole(role);
                existingAssignment.setAssignmentDate(new Date());
                return usuarioProyectoRepository.save(existingAssignment);
            } else {
                // Si ya existe y está activo, actualizamos el rol
                existingAssignment.setRole(role);
                return usuarioProyectoRepository.save(existingAssignment);
            }
        }
        
        // Crear nueva asignación
        UsuarioProyecto usuarioProyecto = new UsuarioProyecto(
                optUsuario.get(),
                optProyecto.get(),
                role,
                new Date()
        );
        
        return usuarioProyectoRepository.save(usuarioProyecto);
    }
    
    /**
     * Elimina la asignación de un usuario a un proyecto
     */
    public boolean removeUsuarioFromProyecto(int userId, int projectId) {
        UsuarioProyecto assignment = usuarioProyectoRepository.findByUsuarioIdAndProyectoId(userId, projectId);
        if (assignment != null) {
            assignment.setDeleted(1);
            usuarioProyectoRepository.save(assignment);
            return true;
        }
        return false;
    }
    
    /**
     * Obtiene una asignación específica por su ID
     */
    public ResponseEntity<UsuarioProyecto> getUsuarioProyectoById(int userProjectId) {
        Optional<UsuarioProyecto> optUsuarioProyecto = usuarioProyectoRepository.findById(userProjectId);
        if (optUsuarioProyecto.isPresent() && optUsuarioProyecto.get().getDeleted() == 0) {
            return new ResponseEntity<>(optUsuarioProyecto.get(), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
    
    /**
     * Actualiza el rol de un usuario en un proyecto
     */
    public UsuarioProyecto updateUsuarioRole(int userId, int projectId, String newRole) {
        UsuarioProyecto assignment = usuarioProyectoRepository.findByUsuarioIdAndProyectoId(userId, projectId);
        if (assignment != null) {
            assignment.setRole(newRole);
            return usuarioProyectoRepository.save(assignment);
        }
        throw new RuntimeException("Asignación no encontrada para el usuario " + userId + " y proyecto " + projectId);
    }

    /**
     * Encuentra una relación usuario-proyecto específica (como Optional)
     */
    public Optional<UsuarioProyecto> findByUsuarioIdAndProyectoId(int userId, int projectId) {
        return usuarioProyectoRepository.findOptionalByUsuarioIdAndProyectoId(userId, projectId);
    }
}
