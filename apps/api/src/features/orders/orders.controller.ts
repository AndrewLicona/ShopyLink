import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../../core/auth/jwt-auth.guard';
import { RequestWithUser } from '../../core/auth/interfaces/user.interface';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Public endpoint for customers to place orders
  @Post()
  create(@Body() createOrderDto: CreateOrderDto): Promise<any> {
    return this.ordersService.create(createOrderDto);
  }

  // Private endpoints for store owners
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Request() req: RequestWithUser,
    @Query('storeId') storeId: string,
  ): Promise<any[]> {
    const userId = req.user.sub;
    return this.ordersService.findAllByStore(storeId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<any> {
    const userId = req.user.sub;
    return this.ordersService.findOne(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  updateStatus(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<any> {
    const userId = req.user.sub;
    return this.ordersService.updateStatus(id, userId, updateOrderStatusDto);
  }
}
