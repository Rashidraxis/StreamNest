package com.example.streaming.controller;

import com.example.streaming.service.VideoService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final VideoService videoService;

    public AdminController(VideoService videoService) {
        this.videoService = videoService;
    }

    @PostMapping("/upload")
    public String uploadVideo(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            Authentication authentication) throws Exception {

        // read bytes immediately before async takes over
        byte[] fileBytes = file.getBytes();
        String originalFilename = file.getOriginalFilename();

        videoService.uploadVideo(fileBytes, originalFilename, title, description, authentication.getName());
        return "Video upload started! Processing in background.";
    }

    @DeleteMapping("/videos/{id}")
    public String deleteVideo(@PathVariable Integer id) {
        videoService.deleteVideo(id);
        return "Video deleted successfully";
    }
}