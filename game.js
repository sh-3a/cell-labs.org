const mainMenu = document.getElementById("mainMenu");
const cellTypeMenu = document.getElementById("cellTypeMenu");
const templateMenu = document.getElementById("templateMenu");
const editor = document.getElementById("editor");
const simulation = document.getElementById("simulation");
const menuBackground = document.getElementById("menuBackground");

const createCellButton = document.getElementById("createCellButton");
const cellTypeDisplay = document.getElementById("cellTypeDisplay");

const cellCanvas = document.getElementById("cellCanvas");
const cellCtx = cellCanvas.getContext("2d");

const simulationCanvas = document.getElementById("simulationCanvas");
const simCtx = simulationCanvas.getContext("2d");

const deathPopup = document.getElementById("deathPopup");
const deathReason = document.getElementById("deathReason");
const deathMenuButton = document.getElementById("deathMenuButton");

const energyDisplay = document.getElementById("energyDisplay");
const pauseButton = document.getElementById("pauseButton");
const resetButton = document.getElementById("resetButton");
const menuButton = document.getElementById("menuButton");


// ======================================================
// CELL
// ======================================================

let selectedCellType = null;

let cell = {
    x: 0,
    y: 0,
    radius: 45,
    energy: 100,
    speed: 2,
    directionX: 0,
    directionY: 0,
    rotation: 0,
    organelles: []
};


// ======================================================
// WORLD
// ======================================================

const WORLD_SIZE = 5000;

let food = [];

let simulationRunning = true;


// ======================================================
// CAMERA
// ======================================================

let camera = {
    x: 0,
    y: 0,
    smoothness: 0.08
};


// ======================================================
// EDITOR DRAGGING
// ======================================================

let draggingOrganelle = null;


// ======================================================
// SCREEN MANAGEMENT
// ======================================================

function showScreen(screen) {

    function showScreen(screen) {
    document.querySelectorAll(".screen").forEach(s => {
        s.classList.add("hidden");
    });

    screen.classList.remove("hidden");

    // Background is visible on menus, hidden in editor/simulation
    if (screen === editor || screen === simulation) {
        menuBackground.classList.add("hidden");
    } else {
        menuBackground.classList.remove("hidden");
    }
}
    mainMenu.classList.add("hidden");
    cellTypeMenu.classList.add("hidden");
    templateMenu.classList.add("hidden");
    editor.classList.add("hidden");
    simulation.classList.add("hidden");

    screen.classList.remove("hidden");

    
}


// ======================================================
// MAIN MENU
// ======================================================

createCellButton.addEventListener("click", () => {

    showScreen(templateMenu);

});


// ======================================================
// CELL TYPE
// ======================================================

document.querySelectorAll(".cellChoice").forEach(button => {

    button.addEventListener("click", () => {

        selectedCellType = button.dataset.type;

        cellTypeDisplay.textContent =
            "Type: " + selectedCellType;

        cell = createEmptyCell();

        document.querySelectorAll(".eukOnly").forEach(button => {

            if (selectedCellType === "prokaryotic") {

                button.disabled = true;

            } else {

                button.disabled = false;

            }

        });

        showScreen(editor);

        resizeEditorCanvas();

        drawEditor();

    });

});


// ======================================================
// CREATE EMPTY CELL
// ======================================================

function createEmptyCell() {

    return {

        x: 0,
        y: 0,

        radius: 45,

        energy: 100,

        speed: 2,

        directionX: 0,
        directionY: 0,

        rotation: 0,

        organelles: []

    };

}


// ======================================================
// ORGANELLE BUTTONS
// ======================================================

document.querySelectorAll(".organelleButton").forEach(button => {

    button.addEventListener("mousedown", event => {

        event.preventDefault();

        const type = button.dataset.organelle;

        if (type === "membrane") {
            return;
        }

        if (
            selectedCellType === "prokaryotic" &&
            (
                type === "nucleus" ||
                type === "mitochondria"
            )
        ) {

            return;

        }

        if (
            type === "nucleus" &&
            cell.organelles.some(o => o.type === "nucleus")
        ) {

            return;

        }

        draggingOrganelle = {

            type: type,

            mouseX: event.clientX,
            mouseY: event.clientY,

            x: 0,
            y: 0,

            fromButton: true

        };

        drawEditor();

    });

});


