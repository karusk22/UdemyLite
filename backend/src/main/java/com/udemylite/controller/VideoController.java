package com.udemylite.controller;

import com.udemylite.model.User;
import com.udemylite.model.Video;
import com.udemylite.service.VideoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses/{courseId}/videos")
public class VideoController {

    @Autowired
    private VideoService videoService;

    @Autowired
    private com.udemylite.service.UserService userService;

    @GetMapping
    public ResponseEntity<List<Video>> getVideosByCourse(@PathVariable Long courseId, @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(videoService.getVideosByCourse(courseId, user));
    }

    @GetMapping("/{videoId}")
    public ResponseEntity<Video> getVideoById(@PathVariable Long courseId, @PathVariable Long videoId, @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(videoService.getVideoById(videoId, user));
    }

    @PostMapping
    public ResponseEntity<Video> createVideo(@PathVariable Long courseId, @RequestBody Video video, @AuthenticationPrincipal UserDetails userDetails) {
        User instructor = userService.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(videoService.createVideo(video, courseId, instructor));
    }

    @PutMapping("/{videoId}")
    public ResponseEntity<Video> updateVideo(@PathVariable Long courseId, @PathVariable Long videoId, @RequestBody Video video, @AuthenticationPrincipal UserDetails userDetails) {
        User instructor = userService.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(videoService.updateVideo(videoId, video, instructor));
    }

    @DeleteMapping("/{videoId}")
    public ResponseEntity<Void> deleteVideo(@PathVariable Long courseId, @PathVariable Long videoId, @AuthenticationPrincipal UserDetails userDetails) {
        User instructor = userService.findByEmail(userDetails.getUsername()).orElseThrow();
        videoService.deleteVideo(videoId, instructor);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/lesson/{lessonId}")
    public ResponseEntity<Video> createVideoForLesson(@PathVariable Long courseId, @PathVariable Long lessonId, @RequestBody Video video, @AuthenticationPrincipal UserDetails userDetails) {
        User instructor = userService.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(videoService.createVideoForLesson(video, lessonId, instructor));
    }
}
