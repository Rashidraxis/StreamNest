package com.example.streaming.service;

import net.bramp.ffmpeg.FFmpeg;
import net.bramp.ffmpeg.FFprobe;
import net.bramp.ffmpeg.builder.FFmpegBuilder;
import net.bramp.ffmpeg.probe.FFmpegProbeResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@Service
public class FFmpegService {

    @Value("${ffmpeg.path}")
    private String ffmpegPath;

    @Value("${ffprobe.path}")
    private String ffprobePath;

    // convert video to HLS format
    public File convertToHls(File inputFile, String videoId) throws IOException {
        // create temp output directory
        Path outputDir = Files.createTempDirectory("hls_" + videoId);

        FFmpeg ffmpeg = new FFmpeg(ffmpegPath);

        FFmpegBuilder builder = new FFmpegBuilder()
                .setInput(inputFile.getAbsolutePath())
                .addOutput(outputDir.toString() + "/index.m3u8")
                .setFormat("hls")
                .addExtraArgs("-hls_time", "10") // 10 second chunks
                .addExtraArgs("-hls_list_size", "0") // keep all chunks
                .addExtraArgs("-hls_segment_filename",
                        outputDir.toString() + "/segment_%03d.ts")
                .addExtraArgs("-c:v", "libx264") // video codec
                .addExtraArgs("-c:a", "aac") // audio codec
                .addExtraArgs("-preset", "fast") // encoding speed
                .done();

        net.bramp.ffmpeg.FFmpegExecutor executor = new net.bramp.ffmpeg.FFmpegExecutor(ffmpeg);
        executor.createJob(builder).run();

        return outputDir.toFile();
    }

    // get video duration in seconds
    public int getDuration(File videoFile) throws IOException {
        FFprobe ffprobe = new FFprobe(ffprobePath);
        FFmpegProbeResult result = ffprobe.probe(videoFile.getAbsolutePath());
        return (int) result.getFormat().duration;
    }

    // generate thumbnail from video
    public File generateThumbnail(File videoFile, String videoId) throws IOException {
        Path outputDir = Files.createTempDirectory("thumb_" + videoId);
        String thumbnailPath = outputDir.toString() + "/thumbnail.jpg";

        FFmpeg ffmpeg = new FFmpeg(ffmpegPath);

        FFmpegBuilder builder = new FFmpegBuilder()
                .setInput(videoFile.getAbsolutePath())
                .addOutput(thumbnailPath)
                .setFrames(1) // extract 1 frame
                .addExtraArgs("-ss", "00:00:02") // at 2 seconds
                .addExtraArgs("-vf", "scale=640:360") // 640x360 size
                .done();

        net.bramp.ffmpeg.FFmpegExecutor executor = new net.bramp.ffmpeg.FFmpegExecutor(ffmpeg);
        executor.createJob(builder).run();

        return new File(thumbnailPath);
    }
}