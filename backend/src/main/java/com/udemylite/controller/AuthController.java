package com.udemylite.controller;

import com.udemylite.model.User; // <-- 1. IMPORT YOUR USER MODEL
import com.udemylite.security.JwtUtil;
import com.udemylite.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus; // <-- 2. IMPORT THIS
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Corrected register endpoint with error handling.
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            // Call the service method that checks for duplicate emails
            User newUser = userService.registerUser(user);
            return ResponseEntity.ok(newUser);

        } catch (RuntimeException e) {
            // Catches the "Email already in use" error from the service
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST) // 400
                    .body(e.getMessage());
        } catch (Exception e) {
            // Catches any other unexpected errors
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR) // 500
                    .body("An unexpected error occurred: " + e.getMessage());
        }
    }


    /**
     * Corrected login endpoint that includes roles in the JWT.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            // Authenticate the user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            // Get UserDetails from the authentication object
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            
            // Get the roles (authorities)
            List<String> roles = userDetails.getAuthorities().stream()
                                    .map(GrantedAuthority::getAuthority)
                                    .collect(Collectors.toList());

            // Generate the token, passing both username (email) AND roles
            String token = jwtUtil.generateToken(userDetails.getUsername(), roles);
            
            // Build the response
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("message", "Login successful");
            // You can also add user info here if needed
            // response.put("email", userDetails.getUsername());
            // response.put("roles", roles);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            // Handle bad credentials or other auth errors
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED) // 401
                    .body("Login failed: Invalid email or password");
        }
    }

    /**
     * A static inner class to map the login request JSON.
     */
    public static class LoginRequest {
        private String email;
        private String password;

        // Getters and setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
}