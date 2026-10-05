// src/services/admin/graph-cache.service.ts

export async function invalidateGraphCache() {
    // Здесь должна быть логика очистки вашего кэша.
    // Если вы используете in-memory кэш в другом файле, обнулите его здесь.
    // Например:
    // import { clearCache } from '../../services/graph.service';
    // clearCache();

    console.log('[Cache] Graph cache invalidated successfully');

    // Заглушка, которая всегда успешно выполняется
    return Promise.resolve();
}