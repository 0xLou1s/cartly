import { Module } from '@nestjs/common'
import { RolesService } from 'src/routes/auth/roles.service'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

@Module({
  providers: [AuthService, RolesService],
  controllers: [AuthController],
})
export class AuthModule {}
