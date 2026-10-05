import type { Floor } from '@/types';

export const mockFloors: Floor[] = [
    {
        id: 1,
        number: 1,
        name: '1 этаж',
        planUrl: '/images/floors/floor-1.svg', // если есть
        width: 1000,
        height: 600,
        objectIds: [203, 204]
    },
    {
        id: 2,
        number: 2,
        name: '2 этаж',
        planUrl: '/images/floors/floor-2.svg',
        width: 1000,
        height: 600,
        objectIds: []
    },
    {
        id: 3,
        number: 3,
        name: '3 этаж',
        planUrl: '/images/floors/floor-3.svg', // <-- ваш PNG
        width: 1000,    // <-- замените на реальную ширину PNG
        height: 600,    // <-- замените на реальную высоту PNG
        objectIds: []
    },
    {
        id: 4,
        number: 4,
        name: '4 этаж — Кафедра',
        planUrl: '/images/floors/floor-4.svg', // <-- ваш PNG
        width: 814,    // <-- замените на реальную ширину PNG
        height: 1270,    // <-- замените на реальную высоту PNG
        objectIds: [101, 102, 103, 104, 105, 201, 202, 301]
    },
];