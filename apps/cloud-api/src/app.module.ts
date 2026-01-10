import { Module } from "@nestjs/common";
import { RestaurantsModule } from "./restaurants/restaurants.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    PrismaModule,
    RestaurantsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  exports: [],
})
export class AppModule {}
