package com.udemylite.service;

import com.udemylite.model.Course;
import com.udemylite.model.Enrollment;
import com.udemylite.model.Lesson;
import com.udemylite.model.User;
import com.udemylite.repository.EnrollmentRepository;
import com.udemylite.repository.LessonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LessonService {

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    public List<Lesson> getLessonsByCourse(Long courseId, User user) {
        checkAccessToCourse(courseId, user);
        return lessonRepository.findByCourseIdOrderByOrderIndex(courseId);
    }

    public Lesson getLessonById(Long lessonId, User user) {
        Lesson lesson = lessonRepository.findById(lessonId).orElseThrow(() -> new RuntimeException("Lesson not found"));
        checkAccessToCourse(lesson.getCourse().getId(), user);
        return lesson;
    }

    public Lesson createLesson(Lesson lesson, Long courseId, User instructor) {
        Course course = new Course();
        course.setId(courseId);
        lesson.setCourse(course);
        if (!course.getInstructor().getId().equals(instructor.getId())) {
            throw new RuntimeException("Unauthorized to create lesson for this course");
        }
        return lessonRepository.save(lesson);
    }

    public Lesson updateLesson(Long lessonId, Lesson lessonDetails, User instructor) {
        Lesson lesson = lessonRepository.findById(lessonId).orElseThrow(() -> new RuntimeException("Lesson not found"));
        if (!lesson.getCourse().getInstructor().getId().equals(instructor.getId())) {
            throw new RuntimeException("Unauthorized to update this lesson");
        }
        lesson.setTitle(lessonDetails.getTitle());
        lesson.setContent(lessonDetails.getContent());
        lesson.setVideoUrl(lessonDetails.getVideoUrl());
        lesson.setOrderIndex(lessonDetails.getOrderIndex());
        return lessonRepository.save(lesson);
    }

    public void deleteLesson(Long lessonId, User instructor) {
        Lesson lesson = lessonRepository.findById(lessonId).orElseThrow(() -> new RuntimeException("Lesson not found"));
        if (!lesson.getCourse().getInstructor().getId().equals(instructor.getId())) {
            throw new RuntimeException("Unauthorized to delete this lesson");
        }
        lessonRepository.delete(lesson);
    }

    private void checkAccessToCourse(Long courseId, User user) {
        if (user.getRole() == User.Role.ADMIN || user.getRole() == User.Role.INSTRUCTOR) {
            return; // Admins and instructors have access
        }
        if (user.getRole() == User.Role.STUDENT) {
            boolean isEnrolled = enrollmentRepository.existsByStudentIdAndCourseId(user.getId(), courseId);
            if (!isEnrolled) {
                throw new RuntimeException("Access denied: Student not enrolled in this course");
            }
        } else {
            throw new RuntimeException("Access denied: Invalid user role");
        }
    }
}
