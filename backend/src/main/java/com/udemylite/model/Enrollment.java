package com.udemylite.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "enrollments")
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonBackReference("student-enrollments")
    private User student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id", nullable = false)
    @JsonBackReference("course-enrollments")
    private Course course;

    @Column(nullable = false)
    private LocalDateTime enrollmentDate;

    @Column
    private LocalDateTime completionDate;

    public Enrollment() {}

    public Enrollment(Long id, User student, Course course, LocalDateTime enrollmentDate, LocalDateTime completionDate) {
        this.id = id;
        this.student = student;
        this.course = course;
        this.enrollmentDate = enrollmentDate;
        this.completionDate = completionDate;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }

    public LocalDateTime getEnrollmentDate() { return enrollmentDate; }
    public void setEnrollmentDate(LocalDateTime enrollmentDate) { this.enrollmentDate = enrollmentDate; }

    public LocalDateTime getCompletionDate() { return completionDate; }
    public void setCompletionDate(LocalDateTime completionDate) { this.completionDate = completionDate; }
}
