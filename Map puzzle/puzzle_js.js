//Setting up initial map
let map = L.map('map_box').setView([53.432826892328116, 14.548091452802913], 17);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let tiles = [];
let correctly_placed_tiles = [];
let incorrectly_placed_tiles = [];
let correct_tiles_counter = 0;
let dragging_tile = null;
let offset_x, offset_y;

//Action after clicking choose map icon
document.getElementById("choose_map_icon").addEventListener("click", function() {
    leafletImage(map, function (err, canvas) {
        //Drawing current map on first canvas
        let raster_map = document.getElementById("raster_map");
        raster_map.width = canvas.width;
        raster_map.height = canvas.height;
        let raster_context = raster_map.getContext("2d");
        raster_context.drawImage(canvas, 0, 0);

        //Creating two canvases for puzzle and solution
        let map_puzzle = document.getElementById("map_puzzle");
        let map_solve = document.getElementById("map_solve");
        map_puzzle.width = canvas.width;
        map_puzzle.height = canvas.height;
        map_solve.width = canvas.width;
        map_solve.height = canvas.height;
        let map_puzzle_context = map_puzzle.getContext("2d");
        let map_solve_context = map_solve.getContext("2d");

        //Calculating width and height of tile dimensions
        let mini_square_width = Math.round(raster_map.width / 4);
        let mini_square_height = Math.round(raster_map.height / 4);

        tiles = [];
        let random_indexes = []

        //Create a canvas for each tile
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                let tile_canvas = document.createElement('canvas');
                tile_canvas.width = mini_square_width;
                tile_canvas.height = mini_square_height;
                tile_canvas.style.position = 'absolute';
                let tile_context = tile_canvas.getContext('2d');

                //Drawing each tile on canvas
                tile_context.drawImage(
                    canvas,
                    j * mini_square_width,
                    i * mini_square_height,
                    mini_square_width,
                    mini_square_height,
                    0,
                    0,
                    mini_square_width,
                    mini_square_height
                );

                //Setting up random position for each tile
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

                //Pushing each tile to tiles array
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
            }

            draw_grid(map_puzzle_context, mini_square_width, mini_square_height, map_puzzle.width, map_puzzle.height);
            draw_grid(map_solve_context, mini_square_width, mini_square_height, map_solve.width, map_solve.height);
        }
    });

});

