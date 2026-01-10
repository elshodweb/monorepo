import { Module } from "@nestjs/common";
import { SetupModule } from "./setup/setup.module";
import { TabletsModule } from "./tablets/tablets.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ConfigModule } from "./config/config.module";  // ✅ Измените на ваш

@Module({
  imports: [
    ConfigModule,      // ✅ Ваш ConfigModule (внутри уже есть NestJS ConfigModule)
    PrismaModule,
    SetupModule,
    TabletsModule,
  ],
})
export class AppModule {}