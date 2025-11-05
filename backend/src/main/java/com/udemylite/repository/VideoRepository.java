package com.udemylite.repository;

import com.udemylite.model.Video;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VideoRepository extends JpaRepository<Video, Long> {
    List<Video> findByCourseIdOrderByOrderIndex(Long courseId);
}
