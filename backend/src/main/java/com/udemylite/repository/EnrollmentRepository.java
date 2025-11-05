package com.udemylite.repository;

import com.udemylite.model.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List; // <-- 1. IMPORT THIS
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    // --- 2. ADD THIS MISSING METHOD ---
    // This is needed by EnrollmentService.getEnrollmentsByStudent()
    List<Enrollment> findByStudentId(Long studentId);

    Optional<Enrollment> findByStudentIdAndCourseId(Long studentId, Long courseId);
    
    boolean existsByStudentIdAndCourseId(Long studentId, Long courseId);
}
