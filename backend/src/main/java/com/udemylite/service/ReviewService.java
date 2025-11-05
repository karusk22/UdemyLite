package com.udemylite.service;

import com.udemylite.model.Review;
import com.udemylite.model.User;
import com.udemylite.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private EnrollmentService enrollmentService;

    public Review createReview(Review review, Long courseId, User student) {
        if (!enrollmentService.isStudentEnrolled(student.getId(), courseId)) {
            throw new RuntimeException("Cannot review course: Student not enrolled");
        }
        review.setStudent(student);
        com.udemylite.model.Course course = new com.udemylite.model.Course();
        course.setId(courseId);
        review.setCourse(course);
        return reviewRepository.save(review);
    }

    public Review updateReview(Long reviewId, Review reviewDetails, User student) {
        Review review = reviewRepository.findById(reviewId).orElseThrow(() -> new RuntimeException("Review not found"));
        if (!review.getStudent().getId().equals(student.getId())) {
            throw new RuntimeException("Unauthorized to update this review");
        }
        review.setRating(reviewDetails.getRating());
        review.setComment(reviewDetails.getComment());
        return reviewRepository.save(review);
    }

    public void deleteReview(Long reviewId, User student) {
        Review review = reviewRepository.findById(reviewId).orElseThrow(() -> new RuntimeException("Review not found"));
        if (!review.getStudent().getId().equals(student.getId())) {
            throw new RuntimeException("Unauthorized to delete this review");
        }
        reviewRepository.delete(review);
    }

    public List<Review> getReviewsByCourse(Long courseId) {
        return reviewRepository.findByCourseId(courseId);
    }

    public List<Review> getReviewsByStudent(Long studentId) {
        return reviewRepository.findByStudentId(studentId);
    }
}
