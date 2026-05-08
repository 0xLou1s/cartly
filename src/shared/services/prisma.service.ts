import { Injectable } from '@nestjs/common'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import envConfig from '../env.config'

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaPg({
      connectionString: envConfig.DATABASE_URL,
    })
    super({ adapter, log: ['info'] })
  }

  async onModuleInit() {
    await this.$queryRaw`SELECT 1`
  }
}
