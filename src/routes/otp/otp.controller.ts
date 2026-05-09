import { Body, Controller, Post } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { SendOTPBodyDTO, SendOTPResDTO } from 'src/routes/otp/otp.dto'
import { OtpService } from 'src/routes/otp/otp.service'

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post()
  @ZodSerializerDto(SendOTPResDTO)
  async sendOTP(@Body() body: SendOTPBodyDTO) {
    await this.otpService.sendOTP(body)
    return { message: 'OTP sent successfully' }
  }
}
