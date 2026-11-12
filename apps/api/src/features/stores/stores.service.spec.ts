import { StoresService } from './stores.service';
import sharp from 'sharp';

/**
 * El logo de la tienda se sirve en PNG porque el motor del render OG
 * (satori/resvg) no decodifica WebP: si la migracion de imagenes deja el
 * logo en WebP, la imagen para compartir sale vacia.
 */
describe('StoresService.getStoreLogoPng', () => {
    const logoUrl = 'https://example.supabase.co/storage/v1/object/public/shopy-images/logos/x.webp';

    let service: StoresService;
    let prismaMock: any;
    let cacheMock: any;

    beforeEach(() => {
        prismaMock = {
            withRetry: (fn: () => unknown) => fn(),
            store: { findUnique: jest.fn() },
        };
        cacheMock = { get: jest.fn(), set: jest.fn() };

        service = new StoresService(
            prismaMock,
            {} as any,
            {} as any,
            cacheMock,
            {} as any,
        );
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('convierte el logo a PNG y lo cachea', async () => {
        prismaMock.store.findUnique.mockResolvedValue({ logoUrl });
        cacheMock.get.mockResolvedValue(null);

        // Un WebP de verdad: si no se convierte, la respuesta no seria PNG.
        const webp = await sharp({
            create: { width: 40, height: 40, channels: 4, background: '#10b981' },
        })
            .webp()
            .toBuffer();

        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            arrayBuffer: async () => webp.buffer.slice(
                webp.byteOffset,
                webp.byteOffset + webp.byteLength,
            ),
        }) as any;

        const png = await service.getStoreLogoPng('andtech');

        expect(png).toBeInstanceOf(Buffer);
        // Firma del PNG: 89 50 4E 47
        expect(Array.from(png!.subarray(0, 4))).toEqual([0x89, 0x50, 0x4e, 0x47]);

        // Y se cachea en base64 para no convertirlo en cada pedido
        expect(cacheMock.set).toHaveBeenCalledWith(
            'storeLogoPng:andtech',
            expect.any(String),
            3600,
        );
    });

    it('devuelve la cache si ya esta', async () => {
        prismaMock.store.findUnique.mockResolvedValue({ logoUrl });
        const guardado = Buffer.from('png-falso').toString('base64');
        cacheMock.get.mockResolvedValue(guardado);

        const png = await service.getStoreLogoPng('andtech');

        expect(png!.toString()).toBe('png-falso');
        expect(prismaMock.store.findUnique).not.toHaveBeenCalled();
    });

    it('devuelve null si la tienda no tiene logo', async () => {
        prismaMock.store.findUnique.mockResolvedValue({ logoUrl: null });
        cacheMock.get.mockResolvedValue(null);

        expect(await service.getStoreLogoPng('andtech')).toBeNull();
    });

    it('devuelve null si la descarga falla', async () => {
        prismaMock.store.findUnique.mockResolvedValue({ logoUrl });
        cacheMock.get.mockResolvedValue(null);

        global.fetch = jest.fn().mockResolvedValue({ ok: false }) as any;

        expect(await service.getStoreLogoPng('andtech')).toBeNull();
    });
});
