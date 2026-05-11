import { Body, Controller, Get, HttpCode, HttpStatus, Ip, Post, Query, Res } from '@nestjs/common'
import type { Response } from 'express'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  GetAuthorizationUrlResDTO,
  LoginBodyDTO,
  LoginResDTO,
  LogoutBodyDTO,
  RefreshTokenBodyDTO,
  RefreshTokenResDTO,
  RegisterBodyDTO,
  RegisterResDTO,
} from 'src/routes/auth/auth.dto'
import { AuthService } from 'src/routes/auth/auth.service'
import { IsPublic } from 'src/shared/decorators/auth.decorator'
import { UserAgent } from 'src/shared/decorators/user-agent.decorator'
import { MessageResDTO } from 'src/shared/dtos/reponse.dto'
import envConfig from 'src/shared/env.config'
import { GoogleService } from './google.service'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleService: GoogleService,
  ) {}

  @Post('register')
  @IsPublic()
  @ZodSerializerDto(RegisterResDTO)
  async register(@Body() body: RegisterBodyDTO, @UserAgent() userAgent: string, @Ip() ip: string) {
    return await this.authService.register({
      ...body,
      userAgent,
      ip,
    })
  }

  @Post('login')
  @IsPublic()
  @ZodSerializerDto(LoginResDTO)
  async login(@Body() body: LoginBodyDTO, @UserAgent() userAgent: string, @Ip() ip: string) {
    return await this.authService.login({
      ...body,
      userAgent,
      ip,
    })
  }

  @Post('refresh-token')
  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(RefreshTokenResDTO)
  async refreshToken(@Body() body: RefreshTokenBodyDTO, @UserAgent() userAgent: string, @Ip() ip: string) {
    return await this.authService.refreshToken({
      refreshToken: body.refreshToken,
      userAgent,
      ip,
    })
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(MessageResDTO)
  async logout(@Body() body: LogoutBodyDTO) {
    return await this.authService.logout(body.refreshToken)
  }

  @Get('google/authorize')
  @IsPublic()
  @ZodSerializerDto(GetAuthorizationUrlResDTO)
  getAuthorizationUrl(@UserAgent() userAgent: string, @Ip() ip: string) {
    return this.googleService.getAuthorizationUrl({
      userAgent,
      ip,
    })
  }

  @Get('google/callback')
  @IsPublic()
  async googleCallback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
    try {
      const data = await this.googleService.googleCallback({ code, state })
      const params = new URLSearchParams({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      })
      return res.redirect(`${envConfig.GOOGLE_CLIENT_REDIRECT_URI}?${params.toString()}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Google sign-in failed, please try another method'
      const params = new URLSearchParams({ errorMessage: message })
      return res.redirect(`${envConfig.GOOGLE_CLIENT_REDIRECT_URI}?${params.toString()}`)
    }
  }
}