// ======================================================
// EDITOR CANVAS RESIZE
// ======================================================

function resizeEditorCanvas() {

    cellCanvas.width = cellCanvas.clientWidth;
    cellCanvas.height = cellCanvas.clientHeight;

}


// ======================================================
// GET MOUSE POSITION ON EDITOR
// ======================================================

function getEditorMousePosition(event) {

    const rect = cellCanvas.getBoundingClientRect();

    return {

        x:
            event.clientX -
            rect.left,

        y:
            event.clientY -
            rect.top

    };

}


// ======================================================
// CONVERT EDITOR PIXELS TO CELL COORDINATES
// ======================================================

function editorToCell(x, y) {

    const centerX = cellCanvas.width / 2;
    const centerY = cellCanvas.height / 2;

    return {

        x: (x - centerX) / 2,
        y: (y - centerY) / 2

    };

}


// ======================================================
// CONVERT CELL COORDINATES TO EDITOR PIXELS
// ======================================================

function cellToEditor(x, y) {

    return {

        x:
            cellCanvas.width / 2 +
            x * 2,

        y:
            cellCanvas.height / 2 +
            y * 2

    };

}


// ======================================================
// CHECK IF POSITION IS INSIDE CELL
// ======================================================

function positionInsideCell(x, y) {

    const distance = Math.sqrt(
        x * x +
        y * y
    );

    return distance <= cell.radius - 5;

}


// ======================================================
// FIND ORGANELLE UNDER MOUSE
// ======================================================

function findOrganelleAt(x, y) {

    for (let i = cell.organelles.length - 1; i >= 0; i--) {

        const organelle = cell.organelles[i];

        const position =
            cellToEditor(
                organelle.x,
                organelle.y
            );

        let size = 10;

        if (organelle.type === "nucleus") {
            size = 20;
        }

        if (organelle.type === "mitochondria") {
            size = 20;
        }

        if (organelle.type === "ribosome") {
            size = 8;
        }

        const dx = x - position.x;
        const dy = y - position.y;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        if (distance <= size) {
            return i;
        }

    }

    return -1;

}


// ======================================================
// EDITOR MOUSE DOWN
// ======================================================

cellCanvas.addEventListener("mousedown", event => {

    const mouse =
        getEditorMousePosition(event);

    const index =
        findOrganelleAt(
            mouse.x,
            mouse.y
        );

    if (index !== -1) {

        const organelle =
            cell.organelles[index];

        draggingOrganelle = {

            type: organelle.type,

            index: index,

            fromButton: false,

            offsetX:
                mouse.x -
                cellToEditor(
                    organelle.x,
                    organelle.y
                ).x,

            offsetY:
                mouse.y -
                cellToEditor(
                    organelle.x,
                    organelle.y
                ).y

        };

        return;

    }

});


// ======================================================
// EDITOR MOUSE MOVE
// ======================================================

cellCanvas.addEventListener("mousemove", event => {

    if (!draggingOrganelle) {
        return;
    }

    const mouse =
        getEditorMousePosition(event);

    if (draggingOrganelle.fromButton) {

        const position =
            editorToCell(
                mouse.x,
                mouse.y
            );

        draggingOrganelle.x =
            position.x;

        draggingOrganelle.y =
            position.y;

    } else {

        const position =
            editorToCell(
                mouse.x -
                draggingOrganelle.offsetX,

                mouse.y -
                draggingOrganelle.offsetY
            );

        draggingOrganelle.x =
            position.x;

        draggingOrganelle.y =
            position.y;

    }

    drawEditor();

});


// ======================================================
// EDITOR MOUSE UP
// ======================================================

