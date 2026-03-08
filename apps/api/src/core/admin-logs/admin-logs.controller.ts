import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminLogsService } from './admin-logs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SuperAdminGuard } from '../auth/super-admin.guard';

@Controller('admin/logs')
export class AdminLogsController {
    constructor(private readonly adminLogsService: AdminLogsService) { }

    @Get()
    @UseGuards(JwtAuthGuard, SuperAdminGuard)
    async getLogs(@Query('limit') limit?: string) {
        return this.adminLogsService.getLogs(limit ? parseInt(limit) : 50);
    }
}
