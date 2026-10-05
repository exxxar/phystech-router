import type { Graph } from '@/types';

export const mockGraph: Graph = {
    nodes: [
        { id: 'n_entrance', type: 'entrance', objectId: 203, floorId: 1, x: 470, y: 500 },
        { id: 'n_info', type: 'corridor', objectId: 204, floorId: 1, x: 470, y: 450 },
        { id: 'n_stairs_w_1', type: 'stairs', objectId: 202, floorId: 1, x: 120, y: 300 },
        { id: 'n_stairs_c_1', type: 'stairs', objectId: 201, floorId: 1, x: 762, y: 978 },
        { id: 'n_stairs_w_4', type: 'stairs', objectId: 202, floorId: 4, x: 760, y: 353 },
        { id: 'n_stairs_c_4', type: 'stairs', objectId: 201, floorId: 4,  x: 762, y: 978 },
        { id: 'n_corridor_4', type: 'corridor', floorId: 4, x: 470, y: 180 },
        { id: 'n_400', type: 'room', objectId: 105, floorId: 4, x: 320, y: 180 },
        { id: 'n_401', type: 'room', objectId: 101, floorId: 4,  x: 526, y: 1145 },
        { id: 'n_405', type: 'room', objectId: 102, floorId: 4, x: 551, y: 1034  },
        { id: 'n_407', type: 'room', objectId: 103, floorId: 4,  x: 629, y: 883 },
        { id: 'n_410', type: 'room', objectId: 104, floorId: 4, x: 629, y: 645 },
        { id: 'n_412', type: 'room', objectId: 301, floorId: 4, x: 634, y: 609  },
    ],
    edges: [
        { id: 'e1', from: 'n_entrance', to: 'n_info', distance: 50, cost: 1, accessible: true },
        { id: 'e2', from: 'n_info', to: 'n_stairs_c_1', distance: 150, cost: 1, accessible: true },
        { id: 'e3', from: 'n_info', to: 'n_stairs_w_1', distance: 350, cost: 1, accessible: true },
        { id: 'e4', from: 'n_stairs_c_1', to: 'n_stairs_c_4', distance: 30, cost: 3, accessible: true },
        { id: 'e5', from: 'n_stairs_w_1', to: 'n_stairs_w_4', distance: 30, cost: 3, accessible: true },
        { id: 'e6', from: 'n_stairs_c_4', to: 'n_corridor_4', distance: 120, cost: 1, accessible: true },
        { id: 'e7', from: 'n_stairs_w_4', to: 'n_corridor_4', distance: 350, cost: 1, accessible: true },
        { id: 'e8', from: 'n_corridor_4', to: 'n_400', distance: 150, cost: 1, accessible: true },
        { id: 'e9', from: 'n_corridor_4', to: 'n_401', distance: 50, cost: 1, accessible: true },
        { id: 'e10', from: 'n_corridor_4', to: 'n_405', distance: 50, cost: 1, accessible: true },
        { id: 'e11', from: 'n_corridor_4', to: 'n_407', distance: 150, cost: 1, accessible: true },
        { id: 'e12', from: 'n_corridor_4', to: 'n_410', distance: 250, cost: 1, accessible: true },
        { id: 'e13', from: 'n_corridor_4', to: 'n_412', distance: 350, cost: 1, accessible: true },
    ],
};