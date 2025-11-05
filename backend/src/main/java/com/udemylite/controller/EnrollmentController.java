package com.udemylite.controller;

import com.udemylite.model.Enrollment;
import com.udemylite.model.User;
import com.udemylite.service.EnrollmentService;
import com.udemylite.service.UserService; // Corrected import
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map; // <-- Import Map

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    @Autowired
    private EnrollmentService enrollmentService;

    @Autowired
    private UserService userService; // Corrected service name

    // --- FIX 1: Changed URL from "/courses/{courseId}" to "/{courseId}" ---
    // This now matches the frontend's POST /api/enrollments/2
    @PostMapping("/{courseId}")
    public ResponseEntity<Enrollment> enrollInCourse(@PathVariable Long courseId, @AuthenticationPrincipal UserDetails userDetails) {
        User student = userService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Student not found"));
        return ResponseEntity.ok(enrollmentService.enrollStudent(courseId, student));
    }

    // --- FIX 2: Changed URL from "/courses/{courseId}" to "/{courseId}" ---
    // This makes it consistent with the POST URL
    @DeleteMapping("/{courseId}")
    public ResponseEntity<Void> unenrollFromCourse(@PathVariable Long courseId, @AuthenticationPrincipal UserDetails userDetails) {
        User student = userService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Student not found"));
        enrollmentService.unenrollStudent(courseId, student);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getMyEnrollments(@AuthenticationPrincipal UserDetails userDetails) {
        User student = userService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Student not found"));
        List<Enrollment> enrollments = enrollmentService.getEnrollmentsByStudent(student.getId());
        List<Map<String, Object>> result = enrollments.stream().map(enrollment -> Map.of(
            "id", enrollment.getId(),
            "course", Map.of(
                "id", enrollment.getCourse().getId(),
                "title", enrollment.getCourse().getTitle(),
                "description", enrollment.getCourse().getDescription(),
                "price", enrollment.getCourse().getPrice(),
                "instructor", Map.of(
                    "firstName", enrollment.getCourse().getInstructor().getFirstName(),
                    "lastName", enrollment.getCourse().getInstructor().getLastName()
                )
            ),
            "enrollmentDate", enrollment.getEnrollmentDate()
        )).toList();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/instructor")
    public ResponseEntity<List<Map<String, Object>>> getInstructorEnrollments(@AuthenticationPrincipal UserDetails userDetails) {
        User instructor = userService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Instructor not found"));
        List<Enrollment> enrollments = enrollmentService.getEnrollmentsByInstructor(instructor.getId());
        List<Map<String, Object>> result = enrollments.stream().map(enrollment -> Map.of(
            "id", enrollment.getId(),
            "student", Map.of("firstName", enrollment.getStudent().getFirstName(), "lastName", enrollment.getStudent().getLastName()),
            "course", Map.of("title", enrollment.getCourse().getTitle()),
            "enrollmentDate", enrollment.getEnrollmentDate()
        )).toList();
        return ResponseEntity.ok(result);
    }

    // --- FIX 3: ADDED THIS ENTIRE METHOD ---
    // This creates the missing GET /api/enrollments/check/{courseId} endpoint
    @GetMapping("/check/{courseId}")
    public ResponseEntity<?> checkEnrollment(@PathVariable Long courseId, @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            // If user is not logged in, they are not enrolled
            return ResponseEntity.ok(Map.of("enrolled", false));
        }
        User student = userService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        boolean isEnrolled = enrollmentService.isStudentEnrolled(student.getId(), courseId);

        // Return a simple JSON object: { "enrolled": true }
        return ResponseEntity.ok(Map.of("enrolled", isEnrolled));
    }
}
