package com.example.streaming.controller;

import com.example.streaming.dto.VideoResponseDTO;
import com.example.streaming.service.VideoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/videos")
public class VideoController {

    private final VideoService videoService;

    public VideoController(VideoService videoService) {
        this.videoService = videoService;
    }

    @GetMapping
    public List<VideoResponseDTO> getAllVideos() {
        return videoService.getAllVideos();
    }

    @GetMapping("/{id}")
    public VideoResponseDTO getVideo(@PathVariable Integer id) {
        return videoService.getVideoById(id);
    }

    @GetMapping("/search")
    public List<VideoResponseDTO> searchVideos(@RequestParam String query) {
        return videoService.searchVideos(query);
    }
}