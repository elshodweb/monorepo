import { Module } from '@nestjs/common';
import { SetupModule } from './setup/setup.module';
import { TabletsModule } from './tablets/tablets.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [PrismaModule, ConfigModule, SetupModule, TabletsModule],
})
export class AppModule {}
