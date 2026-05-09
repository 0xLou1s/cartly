import { Injectable, UnprocessableEntityException } from '@nestjs/common'
import { addMilliseconds } from 'date-fns'
import ms from 'ms'
import { SendOTPBodyType } from 'src/routes/otp/otp.model'
import { OtpRepository } from 'src/routes/otp/otp.repo'
import { TypeOfVerificationCode } from 'src/shared/constants/auth.constant'
import envConfig from 'src/shared/env.config'
import { generateOTP } from 'src/shared/helpers'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'

@Injectable()
export class OtpService {
  constructor(
    private readonly otpRepository: OtpRepository,
    private readonly sharedUserRepository: SharedUserRepository,
  ) {}

  async sendOTP(body: SendOTPBodyType) {
    const user = await this.sharedUserRepository.findUnique({
      email: body.email,
    })
    if (body.type === TypeOfVerificationCode.REGISTER && user) {
      throw new UnprocessableEntityException([
        {
          message: 'Email already exists',
          path: 'email',
        },
      ])
    }
    if (body.type === TypeOfVerificationCode.FORGOT_PASSWORD && !user) {
      throw new UnprocessableEntityException([
        {
          message: 'Email not found',
          path: 'email',
        },
      ])
    }
    const code = generateOTP()
    const verificationCode = await this.otpRepository.createVerificationCode({
      email: body.email,
      code,
      type: body.type,
      expiresAt: addMilliseconds(new Date(), ms(envConfig.OTP_EXPIRES_IN)),
    })
    return verificationCode
  }
}
