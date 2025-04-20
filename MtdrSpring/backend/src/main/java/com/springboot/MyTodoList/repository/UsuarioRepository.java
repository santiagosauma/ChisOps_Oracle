package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * REPOSITORIO DE USUARIOS
 *
 * Esta interfaz proporciona métodos para acceder y manipular datos de usuarios en la base de datos.
 * Extiende JpaRepository para heredar operaciones CRUD básicas y consultas personalizadas.
 */
@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    /**
     * Busca un usuario por su correo electrónico
     *
     * @param email Correo electrónico del usuario
     * @return Usuario encontrado o vacío si no existe
     */
    Optional<Usuario> findByEmail(String email);

    /**
     * Busca usuarios por su nombre
     *
     * @param firstName Nombre del usuario
     * @return Lista de usuarios que coinciden con el nombre
     */
    List<Usuario> findByFirstName(String firstName);

    /**
     * Busca usuarios por su apellido
     *
     * @param lastName Apellido del usuario
     * @return Lista de usuarios que coinciden con el apellido
     */
    List<Usuario> findByLastName(String lastName);

    /**
     * Busca usuarios por su rol
     *
     * @param rol Rol del usuario (admin, user)
     * @return Lista de usuarios con el rol especificado
     */
    List<Usuario> findByRol(String rol);

    /**
     * Busca todos los usuarios activos (no eliminados)
     *
     * @return Lista de usuarios activos
     */
    @Query("SELECT u FROM Usuario u WHERE u.deleted = 0")
    List<Usuario> findActiveUsers();

    /**
     * Busca usuarios por nombre o apellido (coincidencia parcial)
     *
     * @param searchTerm Término de búsqueda
     * @return Lista de usuarios que coinciden con el término de búsqueda
     */
    @Query("SELECT u FROM Usuario u WHERE LOWER(u.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Usuario> searchByName(@Param("searchTerm") String searchTerm);

    /**
     * Verifica si existe un usuario con el correo electrónico dado
     *
     * @param email Correo electrónico a verificar
     * @return true si existe, false en caso contrario
     */
    boolean existsByEmail(String email);

    /**
     * Cuenta el número de usuarios por rol
     *
     * @param rol Rol de usuario
     * @return Número de usuarios con el rol especificado
     */
    long countByRol(String rol);

    Optional<Usuario> findByTelegramUsername(String telegramUsername); // Added for Telegram Login
}