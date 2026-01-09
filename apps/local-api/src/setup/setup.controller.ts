import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SetupService } from './setup.service';
import { SetupLocalApiDto, SetupLocalApiResponseDto } from '@monorepo/shared-types';

@ApiTags('setup')
@Controller('setup')
export class SetupController {
  constructor(private readonly setupService: SetupService) {}

  @Post()
  @ApiOperation({ summary: 'Activate Local API with Cloud API' })
  @ApiResponse({ status: 201, description: 'Local API activated successfully', type: SetupLocalApiResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid activation secret or already activated' })
  async setup(@Body() setupDto: SetupLocalApiDto) {
    return this.setupService.setup(setupDto);
  }
}
