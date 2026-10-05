export interface User {
    id: number | string;
    name: string;
    role: 'applicant' | 'student' | 'teacher' | 'staff' | 'guest';
    faculty?: string;
    course?: number;
    interests: string[];
    preferences: Record<string, any>;
}

export interface Context {
    currentFloor: number;
    currentObjectId: number | null;
    latitude: number | null;
    longitude: number | null;
    positionAvailable: boolean;
    currentTime: string;
    availableTime: number | null;
    networkStatus: 'online' | 'offline';
}

export interface DepartmentObject {
    id: number;
    name: string;
    type: 'classroom' | 'lab' | 'office' | 'department' | 'stairs' | 'entrance' | 'info' | 'corridor';
    floor: number;
    roomNumber?: string;
    description: string;
    category: string;
    tags: string[];
    image?: string;
    coordinates: { x: number; y: number };
    availability: { isAvailable: boolean; schedule?: string };
    equipment?: string[];
    researchTopic?: string;
    relatedIds?: number[];
}

export interface Floor {
    id: number;
    number: number;
    name: string;
    planUrl?: string;
    width: number;
    height: number;
    objectIds: number[];
}

export interface GraphNode {
    id: string;
    type: 'room' | 'corridor' | 'stairs' | 'entrance';
    objectId?: number;
    floorId: number;
    x: number;
    y: number;
}

export interface GraphEdge {
    id: string;
    from: string;
    to: string;
    distance: number;
    cost: number;
    accessible: boolean;
}

export interface Graph {
    nodes: GraphNode[];
    edges: GraphEdge[];
}

export interface RouteStep {
    order: number;
    instruction: string;
    distance: number;
    floor: number;
    direction: 'straight' | 'left' | 'right' | 'up' | 'down';
    nodeId: string;
}

export interface Route {
    id: string;
    from: string;
    to: string;
    distance: number;
    duration: number;
    floors: number[];
    steps: RouteStep[];
    nodes: string[];
    createdAt: string;
}

export interface Favorite {
    objectId: number;
    createdAt: string;
}

export interface HistoryEntry {
    id: string;
    objectId: number;
    action: 'view_object' | 'build_route' | 'start_navigation' | 'favorite';
    createdAt: string;
}

export interface Recommendation {
    objectId: number;
    reason: string;
    score: number;
}

export interface SearchFilters {
    query: string;
    floor?: number;
    category?: string;
    type?: string;
    accessible?: boolean;
}

export interface ApiError {
    message: string;
    code?: string;
}