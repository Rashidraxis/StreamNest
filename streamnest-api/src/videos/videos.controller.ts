import {
  Controller,
  Post,
  Get,
  Delete,
  UseInterceptors,
  UploadedFile,
  Body,
  UseGuards,
  Request,
  Param,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VideosService } from './videos.service';
import { JwtRestGuard } from '../auth/jwt-rest.guard';
import { RolesRestGuard } from '../auth/roles-rest.guard';
import { Roles } from '../auth/roles.decorator';
import { memoryStorage } from 'multer';

@Controller('api/videos')
export class VideosController {
  constructor(private videosService: VideosService) {}

  @Get()
  @UseGuards(JwtRestGuard)
  getAllVideos() {
    return this.videosService.getAllVideos();
  }

  @Get('search')
  @UseGuards(JwtRestGuard)
  searchVideos(@Query('query') query: string) {
    return this.videosService.searchVideos(query);
  }

  @Get(':id')
  @UseGuards(JwtRestGuard)
  getVideo(@Param('id') id: string) {
    return this.videosService.getVideoById(parseInt(id));
  }

  @Post('upload')
  @UseGuards(JwtRestGuard, RolesRestGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title: string,
    @Body('description') description: string,
    @Request() req: any,
  ) {
    if (!file) throw new Error('No file uploaded');
    return this.videosService.uploadVideo(
      file.buffer,
      file.originalname,
      { title, description },
      req.user.id,
    );
  }

  @Delete(':id')
  @UseGuards(JwtRestGuard, RolesRestGuard)
  @Roles('ADMIN')
  deleteVideo(@Param('id') id: string) {
    return this.videosService.deleteVideo(parseInt(id));
  }
}