package com.udemylite.service;

import com.udemylite.model.Course;
import com.udemylite.model.Enrollment;
import com.udemylite.model.Lesson;
import com.udemylite.model.User;
import com.udemylite.model.Video;
import com.udemylite.repository.EnrollmentRepository;
import com.udemylite.repository.LessonRepository;
import com.udemylite.repository.VideoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VideoService {

    @Autowired
    private VideoRepository videoRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private LessonRepository lessonRepository;

    public List<Video> getVideosByCourse(Long courseId, User user) {
        checkAccessToCourse(courseId, user);
        return videoRepository.findByCourseIdOrderByOrderIndex(courseId);
    }

    public Video getVideoById(Long videoId, User user) {
        Video video = videoRepository.findById(videoId).orElseThrow(() -> new RuntimeException("Video not found"));
        checkAccessToCourse(video.getCourse().getId(), user);
        return video;
    }

    public Video createVideo(Video video, Long courseId, User instructor) {
        Course course = new Course();
        course.setId(courseId);
        video.setCourse(course);
        if (!course.getInstructor().getId().equals(instructor.getId())) {
            throw new RuntimeException("Unauthorized to create video for this course");
        }
        return videoRepository.save(video);
    }

    public Video updateVideo(Long videoId, Video videoDetails, User instructor) {
        Video video = videoRepository.findById(videoId).orElseThrow(() -> new RuntimeException("Video not found"));
        if (!video.getCourse().getInstructor().getId().equals(instructor.getId())) {
            throw new RuntimeException("Unauthorized to update this video");
        }
        video.setTitle(videoDetails.getTitle());
        video.setDescription(videoDetails.getDescription());
        video.setYoutubeUrl(videoDetails.getYoutubeUrl());
        video.setOrderIndex(videoDetails.getOrderIndex());
        return videoRepository.save(video);
    }

    public void deleteVideo(Long videoId, User instructor) {
        Video video = videoRepository.findById(videoId).orElseThrow(() -> new RuntimeException("Video not found"));
        if (!video.getCourse().getInstructor().getId().equals(instructor.getId())) {
            throw new RuntimeException("Unauthorized to delete this video");
        }
        videoRepository.delete(video);
    }

    public Video createVideoForLesson(Video video, Long lessonId, User instructor) {
        Lesson lesson = lessonRepository.findById(lessonId)
            .orElseThrow(() -> new RuntimeException("Lesson not found"));
        if (!lesson.getCourse().getInstructor().getId().equals(instructor.getId())) {
            throw new RuntimeException("Unauthorized to create video for this lesson");
        }
        video.setLesson(lesson);
        video.setCourse(lesson.getCourse());
        return videoRepository.save(video);
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
