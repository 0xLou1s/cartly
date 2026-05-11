import { UnauthorizedException, UnprocessableEntityException } from '@nestjs/common'

// OTP related errors
export const InvalidOTPException = new UnprocessableEntityException([
  {
    message: 'Error.InvalidOTP',
    path: 'code',
  },
])

export const OTPExpiredException = new UnprocessableEntityException([
  {
    message: 'Error.OTPExpired',
    path: 'code',
  },
])

export const FailedToSendOTPException = new UnprocessableEntityException([
  {
    message: 'Error.FailedToSendOTP',
    path: 'code',
  },
])

// Email related errors
export const EmailAlreadyExistsException = new UnprocessableEntityException([
  {
    message: 'Error.EmailAlreadyExists',
    path: 'email',
  },
])

export const EmailNotFoundException = new UnprocessableEntityException([
  {
    message: 'Error.EmailNotFound',
    path: 'email',
  },
])

// Password related errors
export const InvalidPasswordException = new UnprocessableEntityException([
  {
    message: 'Error.InvalidPassword',
    path: 'password',
  },
])

export const InvalidCredentialsException = new UnprocessableEntityException([
  {
    message: 'Error.InvalidCredentials',
    path: 'password',
  },
])

// Auth token related errors
export const RefreshTokenAlreadyUsedException = new UnauthorizedException('Error.RefreshTokenAlreadyUsed')
export const UnauthorizedAccessException = new UnauthorizedException('Error.UnauthorizedAccess')

// Google auth related errors
export const GoogleUserInfoError = new Error('Error.FailedToGetGoogleUserInfo')
export const MissingStateError = new Error('Error.MissingState')
export const InvalidStateError = new Error('Error.InvalidState')
export const StateExpiredError = new Error('Error.StateExpired')
