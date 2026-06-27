import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { execSync } from 'child_process';
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import * as os from 'os';

@Injectable()
export class FfmpegService {
  private ffmpegPath: string;
  private ffprobePath: string;

  constructor(private configService: ConfigService) {
    this.ffmpegPath = this.configService.get<string>('FFMPEG_PATH')!;
    this.ffprobePath = this.configService.get<string>('FFPROBE_PATH')!;
  }

  getDuration(inputPath: string): number {
    const result = execSync(
      `"${this.ffprobePath}" -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${inputPath}"`
    ).toString().trim();
    return Math.floor(parseFloat(result));
  }

  convertToHls(inputPath: string, videoId: number): string {
    const outputDir = join(os.tmpdir(), `hls_${videoId}`);
    if (!existsSync(outputDir)) mkdirSync(outputDir);

    execSync(
      `"${this.ffmpegPath}" -i "${inputPath}" -hls_time 10 -hls_list_size 0 ` +
      `-hls_segment_filename "${outputDir}/segment_%03d.ts" ` +
      `-c:v libx264 -c:a aac -preset fast "${outputDir}/index.m3u8"`
    );

    return outputDir;
  }

  generateThumbnail(inputPath: string, videoId: number): string {
    const outputDir = join(os.tmpdir(), `thumb_${videoId}`);
    if (!existsSync(outputDir)) mkdirSync(outputDir);

    const thumbnailPath = join(outputDir, 'thumbnail.jpg');

    execSync(
      `"${this.ffmpegPath}" -i "${inputPath}" -ss 00:00:02 -vframes 1 ` +
      `-vf scale=640:360 "${thumbnailPath}"`
    );

    return thumbnailPath;
  }
}