window.addEventListener("mouseup", event => {

    if (!draggingOrganelle) {
        return;
    }

    const rect =
        cellCanvas.getBoundingClientRect();

    const mouse = {

        x:
            event.clientX -
            rect.left,

        y:
            event.clientY -
            rect.top

    };

    const position =
        editorToCell(
            mouse.x,
            mouse.y
        );

    let x = position.x;
    let y = position.y;

    if (!draggingOrganelle.fromButton) {

        x = draggingOrganelle.x;
        y = draggingOrganelle.y;

    }

    const inside =
        positionInsideCell(
            x,
            y
        );

    if (!inside) {

        draggingOrganelle = null;

        drawEditor();

        return;

    }

    if (draggingOrganelle.fromButton) {

        const type =
            draggingOrganelle.type;

        if (
            type === "nucleus" &&
            cell.organelles.some(
                o => o.type === "nucleus"
            )
        ) {

            draggingOrganelle = null;

            drawEditor();

            return;

        }

        if (
            selectedCellType === "prokaryotic" &&
            (
                type === "nucleus" ||
                type === "mitochondria"
            )
        ) {

            draggingOrganelle = null;

            drawEditor();

            return;

        }

        cell.organelles.push({

            type: type,

            x: x,
            y: y

        });

    } else {

        const organelle =
            cell.organelles[
                draggingOrganelle.index
            ];

        if (organelle) {

            organelle.x =
                draggingOrganelle.x;

            organelle.y =
                draggingOrganelle.y;

        }

    }

    draggingOrganelle = null;

    drawEditor();

});


// ======================================================
// DRAW ORGANELLE
// ======================================================

