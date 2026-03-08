import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalValidationPipes } from './common/pipes/global-validation.pips';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new GlobalValidationPipes());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error(
    'nest application failed during bootstrap',
    error instanceof Error ? error.message : 'Error',
  );
});
