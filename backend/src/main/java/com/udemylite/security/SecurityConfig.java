package com.udemylite.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 1. Enable CORS using the bean defined below
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // 2. Disable CSRF (common for stateless APIs)
            .csrf(csrf -> csrf.disable())
            
            // 3. Define authorization rules
            .authorizeHttpRequests(authz -> authz
                
                // --- Permit all static assets for the React frontend ---
                .requestMatchers(
                    new AntPathRequestMatcher("/"),
                    new AntPathRequestMatcher("/*.jpg"),
                    new AntPathRequestMatcher("/*.png"),
                    new AntPathRequestMatcher("/*.gif"),
                    new AntPathRequestMatcher("/*.ico"),
                    new AntPathRequestMatcher("/static/**"),
                    new AntPathRequestMatcher("/manifest.json"),
                    new AntPathRequestMatcher("/index.html")
                ).permitAll()
                
                // --- Permit all authentication endpoints ---
                .requestMatchers("/api/auth/**").permitAll()
                
                // --- Permit public viewing of courses ---
                .requestMatchers(HttpMethod.GET, "/api/courses").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/courses/{id}").permitAll()

                // --- Secure endpoints (Specific rules FIRST) ---
                .requestMatchers(HttpMethod.GET, "/api/courses/{courseId}/lessons").hasAnyRole("STUDENT", "INSTRUCTOR", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/courses/{courseId}/lessons/{lessonId}").hasAnyRole("STUDENT", "INSTRUCTOR", "ADMIN")
                
                // --- General rule for courses (e.g., POST, PUT, DELETE) ---
                .requestMatchers("/api/courses/**").hasAnyRole("INSTRUCTOR", "ADMIN")
                
                // --- Other role-specific routes ---
                .requestMatchers("/api/enrollments/**").hasAnyRole("STUDENT", "INSTRUCTOR", "ADMIN")
                .requestMatchers("/api/reviews/**").hasAnyRole("STUDENT", "ADMIN")
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                
                // --- All other requests must be authenticated ---
                .anyRequest().authenticated()
            )
            
            // 4. Set session management to STATELESS (for JWT)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        // 5. Add the JWT filter before the standard auth filter
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * This bean configures CORS to allow the React frontend (at localhost:3000)
     * to communicate with the Spring Boot backend.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Allow your React app's origin
        configuration.setAllowedOrigins(List.of("http://localhost:3000")); 
        // Allow standard HTTP methods
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS")); 
        // Allow all headers
        configuration.setAllowedHeaders(List.of("*")); 
        // Allow credentials (important for tokens/cookies)
        configuration.setAllowCredentials(true); 
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Apply this CORS configuration to all paths
        source.registerCorsConfiguration("/**", configuration); 
        return source;
    }

    /**
     * Exposes the AuthenticationManager as a Bean, required for login.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }


}