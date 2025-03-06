package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.Proyecto;
import com.springboot.MyTodoList.model.Usuario;
import com.springboot.MyTodoList.repository.ProyectoRepository;
import com.springboot.MyTodoList.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

/**
 * SERVICIO DE PROYECTOS
 * 
 * Esta clase implementa la lógica de negocio para gestionar proyectos.
 * Actúa como una capa intermedia entre el controlador y el repositorio,
 * proporcionando métodos para crear, leer, actualizar y eliminar proyectos,
 * así como para realizar consultas específicas y validaciones.
 */
@Service
public class ProyectoService {
    
    @Autowired
    private ProyectoRepository proyectoRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    /**
     * Obtiene todos los proyectos activos del sistema
     * 
     * @return Lista de proyectos no eliminados
     */
    public List<Proyecto> findAll() {
        return proyectoRepository.findActiveProyectos();
    }
    
    /**
     * Busca un proyecto específico por su ID
     * 
     * @param id Identificador del proyecto
     * @return ResponseEntity con el proyecto si existe o NOT_FOUND si no
     */
    public ResponseEntity<Proyecto> getProyectoById(int id) {
        Optional<Proyecto> proyectoData = proyectoRepository.findById(id);
        if (proyectoData.isPresent() && proyectoData.get().getDeleted() == 0) {
            return new ResponseEntity<>(proyectoData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    /**
     * Añade un nuevo proyecto al sistema
     * 
     * @param proyecto Datos del nuevo proyecto
     * @return Proyecto creado con su ID generado
     * @throws Exception Si ocurre un error en la validación o creación
     */
    public Proyecto addProyecto(Proyecto proyecto) throws Exception {
        // Validar que el usuario existe
        Optional<Usuario> usuario = usuarioRepository.findById(proyecto.getUsuario().getUserId());
        if (!usuario.isPresent() || usuario.get().getDeleted() == 1) {
            throw new Exception("Usuario no encontrado o inactivo");
        }
        
        // Validar fechas
        if (proyecto.getEndDate().before(proyecto.getStartDate())) {
            throw new Exception("La fecha de fin no puede ser anterior a la fecha de inicio");
        }
        
        // Asignar usuario encontrado
        proyecto.setUsuario(usuario.get());
        
        // Establecer marca de borrado a 0 (no borrado)
        proyecto.setDeleted(0);
        
        return proyectoRepository.save(proyecto);
    }
    
    /**
     * Actualiza los datos de un proyecto existente
     * 
     * @param id ID del proyecto a actualizar
     * @param proyectoDetails Nuevos datos del proyecto
     * @return Proyecto actualizado o null si no existe
     * @throws Exception Si hay error en validación de datos
     */
    public Proyecto updateProyecto(int id, Proyecto proyectoDetails) throws Exception {
        Optional<Proyecto> proyectoData = proyectoRepository.findById(id);
        if (proyectoData.isPresent() && proyectoData.get().getDeleted() == 0) {
            Proyecto proyecto = proyectoData.get();
            
            // Actualizar atributos básicos
            proyecto.setName(proyectoDetails.getName());
            proyecto.setDescription(proyectoDetails.getDescription());
            proyecto.setStatus(proyectoDetails.getStatus());
            
            // Validar fechas
            if (proyectoDetails.getStartDate() != null) {
                proyecto.setStartDate(proyectoDetails.getStartDate());
            }
            
            if (proyectoDetails.getEndDate() != null) {
                proyecto.setEndDate(proyectoDetails.getEndDate());
            }
            
            if (proyecto.getEndDate().before(proyecto.getStartDate())) {
                throw new Exception("La fecha de fin no puede ser anterior a la fecha de inicio");
            }
            
            // Actualizar usuario si se proporciona
            if (proyectoDetails.getUsuario() != null && proyectoDetails.getUsuario().getUserId() > 0) {
                Optional<Usuario> usuario = usuarioRepository.findById(proyectoDetails.getUsuario().getUserId());
                if (usuario.isPresent() && usuario.get().getDeleted() == 0) {
                    proyecto.setUsuario(usuario.get());
                } else {
                    throw new Exception("Usuario no encontrado o inactivo");
                }
            }
            
            return proyectoRepository.save(proyecto);
        } else {
            return null;
        }
    }
    
    /**
     * Elimina un proyecto del sistema (borrado lógico)
     * 
     * @param id ID del proyecto a eliminar
     * @return true si la eliminación fue exitosa, false en caso contrario
     */
    public boolean deleteProyecto(int id) {
        try {
            Optional<Proyecto> proyecto = proyectoRepository.findById(id);
            if (proyecto.isPresent()) {
                Proyecto proyectoToDelete = proyecto.get();
                // Realizamos un borrado lógico cambiando el flag 'deleted' a 1
                proyectoToDelete.setDeleted(1);
                proyectoRepository.save(proyectoToDelete);
                return true;
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Busca proyectos por usuario responsable
     * 
     * @param userId ID del usuario
     * @return Lista de proyectos asignados al usuario
     */
    public List<Proyecto> getProyectosByUsuario(int userId) {
        return proyectoRepository.findByUsuario(userId);
    }
    
    /**
     * Busca proyectos por estado
     * 
     * @param status Estado del proyecto
     * @return Lista de proyectos con el estado especificado
     */
    public List<Proyecto> getProyectosByStatus(String status) {
        return proyectoRepository.findByStatusAndDeleted(status, 0);
    }
    
    /**
     * Busca proyectos actualmente activos
     * 
     * @return Lista de proyectos en curso a la fecha actual
     */
    public List<Proyecto> getActiveProyectos() {
        return proyectoRepository.findActiveProyectosByDate(new Date());
    }
    
    /**
     * Busca proyectos por texto en nombre o descripción
     * 
     * @param searchTerm Término de búsqueda
     * @return Lista de proyectos que coinciden con el término
     */
    public List<Proyecto> searchProyectos(String searchTerm) {
        return proyectoRepository.searchByNameOrDescription(searchTerm);
    }
}