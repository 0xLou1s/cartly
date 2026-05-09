import { createZodDto } from 'nestjs-zod'
import { SendOTPBodySchema } from 'src/routes/otp/otp.model'

export class SendOTPBodyDTO extends createZodDto(SendOTPBodySchema) {}
