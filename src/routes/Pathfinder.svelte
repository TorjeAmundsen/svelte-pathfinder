<script lang="ts">
    import { pathfindDijkstra, recursiveDivisionMaze } from "./algorithms";
    import {
        createNewGrid,
        createWall,
        pickOrientation,
        type Coordinate,
        type TNode,
    } from "./util";

    const totalRows = 33;
    const totalCols = 33;

    let nodes: TNode[][] = $state([]);

    let nodeTransitionTime = "100ms";
    let animationTime = "1000ms";
    let searchedBg = "hsl(263, 52%, 30%)";

    let elements: HTMLElement[][] = Array.from(Array(totalRows), () => new Array(totalCols));

    let startNode: Coordinate = {
        col: 2,
        row: 2,
    };

    let endNode: Coordinate = {
        col: totalCols - 3,
        row: totalRows - 3,
    };

    function getNodeClass(row: number, col: number) {
        let classString = "node-base";
        if (nodes[row][col].success) classString += " node-success";
        else if (row === startNode.row && col === startNode.col) classString += " node-start";
        else if (row === endNode.row && col === endNode.col) classString += " node-end";
        else if (nodes[row][col].isWall) classString += " node-wall";
        return classString;
    }

    function resetNodes() {
        nodes = createNewGrid(totalRows, totalCols);
    }

    resetNodes();
</script>

<div>Pathfinder Test Array; Svelte Responsiveness</div>
<button class="search-button" onclick={() => pathfindDijkstra(nodes, startNode, endNode, 5)}>
    Find Path
</button>
<button
    class="maze-button"
    onclick={() => {
        resetNodes();
        recursiveDivisionMaze(
            0,
            0,
            totalCols,
            totalRows,
            pickOrientation(totalCols, totalRows),
            nodes,
            startNode,
            endNode,
            5,
        );
    }}
>
    Create Maze
</button>
<div
    class="grid-wrapper"
    style="--node-transition-time: {nodeTransitionTime}; --animation-time: {animationTime}; --searched-bg: {searchedBg};"
>
    {#each nodes as rowArray, row}
        {#each rowArray as node, col}
            <div
                id={`${row}-${col}`}
                bind:this={elements[row][col]}
                class={getNodeClass(row, col)}
                onclick={() => console.log(elements[row][col])}
            ></div>
        {/each}
    {/each}
</div>

<style>
    .search-button,
    .maze-button {
        padding: 5px;
        width: 6rem;
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
        text-align: center;
        background-color: hsl(218, 11%, 86%);
        width: 1fr;
        height: 1fr;
        outline: 1px solid rgb(156, 156, 156);
        transition: var(--node-transition-time);

        &:hover {
            box-shadow: inset 0 0 0.25vw 0.12vw hsla(0, 100%, 50%, 0.33);
            transition: 0ms;
        }

        &.node-start {
            background-color: hsl(130, 53%, 56%);
        }

        &.node-end {
            background-color: hsl(263, 53%, 56%);
        }

        &.searching {
            animation: searchAnimation var(--animation-time);
            animation-iteration-count: 1;
            background-color: var(--searched-bg);
            &:hover {
                box-shadow: none;
            }
        }

        &.node-wall {
            background-color: hsl(217, 15%, 17%);
            transition: 80ms;
        }
        &.node-found-path {
            background-color: hsl(59, 93%, 50%);
        }
    }

    @keyframes searchAnimation {
        0% {
            background-color: hsla(138, 100%, 50%, 0);
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
