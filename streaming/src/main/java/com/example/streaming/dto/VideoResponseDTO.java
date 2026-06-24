package com.example.streaming.dto;

import com.example.streaming.enums.VideoStatus;
import java.time.LocalDateTime;

public class VideoResponseDTO {
    private Integer id;
    private String title;
    private String description;
    private String thumbnailUrl;
    private String videoUrl;
    private Integer duration;
    private VideoStatus status;
    private LocalDateTime createdAt;

    public VideoResponseDTO() {}

    public VideoResponseDTO(Integer id, String title, String description,
                            String thumbnailUrl, String videoUrl,
                            Integer duration, VideoStatus status,
                            LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.thumbnailUrl = thumbnailUrl;
        this.videoUrl = videoUrl;
        this.duration = duration;
        this.status = status;
        this.createdAt = createdAt;
    }

    public Integer getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getThumbnailUrl() { return thumbnailUrl; }
    public String getVideoUrl() { return videoUrl; }
    public Integer getDuration() { return duration; }
    public VideoStatus getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}