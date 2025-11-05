package com.udemylite.service;

import com.udemylite.model.Course;
import com.udemylite.model.User;
import com.udemylite.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public Course getCourseById(Long id) {
        return courseRepository.findById(id).orElseThrow(() -> new RuntimeException("Course not found"));
    }

    public Course createCourse(Course course, User instructor) {
        course.setInstructor(instructor);
        return courseRepository.save(course);
    }

    public Course updateCourse(Long id, Course courseDetails, User instructor) {
        Course course = getCourseById(id);
        if (!course.getInstructor().getId().equals(instructor.getId())) {
            throw new RuntimeException("Unauthorized to update this course");
        }
        course.setTitle(courseDetails.getTitle());
        course.setDescription(courseDetails.getDescription());
        course.setPrice(courseDetails.getPrice());
        return courseRepository.save(course);
    }

    public void deleteCourse(Long id, User instructor) {
        Course course = getCourseById(id);
        if (!course.getInstructor().getId().equals(instructor.getId())) {
            throw new RuntimeException("Unauthorized to delete this course");
        }
        courseRepository.delete(course);
    }

    public List<Course> getCoursesByInstructor(Long instructorId) {
        return courseRepository.findByInstructorId(instructorId);
    }
}
