import { z } from 'zod';

const envSchema = z.object({
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string(),
    JWT_SECRET: z.string(),
    JWT_ACCESS_EXPIRES: z.string().default('15m'),
    JWT_REFRESH_EXPIRES: z.string().default('7d'),
    CORS_ORIGIN: z.string(),
    ROUTE_STAIR_PENALTY: z.coerce.number().default(10),
    ROUTE_INACCESSIBLE_PENALTY: z.coerce.number().default(1000),
});

export const env = envSchema.parse(process.env);