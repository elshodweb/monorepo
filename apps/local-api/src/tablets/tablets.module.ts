import { Module } from '@nestjs/common';
import { TabletsService } from './tablets.service';
import { TabletsController } from './tablets.controller';

@Module({
  controllers: [TabletsController],
  providers: [TabletsService],
})
export class TabletsModule {}
