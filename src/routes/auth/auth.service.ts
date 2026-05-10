import { HttpException, Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common'
import { addMilliseconds } from 'date-fns'
import ms from 'ms'
import { RolesService } from 'src/routes/auth/roles.service'
import { OtpService } from 'src/routes/otp/otp.service'
import { TypeOfVerificationCode } from 'src/shared/constants/auth.constant'
import envConfig from 'src/shared/env.config'
import { isUniqueConstraintPrismaError } from 'src/shared/helpers'
import { HashingService } from 'src/shared/services/hashing.service'
import { PrismaService } from 'src/shared/services/prisma.service'
import { TokenService } from 'src/shared/services/token.service'
import { AccessTokenPayloadCreate } from 'src/shared/types/jwt.type'
import { LoginBodyType, RefreshTokenBodyType, RegisterBodyType } from './auth.model'
import { AuthRepository } from './auth.repo'

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly rolesService: RolesService,
    private readonly authRepository: AuthRepository,
    private readonly otpService: OtpService,
    private readonly tokenService: TokenService,
    private readonly prismaService: PrismaService,
  ) {}

  async register(body: RegisterBodyType & { userAgent: string; ip: string }) {
    try {
      const verificationCode = await this.otpService.verifyOTP({
        email: body.email,
        code: body.code,
        type: TypeOfVerificationCode.REGISTER,
      })

      const clientRoleId = await this.rolesService.getClientRoleId()
      const hashedPassword = await this.hashingService.hash(body.password)

      const [user] = await this.prismaService.$transaction([
        this.prismaService.user.create({
          data: {
            email: body.email,
            name: body.name,
            phoneNumber: body.phoneNumber,
            password: hashedPassword,
            roleId: clientRoleId,
          },
          include: { role: true },
        }),
        this.prismaService.verificationCode.delete({
          where: { id: verificationCode.id },
        }),
      ])

      const device = await this.authRepository.findOrCreateDevice({
        userId: user.id,
        userAgent: body.userAgent,
        ip: body.ip,
      })
      const tokens = await this.generateTokens({
        userId: user.id,
        deviceId: device.id,
        roleId: user.roleId,
        roleName: user.role.name,
      })
      return { ...tokens, user }
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

  async login(body: LoginBodyType & { userAgent: string; ip: string }) {
    const user = await this.authRepository.findUniqueUserIncludeRole({
      email: body.email,
    })

    const isPasswordMatch = user ? await this.hashingService.compare(body.password, user.password) : false
    if (!user || !isPasswordMatch) {
      throw new UnprocessableEntityException([
        {
          message: 'Email or password is incorrect',
          path: 'password',
        },
      ])
    }

    const device = await this.authRepository.findOrCreateDevice({
      userId: user.id,
      userAgent: body.userAgent,
      ip: body.ip,
    })
    const tokens = await this.generateTokens({
      userId: user.id,
      deviceId: device.id,
      roleId: user.roleId,
      roleName: user.role.name,
    })
    return { ...tokens, user }
  }

  async generateTokens({ userId, deviceId, roleId, roleName }: AccessTokenPayloadCreate) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken({
        userId,
        deviceId,
        roleId,
        roleName,
      }),
      this.tokenService.signRefreshToken({
        userId,
      }),
    ])
    await this.authRepository.createRefreshToken({
      token: refreshToken,
      userId,
      expiresAt: addMilliseconds(new Date(), ms(envConfig.REFRESH_TOKEN_EXPIRES_IN as string)),
      deviceId,
    })
    return { accessToken, refreshToken }
  }

  async refreshToken({ refreshToken, userAgent, ip }: RefreshTokenBodyType & { userAgent: string; ip: string }) {
    try {
      const { userId } = await this.tokenService.verifyRefreshToken(refreshToken)
      const refreshTokenInDb = await this.authRepository.findUniqueRefreshTokenIncludeUserRole({
        token: refreshToken,
      })
      if (!refreshTokenInDb) {
        throw new UnauthorizedException('Refresh token has already been used')
      }
      const {
        deviceId,
        user: {
          roleId,
          role: { name: roleName },
        },
      } = refreshTokenInDb
      if (!deviceId) {
        throw new UnauthorizedException('Refresh token is not bound to a device')
      }
      const $updateDevice = this.authRepository.updateDevice(deviceId, {
        ip,
        userAgent,
      })
      const $deleteRefreshToken = this.authRepository.deleteRefreshToken({
        token: refreshToken,
      })
      const $tokens = this.generateTokens({ userId, roleId, roleName, deviceId })
      const [, , tokens] = await Promise.all([$updateDevice, $deleteRefreshToken, $tokens])
      return tokens
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new UnauthorizedException()
    }
  }
}
