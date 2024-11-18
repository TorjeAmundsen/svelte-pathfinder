import {
    clearSearchProgress,
    createWall,
    delay,
    failedToFindPath,
    getRandomNumber,
    isWalkable,
    pickOrientation,
    visualizePath,
    type Coordinate,
    type QueueItem,
    type TNode,
} from "./util";

export async function pathfindDijkstra(
    nodes: TNode[][],
    startNode: Coordinate,
    endNode: Coordinate,
    animationDelay: number,
) {
    if (animationDelay) await clearSearchProgress(nodes);
    const directions = [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
    ];
    nodes[startNode.row][startNode.col].distance = 0;

    const queue: QueueItem[] = [];

    queue.push({ row: startNode.row, col: startNode.col, distance: 0 });

    while (queue.length > 0) {
        const {
            row: currentRow,
            col: currentCol,
            distance: currentDistance,
        } = queue.shift() || { row: 0, col: 0, distance: 0 };

        if (nodes[currentRow][currentCol].isWall || nodes[currentRow][currentCol].visited) {
            continue;
        }

        nodes[currentRow][currentCol].visited = true;
        nodes[currentRow][currentCol].searching = true;

        if (animationDelay) await delay(animationDelay);

        if (currentRow === endNode.row && currentCol === endNode.col) {
            await visualizePath(nodes, startNode, endNode, animationDelay);
            return;
        }

        for (const [x, y] of directions) {
            const newRow = currentRow + x;
            const newCol = currentCol + y;

            if (isWalkable(newRow, newCol, nodes)) {
                const newDistance = currentDistance + 1;

                if (newDistance < nodes[newRow][newCol].distance) {
                    nodes[newRow][newCol].distance = newDistance;
                    nodes[newRow][newCol].previous = { row: currentRow, col: currentCol };
                    queue.push({ row: newRow, col: newCol, distance: newDistance });
                }
            }
        }
    }
    failedToFindPath(nodes);
}

function pathfindAstar(
    nodes: TNode[][],
    startNode: Coordinate,
    endNode: Coordinate,
    animationDelay: number,
    countFunction: (amount: number) => void,
) {}

// This function is gross and needs to be refactored.
// Split the boolean clauses into two separate functions instead
export async function recursiveDivisionMaze(
    x: number,
    y: number,
    width: number,
    height: number,
    isHorizontal: boolean,
    nodes: TNode[][],
    startNode: Coordinate,
    endNode: Coordinate,
    animationDelay: number,
    searched: boolean,
    runAlgo: () => void,
) {
    if (width < 3 || height < 3) {
        return;
    }

    let wallX, wallY, holeX, holeY, wallLength;
    if (isHorizontal) {
        wallX = x;
        wallY = y + getRandomNumber(1, Math.floor(height / 2)) * 2 - 1;
        holeX = wallX + getRandomNumber(0, Math.floor(width / 2)) * 2;
        holeY = -1;
        wallLength = width;
    } else {
        wallX = x + getRandomNumber(1, Math.floor(width / 2)) * 2 - 1;
        wallY = y;
        holeX = -1;
        holeY = wallY + getRandomNumber(0, Math.floor(height / 2)) * 2;
        wallLength = height;
    }

    if (isHorizontal) {
        for (let i = 0; i < wallLength; i++) {
            if (wallX + i !== holeX) {
                createWall(wallY, wallX + i, nodes, startNode, endNode);
                if (animationDelay) await delay(animationDelay);
            }
        }
    } else {
        for (let i = 0; i < wallLength; i++) {
            if (wallY + i !== holeY) {
                createWall(wallY + i, wallX, nodes, startNode, endNode);
                if (animationDelay) await delay(animationDelay);
            }
        }
    }
    if (searched) {
        runAlgo();
    }

    if (isHorizontal) {
        await recursiveDivisionMaze(
            x,
            y,
            width,
            Math.abs(wallY - y),
            pickOrientation(width, Math.abs(wallY - y)),
            nodes,
            startNode,
            endNode,
            animationDelay,
            searched,
            runAlgo,
        );
        await recursiveDivisionMaze(
            x,
            wallY + 1,
            width,
            height - (wallY - y) - 1,
            pickOrientation(width, height - (wallY - y) - 1),
            nodes,
            startNode,
            endNode,
            animationDelay,
            searched,
            runAlgo,
        );
    } else {
        await recursiveDivisionMaze(
            x,
            y,
            Math.abs(wallX - x),
            height,
            pickOrientation(Math.abs(wallX - x), height),
            nodes,
            startNode,
            endNode,
            animationDelay,
            searched,
            runAlgo,
        );
        await recursiveDivisionMaze(
            wallX + 1,
            y,
            width - (wallX - x) - 1,
            height,
            pickOrientation(width - (wallX - x) - 1, height),
            nodes,
            startNode,
            endNode,
            animationDelay,
            searched,
            runAlgo,
        );
    }
}

/* export async function recursiveDivisionMazeHorizontal(
    x: number,
    y: number,
    width: number,
    height: number,
    nodes: TNode[][],
    startNode: Coordinate,
    endNode: Coordinate,
    animationDelay: number,
) {
    if (width < 3 || height < 3) {
        return;
    }

    let wallX = x;
    let wallY = y + getRandomNumber(1, Math.floor(height / 2)) * 2 - 1;
    let holeX = wallX + getRandomNumber(0, Math.floor(width / 2)) * 2;
    let wallLength = width;

    for (let i = 0; i < wallLength; i++) {
        if (wallX + i !== holeX) {
            createWall(wallY, wallX + 1, nodes, startNode, endNode);
            if (animationDelay) await delay(animationDelay);
        }
    }

    await recursiveDivisionMaze(
        x,
        y,
        width,
        Math.abs(wallY - y),
        pickOrientation(width, Math.abs(wallY - y)),
        nodes,
        startNode,
        endNode,
        animationDelay,
    );
    await recursiveDivisionMaze(
        x,
        wallY + 1,
        width,
        height - (wallY - y) - 1,
        pickOrientation(width, height - (wallY - y) - 1),
        nodes,
        startNode,
        endNode,
        animationDelay,
    );
}

export async function recursiveDivisionMazeVertical(
    x: number,
    y: number,
    width: number,
    height: number,
    nodes: TNode[][],
    startNode: Coordinate,
    endNode: Coordinate,
    animationDelay: number,
) {
    if (width < 3 || height < 3) {
        return;
    }

    const wallX = x + getRandomNumber(1, Math.floor(width / 2)) * 2 - 1;
    const wallY = y;
    const holeY = wallY + getRandomNumber(0, Math.floor(height / 2)) * 2;
    const wallLength = height;

    for (let i = 0; i < wallLength; i++) {
        if (wallY + i !== holeY) {
            createWall(wallY + i, wallX, nodes, startNode, endNode);
            if (animationDelay) await delay(animationDelay);
        }
    }

    await recursiveDivisionMaze(
        x,
        y,
        Math.abs(wallX - x),
        height,
        pickOrientation(Math.abs(wallX - x), height),
        nodes,
        startNode,
        endNode,
        animationDelay,
    );
    await recursiveDivisionMaze(
        wallX + 1,
        y,
        width - (wallX - x) - 1,
        height,
        pickOrientation(width - (wallX - x) - 1, height),
        nodes,
        startNode,
        endNode,
        animationDelay,
    );
} */
