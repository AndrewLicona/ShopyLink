import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { JwtAuthGuard } from '../../core/auth/jwt-auth.guard';
import { RequestWithUser } from '../../core/auth/interfaces/user.interface';

@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  async findAll(@Query('storeId') storeId: string) {
    // El endpoint público siempre devuelve únicamente banners activos
    return this.bannersService.findAll(storeId, true);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin')
  findAllForAdmin(
    @Request() req: RequestWithUser,
    @Query('storeId') storeId: string,
  ) {
    const userId = req.user.sub;
    return this.bannersService.findAll(storeId, false, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  create(
    @Request() req: RequestWithUser,
    @Body() createBannerDto: CreateBannerDto,
  ) {
    const userId = req.user.sub;
    return this.bannersService.create(userId, createBannerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  update(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateBannerDto: UpdateBannerDto,
  ) {
    const userId = req.user.sub;
    return this.bannersService.update(id, userId, updateBannerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Request() req: RequestWithUser, @Param('id') id: string) {
    const userId = req.user.sub;
    return this.bannersService.remove(id, userId);
  }
}
