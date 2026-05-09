import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthRepository } from './auth.repo'
import { AuthService } from './auth.service'
import { RolesService } from './roles.service'

@Module({
  providers: [AuthService, RolesService, AuthRepository],
  controllers: [AuthController],
})
export class AuthModule {}
