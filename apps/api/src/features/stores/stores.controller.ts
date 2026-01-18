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
import { JwtAuthGuard } from '../../core/auth/jwt-auth.guard';
import { RequestWithUser } from '../../core/auth/interfaces/user.interface';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Request() req: RequestWithUser,
    @Body() createStoreDto: CreateStoreDto,
  ): Promise<any> {
    // req.user contains the decoded JWT. Supabase passes 'sub' as userId and 'email'
    const userId = req.user.sub;
    const email = req.user.email;
    return this.storesService.create(userId, email, createStoreDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req: RequestWithUser): Promise<any[]> {
    const userId = req.user.sub;
    return this.storesService.findAllByUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  async findOneByUser(@Param('userId') userId: string): Promise<any> {
    const store = await this.storesService.findOneByUser(userId);
    if (!store) return null;
    return store;
  }

  @Get('favicon.ico')
  async handleFavicon(): Promise<void> {
    return; // Returns 200 by default, or we can use @HttpCode(204)
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string): Promise<any> {
    const store = await this.storesService.findOneBySlug(slug);
    if (!store) throw new NotFoundException('Store not found');
    return store;
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateStoreDto: UpdateStoreDto,
  ): Promise<any> {
    const userId = req.user.sub;
    return this.storesService.update(id, userId, updateStoreDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<any> {
    const userId = req.user.sub;
    return this.storesService.remove(id, userId);
  }
}
