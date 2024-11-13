export type Coordinate = {
    col: number;
    row: number;
};

export type TNode = {
    visited: boolean;
    distance: number;
    isWall: boolean;
    searching: boolean;
    previous?: Coordinate;
    success: boolean;
    failed: boolean;
};

export type Path = {
    distance: number;
    path: Coordinate[];
};

export type QueueItem = {
    row: number;
    col: number;
    distance: number;
};

export function delay(delayInMs: number) {
    return new Promise((resolve) => setTimeout(resolve, delayInMs));
}

export function getRandomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export function isWalkable(row: number, col: number, nodes: TNode[][]): boolean {
    if (row < 0 || row >= nodes.length || col < 0 || col >= nodes[0].length) return false;
    if (nodes[row][col].isWall) return false;
    return true;
}

export function isSlotTaken(row: number, col: number, startNode: Coordinate, endNode: Coordinate) {
    return (
        (row === startNode.row && col === startNode.col) ||
        (row === endNode.row && col === endNode.col)
    );
}

export function createWall(
    row: number,
    col: number,
    nodes: TNode[][],
    startNode: Coordinate,
    endNode: Coordinate,
) {
    if (isSlotTaken(row, col, startNode, endNode)) {
        return;
    }

    nodes[row][col].isWall = true;
}

export function pickOrientation(width: number, height: number): boolean {
    if (width < height) {
        return true;
    } else if (width > height) {
        return false;
    } else {
        return Math.floor(Math.random() * 2) === 0 ? true : false;
    }
}

export function backtrackPath(
    nodes: TNode[][],
    startNode: Coordinate,
    endNode: Coordinate,
): Coordinate[] {
    const path: Coordinate[] = [];
    let currentRow = endNode.row;
    let currentCol = endNode.col;

    while (currentRow !== startNode.row || currentCol !== startNode.col) {
        path.unshift({ row: currentRow, col: currentCol });
        const previous = nodes[currentRow][currentCol].previous;

        if (previous) {
            currentRow = previous.row;
            currentCol = previous.col;
        } else {
            return [];
        }
    }
    return path;
}

export function failedToFindPath(nodes: TNode[][]) {
    for (let i = 0; i < nodes.length; i++) {
        for (let j = 0; j < nodes[i].length; j++) {
            nodes[i][j].searching = false;
            nodes[i][j].failed = true;
        }
    }
}

export async function clearSearchProgress(nodes: TNode[][]) {
    for (let i = 0; i < nodes.length; i++) {
        for (let j = 0; j < nodes[i].length; j++) {
            nodes[i][j].distance = Infinity;
            nodes[i][j].visited = false;
            nodes[i][j].searching = false;
            nodes[i][j].success = false;
            nodes[i][j].failed = false;
        }
    }
}

export async function visualizePath(
    nodes: TNode[][],
    startNode: Coordinate,
    endNode: Coordinate,
    animationDelay: number,
) {
    const path = backtrackPath(nodes, startNode, endNode);

    animationDelay *= 4;

    nodes[startNode.row][startNode.col].searching = false;
    nodes[startNode.row][startNode.col].success = true;

    for (let i = 0; i < path.length; i++) {
        const e = path[i];
        if (animationDelay) await delay(animationDelay);
        nodes[e.row][e.col].searching = false;
        nodes[e.row][e.col].success = true;
    }

    if (animationDelay) await delay(animationDelay);
    nodes[endNode.row][endNode.col].searching = false;
    nodes[endNode.row][endNode.col].success = true;
}
