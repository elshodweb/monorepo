import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiSecurity } from '@nestjs/swagger';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto, ActivateRestaurantDto, CreateRestaurantResponseDto, ActivateRestaurantResponseDto } from '@monorepo/shared-types';
import { SignatureGuard } from '../guards/signature.guard';

@ApiTags('restaurants')
@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new restaurant' })
  @ApiResponse({ status: 201, description: 'Restaurant created successfully with activation secret', type: CreateRestaurantResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(@Body() createRestaurantDto: CreateRestaurantDto) {
    return this.restaurantsService.create(createRestaurantDto);
  }

  @Post('activate')
  @ApiOperation({ summary: 'Activate a Local API server' })
  @ApiResponse({ status: 201, description: 'Restaurant activated successfully', type: ActivateRestaurantResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid activation secret' })
  async activate(@Body() activateRestaurantDto: ActivateRestaurantDto) {
    return this.restaurantsService.activate(activateRestaurantDto);
  }

  @Get()
  // @UseGuards(SignatureGuard)
  @ApiOperation({ summary: 'Get all restaurants' })
  @ApiResponse({ status: 200, description: 'List of restaurants' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid signature' })
  @ApiSecurity('signature')
  async findAll() {
    return this.restaurantsService.findAll();
  }

  @Get(':id')
  // @UseGuards(SignatureGuard)
  @ApiOperation({ summary: 'Get restaurant by ID' })
  @ApiParam({ name: 'id', description: 'Restaurant ID' })
  @ApiResponse({ status: 200, description: 'Restaurant details' })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid signature' })
  @ApiSecurity('signature')
  async findOne(@Param('id') id: string) {
    return this.restaurantsService.findOne(id);
  }
}
