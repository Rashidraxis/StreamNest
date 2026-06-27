import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthResponse, RegisterInput, LoginInput } from './auth.types';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  // GraphQL requires at least one Query
  @Query(() => String)
  health(): string {
    return 'StreamNest API is running!';
  }

  @Mutation(() => AuthResponse)
  async register(@Args('input') input: RegisterInput) {
    return this.authService.register(input);
  }

  @Mutation(() => AuthResponse)
  async login(@Args('input') input: LoginInput) {
    return this.authService.login(input);
  }
}