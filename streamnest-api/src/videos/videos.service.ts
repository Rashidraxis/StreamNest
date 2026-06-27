import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { FfmpegService } from '../ffmpeg/ffmpeg.service';
import { CreateVideoInput } from './videos.types';
import { writeFileSync, unlinkSync, rmSync } from 'fs';
import { join } from 'path';
import * as os from 'os';

@Injectable()
export class VideosService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private ffmpeg: FfmpegService,
  ) {}

  async getAllVideos() {
    return this.prisma.video.findMany({
      where: { status: 'READY' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getVideoById(id: number) {
    return this.prisma.video.findUnique({
      where: { id },
    });
  }

  async searchVideos(query: string) {
    return this.prisma.video.findMany({
      where: {
        title: { contains: query, mode: 'insensitive' },
        status: 'READY',
      },
    });
  }

  async uploadVideo(
    fileBuffer: Buffer,
    filename: string,
    input: CreateVideoInput,
    userId: number,
  ) {
    // create video record
    const video = await this.prisma.video.create({
      data: {
        title: input.title,
        description: input.description,
        status: 'PROCESSING',
        userId,
      },
    });

    // process in background
    this.processVideo(video.id, fileBuffer, filename).catch(async (err) => {
      console.error('Video processing failed:', err);
      await this.prisma.video.update({
        where: { id: video.id },
        data: { status: 'FAILED' },
      });
    });

    return video;
  }

  private async processVideo(videoId: number, fileBuffer: Buffer, filename: string) {
    // save to temp file
    const tempPath = join(os.tmpdir(), `upload_${videoId}_${filename}`);
    writeFileSync(tempPath, fileBuffer);

    try {
      // get duration
      const duration = this.ffmpeg.getDuration(tempPath);

      // generate thumbnail
      const thumbnailPath = this.ffmpeg.generateThumbnail(tempPath, videoId);
      const thumbnailKey = `thumbnails/${videoId}/thumbnail.jpg`;
      const thumbnailUrl = await this.storage.uploadFile(thumbnailPath, thumbnailKey, 'image/jpeg');

      // convert to HLS
      const hlsFolder = this.ffmpeg.convertToHls(tempPath, videoId);
      const r2KeyPrefix = `videos/${videoId}`;
      await this.storage.uploadFolder(hlsFolder, r2KeyPrefix);
      const videoUrl = this.storage.getPublicUrl(`${r2KeyPrefix}/index.m3u8`);

      // update video record
      await this.prisma.video.update({
        where: { id: videoId },
        data: {
          duration,
          thumbnailUrl,
          videoUrl,
          status: 'READY',
        },
      });

      // cleanup
      unlinkSync(tempPath);
      rmSync(hlsFolder, { recursive: true });
      rmSync(`${os.tmpdir()}/thumb_${videoId}`, { recursive: true });

    } catch (err) {
      unlinkSync(tempPath);
      throw err;
    }
  }

  async deleteVideo(id: number) {
    const video = await this.prisma.video.findUnique({ where: { id } });
    if (!video) throw new Error('Video not found');

    // delete from R2
    await this.storage.deleteFolder(`videos/${id}`);
    await this.storage.deleteFile(`thumbnails/${id}/thumbnail.jpg`);

    // delete from database
    await this.prisma.video.delete({ where: { id } });

    return true;
  }
}