import { Injectable, UnprocessableEntityException } from '@nestjs/common'
import { RolesService } from 'src/routes/auth/roles.service'
import { OtpService } from 'src/routes/otp/otp.service'
import { TypeOfVerificationCode } from 'src/shared/constants/auth.constant'
import { isUniqueConstraintPrismaError } from 'src/shared/helpers'
import { HashingService } from 'src/shared/services/hashing.service'
import { RegisterBodyType } from './auth.model'
import { AuthRepository } from './auth.repo'

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly rolesService: RolesService,
    private readonly authRepository: AuthRepository,
    private readonly otpService: OtpService,
  ) {}

  async register(body: RegisterBodyType) {
    try {
      const verificationCode = await this.otpService.verifyOTP({
        email: body.email,
        code: body.code,
        type: TypeOfVerificationCode.REGISTER,
      })

      const clientRoleId = await this.rolesService.getClientRoleId()
      const hashedPassword = await this.hashingService.hash(body.password)
      const user = await this.authRepository.createUser({
        email: body.email,
        name: body.name,
        phoneNumber: body.phoneNumber,
        password: hashedPassword,
        roleId: clientRoleId,
      })
      await this.otpService.deleteVerificationCode({ id: verificationCode.id })
      return user
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw new UnprocessableEntityException([
          {
            message: 'Email already exists',
            path: 'email',
          },
        ])
      }
      throw error
    }
  }
}
