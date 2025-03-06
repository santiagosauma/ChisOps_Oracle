package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.Usuario;
import com.springboot.MyTodoList.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * SERVICIO DE USUARIOS
 * 
 * Esta clase implementa la lógica de negocio para gestionar usuarios.
 * Actúa como una capa intermedia entre el controlador y el repositorio,
 * proporcionando métodos para crear, leer, actualizar y eliminar usuarios,
 * así como para realizar operaciones más complejas como autenticación.
 */
@Service
public class UsuarioService {
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    /**
     * Obtiene todos los usuarios activos del sistema
     * 
     * @return Lista de todos los usuarios no eliminados
     */
    public List<Usuario> findAll() {
        return usuarioRepository.findActiveUsers();
    }
    
    /**
     * Busca un usuario específico por su ID
     * 
     * @param id Identificador del usuario
     * @return ResponseEntity con el usuario si existe o NOT_FOUND si no
     */
    public ResponseEntity<Usuario> getUserById(int id) {
        Optional<Usuario> userData = usuarioRepository.findById(id);
        if (userData.isPresent() && userData.get().getDeleted() == 0) {
            return new ResponseEntity<>(userData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    /**
     * Busca un usuario por su correo electrónico
     * 
     * @param email Correo electrónico del usuario
     * @return Usuario encontrado o null si no existe
     */
    public Usuario findByEmail(String email) {
        Optional<Usuario> usuario = usuarioRepository.findByEmail(email);
        return usuario.orElse(null);
    }
    
    /**
     * Verifica las credenciales de un usuario
     * 
     * @param email Correo electrónico del usuario
     * @param password Contraseña proporcionada
     * @return Usuario autenticado o null si las credenciales son incorrectas
     */
    public Usuario authenticate(String email, String password) {
        Optional<Usuario> usuario = usuarioRepository.findByEmail(email);
        if (usuario.isPresent() && usuario.get().getDeleted() == 0) {
            // En una aplicación real, deberías usar un algoritmo de hash seguro para comparar contraseñas
            if (usuario.get().getPassword().equals(password)) {
                return usuario.get();
            }
        }
        return null;
    }
    
    /**
     * Añade un nuevo usuario al sistema
     * 
     * @param usuario Datos del nuevo usuario
     * @return Usuario creado con su ID generado
     * @throws Exception Si ya existe un usuario con el mismo correo electrónico
     */
    public Usuario addUsuario(Usuario usuario) throws Exception {
        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new Exception("Email already exists");
        }
        
        // En una aplicación real, deberías encriptar la contraseña antes de guardarla
        return usuarioRepository.save(usuario);
    }
    
    /**
     * Actualiza los datos de un usuario existente
     * 
     * @param id ID del usuario a actualizar
     * @param usuarioDetails Nuevos datos del usuario
     * @return Usuario actualizado o null si no existe
     */
    public Usuario updateUsuario(int id, Usuario usuarioDetails) {
        Optional<Usuario> usuarioData = usuarioRepository.findById(id);
        if (usuarioData.isPresent()) {
            Usuario usuario = usuarioData.get();
            usuario.setFirstName(usuarioDetails.getFirstName());
            usuario.setLastName(usuarioDetails.getLastName());
            usuario.setEmail(usuarioDetails.getEmail());
            usuario.setPhone(usuarioDetails.getPhone());
            
            // Solo actualiza la contraseña si se proporciona una nueva
            if (usuarioDetails.getPassword() != null && !usuarioDetails.getPassword().isEmpty()) {
                // En una aplicación real, deberías encriptar la contraseña
                usuario.setPassword(usuarioDetails.getPassword());
            }
            
            // El rol solo puede ser actualizado por un administrador
            if (usuarioDetails.getRol() != null) {
                usuario.setRol(usuarioDetails.getRol());
            }
            
            return usuarioRepository.save(usuario);
        } else {
            return null;
        }
    }
    
    /**
     * Elimina un usuario del sistema (borrado lógico)
     * 
     * @param id ID del usuario a eliminar
     * @return true si la eliminación fue exitosa, false en caso contrario
     */
    public boolean deleteUsuario(int id) {
        try {
            Optional<Usuario> usuario = usuarioRepository.findById(id);
            if (usuario.isPresent()) {
                Usuario usuarioToDelete = usuario.get();
                // Realizamos un borrado lógico cambiando el flag 'deleted' a 1
                usuarioToDelete.setDeleted(1);
                usuarioRepository.save(usuarioToDelete);
                return true;
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Busca usuarios por nombre o apellido
     * 
     * @param searchTerm Término de búsqueda
     * @return Lista de usuarios que coinciden con el término
     */
    public List<Usuario> searchUsuarios(String searchTerm) {
        return usuarioRepository.searchByName(searchTerm);
    }
    
    /**
     * Cuenta el número de usuarios por rol
     * 
     * @param rol Rol del usuario (admin, user)
     * @return Número de usuarios con ese rol
     */
    public long countByRol(String rol) {
        return usuarioRepository.countByRol(rol);
    }
}