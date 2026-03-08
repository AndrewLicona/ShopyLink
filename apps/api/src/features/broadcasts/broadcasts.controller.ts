import { Controller, Get, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { BroadcastsService } from './broadcasts.service';
import { JwtAuthGuard } from '../../core/auth/jwt-auth.guard';
import { SuperAdminGuard } from '../../core/auth/super-admin.guard';

@Controller('broadcasts')
export class BroadcastsController {
    constructor(private readonly broadcastsService: BroadcastsService) { }

    @Get('active')
    async getActive() {
        return this.broadcastsService.getActive();
    }

    @Post()
    @UseGuards(JwtAuthGuard, SuperAdminGuard)
    async create(@Body() data: { title: string; content: string; type: string; expiresAt?: string }) {
        return this.broadcastsService.create({
            title: data.title,
            content: data.content,
            type: data.type,
            expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined
        });
    }

    @Patch(':id/deactivate')
    @UseGuards(JwtAuthGuard, SuperAdminGuard)
    async deactivate(@Param('id') id: string) {
        return this.broadcastsService.deactivate(id);
    }
}
