package com.udemylite.controller;

import com.udemylite.model.Lesson;
import com.udemylite.model.User;
import com.udemylite.service.LessonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses/{courseId}/lessons")
public class LessonController {

    @Autowired
    private LessonService lessonService;

    @Autowired
    private com.udemylite.service.UserService userService;

    @GetMapping
    public ResponseEntity<List<Lesson>> getLessonsByCourse(@PathVariable Long courseId, @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(lessonService.getLessonsByCourse(courseId, user));
    }

    @GetMapping("/{lessonId}")
    public ResponseEntity<Lesson> getLessonById(@PathVariable Long courseId, @PathVariable Long lessonId, @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(lessonService.getLessonById(lessonId, user));
    }

    @PostMapping
    public ResponseEntity<Lesson> createLesson(@PathVariable Long courseId, @RequestBody Lesson lesson, @AuthenticationPrincipal UserDetails userDetails) {
        User instructor = userService.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(lessonService.createLesson(lesson, courseId, instructor));
    }

    @PutMapping("/{lessonId}")
    public ResponseEntity<Lesson> updateLesson(@PathVariable Long courseId, @PathVariable Long lessonId, @RequestBody Lesson lesson, @AuthenticationPrincipal UserDetails userDetails) {
        User instructor = userService.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(lessonService.updateLesson(lessonId, lesson, instructor));
    }

    @DeleteMapping("/{lessonId}")
    public ResponseEntity<Void> deleteLesson(@PathVariable Long courseId, @PathVariable Long lessonId, @AuthenticationPrincipal UserDetails userDetails) {
        User instructor = userService.findByEmail(userDetails.getUsername()).orElseThrow();
        lessonService.deleteLesson(lessonId, instructor);
        return ResponseEntity.noContent().build();
    }
}
