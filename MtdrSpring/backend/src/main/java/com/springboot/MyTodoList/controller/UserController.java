/**
 * CONTROLADOR REST PARA GESTIÓN DE USUARIOS
 * 
 * Este controlador expone una API REST para gestionar usuarios del sistema
 * Proporciona endpoints para listar, buscar, crear, actualizar y eliminar usuarios
 * Utiliza el servicio UserService para delegar la lógica de negocio relacionada con usuarios
 */
package com.springboot.MyTodoList.controller;
import com.springboot.MyTodoList.model.User;
import com.springboot.MyTodoList.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.net.URI;
import java.util.List;

@RestController
public class UserController {
    @Autowired
    private UserService userService;

    /**
     * LISTAR TODOS LOS USUARIOS
     * 
     * Devuelve una lista con todos los usuarios registrados en el sistema
     * Endpoint: GET /users
     */
    //@CrossOrigin
    @GetMapping(value = "/users")
    public List<User> getAllUsers(){
        return userService.findAll();
    }

    /**
     * BUSCAR USUARIO POR ID
     * 
     * Devuelve un usuario específico identificado por su ID
     * Retorna estado 200 (OK) si el usuario existe, o 404 (NOT FOUND) si no se encuentra
     * Endpoint: GET /users/{id}
     */
    //@CrossOrigin
    @GetMapping(value = "/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable int id){
        try{
            ResponseEntity<User> responseEntity = userService.getUserById(id);
            return new ResponseEntity<User>(responseEntity.getBody(), HttpStatus.OK);
        }catch (Exception e){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    /**
     * CREAR NUEVO USUARIO
     * 
     * Añade un nuevo usuario al sistema con los datos proporcionados
     * Devuelve la ubicación del recurso creado en la cabecera HTTP "location"
     * Endpoint: POST /adduser
     */
    //@CrossOrigin
    @PostMapping(value = "/adduser")
    public ResponseEntity addUser(@RequestBody User newUser) throws Exception{
        User dbUser = userService.addUser(newUser);
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.set("location",""+dbUser.getID());
        responseHeaders.set("Access-Control-Expose-Headers","location");
        //URI location = URI.create(""+td.getID())

        return ResponseEntity.ok()
                .headers(responseHeaders).build();
    }
    
    /**
     * ACTUALIZAR USUARIO EXISTENTE
     * 
     * Actualiza los datos de un usuario existente identificado por su ID
     * Devuelve el usuario actualizado y estado 200 (OK), o 404 (NOT FOUND) si no existe
     * Endpoint: PUT /updateUser/{id}
     */
    //@CrossOrigin
    @PutMapping(value = "updateUser/{id}")
    public ResponseEntity updateUser(@RequestBody User user, @PathVariable int id){
        try{
            User dbUser = userService.updateUser(id, user);
            
            return new ResponseEntity<>(dbUser,HttpStatus.OK);
        }catch (Exception e){
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }
    
    /**
     * ELIMINAR USUARIO
     * 
     * Elimina permanentemente un usuario del sistema por su ID
     * Retorna true y estado 200 (OK) si la eliminación es exitosa, o 404 (NOT FOUND) si falla
     * Endpoint: DELETE /deleteUser/{id}
     */
    //@CrossOrigin
    @DeleteMapping(value = "deleteUser/{id}")
    public ResponseEntity<Boolean> deleteUser(@PathVariable("id") int id){
        Boolean flag = false;
        try{
            flag = userService.deleteUser(id);
            return new ResponseEntity<>(flag, HttpStatus.OK);
        }catch (Exception e){
            return new ResponseEntity<>(flag,HttpStatus.NOT_FOUND);
        }
    }
}