function drawOrganelle(
    ctx,
    type,
    x,
    y,
    scale = 1,
    preview = false
) {

    ctx.save();

    ctx.globalAlpha =
        preview ? 0.55 : 1;


    // ==================================================
    // NUCLEUS
    // ==================================================

    if (type === "nucleus") {

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            18 * scale,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "#777";

        ctx.fill();

        ctx.strokeStyle =
            "white";

        ctx.lineWidth =
            2 * scale;

        ctx.stroke();

        ctx.beginPath();

        ctx.arc(
            x + 4 * scale,
            y - 3 * scale,
            5 * scale,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "#555";

        ctx.fill();

    }


    // ==================================================
    // MITOCHONDRIA
    // ==================================================

    else if (type === "mitochondria") {

        ctx.beginPath();

        ctx.ellipse(
            x,
            y,
            18 * scale,
            9 * scale,
            -0.4,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "#777";

        ctx.fill();

        ctx.strokeStyle =
            "#aaa";

        ctx.lineWidth =
            1.5 * scale;

        ctx.stroke();

        ctx.beginPath();

        ctx.moveTo(
            x - 10 * scale,
            y
        );

        ctx.lineTo(
            x - 4 * scale,
            y - 3 * scale
        );

        ctx.lineTo(
            x + 2 * scale,
            y + 3 * scale
        );

        ctx.lineTo(
            x + 9 * scale,
            y - 2 * scale
        );

        ctx.strokeStyle =
            "#ddd";

        ctx.lineWidth =
            1 * scale;

        ctx.stroke();

    }


    // ==================================================
    // RIBOSOME
    // ==================================================

    else if (type === "ribosome") {

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            5 * scale,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "white";

        ctx.fill();

    }

    ctx.restore();

}


// ======================================================
// DRAW EDITOR
// ======================================================

function drawEditor() {

    cellCtx.clearRect(
        0,
        0,
        cellCanvas.width,
        cellCanvas.height
    );

    const x =
        cellCanvas.width / 2;

    const y =
        cellCanvas.height / 2;

    const radius =
        cell.radius * 2;


    // CYTOPLASM

    cellCtx.beginPath();

    cellCtx.arc(
        x,
        y,
        radius,
        0,
        Math.PI * 2
    );

    cellCtx.fillStyle =
        "#252525";

    cellCtx.fill();


    // MEMBRANE

    cellCtx.beginPath();

    cellCtx.arc(
        x,
        y,
        radius,
        0,
        Math.PI * 2
    );

    cellCtx.strokeStyle =
        "white";

    cellCtx.lineWidth =
        5;

    cellCtx.stroke();


    // ORGANELLES

    for (const organelle of cell.organelles) {

        const position =
            cellToEditor(
                organelle.x,
                organelle.y
            );

        drawOrganelle(
            cellCtx,
            organelle.type,
            position.x,
            position.y,
            1
        );

    }


    // DRAGGED PREVIEW

    if (draggingOrganelle) {

        const position =
            cellToEditor(
                draggingOrganelle.x,
                draggingOrganelle.y
            );

        drawOrganelle(
            cellCtx,
            draggingOrganelle.type,
            position.x,
            position.y,
            1,
            true
        );

    }

}


// ======================================================
// START SIMULATION
// ======================================================

document.getElementById("startSimulation")
    .addEventListener("click", () => {

        showScreen(simulation);

        resizeSimulationCanvas();

        createFood();

        cell.x = 0;
        cell.y = 0;

        camera.x = 0;
        camera.y = 0;

        simulationRunning = true;

        pauseButton.textContent =
            "⏸ Pause";

        requestAnimationFrame(
            simulationLoop
        );

    });


// ======================================================
// SIMULATION CANVAS
// ======================================================

function resizeSimulationCanvas() {

    simulationCanvas.width =
        window.innerWidth;

    simulationCanvas.height =
        window.innerHeight - 70;

}

window.addEventListener("resize", () => {

    if (
        !simulation.classList.contains("hidden")
    ) {

        resizeSimulationCanvas();

    }

});


// ======================================================
// FOOD
// ======================================================

function createFood() {

    food = [];

    for (let i = 0; i < 200; i++) {

        food.push({

            x:
                (Math.random() - 0.5) *
                WORLD_SIZE,

            y:
                (Math.random() - 0.5) *
                WORLD_SIZE,

            radius:
                3 +
                Math.random() * 3,

            driftX:
                (Math.random() - 0.5) *
                0.3,

            driftY:
                (Math.random() - 0.5) *
                0.3

        });

    }

}


// ======================================================
// FOOD MOVEMENT
// ======================================================

function updateFood() {

    for (const f of food) {

        f.driftX +=
            (Math.random() - 0.5) *
            0.02;

        f.driftY +=
            (Math.random() - 0.5) *
            0.02;

        f.driftX =
            Math.max(
                -0.5,
                Math.min(
                    0.5,
                    f.driftX
                )
            );

        f.driftY =
            Math.max(
                -0.5,
                Math.min(
                    0.5,
                    f.driftY
                )
            );

        f.x +=
            f.driftX;

        f.y +=
            f.driftY;

    }

}


// ======================================================
// CELL UPDATE
// ======================================================

function updateCell() {

    // --------------------------------------------------
    // ENERGY
    // --------------------------------------------------

    let energyDrain =
        0.025;

    if (cell.energy <= 0) {

        cell.energy = 0;

        cellDied(
            "Your cell ran out of energy."
        );

        return;

    }

    const movementAmount =
        Math.abs(
            cell.directionX
        ) +
        Math.abs(
            cell.directionY
        );

    energyDrain +=
        movementAmount *
        0.002;


    // Mitochondria reduce energy drain.
    // They can never make the drain negative.

    const mitochondriaCount =
        cell.organelles.filter(
            o =>
                o.type ===
                "mitochondria"
        ).length;

    energyDrain -=
        mitochondriaCount *
        0.006;

    energyDrain =
        Math.max(
            0.003,
            energyDrain
        );

    cell.energy -=
        energyDrain;


    // IMPORTANT:
    // A cell can still die even if it has mitochondria.

    if (cell.energy <= 0) {

        cell.energy = 0;

        cellDied(
            "Your cell ran out of energy."
        );

        return;

    }


    // --------------------------------------------------
    // SMOOTH MOVEMENT
    // --------------------------------------------------

    const smoothSpeed = 1.01;

    cell.x +=
        (cell.directionX * cell.speed) *
        smoothSpeed;

    cell.y +=
        (cell.directionY * cell.speed) *
        smoothSpeed;
    
    // --------------------------------------------------
    // NATURAL CELL WOBBLE
    // --------------------------------------------------

    cell.rotation +=
        (Math.random() - 0.5) *
        0.02;


    // --------------------------------------------------
    // FOOD
    // --------------------------------------------------

    for (
        let i = food.length - 1;
        i >= 0;
        i--
    ) {

        const f =
            food[i];

        const dx =
            cell.x -
            f.x;

        const dy =
            cell.y -
            f.y;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        if (
            distance <
            cell.radius +
            f.radius
        ) {

            cell.energy +=
                8;

            food.splice(
                i,
                1
            );

        }

    }


    // --------------------------------------------------
    // ENERGY LIMITS
    // --------------------------------------------------

    cell.energy =
        Math.max(
            0,
            Math.min(
                100,
                cell.energy
            )
        );

    energyDisplay.textContent =
        Math.floor(
            cell.energy
        );


    // --------------------------------------------------
    // WORLD BOUNDARIES
    // --------------------------------------------------

    cell.x =
        Math.max(
            -WORLD_SIZE / 2,
            Math.min(
                WORLD_SIZE / 2,
                cell.x
            )
        );

    cell.y =
        Math.max(
            -WORLD_SIZE / 2,
            Math.min(
                WORLD_SIZE / 2,
                cell.y
            )
        );

}


// ======================================================
// CAMERA FOLLOW
// ======================================================

function updateCamera() {

    camera.x +=
        (
            cell.x -
            camera.x
        ) *
        camera.smoothness;

    camera.y +=
        (
            cell.y -
            camera.y
        ) *
        camera.smoothness;

}


// ======================================================
// WORLD → SCREEN
// ======================================================

function worldToScreen(x, y) {

    return {

        x:
            x -
            camera.x +
            simulationCanvas.width / 2,

        y:
            y -
            camera.y +
            simulationCanvas.height / 2

    };

}


// ======================================================
// DRAW WORLD
// ======================================================

function drawWorldBackground() {

    simCtx.fillStyle =
        "#07100b";

    simCtx.fillRect(
        0,
        0,
        simulationCanvas.width,
        simulationCanvas.height
    );


    // Microscopic particles

    for (
        let x = -250;
        x < 250;
        x += 50
    ) {

        for (
            let y = -200;
            y < 200;
            y += 50
        ) {

            const position =
                worldToScreen(
                    x * 10,
                    y * 10
                );

            if (
                position.x > -20 &&
                position.x <
                    simulationCanvas.width + 20 &&
                position.y > -20 &&
                position.y <
                    simulationCanvas.height + 20
            ) {

                simCtx.beginPath();

                simCtx.arc(
                    position.x,
                    position.y,
                    1,
                    0,
                    Math.PI * 2
                );

                simCtx.fillStyle =
                    "rgba(255,255,255,0.12)";

                simCtx.fill();

            }

        }

    }

}


// ======================================================
// DRAW FOOD
// ======================================================

function drawFood() {

    for (const f of food) {

        const position =
            worldToScreen(
                f.x,
                f.y
            );

        if (
            position.x < -20 ||
            position.x >
                simulationCanvas.width + 20 ||
            position.y < -20 ||
            position.y >
                simulationCanvas.height + 20
        ) {

            continue;

        }

        simCtx.beginPath();

        simCtx.arc(
            position.x,
            position.y,
            f.radius,
            0,
            Math.PI * 2
        );

        simCtx.fillStyle =
            "rgba(170,220,170,0.8)";

        simCtx.fill();

    }

}


// ======================================================
// DRAW SIMULATION ORGANELLE
// ======================================================

function drawSimulationOrganelle(
    organelle
) {

    drawOrganelle(
        simCtx,
        organelle.type,
        organelle.x,
        organelle.y,
        1
    );

}


// ======================================================
// DRAW CELL
// ======================================================

function drawCell() {

    const position =
        worldToScreen(
            cell.x,
            cell.y
        );

    simCtx.save();

    simCtx.translate(
        position.x,
        position.y
    );

    simCtx.rotate(
        cell.rotation
    );


    // ==================================================
    // CYTOPLASM
    // ==================================================

    simCtx.beginPath();

    simCtx.arc(
        0,
        0,
        cell.radius,
        0,
        Math.PI * 2
    );

    simCtx.fillStyle =
        "rgba(100,150,120,0.25)";

    simCtx.fill();


    // ==================================================
    // MEMBRANE
    // ==================================================

    simCtx.beginPath();

    const points =
        40;

    for (
        let i = 0;
        i <= points;
        i++
    ) {

        const angle =
            (
                Math.PI * 2 /
                points
            ) *
            i;

        const wobble =
            Math.sin(
                angle * 5 +
                performance.now() *
                0.001
            ) * 2;

        const radius =
            cell.radius +
            wobble;

        const x =
            Math.cos(angle) *
            radius;

        const y =
            Math.sin(angle) *
            radius;

        if (i === 0) {

            simCtx.moveTo(
                x,
                y
            );

        } else {

            simCtx.lineTo(
                x,
                y
            );

        }

    }

    simCtx.closePath();

    simCtx.fillStyle =
        "rgba(80,140,110,0.25)";

    simCtx.fill();

    simCtx.strokeStyle =
        "rgba(220,255,230,0.9)";

    simCtx.lineWidth =
        3;

    simCtx.stroke();


    // ==================================================
    // USER-PLACED ORGANELLES
    // ==================================================

    for (
        const organelle
        of cell.organelles
    ) {

        drawSimulationOrganelle(
            organelle
        );

    }

    simCtx.restore();

}


// ======================================================
// DRAW SIMULATION
// ======================================================

function drawSimulation() {

    drawWorldBackground();

    drawFood();

    drawAICells();

    drawCell();

}


// ======================================================
// KEYBOARD
// ======================================================

window.addEventListener(
    "keydown",
    event => {

        if (
            simulation.classList.contains(
                "hidden"
            )
        ) {

            return;

        }

        let x = 0;
        let y = 0;

        if (
            event.key === "ArrowUp" ||
            event.key.toLowerCase() === "w"
        ) {

            y -= 1;

        }

        if (
            event.key === "ArrowDown" ||
            event.key.toLowerCase() === "s"
        ) {

            y += 1;

        }

        if (
            event.key === "ArrowLeft" ||
            event.key.toLowerCase() === "a"
        ) {

            x -= 1;

        }

        if (
            event.key === "ArrowRight" ||
            event.key.toLowerCase() === "d"
        ) {

            x += 1;

        }

        const length =
            Math.sqrt(
                x * x +
                y * y
            );

        if (length > 0) {

            cell.directionX =
                x / length;

            cell.directionY =
                y / length;

        }

    }
);


// ======================================================
// STOP MOVING WHEN KEY IS RELEASED
// ======================================================

window.addEventListener(
    "keyup",
    event => {

        if (
            event.key === "ArrowUp" ||
            event.key === "ArrowDown" ||
            event.key === "ArrowLeft" ||
            event.key === "ArrowRight" ||
            ["w", "a", "s", "d"]
                .includes(
                    event.key.toLowerCase()
                )
        ) {

            cell.directionX = 0;

            cell.directionY = 0;

        }

    }
);


// ======================================================
// SIMULATION LOOP
// ======================================================

function simulationLoop() {

    if (!simulationRunning) {
        return;
    }

    updateFood();

    updateAICells();

    updateCell();

    updateCamera();

    drawSimulation();

    requestAnimationFrame(
        simulationLoop
    );

}


// ======================================================
// PAUSE
// ======================================================

pauseButton.addEventListener(
    "click",
    () => {

        simulationRunning =
            !simulationRunning;

        if (simulationRunning) {

            pauseButton.textContent =
                "⏸ Pause";

            requestAnimationFrame(
                simulationLoop
            );

        } else {

            pauseButton.textContent =
                "▶ Resume";

        }

    }
);


// ======================================================
// RESET
// ======================================================

resetButton.addEventListener(
    "click",
    () => {

        cell.x = 0;

        cell.y = 0;

        cell.directionX = 0;

        cell.directionY = 0;

        cell.energy = 100;

        camera.x = 0;

        camera.y = 0;

        createFood();

        if (!simulationRunning) {

            simulationRunning =
                true;

            pauseButton.textContent =
                "⏸ Pause";

            requestAnimationFrame(
                simulationLoop
            );

        }

    }
);


// ======================================================
// BACK TO MENU
// ======================================================

menuButton.addEventListener(
    "click",
    () => {

        simulationRunning =
            false;

        showScreen(
            mainMenu
        );

    }
);


// ======================================================
// TEMPLATES
// ======================================================

document
    .querySelectorAll(".templateChoice")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const template =
                    button.dataset.template;


                // ==========================================
                // BLANK CELL
                // ==========================================

                if (
                    template === "blank"
                ) {

                    showScreen(
                        cellTypeMenu
                    );

                    return;

                }


                // ==========================================
                // BASIC PROKARYOTE
                // ==========================================

                if (
                    template === "prokaryote"
                ) {

                    selectedCellType =
                        "prokaryotic";

                    cell = {

                        x: 0,
                        y: 0,

                        radius: 45,

                        energy: 100,

                        speed: 2,

                        directionX: 0,
                        directionY: 0,

                        rotation: 0,

                        organelles: [

                            {
                                type:
                                    "ribosome",

                                x: -20,

                                y: -10

                            },

                            {
                                type:
                                    "ribosome",

                                x: 20,

                                y: 10

                            },

                            {
                                type:
                                    "ribosome",

                                x: 0,

                                y: 25

                            }

                        ]

                    };

                    cellTypeDisplay.textContent =
                        "Type: Prokaryotic";

                    document
                        .querySelectorAll(".eukOnly")
                        .forEach(button => {

                            button.disabled =
                                true;

                        });

                    showScreen(
                        editor
                    );

                    resizeEditorCanvas();

                    drawEditor();

                    return;

                }


                // ==========================================
                // BASIC EUKARYOTE
                // ==========================================

                if (
                    template === "eukaryote"
                ) {

                    selectedCellType =
                        "eukaryotic";

                    cell = {

                        x: 0,
                        y: 0,

                        radius: 45,

                        energy: 100,

                        speed: 2,

                        directionX: 0,
                        directionY: 0,

                        rotation: 0,

                        organelles: [

                            {
                                type:
                                    "nucleus",

                                x: -5,

                                y: 0

                            },

                            {
                                type:
                                    "mitochondria",

                                x: -25,

                                y: -20

                            },

                            {
                                type:
                                    "mitochondria",

                                x: 22,

                                y: -18

                            },

                            {
                                type:
                                    "mitochondria",

                                x: 25,

                                y: 18

                            },

                            {
                                type:
                                    "mitochondria",

                                x: -20,

                                y: 20

                            },

                            {
                                type:
                                    "ribosome",

                                x: -28,

                                y: -5

                            },

                            {
                                type:
                                    "ribosome",

                                x: -15,

                                y: 25

                            },

                            {
                                type:
                                    "ribosome",

                                x: 12,

                                y: 25

                            },

                            {
                                type:
                                    "ribosome",

                                x: 29,

                                y: 5

                            },

                            {
                                type:
                                    "ribosome",

                                x: 12,

                                y: -28

                            },

                            {
                                type:
                                    "ribosome",

                                x: -25,

                                y: -23

                            }

                        ]

                    };

                    cellTypeDisplay.textContent =
                        "Type: Eukaryotic";

                    document
                        .querySelectorAll(".eukOnly")
                        .forEach(button => {

                            button.disabled =
                                false;

                        });

                    showScreen(
                        editor
                    );

                    resizeEditorCanvas();

                    drawEditor();

                    return;

                }

            }

        );

    });


