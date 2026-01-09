import { Module } from '@nestjs/common';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, RestaurantsModule],
})
export class AppModule {}
