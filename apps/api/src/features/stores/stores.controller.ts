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
  UsePipes,
  ValidationPipe,
  Req,
  Query,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { AdminLogsService } from '../../core/admin-logs/admin-logs.service';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { JwtAuthGuard } from '../../core/auth/jwt-auth.guard';
import { SuperAdminGuard } from '../../core/auth/super-admin.guard';
import { RequestWithUser } from '../../core/auth/interfaces/user.interface';

@Controller('stores')
export class StoresController {
  constructor(
    private readonly storesService: StoresService,
    private readonly configService: ConfigService,
    private readonly adminLogs: AdminLogsService,
  ) {}

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Get('admin/all')
  findAllAsAdmin(): Promise<any> {
    return this.storesService.findAllAsAdmin();
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Get('admin/metrics')
  getMetrics(): Promise<any> {
    return this.storesService.getMetrics();
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Get('admin/users')
  findAllUsersAsAdmin(): Promise<any> {
    return this.storesService.findAllUsersAsAdmin();
  }

  @Patch('admin/:id')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  async updateAsAdmin(
    @Param('id') id: string,
    @Body() updateStoreDto: any,
    @Req() req: any,
  ) {
    const adminId = req.user.sub;
    return this.storesService.updateAsAdmin(adminId, id, updateStoreDto);
  }

  @Post('admin/impersonate/:userId')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  async impersonate(@Param('userId') userId: string, @Req() req: any) {
    const adminId = req.user.sub;

    // Fetch target user to get their email
    const user = await this.storesService.findUserById(userId);

    if (!user) {
      throw new NotFoundException('Usuario a suplantar no encontrado');
    }

    const secret =
      this.configService.get<string>('JWT_SECRET') || 'fallback_secret';

    const payload = {
      sub: userId,
      email: user.email,
      impersonatorId: adminId,
      role: 'USER',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
    };

    console.log('[Impersonate] Generating token for payload:', payload);

    const impersonationToken = jwt.sign(payload, secret);

    // Record Audit Log
    await this.adminLogs.log(adminId, 'IMPERSONATE_USER', 'USER', userId, {
      timestamp: new Date().toISOString(),
    });

    return {
      message: 'Impersonation session created',
      token: impersonationToken,
      userId: userId,
    };
  }

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
  handleFavicon(): void {
    return; // Returns 200 by default, or we can use @HttpCode(204)
  }

  @Get('marketplace/public')
  findForMarketplace(@Query() query: any): Promise<any[]> {
    return this.storesService.findForMarketplace(query);
  }

  @Get('marketplace/categories')
  getActiveMarketplaceCategories(): Promise<string[]> {
    return this.storesService.getActiveMarketplaceCategories();
  }

  @Post(':id/view')
  incrementViewCount(@Param('id') id: string): Promise<any> {
    return this.storesService.incrementViewCount(id);
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
