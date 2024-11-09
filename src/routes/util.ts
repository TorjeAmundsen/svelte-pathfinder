export type Coordinate = {
    col: number;
    row: number;
};

export type TNode = {
    visited: boolean;
    distance: number;
    isWall: boolean;
    previous?: Coordinate;
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

export function isWalkable(row: number, col: number, node: TNode): boolean {
    return true;
}

export function createNewGrid(totalRows: number, totalCols: number) {
    const nodes: TNode[][] = [];

    for (let row = 0; row < totalRows; row++) {
        const cols: TNode[] = [];

        for (let col = 0; col < totalCols; col++) {
            cols.push({
                visited: false,
                distance: Infinity,
                isWall: false,
            });
        }

        nodes.push(cols);
    }

    return nodes;
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
