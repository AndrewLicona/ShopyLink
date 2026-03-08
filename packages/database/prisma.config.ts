import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../../apps/api/.env') });

export default defineConfig({
    schema: 'prisma/schema.prisma',
    datasource: {
        url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
});
