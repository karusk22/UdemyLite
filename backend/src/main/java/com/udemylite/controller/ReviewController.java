package com.udemylite.controller;

import com.udemylite.model.Review;
import com.udemylite.model.User;
import com.udemylite.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private com.udemylite.service.UserService userService;

    @PostMapping("/courses/{courseId}")
    public ResponseEntity<Review> createReview(@PathVariable Long courseId, @RequestBody Review review, @AuthenticationPrincipal UserDetails userDetails) {
        User student = userService.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(reviewService.createReview(review, courseId, student));
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<Review> updateReview(@PathVariable Long reviewId, @RequestBody Review review, @AuthenticationPrincipal UserDetails userDetails) {
        User student = userService.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(reviewService.updateReview(reviewId, review, student));
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long reviewId, @AuthenticationPrincipal UserDetails userDetails) {
        User student = userService.findByEmail(userDetails.getUsername()).orElseThrow();
        reviewService.deleteReview(reviewId, student);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/courses/{courseId}")
    public ResponseEntity<List<Review>> getReviewsByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(reviewService.getReviewsByCourse(courseId));
    }

    @GetMapping("/my-reviews")
    public ResponseEntity<List<Review>> getMyReviews(@AuthenticationPrincipal UserDetails userDetails) {
        User student = userService.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(reviewService.getReviewsByStudent(student.getId()));
    }
}
