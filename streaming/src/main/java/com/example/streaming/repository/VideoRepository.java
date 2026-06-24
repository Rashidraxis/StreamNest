package com.example.streaming.repository;

import com.example.streaming.enums.VideoStatus;
import com.example.streaming.model.Video;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VideoRepository extends JpaRepository<Video, Integer> {
    List<Video> findByStatus(VideoStatus status);
    List<Video> findByTitleContainingIgnoreCase(String title);
}