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
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { JwtAuthGuard } from '../../core/auth/jwt-auth.guard';
import { RequestWithUser } from '../../core/auth/interfaces/user.interface';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Request() req: RequestWithUser,
    @Body() createProductDto: CreateProductDto,
  ): Promise<any> {
    const userId = req.user.sub;
    return this.productsService.create(userId, createProductDto);
  }

  @Get()
  findAll(
    @Query('storeId') storeId: string,
    @Query('onlyActive') onlyActive?: string,
  ): Promise<any[]> {
    return this.productsService.findAllByStore(storeId, onlyActive === 'true');
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<any> {
    return this.productsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<any> {
    console.log('Update Payload:', JSON.stringify(updateProductDto, null, 2));
    const userId = req.user.sub;
    return this.productsService.update(id, userId, updateProductDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/inventory')
  updateStock(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ): Promise<any> {
    const userId = req.user.sub;
    return this.productsService.updateStock(
      id,
      userId,
      updateInventoryDto.stock,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<any> {
    const userId = req.user.sub;
    return this.productsService.remove(id, userId);
  }
}
