<script lang="ts">
    import { pathfindDijkstra, recursiveDivisionMaze } from "./algorithms";
    import {
        delay,
        isNodeDrawable,
        isSlotTaken,
        pickOrientation,
        type Coordinate,
        type TNode,
    } from "./util";

    const totalRows = 33;
    const totalCols = 33;

    let nodes: TNode[][] = $state([]);

    let nodeTransitionTime = "100ms";
    let animationTime = $state("1500ms");
    let searchedBg = "hsla(194, 88%, 61%, 0.87)";

    // Used by mouse event handlers to choose the correct action
    let holdingStartNode = false;
    let holdingEndNode = false;
    let drawingWall = false;

    let searched = false;

    let startNode: Coordinate = $state({
        col: 2,
        row: 2,
    });

    let endNode: Coordinate = $state({
        col: totalCols - 3,
        row: totalRows - 3,
    });

    let mazeInProgress = $state(false);

    function getNodeClass(row: number, col: number) {
        let classString = "node-base";
        const currentNode = nodes[row][col];

        if (currentNode.success) classString += " node-found-path";

        if (row === startNode.row && col === startNode.col) classString += " node-start";
        else if (row === endNode.row && col === endNode.col) classString += " node-end";
        else if (currentNode.searching) classString += " node-searching";

        if (currentNode.isWall) classString += " node-wall";
        return classString;
    }

    function createNewGrid(totalRows: number, totalCols: number) {
        searched = false;
        const newNodes: TNode[][] = [];

        for (let row = 0; row < totalRows; row++) {
            const cols: TNode[] = [];

            for (let col = 0; col < totalCols; col++) {
                cols.push({
                    visited: false,
                    distance: Infinity,
                    isWall: false,
                    searching: false,
                    success: false,
                    failed: false,
                    isStart: false,
                    isEnd: false,
                });
            }

            newNodes.push(cols);
        }

        nodes = newNodes;
    }

    function clearSearch() {
        for (let row = 0; row < totalRows; row++) {
            for (let col = 0; col < totalCols; col++) {
                nodes[row][col].distance = Infinity;
                nodes[row][col].visited = false;
                nodes[row][col].failed = false;
                nodes[row][col].success = false;
            }
        }
    }

    function setStartNode(row: number, col: number) {
        nodes[startNode.row][startNode.col].isStart = false;
        startNode.row = row;
        startNode.col = col;
        nodes[row][col].isStart = true;
    }

    function setEndNode(row: number, col: number) {
        nodes[endNode.row][endNode.col].isStart = false;
        endNode.row = row;
        endNode.col = col;
        nodes[row][col].isStart = true;
    }

    function instantSearch() {
        clearSearch();
        pathfindDijkstra(nodes, startNode, endNode, 0);
    }

    function createWall(
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
        if (searched) {
            instantSearch();
        }
    }

    function clearWalls() {
        for (let i = 0; i < totalRows; i++) {
            for (let j = 0; j < totalCols; j++) {
                nodes[i][j].isWall = false;
            }
        }
    }

    function isAlgorithmInProgress() {
        return nodes[startNode.row][startNode.col].searching || mazeInProgress;
    }

    function handleMouseDown(row: number, col: number) {
        if (isAlgorithmInProgress()) {
            return;
        }

        drawingWall = false;
        holdingStartNode = false;
        holdingEndNode = false;

        if (isNodeDrawable(row, col, startNode, endNode)) {
            drawingWall = true;
            createWall(row, col, nodes, startNode, endNode);
        } else if (row === startNode.row && col === startNode.col) {
            holdingStartNode = true;
        } else if (row === endNode.row && col === endNode.col) {
            holdingEndNode = true;
        }
    }

    function handleMouseEnter(row: number, col: number) {
        if (
            isAlgorithmInProgress() ||
            nodes[row][col].isWall ||
            !isNodeDrawable(row, col, startNode, endNode)
        ) {
            return;
        }

        if (drawingWall) {
            createWall(row, col, nodes, startNode, endNode);
        } else if (holdingStartNode || holdingEndNode) {
            if (holdingStartNode) {
                setStartNode(row, col);
            } else if (holdingEndNode) {
                setEndNode(row, col);
            }
            // const nodeContainingStart = nodes[startNode.row][startNode.col];
        }

        if (searched && (drawingWall || holdingStartNode || holdingEndNode)) {
            clearSearch();
            pathfindDijkstra(nodes, startNode, endNode, 0);
        }
    }

    function handleMouseUp() {
        drawingWall = false;
        holdingStartNode = false;
        holdingEndNode = false;
    }

    createNewGrid(totalRows, totalCols);
