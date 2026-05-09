import { createZodDto } from 'nestjs-zod'
import { SendOTPBodySchema, SendOTPResSchema } from 'src/routes/otp/otp.model'

export class SendOTPBodyDTO extends createZodDto(SendOTPBodySchema) {}
export class SendOTPResDTO extends createZodDto(SendOTPResSchema) {}
