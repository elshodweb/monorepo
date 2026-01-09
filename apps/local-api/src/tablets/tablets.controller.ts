import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiSecurity } from '@nestjs/swagger';
import { TabletsService } from './tablets.service';
import { CreateTabletDto, ActivateTabletDto, CreateTabletResponseDto, ActivateTabletResponseDto } from '@monorepo/shared-types';
import { TabletSignatureGuard } from '../guards/tablet-signature.guard';

@ApiTags('tablets')
@Controller('tablets')
export class TabletsController {
  constructor(private readonly tabletsService: TabletsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tablet' })
  @ApiResponse({ status: 201, description: 'Tablet created successfully with activation code', type: CreateTabletResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(@Body() createTabletDto: CreateTabletDto) {
    return this.tabletsService.create(createTabletDto);
  }

  @Post('activate')
  @ApiOperation({ summary: 'Activate a tablet' })
  @ApiResponse({ status: 201, description: 'Tablet activated successfully', type: ActivateTabletResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid activation code or expired' })
  async activate(@Body() activateTabletDto: ActivateTabletDto) {
    return this.tabletsService.activate(activateTabletDto);
  }

  @Get()
  @UseGuards(TabletSignatureGuard)
  @ApiOperation({ summary: 'Get all tablets' })
  @ApiResponse({ status: 200, description: 'List of tablets' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid signature' })
  @ApiSecurity('tablet-signature')
  async findAll() {
    return this.tabletsService.findAll();
  }

  @Get(':id')
  @UseGuards(TabletSignatureGuard)
  @ApiOperation({ summary: 'Get tablet by ID' })
  @ApiParam({ name: 'id', description: 'Tablet ID' })
  @ApiResponse({ status: 200, description: 'Tablet details' })
  @ApiResponse({ status: 404, description: 'Tablet not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid signature' })
  @ApiSecurity('tablet-signature')
  async findOne(@Param('id') id: string) {
    return this.tabletsService.findOne(id);
  }
}
