import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * Chequeo de vida del proceso. Responde 200 siempre: el detalle de la base
   * y de redis va en el cuerpo. Devolver 503 cuando una dependencia falla
   * hacia que Docker reinicie la API en cada corte momentaneo.
   */
  @Get('health')
  async getHealth(@Res({ passthrough: true }) res: Response) {
    const health = await this.appService.getHealth();
    res.status(HttpStatus.OK);
    return health;
  }
}