// ======================================================
// SIMPLE AI CELLS
// ======================================================

let aiCells = [];

function createAICell(x, y) {

    return {

        x: x,

        y: y,

        radius: 30,

        speed: 1.2,

        energy: 100,

        angle:
            Math.random() *
            Math.PI *
            2

    };

}


function createAICells() {

    aiCells = [];

    for (
        let i = 0;
        i < 5;
        i++
    ) {

        aiCells.push(
            createAICell(

                Math.random() *
                    WORLD_SIZE -
                    WORLD_SIZE / 2,

                Math.random() *
                    WORLD_SIZE -
                    WORLD_SIZE / 2

            )
        );

    }

}


function updateAICells() {

    for (const ai of aiCells) {

        // Find closest food

        let closestFood =
            null;

        let closestDistance =
            Infinity;

        for (
            const foodItem
            of food
        ) {

            const dx =
                foodItem.x -
                ai.x;

            const dy =
                foodItem.y -
                ai.y;

            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );

            if (
                distance <
                closestDistance
            ) {

                closestDistance =
                    distance;

                closestFood =
                    foodItem;

            }

        }


        // Move toward food

        if (closestFood) {

            const dx =
                closestFood.x -
                ai.x;

            const dy =
                closestFood.y -
                ai.y;

            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );

            if (
                distance > 1
            ) {

                ai.x +=
                    (
                        dx /
                        distance
                    ) *
                    ai.speed;

                ai.y +=
                    (
                        dy /
                        distance
                    ) *
                    ai.speed;

            }

        } else {

            ai.x +=
                Math.cos(
                    ai.angle
                ) *
                ai.speed;

            ai.y +=
                Math.sin(
                    ai.angle
                ) *
                ai.speed;

            if (
                Math.random() <
                0.02
            ) {

                ai.angle +=
                    (
                        Math.random() -
                        0.5
                    );

            }

        }


        // Eat food

        for (
            let i =
                food.length - 1;
            i >= 0;
            i--
        ) {

            const foodItem =
                food[i];

            const dx =
                ai.x -
                foodItem.x;

            const dy =
                ai.y -
                foodItem.y;

            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );

            if (
                distance <
                ai.radius +
                foodItem.radius
            ) {

                food.splice(
                    i,
                    1
                );

                ai.energy +=
                    10;

                if (
                    ai.energy >
                    100
                ) {

                    ai.energy =
                        100;

                }

                break;

            }

        }


        // Slowly use energy

        ai.energy -=
            0.01;


        // Move faster when hungry

        if (
            ai.energy <
            30
        ) {

            ai.speed =
                2;

        } else {

            ai.speed =
                1.2;

        }


        // World boundaries

        ai.x =
            Math.max(
                -WORLD_SIZE / 2,
                Math.min(
                    WORLD_SIZE / 2,
                    ai.x
                )
            );

        ai.y =
            Math.max(
                -WORLD_SIZE / 2,
                Math.min(
                    WORLD_SIZE / 2,
                    ai.y
                )
            );

    }

}


