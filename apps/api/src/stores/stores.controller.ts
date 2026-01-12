import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req: any, @Body() createStoreDto: CreateStoreDto) {
    // req.user contains the decoded JWT. Supabase passes 'sub' as userId and 'email'
    const userId = req.user.sub as string;
    const email = req.user.email as string;
    return this.storesService.create(userId, email, createStoreDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req: any) {
    const userId = req.user.sub as string;
    return this.storesService.findAllByUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  async findOneByUser(@Param('userId') userId: string) {
    const store = await this.storesService.findOneByUser(userId);
    if (!store) return null;
    return store;
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const store = await this.storesService.findOneBySlug(slug);
    if (!store) throw new NotFoundException('Store not found');
    return store;
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateStoreDto: UpdateStoreDto,
  ) {
    const userId = req.user.sub as string;
    return this.storesService.update(id, userId, updateStoreDto);
  }
}
