package com.udemylite.controller;

import com.udemylite.model.Course;
import com.udemylite.model.User;
import com.udemylite.service.CourseService;
import com.udemylite.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private CourseService courseService;

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userService.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("email", user.getEmail());
        profile.put("firstName", user.getFirstName());
        profile.put("lastName", user.getLastName());
        profile.put("role", user.getRole());

        if (user.getRole() == User.Role.INSTRUCTOR) {
            List<Course> courses = courseService.getCoursesByInstructor(user.getId());
            profile.put("courses", courses.stream().map(course -> Map.of(
                "id", course.getId(),
                "title", course.getTitle(),
                "description", course.getDescription(),
                "price", course.getPrice()
            )).toList());
        }

        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(@RequestBody User updatedUser) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userService.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        // Update only allowed fields
        user.setFirstName(updatedUser.getFirstName());
        user.setLastName(updatedUser.getLastName());
        // Email and role should not be updated here for security reasons

        User savedUser = userService.save(user);
        return ResponseEntity.ok(savedUser);
    }
}
