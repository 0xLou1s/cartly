import { Module } from '@nestjs/common'
import { OtpModule } from 'src/routes/otp/otp.module'
import { AuthController } from './auth.controller'
import { AuthRepository } from './auth.repo'
import { AuthService } from './auth.service'
import { RolesService } from './roles.service'

@Module({
  imports: [OtpModule],
  providers: [AuthService, RolesService, AuthRepository],
  controllers: [AuthController],
})
export class AuthModule {}
