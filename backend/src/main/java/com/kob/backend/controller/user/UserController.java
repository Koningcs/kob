package com.kob.backend.controller.user;

import com.kob.backend.mapper.UserMapper;
import com.kob.backend.pojo.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class UserController {


    @Autowired
    UserMapper userMapper;


    @GetMapping("/user/all/")
    public List<User> getAllUsers() {
        return userMapper.selectList(null);
    }

    @GetMapping("/user/{userId}")
    public User getUserById(@PathVariable int userId) {
        return userMapper.selectById(userId);
    }

    @GetMapping("/user/add/{userId}/{username}/{password}/")
    public User addUser(
            @PathVariable int userId,
            @PathVariable String username,
            @PathVariable String password) {

        if(password.length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters");
        }
        User user = new User(userId, username, password);
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        user.setPassword(passwordEncoder.encode(password));
        userMapper.insert(user);
        return user;
    }

    @GetMapping("/user/delete/{userId}/")
    public String deleteUser(@PathVariable int userId) {
        userMapper.deleteById(userId);
        return "Sucessfully deleted user!";
    }
}
