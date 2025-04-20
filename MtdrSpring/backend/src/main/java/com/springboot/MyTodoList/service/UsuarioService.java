package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.Usuario;
import com.springboot.MyTodoList.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder; // Import PasswordEncoder
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Import Transactional

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

    @Autowired
    private PasswordEncoder passwordEncoder; // Inject PasswordEncoder

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
     * Busca un usuario por su Telegram Username
     *
     * @param telegramUsername Telegram Username del usuario
     * @return Usuario encontrado o null si no existe
     */
    public Optional<Usuario> findByTelegramUsername(String telegramUsername) {
        return usuarioRepository.findByTelegramUsername(telegramUsername);
    }


    /**
     * Verifica las credenciales de un usuario
     *
     * @param email    Correo electrónico del usuario
     * @param password Contraseña proporcionada en texto plano
     * @return Usuario autenticado o null si las credenciales son incorrectas
     */
    public Usuario authenticate(String email, String password) {
        Optional<Usuario> usuarioOptional = usuarioRepository.findByEmail(email);
        if (usuarioOptional.isPresent()) {
            Usuario usuario = usuarioOptional.get();
            if (usuario.getDeleted() == 0 && passwordEncoder.matches(password, usuario.getPasswordHash())) { // Compare hashed password
                return usuario;
            }
        }
        return null;
    }

    /**
     * Añade un nuevo usuario al sistema
     *
     * @param usuario Datos del nuevo usuario (includes plain password)
     * @return Usuario creado con su ID generado
     * @throws Exception Si ya existe un usuario con el mismo correo electrónico
     */
    @Transactional // Add Transactional annotation
    public Usuario addUsuario(Usuario usuario) throws Exception {
        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new Exception("Email already exists");
        }

        // Hash the password before saving
        String hashedPassword = passwordEncoder.encode(usuario.getPasswordHash()); // Assuming passwordHash field temporarily holds plaintext password
        usuario.setPasswordHash(hashedPassword); // Set hashed password
        return usuarioRepository.save(usuario);
    }

    /**
     * Actualiza los datos de un usuario existente
     *
     * @param id            ID del usuario a actualizar
     * @param usuarioDetails Nuevos datos del usuario (can include plain password for update)
     * @return Usuario actualizado o null si no existe
     */
    @Transactional // Add Transactional annotation
    public Usuario updateUsuario(int id, Usuario usuarioDetails) {
        Optional<Usuario> usuarioData = usuarioRepository.findById(id);
        if (usuarioData.isPresent()) {
            Usuario usuario = usuarioData.get();
            usuario.setFirstName(usuarioDetails.getFirstName());
            usuario.setLastName(usuarioDetails.getLastName());
            usuario.setEmail(usuarioDetails.getEmail());
            usuario.setPhone(usuarioDetails.getPhone());
            usuario.setTelegramUsername(usuarioDetails.getTelegramUsername()); // Added telegram username update

            // Update password only if a new password (plaintext) is provided in usuarioDetails.getPasswordHash()
            if (usuarioDetails.getPasswordHash() != null && !usuarioDetails.getPasswordHash().isEmpty()) {
                String hashedPassword = passwordEncoder.encode(usuarioDetails.getPasswordHash()); // Hash the new password
                usuario.setPasswordHash(hashedPassword); // Set the hashed password
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

    /**
     * ACTUALIZAR PASSWORD HASH DE USUARIO EXISTENTE
     *
     * Actualiza *solo* el passwordHash de un usuario, hasheando la nueva contraseña proporcionada.
     *
     * 
     * @param id                ID del usuario a actualizar.
     * @param newPlainPassword  Nueva contraseña en texto plano que se va a hashear y guardar.
     * @return Usuario actualizado si se encontró y actualizó, null si el usuario no existe.
     */
    @Transactional
    public Usuario updatePasswordHash(int id, String newPlainPassword) {
        Optional<Usuario> usuarioData = usuarioRepository.findById(id);
        System.out.println("Usuario encontrado: " + usuarioData.isPresent());
        System.out.println("Usuario encontrado: " + usuarioData.isPresent());
        System.out.println("Usuario encontrado: " + usuarioData.isPresent());
        if (usuarioData.isPresent()) {
            Usuario usuario = usuarioData.get();

            // Hash the new plain password
            String hashedPassword = passwordEncoder.encode(newPlainPassword);
            usuario.setPasswordHash(hashedPassword);

            return usuarioRepository.save(usuario); // Guarda el usuario con el nuevo hash
        } else {
            return null; // Usuario no encontrado
        }
    }

}