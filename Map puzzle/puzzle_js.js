let map = L.map('map_box').setView([53.432826892328116, 14.548091452802913], 19);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let tiles = [];
let correct_tiles_counter = 0;
let dragging_tile = null;
let offset_x, offset_y;

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

            let mini_square_width = Math.round(raster_map.width / 4);
            let mini_square_height = Math.round(raster_map.height / 4);

            tiles = [];
            let random_indexes = []

            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    // Create a canvas for each tile
                    let tile_canvas = document.createElement('canvas');
                    tile_canvas.width = mini_square_width;
                    tile_canvas.height = mini_square_height;
                    tile_canvas.style.position = 'absolute';
                    let tile_context = tile_canvas.getContext('2d');

                    tile_context.drawImage(
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
                        image: tile_canvas,
                        correct_row: i,
                        correct_column: j,
                        draggable: true
                    });

                    map_puzzle_context.drawImage(tile_canvas, random_column * mini_square_width, random_row * mini_square_height);
                    map_puzzle_context.strokeRect(random_column * mini_square_width, random_row * mini_square_height, mini_square_width, mini_square_height);
                    map_solve_context.strokeRect(random_column * mini_square_width, random_row * mini_square_height, mini_square_width, mini_square_height);
                }
            }
            // tiles.forEach(tile => {
            //     tile.draggable = true;
            // });

        }

        document.addEventListener("mousedown", function(event) {
            const mouse_x = event.clientX;
            const mouse_y = event.clientY;
            const canvas_borders = map_puzzle.getBoundingClientRect();

            for (let tile of tiles) {
                const tile_x = canvas_borders.left + tile.x;
                const tile_y = canvas_borders.top + tile.y;

                if (mouse_x > tile_x && mouse_x < tile_x + tile.width &&
                    mouse_y > tile_y && mouse_y < tile_y + tile.height &&
                    tile.draggable) {

                    dragging_tile = tile;
                    offset_x = mouse_x - tile_x;
                    offset_y = mouse_y - tile_y;
                    break;
                }
            }

        });

        document.addEventListener("mousemove", function(event) {
            //console.log("mousemove");
            if (dragging_tile && dragging_tile.draggable) {
                //dragging_tile.image.style.zIndex = 10000000000000000000000;
                const mouse_x = event.clientX;
                const mouse_y = event.clientY;
                console.log(dragging_tile.x, dragging_tile.y);

                // Calculate tile's new position relative to the canvas
                const canvas_borders_puzzle = map_puzzle.getBoundingClientRect();

                dragging_tile.x = mouse_x - canvas_borders_puzzle.left - offset_x;
                dragging_tile.y = mouse_y - canvas_borders_puzzle.top - offset_y;

                // Redraw the canvas
                //let map_puzzle = document.getElementById("map_puzzle");
                const map_puzzle_context = map_puzzle.getContext("2d");
                map_puzzle_context.clearRect(0, 0, map_puzzle.width, map_puzzle.height);
                drawGrid(map_puzzle_context, dragging_tile.width, dragging_tile.height, map_puzzle.width, map_puzzle.height);

                for (let tile of tiles) {
                    map_puzzle_context.drawImage(tile.image, tile.x, tile.y);
                    map_puzzle_context.strokeRect(tile.x, tile.y, tile.width, tile.height);
                }
            }

        });

        let placed_tiles = [];
        let incorrectTiles = [];

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

            if (dragging_tile) {

                dragging_tile.x = Math.round(dragging_tile.x / dragging_tile.width) * dragging_tile.width;
                dragging_tile.y = Math.round(dragging_tile.y / dragging_tile.height) * dragging_tile.height;

                let mouse_x = event.clientX;
                let mouse_y = event.clientY;

                const map_solve = document.getElementById("map_solve");
                const map_solve_context = map_solve.getContext("2d");
                const canvas_borders_solve = map_solve.getBoundingClientRect();

                const map_puzzle_context = map_puzzle.getContext("2d");

                // Clear the `map_puzzle` canvas and redraw all tiles
                map_puzzle_context.clearRect(0, 0, map_puzzle.width, map_puzzle.height);
                drawGrid(map_puzzle_context, dragging_tile.width, dragging_tile.height, map_puzzle.width, map_puzzle.height);
                for (let tile of tiles) {
                    map_puzzle_context.drawImage(tile.image, tile.x, tile.y);
                    map_puzzle_context.strokeRect(tile.x, tile.y, tile.width, tile.height);
                }

                // Calculate target tile position on the `map_solve` canvas
                let tile_x = Math.floor((mouse_x - canvas_borders_solve.left) / dragging_tile.width) * dragging_tile.width;
                let tile_y = Math.floor((mouse_y - canvas_borders_solve.top) / dragging_tile.height) * dragging_tile.height;

                // Clear `map_solve`, redraw grid, and redraw correctly placed tiles
                map_solve_context.clearRect(0, 0, map_solve.width, map_solve.height);
                drawGrid(map_puzzle_context, dragging_tile.width, dragging_tile.height, map_puzzle.width, map_puzzle.height);
                drawGrid(map_solve_context, dragging_tile.width, dragging_tile.height, map_solve.width, map_solve.height);


                // Redraw all correctly placed tiles from `placed_tiles`
                for (let tile of placed_tiles) {
                    map_solve_context.drawImage(tile.image, tile.x, tile.y);
                    map_solve_context.strokeStyle = "green";
                    map_solve_context.lineWidth = 3;
                    map_solve_context.strokeRect(tile.x, tile.y, tile.width, tile.height);
                }

                // Check if the mouse is inside the `map_solve` canvas
                if (mouse_x > canvas_borders_solve.left && mouse_x < canvas_borders_solve.right &&
                    mouse_y > canvas_borders_solve.top && mouse_y < canvas_borders_solve.bottom) {

                    // Check if the tile is in the correct position
                    const correctX = dragging_tile.correct_column * dragging_tile.width;
                    const correctY = dragging_tile.correct_row * dragging_tile.height;

                    if (tile_x === correctX && tile_y === correctY) {
                        // Correct position: draw the tile with a green border and add to placed_tiles
                        map_solve_context.drawImage(dragging_tile.image, correctX, correctY);
                        map_solve_context.strokeStyle = "green";
                        map_solve_context.lineWidth = 3;
                        map_solve_context.strokeRect(correctX, correctY, dragging_tile.width, dragging_tile.height);

                        // Add the tile to placed_tiles to retain it on the `map_solve` canvas
                        placed_tiles.push({
                            image: dragging_tile.image,
                            x: correctX,
                            y: correctY,
                            width: dragging_tile.width,
                            height: dragging_tile.height
                        });

                        correct_tiles_counter++;
                        dragging_tile.draggable = false;

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

                        map_solve_context.drawImage(dragging_tile.image, tile_x, tile_y);
                        map_solve_context.strokeStyle = "red";
                        map_solve_context.lineWidth = 3;
                        map_solve_context.strokeRect(tile_x, tile_y, dragging_tile.width, dragging_tile.height);
                    }
                }
    
                dragging_tile = null;
            }
        });

    });
});







