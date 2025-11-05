package com.udemylite.service;

import com.udemylite.model.Course; // <-- Import Course
import com.udemylite.model.Enrollment;
import com.udemylite.model.User;
import com.udemylite.repository.EnrollmentRepository;
import com.udemylite.repository.CourseRepository; // <-- Import CourseRepository
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EnrollmentService {

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    // We need the CourseRepository to properly attach the course
    @Autowired
    private CourseRepository courseRepository; 

    public Enrollment enrollStudent(Long courseId, User student) {
        if (enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), courseId)) {
            throw new RuntimeException("Student already enrolled in this course");
        }

        // Find the actual course from the database
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        Enrollment enrollment = new Enrollment();
        enrollment.setStudent(student);
        enrollment.setCourse(course); // Set the managed entity
        enrollment.setEnrollmentDate(LocalDateTime.now());
        return enrollmentRepository.save(enrollment);
    }

    public void unenrollStudent(Long courseId, User student) {
        Enrollment enrollment = enrollmentRepository.findByStudentIdAndCourseId(student.getId(), courseId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));
        enrollmentRepository.delete(enrollment);
    }

    public List<Enrollment> getEnrollmentsByStudent(Long studentId) {
        // --- FIX 4: Replaced inefficient "findAll" with a direct query ---
        // This is much faster and will not crash on large databases.
        return enrollmentRepository.findByStudentId(studentId);
    }

    public boolean isStudentEnrolled(Long studentId, Long courseId) {
        return enrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId);
    }
}
