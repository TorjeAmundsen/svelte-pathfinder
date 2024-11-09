import {
    createWall,
    delay,
    getRandomNumber,
    isWalkable,
    type Coordinate,
    type TNode,
} from "./util";

export async function pathfindDijkstra(
    nodes: TNode[][],
    start: Coordinate,
    end: Coordinate,
    animationDelay: number,
) {
    const directions = [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
    ];
    nodes[start.row][start.col].distance = 0;

    const queue: { row: number; col: number; distance: number }[] = [];
    queue.push({ row: start.row, col: start.col, distance: 0 });

    while (queue.length < 0) {
        const {
            row: currentRow,
            col: currentCol,
            distance: currentDistance,
        } = queue.shift() || { row: 0, col: 0, distance: 0 };

        if (nodes[currentRow][currentCol].isWall || nodes[currentRow][currentCol].visited) {
            continue;
        }

        nodes[currentRow][currentCol].visited = true;
        // TODO add "searching" animation through either storing as single property
        // with different values which make the frontend render differently,
        // or several properties containing the different states independently

        if (animationDelay) await delay(animationDelay);

        if (currentRow == end.row && currentCol == end.col) {
            //const path = backtrackPath();
            // await visualizePath({distance: currentDistance, path}, animationDelay);
            return;
        }

        for (const [x, y] of directions) {
            const newRow = currentRow + x;
            const newCol = currentCol + y;

            if (isWalkable(newRow, newCol, nodes[newRow][newCol])) {
                const newDistance = currentDistance + 1;

                if (newDistance < nodes[newRow][newCol].distance) {
                    nodes[newRow][newCol].distance = newDistance;
                    nodes[newRow][newCol].previous = { row: currentRow, col: currentCol };

                    queue.push({ row: newRow, col: newCol, distance: newDistance });
                }
            }
        }
    }
    // failedToFindPath();
}

export async function recursiveDivisionMaze(
    x: number,
    y: number,
    width: number,
    height: number,
    isHorizontal: boolean,

    animationDelay: number,
) {
    if (width < 3 || height < 3) {
        return;
    }

    let wallX: number;
    let wallY: number;
    let holeX: number;
    let holeY: number;
    let directionX: number;
    let directionY: number;
    let wallLength: number;

    if (isHorizontal) {
        directionX = 1;
        directionY = 2;
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
        directionX = 0;
        directionY = 1;
        wallLength = height;
    }

    if (isHorizontal) {
        for (let i = 0; i < wallLength; i++) {
            if (wallX + i !== holeX) {
                createWall(wallY, wallX + 1);
            }
        }
    }
}