function drawAICells() {

    for (
        const ai
        of aiCells
    ) {

        const position =
            worldToScreen(
                ai.x,
                ai.y
            );

        if (
            position.x < -50 ||
            position.x >
                simulationCanvas.width +
                50 ||
            position.y < -50 ||
            position.y >
                simulationCanvas.height +
                50
        ) {

            continue;

        }


        // AI cell body

        simCtx.beginPath();

        simCtx.arc(
            position.x,
            position.y,
            ai.radius,
            0,
            Math.PI * 2
        );

        simCtx.fillStyle =
            "#ff9f43";

        simCtx.fill();


        // AI membrane

        simCtx.beginPath();

        simCtx.arc(
            position.x,
            position.y,
            ai.radius,
            0,
            Math.PI * 2
        );

        simCtx.strokeStyle =
            "#ffd08a";

        simCtx.lineWidth =
            2;

        simCtx.stroke();


        // AI nucleus

        simCtx.beginPath();

        simCtx.arc(
            position.x - 6,
            position.y - 4,
            ai.radius * 0.25,
            0,
            Math.PI * 2
        );

        simCtx.fillStyle =
            "#a85b24";

        simCtx.fill();

    }

}


createAICells();


// ======================================================
// CELL DEATH
// ======================================================

function cellDied(reason) {

    simulationRunning =
        false;

    deathReason.textContent =
        reason;

    showScreen(
        mainMenu
    );

    deathPopup.classList.remove(
        "hidden"
    );

}


deathMenuButton.addEventListener(
    "click",
    () => {

        deathPopup.classList.add(
            "hidden"
        );

        showScreen(
            mainMenu
        );

    }
);