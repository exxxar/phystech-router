import { PrismaClient, ObjectType, NodeType, EdgeType, ModelStatus, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting seed...');

    // Очистка
    await prisma.$transaction([
        prisma.graphEdge.deleteMany(),
        prisma.graphNode.deleteMany(),
        prisma.spatialObject.deleteMany(),
        prisma.floor.deleteMany(),
        prisma.building.deleteMany(),
        prisma.user.deleteMany(),
    ]);

    // 1. Building
    const building = await prisma.building.create({
        data: {
            name: 'Главный учебный корпус',
            description: 'Основной корпус университета',
            address: 'ул. Академическая, 1'
        }
    });

    // 2. Floors (4 этажа, кафедра на 4-м)
    const floors = await Promise.all([
        prisma.floor.create({ data: { buildingId: building.id, number: 1, name: '1 этаж', width: 100, height: 50 } }),
        prisma.floor.create({ data: { buildingId: building.id, number: 2, name: '2 этаж', width: 100, height: 50 } }),
        prisma.floor.create({ data: { buildingId: building.id, number: 3, name: '3 этаж', width: 100, height: 50 } }),
        prisma.floor.create({ data: { buildingId: building.id, number: 4, name: '4 этаж (Кафедра КТ)', width: 100, height: 50 } }),
    ]);

    // 3. Spatial Objects (Пример: аудитории, лестницы, кафедра)
    const objects = await Promise.all([
        // 1 этаж
        prisma.spatialObject.create({ data: { floorId: floors[0].id, name: 'Аудитория 101', type: ObjectType.classroom, roomNumber: '101', x: 10, y: 10, isAvailable: true, status: ModelStatus.published } }),
        prisma.spatialObject.create({ data: { floorId: floors[0].id, name: 'Лестница 1-2', type: ObjectType.stairs, roomNumber: 'S1', x: 50, y: 25, isAvailable: true, status: ModelStatus.published } }),
        // 4 этаж (Кафедра)
        prisma.spatialObject.create({ data: { floorId: floors[3].id, name: 'Кафедра компьютерных технологий', type: ObjectType.department, roomNumber: '401', x: 20, y: 20, isAvailable: true, status: ModelStatus.published } }),
        prisma.spatialObject.create({ data: { floorId: floors[3].id, name: 'Лаборатория робототехники', type: ObjectType.laboratory, roomNumber: '402', x: 40, y: 20, isAvailable: true, status: ModelStatus.published } }),
        prisma.spatialObject.create({ data: { floorId: floors[3].id, name: 'Лестница 3-4', type: ObjectType.stairs, roomNumber: 'S4', x: 50, y: 25, isAvailable: true, status: ModelStatus.published } }),
    ]);

    // 4. Graph Nodes
    const nodes = await Promise.all([
        // 1 этаж
        prisma.graphNode.create({ data: { floorId: floors[0].id, objectId: objects[0].id, type: NodeType.room, x: 10, y: 10 } }), // Node 1
        prisma.graphNode.create({ data: { floorId: floors[0].id, objectId: objects[1].id, type: NodeType.stairs, x: 50, y: 25 } }), // Node 2 (Stairs 1-2)
        // 2 этаж (промежуточный)
        prisma.graphNode.create({ data: { floorId: floors[1].id, objectId: null, type: NodeType.intersection, x: 50, y: 25 } }), // Node 3
        // 3 этаж (промежуточный)
        prisma.graphNode.create({ data: { floorId: floors[2].id, objectId: null, type: NodeType.intersection, x: 50, y: 25 } }), // Node 4
        // 4 этаж
        prisma.graphNode.create({ data: { floorId: floors[3].id, objectId: objects[4].id, type: NodeType.stairs, x: 50, y: 25 } }), // Node 5 (Stairs 3-4)
        prisma.graphNode.create({ data: { floorId: floors[3].id, objectId: objects[2].id, type: NodeType.room, x: 20, y: 20 } }), // Node 6 (Кафедра)
        prisma.graphNode.create({ data: { floorId: floors[3].id, objectId: objects[3].id, type: NodeType.room, x: 40, y: 20 } }), // Node 7 (Лаборатория)
    ]);

    // 5. Graph Edges (Связи, включая вертикальные лестницы)
    const edges = await Promise.all([
        // 1 этаж: вход -> лестница
        prisma.graphEdge.create({ data: { fromNodeId: nodes[0].id, toNodeId: nodes[1].id, distance: 40, cost: 40, type: EdgeType.corridor, accessible: true, bidirectional: true } }),
        // Вертикаль: 1 этаж -> 2 этаж (Лестница)
        prisma.graphEdge.create({ data: { fromNodeId: nodes[1].id, toNodeId: nodes[2].id, distance: 15, cost: 15 + 10, type: EdgeType.stairs, accessible: true, bidirectional: true } }), // +10 penalty
        // Вертикаль: 2 этаж -> 3 этаж
        prisma.graphEdge.create({ data: { fromNodeId: nodes[2].id, toNodeId: nodes[3].id, distance: 15, cost: 15 + 10, type: EdgeType.stairs, accessible: true, bidirectional: true } }),
        // Вертикаль: 3 этаж -> 4 этаж (Лестница)
        prisma.graphEdge.create({ data: { fromNodeId: nodes[3].id, toNodeId: nodes[4].id, distance: 15, cost: 15 + 10, type: EdgeType.stairs, accessible: true, bidirectional: true } }),
        // 4 этаж: лестница -> кафедра
        prisma.graphEdge.create({ data: { fromNodeId: nodes[4].id, toNodeId: nodes[5].id, distance: 30, cost: 30, type: EdgeType.corridor, accessible: true, bidirectional: true } }),
        // 4 этаж: кафедра -> лаборатория
        prisma.graphEdge.create({ data: { fromNodeId: nodes[5].id, toNodeId: nodes[6].id, distance: 20, cost: 20, type: EdgeType.corridor, accessible: true, bidirectional: true } }),
    ]);

    // 6. Пользователь
    await prisma.user.create({
        data: {
            email: 'student@example.com',
            passwordHash: '$2b$10$dummyhashforseedpurposesonly', // В реальности использовать bcrypt.hash
            name: 'Иван Студентов',
            role: Role.student,
            profile: {
                create: {
                    faculty: 'Физико-технический',
                    course: 2,
                    interests: ['programming', 'robotics'],
                    preferences: { shortestRoute: true, avoidStairs: false }
                }
            }
        }
    });

    console.log('Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });