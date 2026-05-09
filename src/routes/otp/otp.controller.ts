import { Body, Controller, Post } from '@nestjs/common'
import { SendOTPBodyDTO } from 'src/routes/otp/otp.dto'
import { OtpService } from 'src/routes/otp/otp.service'

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post()
  async sendOTP(@Body() body: SendOTPBodyDTO) {
    return this.otpService.sendOTP(body)
  }
}
