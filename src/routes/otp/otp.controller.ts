import { Body, Controller, Post } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { SendOTPBodyDTO } from 'src/routes/otp/otp.dto'
import { OtpService } from 'src/routes/otp/otp.service'
import { MessageResDTO } from 'src/shared/dtos/reponse.dto'

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post()
  @ZodSerializerDto(MessageResDTO)
  async sendOTP(@Body() body: SendOTPBodyDTO) {
    return await this.otpService.sendOTP(body)
  }
}
