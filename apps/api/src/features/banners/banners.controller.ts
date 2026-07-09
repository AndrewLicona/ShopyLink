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
import { JwtAuthGuard } from '../../core/auth/jwt-auth.guard';
import { RequestWithUser } from '../../core/auth/interfaces/user.interface';

@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  async findAll(
    @Query('storeId') storeId: string,
    @Query('onlyActive') onlyActive?: string,
    @Request() req?: any,
  ) {
    const showOnlyActive = onlyActive === 'true';

    // Si es público o pide solo activos
    if (showOnlyActive) {
      return this.bannersService.findAll(storeId, true);
    }

    // Si pide todos, requiere estar logueado y ser dueño de la tienda
    // Nota: Para permitir solicitudes con o sin guard de forma flexible,
    // podemos usar un endpoint protegido aparte, o evaluar el token si JwtAuthGuard se aplica.
    // Para alinearnos al patrón de productos, usaremos un endpoint protegido por separado
    // o simplemente requerimos JwtAuthGuard si no es public.
  }

  // Crearemos una ruta específica para el dueño para simplificar las políticas de NestJS
  @UseGuards(JwtAuthGuard)
  @Get('admin')
  findAllForAdmin(
    @Request() req: RequestWithUser,
    @Query('storeId') storeId: string,
  ) {
    const userId = req.user.sub;
    return this.bannersService.findAll(storeId, false);
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
    @Body() updateBannerDto: Partial<CreateBannerDto>,
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
