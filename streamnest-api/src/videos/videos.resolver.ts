import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { VideosService } from './videos.service';
import { Video, CreateVideoInput } from './videos.types';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Resolver(() => Video)
export class VideosResolver {
  constructor(private videosService: VideosService) {}

  @Query(() => [Video])
  @UseGuards(GqlAuthGuard)
  async videos() {
    return this.videosService.getAllVideos();
  }

  @Query(() => Video, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async video(@Args('id', { type: () => Int }) id: number) {
    return this.videosService.getVideoById(id);
  }

  @Query(() => [Video])
  @UseGuards(GqlAuthGuard)
  async searchVideos(@Args('query') query: string) {
    return this.videosService.searchVideos(query);
  }

  @Mutation(() => Video)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async uploadVideo(
    @Args('input') input: CreateVideoInput,
    @Args('filename') filename: string,
    @Args('fileBase64') fileBase64: string,
    @Context() context: any,
  ) {
    const fileBuffer = Buffer.from(fileBase64, 'base64');
    const userId = context.req.user.id;
    return this.videosService.uploadVideo(fileBuffer, filename, input, userId);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteVideo(@Args('id', { type: () => Int }) id: number) {
    return this.videosService.deleteVideo(id);
  }
}