export const OtpMessage = {
  Error: {
    InvalidOTP: 'Error.InvalidOTP',
    OTPExpired: 'Error.OTPExpired',
    FailedToSendOTP: 'Error.FailedToSendOTP',
  },
  Success: {
    Sent: 'Auth.OTPSent',
  },
} as const
