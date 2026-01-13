import { Module, Global } from "@nestjs/common";
import { ConfigService } from "./config.service";
import { ConfigModule as NestConfigModule } from "@nestjs/config"; 

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({  
      isGlobal: true,
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}