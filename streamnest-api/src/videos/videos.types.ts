import { ObjectType, Field, Int, InputType } from '@nestjs/graphql';

@ObjectType()
export class Video {
  @Field(() => Int)
  id: number;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  thumbnailUrl?: string;

  @Field({ nullable: true })
  videoUrl?: string;

  @Field(() => Int, { nullable: true })
  duration?: number;

  @Field()
  status: string;

  @Field({ nullable: true })
  createdAt?: Date;
}

@InputType()
export class CreateVideoInput {
  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;
}