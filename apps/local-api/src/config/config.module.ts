import { Module, Global } from "@nestjs/common";
import { ConfigService } from "./config.service";
import Config from "@nestjs/config";
@Global()
@Module({
  imports: [
    Config.ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
