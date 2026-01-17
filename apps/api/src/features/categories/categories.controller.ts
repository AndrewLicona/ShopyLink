import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtAuthGuard } from '../../core/auth/jwt-auth.guard';
import { RequestWithUser } from '../../core/auth/interfaces/user.interface';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Request() req: RequestWithUser,
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<any> {
    return this.categoriesService.create(req.user.sub, createCategoryDto);
  }

  @Get()
  findAll(@Query('storeId') storeId: string): Promise<any[]> {
    return this.categoriesService.findAllByStore(storeId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<any> {
    return this.categoriesService.remove(req.user.sub, id);
  }
}
