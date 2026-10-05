import { apiClient } from './api';
import { mockRecommendations } from '@/mock';
import type { Recommendation } from '@/types';

export const recommendationService = {
    get: (context: any) =>
        apiClient.get<Recommendation[]>('/recommendations', async () => mockRecommendations),
};