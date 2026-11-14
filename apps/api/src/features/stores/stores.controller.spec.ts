import { Response } from 'express';
import { StoresController } from './stores.controller';

/**
 * El logo se sirve como PNG para la imagen OG. Si el controller devuelve el
 * Buffer, Nest lo serializa a JSON ({type:'Buffer',data:[...]}) y el
 * navegador recibe un JSON con cabecera image/png: el motor del render no
 * puede leerlo y la imagen para compartir sale con el logo vacio.
 */
describe('StoresController.getStoreLogoPng', () => {
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  function buildController(pngMock: jest.Mock) {
    const storesService = { getStoreLogoPng: pngMock } as any;
    return new StoresController(storesService, {} as any, {} as any);
  }

  function buildResponse() {
    return {
      set: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as Response;
  }

  it('manda los bytes crutos del PNG', async () => {
    const controller = buildController(jest.fn().mockResolvedValue(png));
    const res = buildResponse();

    await controller.getStoreLogoPng('andtech', res);

    expect(res.set).toHaveBeenCalledWith({
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=3600',
    });
    expect(res.end).toHaveBeenCalledWith(png);
  });

  it('responde 404 cuando la tienda no tiene logo', async () => {
    const controller = buildController(jest.fn().mockResolvedValue(null));
    const res = buildResponse();

    await controller.getStoreLogoPng('andtech', res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.end).not.toHaveBeenCalled();
  });
});
