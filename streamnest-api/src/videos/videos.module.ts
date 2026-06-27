import { Module } from '@nestjs/common';
import { VideosResolver } from './videos.resolver';
import { VideosService } from './videos.service';
import { VideosController } from './videos.controller';
import { StorageModule } from '../storage/storage.module';
import { FfmpegModule } from '../ffmpeg/ffmpeg.module';

@Module({
  imports: [StorageModule, FfmpegModule],
  controllers: [VideosController],
  providers: [VideosResolver, VideosService],
})
export class VideosModule {}