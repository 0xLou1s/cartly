import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { cleanupOpenApiDoc } from 'nestjs-zod'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const config = new DocumentBuilder()
    .setTitle('Cartly API')
    .setDescription('Cartly API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  const document = cleanupOpenApiDoc(SwaggerModule.createDocument(app, config))
  SwaggerModule.setup('api-docs', app, document)

  await app.listen(process.env.PORT ?? 4000)
}
bootstrap()
