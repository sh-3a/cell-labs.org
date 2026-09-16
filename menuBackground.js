// ================================
// MENU ANIMATED BACKGROUND
// ================================

const menuBackground = document.getElementById("menuBackground");

if (menuBackground) {
    const menuCtx = menuBackground.getContext("2d");

    let menuCells = [];
    let menuFood = [];

    function resizeMenuBackground() {
        const dpr = window.devicePixelRatio || 1;

        menuBackground.width = window.innerWidth * dpr;
        menuBackground.height = window.innerHeight * dpr;

        menuBackground.style.width = window.innerWidth + "px";
        menuBackground.style.height = window.innerHeight + "px";

        menuCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    window.addEventListener("resize", resizeMenuBackground);
    resizeMenuBackground();

    function createMenuCell() {
        return {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            radius: 18 + Math.random() * 22,
            speed: 0.3 + Math.random() * 0.7,
            angle: Math.random() * Math.PI * 2
        };
    }

    function createMenuFood() {
        return {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            radius: 3 + Math.random() * 3
        };
    }

    for (let i = 0; i < 12; i++) {
        menuCells.push(createMenuCell());
    }

    for (let i = 0; i < 80; i++) {
        menuFood.push(createMenuFood());
    }

    function updateMenuBackground() {
        for (const cell of menuCells) {

            // Move cell
            cell.x += Math.cos(cell.angle) * cell.speed;
            cell.y += Math.sin(cell.angle) * cell.speed;

            // Randomly change direction
            if (Math.random() < 0.01) {
                cell.angle += (Math.random() - 0.5) * 1.5;
            }

            // Wrap around screen
            if (cell.x < -cell.radius) {
                cell.x = window.innerWidth + cell.radius;
            }

            if (cell.x > window.innerWidth + cell.radius) {
                cell.x = -cell.radius;
            }

            if (cell.y < -cell.radius) {
                cell.y = window.innerHeight + cell.radius;
            }

            if (cell.y > window.innerHeight + cell.radius) {
                cell.y = -cell.radius;
            }

            // Eat food
            for (let i = menuFood.length - 1; i >= 0; i--) {

                const food = menuFood[i];

                const dx = cell.x - food.x;
                const dy = cell.y - food.y;

                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < cell.radius + food.radius) {

                    menuFood.splice(i, 1);

                    // Spawn replacement food
                    menuFood.push(createMenuFood());

                    // Change direction slightly
                    cell.angle += (Math.random() - 0.5);

                    break;
                }
            }
        }
    }

    function drawMenuBackground() {

        menuCtx.clearRect(
            0,
            0,
            window.innerWidth,
            window.innerHeight
        );

        // Food
        for (const food of menuFood) {

            menuCtx.beginPath();

            menuCtx.arc(
                food.x,
                food.y,
                food.radius,
                0,
                Math.PI * 2
            );

            menuCtx.fillStyle = "#65d66b";
            menuCtx.fill();
        }

        // Cells
        for (const cell of menuCells) {

            // Cell body
            menuCtx.beginPath();

            menuCtx.arc(
                cell.x,
                cell.y,
                cell.radius,
                0,
                Math.PI * 2
            );

            menuCtx.fillStyle = "#4c8cff";
            menuCtx.fill();

            // Membrane
            menuCtx.beginPath();

            menuCtx.arc(
                cell.x,
                cell.y,
                cell.radius,
                0,
                Math.PI * 2
            );

            menuCtx.strokeStyle = "#8bb5ff";
            menuCtx.lineWidth = 2;
            menuCtx.stroke();

            // Nucleus
            menuCtx.beginPath();

            menuCtx.arc(
                cell.x - cell.radius * 0.2,
                cell.y - cell.radius * 0.1,
                cell.radius * 0.25,
                0,
                Math.PI * 2
            );

            menuCtx.fillStyle = "#263d8f";
            menuCtx.fill();
        }
    }

    function menuBackgroundLoop() {

        updateMenuBackground();
        drawMenuBackground();

        requestAnimationFrame(menuBackgroundLoop);
    }

    menuBackgroundLoop();
}