import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateBannerDto } from './create-banner.dto';

/**
 * Actualización de un banner.
 *
 * `storeId` se excluye a propósito: la tienda de un banner no se cambia con
 * un PATCH. Sin esa exclusión el dueño de una tienda podía mover sus
 * banners al `storeId` de otra tienda (incluso de otro usuario) y el cambio
 * se guardaba sin verificar propiedad del destino.
 *
 * Al ser una clase real, el ValidationPipe del controlador valida y aplica
 * `whitelist`: `focalPoint` solo admite los valores declarados y los campos
 * desconocidos se descartan.
 */
export class UpdateBannerDto extends PartialType(
  OmitType(CreateBannerDto, ['storeId'] as const),
) {}
