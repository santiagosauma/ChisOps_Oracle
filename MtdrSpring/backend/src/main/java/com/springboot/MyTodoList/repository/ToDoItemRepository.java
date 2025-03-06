/**
 * Interfaz de repositorio para entidades ToDoItem
 * 
 * Este repositorio proporciona acceso a la capa de persistencia para los objetos ToDoItem.
 * Al extender JpaRepository, hereda automáticamente métodos CRUD estándar como:
 * - save(): guardar o actualizar una entidad
 * - findAll(): obtener todas las entidades
 * - findById(): buscar una entidad por su ID
 * - deleteById(): eliminar una entidad por su ID
 * - Y muchos otros métodos útiles para manipular datos
 * 
 * @Transactional asegura que las operaciones se ejecuten dentro de transacciones
 * @EnableTransactionManagement activa la gestión de transacciones basada en anotaciones
 */
package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.ToDoItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.transaction.Transactional;

@Repository
@Transactional
@EnableTransactionManagement
public interface ToDoItemRepository extends JpaRepository<ToDoItem,Integer> {


}