package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.User;
import com.springboot.MyTodoList.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // Get all the users from the database
    public List<User> findAll(){
        List<User> users = userRepository.findAll();
        return users;
    }
    // Get a user by id
    public ResponseEntity<User> getUserById(int id){
        Optional<User> userById = userRepository.findById(id);
        if (userById.isPresent()){
            return new ResponseEntity<>(userById.get(), HttpStatus.OK);
        }else{
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Add a user to the database
    public User addUser(User newUser){
        return userRepository.save(newUser);
    }

    // Delete a user from the database
    public boolean deleteUser(int id){
        try{
            userRepository.deleteById(id);
            return true;
        }catch(Exception e){
            return false;
        }
    }
    // Update a user in the database
    public User updateUser(int id, User user2update){
        Optional<User> dbUser = userRepository.findById(id);
        if(dbUser.isPresent()){
            User user = dbUser.get();
            user.setID(id);
            user.setNumber(user2update.getNumber());
            user.setPassword(user2update.getPassword());
            return userRepository.save(user);
        }else{
            return null;
        }
    }

}
