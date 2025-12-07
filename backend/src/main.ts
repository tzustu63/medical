import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局前綴
  app.setGlobalPrefix('api/v1');

  // 全局驗證管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Swagger 文件
  const config = new DocumentBuilder()
    .setTitle('全國偏鄉醫事人力需求平台 API')
    .setDescription('連接偏鄉醫療機構與願意支援的醫事人員')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('認證', '用戶認證相關操作')
    .addTag('醫事人員', '醫事人員個人檔案管理')
    .addTag('職缺管理', '醫院職缺發布與管理')
    .addTag('申請管理', '職缺申請與媒合')
    .addTag('系統參數', '系統選項與參數設定')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 API 伺服器運行於: http://localhost:${port}`);
  console.log(`📚 API 文件: http://localhost:${port}/api/docs`);
}

bootstrap();

