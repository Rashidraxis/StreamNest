package com.example.streaming.service;

import com.example.streaming.dto.VideoResponseDTO;
import com.example.streaming.enums.VideoStatus;
import com.example.streaming.model.User;
import com.example.streaming.model.Video;
import com.example.streaming.repository.UserRepository;
import com.example.streaming.repository.VideoRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VideoService {

    private final VideoRepository videoRepository;
    private final UserRepository userRepository;
    private final R2StorageService r2StorageService;
    private final FFmpegService ffmpegService;

    public VideoService(VideoRepository videoRepository,
            UserRepository userRepository,
            R2StorageService r2StorageService,
            FFmpegService ffmpegService) {
        this.videoRepository = videoRepository;
        this.userRepository = userRepository;
        this.r2StorageService = r2StorageService;
        this.ffmpegService = ffmpegService;
    }

    @Async
    public void uploadVideo(byte[] fileBytes, String originalFilename,
            String title, String description,
            String adminEmail) throws IOException {

        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Video video = new Video();
        video.setTitle(title);
        video.setDescription(description);
        video.setUploadedBy(admin);
        videoRepository.save(video);

        try {
            // write bytes to temp file
            File tempFile = Files.createTempFile("upload_", "_" + originalFilename).toFile();
            java.nio.file.Files.write(tempFile.toPath(), fileBytes);

            // get duration
            int duration = ffmpegService.getDuration(tempFile);
            video.setDuration(duration);

            // generate thumbnail
            File thumbnailFile = ffmpegService.generateThumbnail(tempFile, video.getId().toString());
            String thumbnailKey = "thumbnails/" + video.getId() + "/thumbnail.jpg";
            String thumbnailUrl = r2StorageService.uploadThumbnail(thumbnailFile, thumbnailKey);
            video.setThumbnailUrl(thumbnailUrl);
            thumbnailFile.getParentFile().delete();
            thumbnailFile.delete();

            // convert to HLS
            File hlsFolder = ffmpegService.convertToHls(tempFile, video.getId().toString());

            // upload to R2
            String r2KeyPrefix = "videos/" + video.getId();
            r2StorageService.uploadFolder(hlsFolder, r2KeyPrefix);

            // set video URL
            String videoUrl = r2StorageService.getPublicUrl(r2KeyPrefix + "/index.m3u8");
            video.setVideoUrl(videoUrl);
            video.setStatus(VideoStatus.READY);

            // cleanup
            tempFile.delete();
            deleteFolder(hlsFolder);

        } catch (Exception e) {
            video.setStatus(VideoStatus.FAILED);
            e.printStackTrace();
        }

        videoRepository.save(video);
    }

    public List<VideoResponseDTO> getAllVideos() {
        return videoRepository.findByStatus(VideoStatus.READY)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public VideoResponseDTO getVideoById(Integer id) {
        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Video not found"));
        return toDTO(video);
    }

    public List<VideoResponseDTO> searchVideos(String query) {
        return videoRepository.findByTitleContainingIgnoreCase(query)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private VideoResponseDTO toDTO(Video video) {
        return new VideoResponseDTO(
                video.getId(),
                video.getTitle(),
                video.getDescription(),
                video.getThumbnailUrl(),
                video.getVideoUrl(),
                video.getDuration(),
                video.getStatus(),
                video.getCreatedAt());
    }

    private void deleteFolder(File folder) {
        File[] files = folder.listFiles();
        if (files != null) {
            for (File file : files)
                file.delete();
        }
        folder.delete();
    }

    public void deleteVideo(Integer id) {
        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Video not found"));

        // delete from R2
        String videoKeyPrefix = "videos/" + id;
        String thumbnailKey = "thumbnails/" + id + "/thumbnail.jpg";
        r2StorageService.deleteFolder(videoKeyPrefix);
        r2StorageService.deleteFile(thumbnailKey);

        // delete from database
        videoRepository.deleteById(id);
    }
}