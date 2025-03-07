/**
 * CONTROLADOR REST PARA GESTIÓN DE USUARIOS
 * 
 * Este controlador expone una API REST para gestionar usuarios del sistema
 * Proporciona endpoints para listar, buscar, crear, actualizar y eliminar usuarios
 * Utiliza el servicio UsuarioService para delegar la lógica de negocio
 */
package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.Usuario;
import com.springboot.MyTodoList.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class UsuarioController {
    @Autowired
    private UsuarioService usuarioService;
    
    /**
     * LISTAR TODOS LOS USUARIOS
     * 
     * Devuelve una lista con todos los usuarios activos registrados en el sistema
     * Endpoint: GET /users
     */
    //@CrossOrigin
    @GetMapping(value = "/usuarios")
    public List<Usuario> getAllUsuarios() {
        return usuarioService.findAll();
    }
    
    /**
     * BUSCAR USUARIO POR ID
     * 
     * Devuelve un usuario específico identificado por su ID
     * Retorna estado 200 (OK) si el usuario existe, o 404 (NOT FOUND) si no se encuentra
     * Endpoint: GET /users/{id}
     */
    //@CrossOrigin
    @GetMapping(value = "/usuarios/{id}")
    public ResponseEntity<Usuario> getUsuarioById(@PathVariable int id) {
        try {
            ResponseEntity<Usuario> responseEntity = usuarioService.getUserById(id);
            return new ResponseEntity<Usuario>(responseEntity.getBody(), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    /**
     * CREAR NUEVO USUARIO
     * 
     * Añade un nuevo usuario al sistema con los datos proporcionados
     * Devuelve la ubicación del recurso creado en la cabecera HTTP "location"
     * Endpoint: POST /users
     */
    //@CrossOrigin
    @PostMapping(value = "/usuarios")
    public ResponseEntity addUsuario(@RequestBody Usuario usuario) throws Exception {
        Usuario newUser = usuarioService.addUsuario(usuario);
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.set("location", "" + newUser.getUserId());
        responseHeaders.set("Access-Control-Expose-Headers", "location");
        
        return ResponseEntity.ok()
                .headers(responseHeaders).build();
    }
    
    /**
     * ACTUALIZAR USUARIO EXISTENTE
     * 
     * Actualiza los datos de un usuario existente identificado por su ID
     * Devuelve el usuario actualizado y estado 200 (OK), o 404 (NOT FOUND) si no existe
     * Endpoint: PUT /users/{id}
     */
    //@CrossOrigin
    @PutMapping(value = "usuarios/{id}")
    public ResponseEntity updateUsuario(@RequestBody Usuario usuario, @PathVariable int id) {
        try {
            Usuario updatedUser = usuarioService.updateUsuario(id, usuario);
            return new ResponseEntity<>(updatedUser, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }
    
    /**
     * ELIMINAR USUARIO
     * 
     * Elimina lógicamente un usuario del sistema por su ID
     * Retorna true y estado 200 (OK) si la eliminación es exitosa, o 404 (NOT FOUND) si falla
     * Endpoint: DELETE /users/{id}
     */
    //@CrossOrigin
    @DeleteMapping(value = "usuarios/{id}")
    public ResponseEntity<Boolean> deleteUsuario(@PathVariable("id") int id) {
        Boolean flag = false;
        try {
            flag = usuarioService.deleteUsuario(id);
            return new ResponseEntity<>(flag, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(flag, HttpStatus.NOT_FOUND);
        }
    }
    
    /**
     * AUTENTICAR USUARIO
     * 
     * Verifica las credenciales de un usuario (email y contraseña)
     * Retorna el usuario si la autenticación es exitosa, o 401 (UNAUTHORIZED) si falla
     * Endpoint: POST /users/login
     */
    //@CrossOrigin
    @PostMapping(value = "/usuarios/login")
    public ResponseEntity<?> authenticateUsuario(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");
        
        if (email == null || password == null) {
            return new ResponseEntity<>("Email and password are required", HttpStatus.BAD_REQUEST);
        }
        
        Usuario authenticatedUser = usuarioService.authenticate(email, password);
        
        if (authenticatedUser != null) {
            return new ResponseEntity<>(authenticatedUser, HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Invalid credentials", HttpStatus.UNAUTHORIZED);
        }
    }
    
    /**
     * BUSCAR USUARIO POR EMAIL
     * 
     * Busca un usuario por su dirección de correo electrónico
     * Retorna el usuario si existe, o 404 (NOT FOUND) si no se encuentra
     * Endpoint: GET /users/email/{email}
     */
    //@CrossOrigin
    @GetMapping(value = "/usuarios/email/{email}")
    public ResponseEntity<?> getUsuarioByEmail(@PathVariable String email) {
        Usuario usuario = usuarioService.findByEmail(email);
        
        if (usuario != null) {
            return new ResponseEntity<>(usuario, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    /**
     * BUSCAR USUARIOS POR NOMBRE
     * 
     * Busca usuarios que coincidan con el término de búsqueda en nombre o apellido
     * Retorna lista de usuarios que coinciden con la búsqueda
     * Endpoint: GET /users/search?term={searchTerm}
     */
    //@CrossOrigin
    @GetMapping(value = "/usuarios/search")
    public List<Usuario> searchUsuarios(@RequestParam("term") String searchTerm) {
        return usuarioService.searchUsuarios(searchTerm);
    }
}