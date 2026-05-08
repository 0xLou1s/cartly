import type { JwtSignOptions } from '@nestjs/jwt'
import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'
import z from 'zod'

config({
  path: '.env',
})
if (!fs.existsSync(path.resolve('.env'))) {
  console.log('Cannot find .env file')
  process.exit(1)
}

const configSchema = z.object({
  DATABASE_URL: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRES_IN: z.string() as z.ZodType<JwtSignOptions['expiresIn']>,
  REFRESH_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_EXPIRES_IN: z.string() as z.ZodType<JwtSignOptions['expiresIn']>,
  SECRET_API_KEY: z.string(),
  // admin
  ADMIN_EMAIL: z.string(),
  ADMIN_PASSWORD: z.string(),
  ADMIN_NAME: z.string(),
  ADMIN_PHONE_NUMBER: z.string(),
})

const configServer = configSchema.safeParse(process.env)

if (!configServer.success) {
  console.log('Invalid configuration values')
  console.error(configServer.error)
  process.exit(1)
}

const envConfig: z.infer<typeof configSchema> = configServer.data

export default envConfig
