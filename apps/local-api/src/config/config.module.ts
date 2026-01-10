import { Module, Global } from "@nestjs/common";
import { ConfigService } from "./config.service";
import { ConfigModule as NestConfigModule } from "@nestjs/config";  // ✅ Правильный импорт

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({  // ✅ Используйте NestConfigModule
      isGlobal: true,
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}