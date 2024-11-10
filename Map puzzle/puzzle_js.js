let map = L.map('map_box').setView([53.432826892328116, 14.548091452802913], 19);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let tiles = [];
let correct_tiles_counter = 0;
let draggingTile = null;
let offsetX, offsetY;

document.getElementById("download_icon").addEventListener("click", function() {
    leafletImage(map, function (err, canvas) {
        if (!err) {
            let raster_map = document.getElementById("raster_map");
            raster_map.width = canvas.width;
            raster_map.height = canvas.height;
            let raster_context = raster_map.getContext("2d");
            raster_context.drawImage(canvas, 0, 0);

            let map_puzzle = document.getElementById("map_puzzle");
            let map_solve = document.getElementById("map_solve");
            map_puzzle.width = canvas.width;
            map_puzzle.height = canvas.height;
            map_solve.width = canvas.width;
            map_solve.height = canvas.height;
            let map_puzzle_context = map_puzzle.getContext("2d");
            let map_solve_context = map_solve.getContext("2d");

            map_puzzle_context.clearRect(0, 0, map_puzzle.width, map_puzzle.height);
            //map_solve_context.clearRect(0, 0, map_solve.width, map_solve.height);

            let mini_square_width = Math.round(raster_map.width / 4);
            let mini_square_height = Math.round(raster_map.height / 4);

            tiles = [];
            let random_indexes = []

            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    // Create a canvas for each tile
                    let tileCanvas = document.createElement('canvas');
                    tileCanvas.width = mini_square_width;
                    tileCanvas.height = mini_square_height;
                    tileCanvas.style.position = 'absolute';
                    let tileContext = tileCanvas.getContext('2d');

                    tileContext.drawImage(
                        canvas,
                        j * mini_square_width,    // Source x
                        i * mini_square_height,   // Source y
                        mini_square_width,        // Source width
                        mini_square_height,       // Source height
                        0,                        // Destination x
                        0,                        // Destination y
                        mini_square_width,        // Destination width
                        mini_square_height        // Destination height
                    );

                    let random_index;
                    while (true) {
                        random_index = Math.floor(Math.random() * 16);
                        if (!random_indexes.includes(random_index)) {
                            random_indexes.push(random_index);
                            break;
                        }
                    }

                    let random_column = random_index % 4;
                    let random_row = Math.floor(random_index / 4);

                    tiles.push({
                        x: random_column * mini_square_width,
                        y: random_row * mini_square_height,
                        width: mini_square_width,
                        height: mini_square_height,
                        image: tileCanvas,
                        correct_row: i,
                        correct_column: j
                    });

                    map_puzzle_context.drawImage(tileCanvas, random_column * mini_square_width, random_row * mini_square_height);
                    map_puzzle_context.strokeRect(random_column * mini_square_width, random_row * mini_square_height, mini_square_width, mini_square_height);
                    map_solve_context.strokeRect(random_column * mini_square_width, random_row * mini_square_height, mini_square_width, mini_square_height);
                    // document.body.appendChild(tileCanvas);
                }
            }

            tiles.forEach(tile => {
                // tile.image.classList.add('item');
                tile.draggable = true;
                // tile.image.draggable = true;
                // tile.image.id = `item_${tile.x}_${tile.y}`;

            });

            // tiles.forEach(tile => {
            //    
            // })
}


document.addEventListener("mousedown", function(event) {
    console.log("mousedown");

    const mouseX = event.clientX;
    const mouseY = event.clientY;
    const canvasRect = map_puzzle.getBoundingClientRect();

    for (let tile of tiles) {
        const tileX = canvasRect.left + tile.x;
        const tileY = canvasRect.top + tile.y;
        //console.log(canvasRect.left, canvasRect.top);

        if (mouseX > tileX && mouseX < tileX + tile.width &&
            mouseY > tileY && mouseY < tileY + tile.height &&
            tile.draggable) {
            console.log("DRAG");
            draggingTile = tile;
            offsetX = mouseX - tileX;
            offsetY = mouseY - tileY;
            break;
        }
    }
});

document.addEventListener("mousemove", function(event) {
    //console.log("mousemove");
    if (draggingTile && draggingTile.draggable) {
        //draggingTile.image.style.zIndex = 10000000000000000000000;
        const mouseX = event.clientX;
        const mouseY = event.clientY;
        console.log(draggingTile.x, draggingTile.y);

        // Calculate tile's new position relative to the canvas
        const canvasRect_puzzle = map_puzzle.getBoundingClientRect();

        draggingTile.x = mouseX - canvasRect_puzzle.left - offsetX;
        draggingTile.y = mouseY - canvasRect_puzzle.top - offsetY;

        // Redraw the canvas
        const map_puzzle_context = map_puzzle.getContext("2d");
        map_puzzle_context.clearRect(0, 0, map_puzzle.width, map_puzzle.height);
        drawGrid(map_puzzle_context, draggingTile.width, draggingTile.height, map_puzzle.width, map_puzzle.height);

        const map_solve = document.getElementById("map_solve");

        for (let tile of tiles) {
            map_puzzle_context.drawImage(tile.image, tile.x, tile.y);
            map_puzzle_context.strokeRect(tile.x, tile.y, tile.width, tile.height);


        }



    }
});


let placedTiles = [];      // For correctly placed tiles
let incorrectTiles = [];   // For incorrectly placed tiles

// Function to draw the grid on the `map_solve` canvas
function drawGrid(context, tileWidth, tileHeight, canvasWidth, canvasHeight) {
    context.strokeStyle = "black";
    context.lineWidth = 1;

    // Draw vertical grid lines
    for (let x = 0; x <= canvasWidth; x += tileWidth) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, canvasHeight);
        context.stroke();
    }

    // Draw horizontal grid lines
    for (let y = 0; y <= canvasHeight; y += tileHeight) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(canvasWidth, y);
        context.stroke();
    }
}
document.addEventListener("mouseup", function(event) {
    console.log("mouseup");
    if (draggingTile) {
        // Snap the tile to the nearest grid position
        draggingTile.x = Math.round(draggingTile.x / draggingTile.width) * draggingTile.width;
        draggingTile.y = Math.round(draggingTile.y / draggingTile.height) * draggingTile.height;

        let mouseX = event.clientX;
        let mouseY = event.clientY;

        const map_solve = document.getElementById("map_solve");
        const map_solve_context = map_solve.getContext("2d");
        const canvasRect_solve = map_solve.getBoundingClientRect();

        const map_puzzle_context = map_puzzle.getContext("2d");

        // Clear the `map_puzzle` canvas and redraw all tiles
        map_puzzle_context.clearRect(0, 0, map_puzzle.width, map_puzzle.height);
        drawGrid(map_puzzle_context, draggingTile.width, draggingTile.height, map_puzzle.width, map_puzzle.height);
        for (let tile of tiles) {
            map_puzzle_context.drawImage(tile.image, tile.x, tile.y);
            map_puzzle_context.strokeRect(tile.x, tile.y, tile.width, tile.height);
        }

        // Calculate target tile position on the `map_solve` canvas
        let tileX = Math.floor((mouseX - canvasRect_solve.left) / draggingTile.width) * draggingTile.width;
        let tileY = Math.floor((mouseY - canvasRect_solve.top) / draggingTile.height) * draggingTile.height;

        // Clear `map_solve`, redraw grid, and redraw correctly placed tiles
        map_solve_context.clearRect(0, 0, map_solve.width, map_solve.height);
        drawGrid(map_puzzle_context, draggingTile.width, draggingTile.height, map_puzzle.width, map_puzzle.height);
        drawGrid(map_solve_context, draggingTile.width, draggingTile.height, map_solve.width, map_solve.height);


        // Redraw all correctly placed tiles from `placedTiles`
        for (let tile of placedTiles) {
            map_solve_context.drawImage(tile.image, tile.x, tile.y);
            map_solve_context.strokeStyle = "green";
            map_solve_context.lineWidth = 3;
            map_solve_context.strokeRect(tile.x, tile.y, tile.width, tile.height);
        }

        // Check if the mouse is inside the `map_solve` canvas
        if (mouseX > canvasRect_solve.left && mouseX < canvasRect_solve.right &&
            mouseY > canvasRect_solve.top && mouseY < canvasRect_solve.bottom) {

            // Check if the tile is in the correct position
            const correctX = draggingTile.correct_column * draggingTile.width;
            const correctY = draggingTile.correct_row * draggingTile.height;

            if (tileX === correctX && tileY === correctY) {
                // Correct position: draw the tile with a green border and add to placedTiles
                map_solve_context.drawImage(draggingTile.image, correctX, correctY);
                map_solve_context.strokeStyle = "green";
                map_solve_context.lineWidth = 3;
                map_solve_context.strokeRect(correctX, correctY, draggingTile.width, draggingTile.height);

                // Add the tile to placedTiles to retain it on the `map_solve` canvas
                placedTiles.push({
                    image: draggingTile.image,
                    x: correctX,
                    y: correctY,
                    width: draggingTile.width,
                    height: draggingTile.height
                });

                correct_tiles_counter++;
                draggingTile.draggable = false;

                if (correct_tiles_counter === 2) {

                    // Puzzle completed - show congratulations message
                    map_solve_context.filter = "blur(5px)";
                    map_solve_context.drawImage(map_solve, 0, 0);
                    map_solve_context.filter = "none";
                    map_solve_context.font = "50px Arial";
                    map_solve_context.fillStyle = "black";
                    map_solve_context.textAlign = "center";
                    map_solve_context.fillText("Congratulations!", map_solve.width / 2, map_solve.height / 2);




                    if ("Notification" in window) {
                        Notification.requestPermission().then(function(permission) {
                            if (permission === "granted") {
                                new Notification("Congratulations!", {
                                    body: "You have solved the puzzle!",
                                    icon: "https://www.freeiconspng.com/uploads/checkmark-png-picture-8.png"
                                });
                            }
                        });
                    }
                }
            }
            else {

                map_solve_context.drawImage(draggingTile.image, tileX, tileY);
                map_solve_context.strokeStyle = "red";
                map_solve_context.lineWidth = 3;
                map_solve_context.strokeRect(tileX, tileY, draggingTile.width, draggingTile.height);
            }
        }

        draggingTile = null;
    }
});




    });
});