//Start dragging tile
document.addEventListener("mousedown", function(event) {
    const mouse_x = event.clientX;
    const mouse_y = event.clientY;
    let map_puzzle = document.getElementById("map_puzzle");
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

//Dragging tile
document.addEventListener("mousemove", function(event) {
    if (dragging_tile && dragging_tile.draggable) {
        const mouse_x = event.clientX;
        const mouse_y = event.clientY;

        //Calculate tile's new position
        let map_puzzle = document.getElementById("map_puzzle");
        const canvas_borders_puzzle = map_puzzle.getBoundingClientRect();

        dragging_tile.x = mouse_x - canvas_borders_puzzle.left - offset_x;
        dragging_tile.y = mouse_y - canvas_borders_puzzle.top - offset_y;

        //Redraw the canvas
        const map_puzzle_context = map_puzzle.getContext("2d");
        map_puzzle_context.clearRect(0, 0, map_puzzle.width, map_puzzle.height);

        for (let tile of tiles) {
            map_puzzle_context.drawImage(tile.image, tile.x, tile.y);
        }
        draw_grid(map_puzzle_context, dragging_tile.width, dragging_tile.height, map_puzzle.width, map_puzzle.height);
    }

});

//Stop dragging tile
document.addEventListener("mouseup", function(event) {
    if (dragging_tile) {

        dragging_tile.x = Math.round(dragging_tile.x / dragging_tile.width) * dragging_tile.width;
        dragging_tile.y = Math.round(dragging_tile.y / dragging_tile.height) * dragging_tile.height;

        let mouse_x = event.clientX;
        let mouse_y = event.clientY;

        const map_solve = document.getElementById("map_solve");
        const map_solve_context = map_solve.getContext("2d");
        const canvas_borders_solve = map_solve.getBoundingClientRect();

        let map_puzzle = document.getElementById("map_puzzle");
        const map_puzzle_context = map_puzzle.getContext("2d");

        //Clear map_puzzle canvas and redrawing all tiles
        map_puzzle_context.clearRect(0, 0, map_puzzle.width, map_puzzle.height);

        for (let tile of tiles) {
            map_puzzle_context.drawImage(tile.image, tile.x, tile.y);
        }

        draw_grid(map_puzzle_context, dragging_tile.width, dragging_tile.height, map_puzzle.width, map_puzzle.height);

        //Calculating correct tile position of current mouse position
        let tile_x = Math.floor((mouse_x - canvas_borders_solve.left) / dragging_tile.width) * dragging_tile.width;
        let tile_y = Math.floor((mouse_y - canvas_borders_solve.top) / dragging_tile.height) * dragging_tile.height;

        //Check if the mouse is inside the map_solve canvas
        if (mouse_x > canvas_borders_solve.left && mouse_x < canvas_borders_solve.right &&
            mouse_y > canvas_borders_solve.top && mouse_y < canvas_borders_solve.bottom) {

            //Check if the tile is in the correct position
            const correct_x = dragging_tile.correct_column * dragging_tile.width;
            const correct_y = dragging_tile.correct_row * dragging_tile.height;

            if (tile_x === correct_x && tile_y === correct_y) {
                //Deleting tile from incorrectly_placed_tiles to avoid double drawing of tile
                 incorrectly_placed_tiles = incorrectly_placed_tiles.filter(tile => tile.image !== dragging_tile.image);

                //Add the tile to correctly_placed_tiles
                correctly_placed_tiles.push({
                    image: dragging_tile.image,
                    x: correct_x,
                    y: correct_y,
                    width: dragging_tile.width,
                    height: dragging_tile.height
                });

                correct_tiles_counter++;
                dragging_tile.draggable = false;
            }

            //Tile is not in the correct position
            else {
                //Check if the tile is already in the incorrectly_placed_tiles list and update its position
                let existing_tile = incorrectly_placed_tiles.find(tile => tile.image === dragging_tile.image);
                if (existing_tile) {
                    existing_tile.x = tile_x;
                    existing_tile.y = tile_y;
                }

                //Add the tile to incorrectly_placed_tiles if it is not already there
                else {
                    incorrectly_placed_tiles.push({
                        image: dragging_tile.image,
                        x: tile_x,
                        y: tile_y,
                        width: dragging_tile.width,
                        height: dragging_tile.height
                    });
                }
            }
        }
        //Redrawing map_solve canvas
        map_solve_context.clearRect(0, 0, map_solve.width, map_solve.height);
        draw_grid(map_solve_context, dragging_tile.width, dragging_tile.height, map_solve.width, map_solve.height);

        //Redrawing all correctly placed tiles
        for (let correct_tile of correctly_placed_tiles) {
            map_solve_context.drawImage(correct_tile.image, correct_tile.x, correct_tile.y);
            map_solve_context.strokeStyle = "green";
            map_solve_context.lineWidth = 3;
            map_solve_context.strokeRect(correct_tile.x, correct_tile.y, correct_tile.width, correct_tile.height);
        }

        //Redrawing all incorrectly placed tiles
        for (let incorrect_tile of incorrectly_placed_tiles) {
            map_solve_context.drawImage(incorrect_tile.image, incorrect_tile.x, incorrect_tile.y);
            map_solve_context.strokeStyle = "red";
            map_solve_context.lineWidth = 3;
            map_solve_context.strokeRect(incorrect_tile.x, incorrect_tile.y, incorrect_tile.width, incorrect_tile.height);
        }

        //Check if the puzzle is completed
        if (correct_tiles_counter === 16) {

            //Showing congratulations message
            map_solve_context.filter = "blur(5px)";
            map_solve_context.drawImage(map_solve, 0, 0);
            map_solve_context.filter = "none";
            map_solve_context.font = "50px Arial";
            map_solve_context.textAlign = "center";
            map_solve_context.fillText("Congratulations!", map_solve.width / 2, map_solve.height / 2);

            //System notification
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

        //Reset dragging_tile holder
        dragging_tile = null;
    }

});

//Grid on canvas drawing function
function draw_grid(context, tile_width, tile_height, canvas_width, canvas_height) {
    context.strokeStyle = "black";
    context.lineWidth = 2;

    //Draw vertical grid lines
    for (let x = tile_width; x <= canvas_width; x += tile_width) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, canvas_height);
        context.stroke();
    }

    //Draw horizontal grid lines
    for (let y = tile_height; y <= canvas_height-tile_height; y += tile_height) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(canvas_width, y);
        context.stroke();
    }

}