</script>

<div>Pathfinder Test Array; Svelte Responsiveness</div>
<button
    disabled={isAlgorithmInProgress()}
    class="search-button"
    onclick={async () => {
        animationTime = "1500ms";
        await pathfindDijkstra(nodes, startNode, endNode, 8);
        animationTime = "0ms";
        searched = true;
    }}
>
    Search w/ Dijkstra's
</button>
<button
    disabled={isAlgorithmInProgress()}
    class="maze-button"
    onclick={async () => {
        mazeInProgress = true;
        clearSearch();
        clearWalls();
        animationTime = "0ms";
        await recursiveDivisionMaze(
            0,
            0,
            totalCols,
            totalRows,
            pickOrientation(totalCols, totalRows),
            nodes,
            startNode,
            endNode,
            10,
            searched,
            instantSearch,
        );
        mazeInProgress = false;
    }}
>
    Create Maze
</button>
<button
    class="clear-button"
    disabled={isAlgorithmInProgress()}
    onclick={() => createNewGrid(totalRows, totalCols)}>Clear Nodes</button
>
<div
    class="grid-wrapper"
    style="--node-transition-time: {nodeTransitionTime}; --animation-time: {animationTime}; --searched-bg: {searchedBg};"
>
    {#each nodes as rowArray, row}
        {#each rowArray as node, col}
            <div
                id={`${row}-${col}`}
                class={getNodeClass(row, col)}
                onmousedown={() => handleMouseDown(row, col)}
                onmouseenter={() => handleMouseEnter(row, col)}
                onmouseup={() => handleMouseUp()}
                role="none"
            ></div>
        {/each}
    {/each}
</div>

<style>
    .search-button,
    .maze-button,
    .clear-button {
        font-size: 1rem;
        padding: 6px;
        width: 11rem;
        margin-top: 4px;
        margin-bottom: 6px;
    }

    .grid-wrapper {
        --grid-rows: 33;
        --grid-cols: 33;
        display: grid;
        width: min(80vw, 80vh);
        grid-template-columns: repeat(var(--grid-cols), calc(min(80vw, 80vh) / var(--grid-cols)));
        grid-template-rows: repeat(var(--grid-rows), calc(min(80vw, 80vh) / var(--grid-cols)));
    }

    .node-base {
        user-select: none;
        text-align: center;
        background-color: hsl(218, 11%, 86%);
        width: 1fr;
        height: 1fr;
        outline: 1px solid rgb(156, 156, 156);
        transition: var(--node-transition-time);

        &:hover {
            box-shadow: inset 0 0 0.25vw 0.12vw hsla(232, 20%, 29%, 0.33);
            transition: 0ms;
        }

        &.node-searching {
            animation: searchAnimation var(--animation-time);
            animation-iteration-count: 1;
            background-color: var(--searched-bg);
        }

        &.node-wall {
            background-color: hsl(217, 15%, 17%);
            transition: 80ms;
        }

        &.node-start {
            &::before {
                font-size: 10px;
                font-weight: 800;
                color: rgb(255, 255, 255);
                content: "Start";
                text-shadow: 0 0 3px black;
            }
            background-color: hsl(0, 61%, 41%);
        }

        &.node-end {
            &::before {
                font-size: 10px;
                font-weight: 800;
                color: rgb(255, 255, 255);
                content: "End";
                text-shadow: 0 0 3px black;
            }
            background-color: hsl(263, 53%, 56%);
        }

        &.node-found-path {
            background-color: hsl(59, 93%, 50%);
        }
    }

    @keyframes searchAnimation {
        0% {
            background-color: hsl(108, 89%, 41%);
        }
        25% {
            background-color: hsla(147, 100%, 50%, 1);
        }
        50% {
            background-color: hsla(167, 100%, 50%, 1);
        }
        100% {
            background-color: hsla(194, 88%, 61%, 0.87);
        }
    }
</style>
