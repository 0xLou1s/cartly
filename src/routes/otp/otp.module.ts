import { Module } from '@nestjs/common'
import { OtpController } from 'src/routes/otp/otp.controller'
import { OtpRepository } from 'src/routes/otp/otp.repo'
import { OtpService } from 'src/routes/otp/otp.service'

@Module({
  providers: [OtpService, OtpRepository],
  controllers: [OtpController],
  exports: [OtpService],
})
export class OtpModule {}
