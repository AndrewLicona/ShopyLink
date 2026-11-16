import { StoresService } from '../stores/stores.service';
import { BannersService } from './banners.service';

describe('Vigencia de banners', () => {
  const now = new Date('2026-11-16T12:00:00.000Z');
  beforeEach(() => jest.useFakeTimers().setSystemTime(now));
  afterEach(() => jest.useRealTimers());

  it('filtra la vigencia incluso cuando la página pública llega de caché', async () => {
    const page = {
      store: {}, products: [], categories: [],
      banners: [
        { id: 'always', startsAt: null, endsAt: null },
        { id: 'future', startsAt: '2026-11-17T00:00:00.000Z', endsAt: null },
        { id: 'expired', startsAt: null, endsAt: '2026-11-15T23:59:59.999Z' },
        { id: 'current', startsAt: '2026-11-15T00:00:00.000Z', endsAt: '2026-11-17T00:00:00.000Z' },
      ],
    };
    const cache = { getOrSetJson: jest.fn().mockResolvedValue(page) };
    const service = new StoresService({} as never, {} as never, {} as never, cache as never, {} as never);
    const result = await service.getPublicStorePage('test');
    expect(result?.banners.map(banner => banner.id)).toEqual(['always', 'current']);
    expect(page.banners).toHaveLength(4);
  });

  it('consulta correctamente banners con solo fecha de inicio o de fin', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const prisma = { withRetry: (fn: () => unknown) => fn(), storeBanner: { findMany } };
    const service = new BannersService(prisma as never, {} as never, {} as never);
    await service.findAll('store', true);
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        isActive: true,
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
        ],
      }),
    }));
  });
});
