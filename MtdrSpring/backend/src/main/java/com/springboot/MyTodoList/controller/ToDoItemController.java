/**
 * CONTROLADOR REST PARA GESTIÓN DE TAREAS PENDIENTES
 * 
 * Este controlador expone una API REST completa para gestionar tareas (ToDoItems)
 * Proporciona endpoints para listar, buscar, crear, actualizar y eliminar tareas
 * Utiliza el servicio ToDoItemService para delegar la lógica de negocio
 */
package com.springboot.MyTodoList.controller;
import com.springboot.MyTodoList.model.ToDoItem;
import com.springboot.MyTodoList.service.ToDoItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.net.URI;
import java.util.List;

@RestController
public class ToDoItemController {
    @Autowired
    private ToDoItemService toDoItemService;
    
    /**
     * LISTAR TODAS LAS TAREAS
     * 
     * Devuelve una lista con todas las tareas pendientes disponibles en el sistema
     * Endpoint: GET /todolist
     */
    //@CrossOrigin
    @GetMapping(value = "/todolist")
    public List<ToDoItem> getAllToDoItems(){
        return toDoItemService.findAll();
    }
    
    /**
     * BUSCAR TAREA POR ID
     * 
     * Devuelve una tarea específica identificada por su ID
     * Retorna estado 200 (OK) si la tarea existe, o 404 (NOT FOUND) si no se encuentra
     * Endpoint: GET /todolist/{id}
     */
    //@CrossOrigin
    @GetMapping(value = "/todolist/{id}")
    public ResponseEntity<ToDoItem> getToDoItemById(@PathVariable int id){
        try{
            ResponseEntity<ToDoItem> responseEntity = toDoItemService.getItemById(id);
            return new ResponseEntity<ToDoItem>(responseEntity.getBody(), HttpStatus.OK);
        }catch (Exception e){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    /**
     * CREAR NUEVA TAREA
     * 
     * Añade una nueva tarea al sistema con los datos proporcionados
     * Devuelve la ubicación del recurso creado en la cabecera HTTP "location"
     * Endpoint: POST /todolist
     */
    //@CrossOrigin
    @PostMapping(value = "/todolist")
    public ResponseEntity addToDoItem(@RequestBody ToDoItem todoItem) throws Exception{
        ToDoItem td = toDoItemService.addToDoItem(todoItem);
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.set("location",""+td.getID());
        responseHeaders.set("Access-Control-Expose-Headers","location");
        //URI location = URI.create(""+td.getID())

        return ResponseEntity.ok()
                .headers(responseHeaders).build();
    }
    
    /**
     * ACTUALIZAR TAREA EXISTENTE
     * 
     * Actualiza los datos de una tarea existente identificada por su ID
     * Devuelve la tarea actualizada y estado 200 (OK), o 404 (NOT FOUND) si no existe
     * Endpoint: PUT /todolist/{id}
     */
    //@CrossOrigin
    @PutMapping(value = "todolist/{id}")
    public ResponseEntity updateToDoItem(@RequestBody ToDoItem toDoItem, @PathVariable int id){
        try{
            ToDoItem toDoItem1 = toDoItemService.updateToDoItem(id, toDoItem);
            System.out.println(toDoItem1.toString());
            return new ResponseEntity<>(toDoItem1,HttpStatus.OK);
        }catch (Exception e){
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }
    
    /**
     * ELIMINAR TAREA
     * 
     * Elimina permanentemente una tarea del sistema por su ID
     * Retorna true y estado 200 (OK) si la eliminación es exitosa, o 404 (NOT FOUND) si falla
     * Endpoint: DELETE /todolist/{id}
     */
    //@CrossOrigin
    @DeleteMapping(value = "todolist/{id}")
    public ResponseEntity<Boolean> deleteToDoItem(@PathVariable("id") int id){
        Boolean flag = false;
        try{
            flag = toDoItemService.deleteToDoItem(id);
            return new ResponseEntity<>(flag, HttpStatus.OK);
        }catch (Exception e){
            return new ResponseEntity<>(flag,HttpStatus.NOT_FOUND);
        }
    }
}