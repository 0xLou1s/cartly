import { Injectable } from '@nestjs/common'
import { VerificationCodeType } from 'src/routes/otp/otp.model'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class OtpRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createVerificationCode(
    payload: Pick<VerificationCodeType, 'email' | 'type' | 'code' | 'expiresAt'>,
  ): Promise<VerificationCodeType> {
    return this.prismaService.verificationCode.upsert({
      where: {
        email: payload.email,
      },
      create: payload,
      update: {
        code: payload.code,
        expiresAt: payload.expiresAt,
      },
    })
  }
}
