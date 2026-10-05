import type { Recommendation } from '@/types';

export const mockRecommendations: Recommendation[] = [
    { objectId: 102, reason: 'Вы интересовались искусственным интеллектом', score: 0.92 },
    { objectId: 301, reason: 'Популярно среди пользователей с вашими интересами', score: 0.85 },
    { objectId: 101, reason: 'Рядом с вашим текущим положением', score: 0.78 },
];