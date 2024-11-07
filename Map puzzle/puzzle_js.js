let map = L.map('map_box').setView([53.432826892328116, 14.548091452802913], 19);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let tiles = [];
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
            map_solve_context.clearRect(0, 0, map_solve.width, map_solve.height);

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
                        image: tileCanvas
                    });

                    map_puzzle_context.drawImage(tileCanvas, random_column * mini_square_width, random_row * mini_square_height);
                    map_puzzle_context.strokeRect(random_column * mini_square_width, random_row * mini_square_height, mini_square_width, mini_square_height);
                    console.log('asdf');
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
            mouseY > tileY && mouseY < tileY + tile.height) {
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
    if (draggingTile) {
        //draggingTile.image.style.zIndex = 10000000000000000000000;
        const mouseX = event.clientX;
        const mouseY = event.clientY;
        //console.log(mouseX, mouseY);

        // Calculate tile's new position relative to the canvas
        const canvasRect_puzzle = map_puzzle.getBoundingClientRect();

        draggingTile.x = mouseX - canvasRect_puzzle.left - offsetX;
        draggingTile.y = mouseY - canvasRect_puzzle.top - offsetY;

        // Redraw the canvas
        const map_puzzle_context = map_puzzle.getContext("2d");
        map_puzzle_context.clearRect(0, 0, map_puzzle.width, map_puzzle.height);

        for (let tile of tiles) {
            map_puzzle_context.drawImage(tile.image, tile.x, tile.y);

            map_puzzle_context.strokeRect(tile.x, tile.y, tile.width, tile.height);
        }
    }
});

document.addEventListener("mouseup", function(event) {
    console.log("mouseup");
    if (draggingTile) {
        draggingTile.x = Math.round(draggingTile.x / draggingTile.width) * draggingTile.width;
        draggingTile.y = Math.round(draggingTile.y / draggingTile.height) * draggingTile.height;

        let mouseX = event.clientX;
        let mouseY = event.clientY;

        const map_solve = document.getElementById("map_solve");
        let map_solve_context = map_solve.getContext("2d");
        const canvasRect_solve = map_solve.getBoundingClientRect();

        let map_puzzle_context = map_puzzle.getContext("2d");
        map_puzzle_context.clearRect(0, 0, map_puzzle.width, map_puzzle.height);
        for (let tile of tiles) {
            map_puzzle_context.drawImage(tile.image, tile.x, tile.y);
            map_puzzle_context.strokeRect(tile.x, tile.y, tile.width, tile.height);
        }

        if (mouseX > canvasRect_solve.left && mouseX < canvasRect_solve.right &&
            mouseY > canvasRect_solve.top && mouseY < canvasRect_solve.bottom) {
            let tileX = Math.floor((mouseX - canvasRect_solve.left) / draggingTile.width) * draggingTile.width;
            let tileY = Math.floor((mouseY - canvasRect_solve.top) / draggingTile.height) * draggingTile.height;
            map_solve_context.drawImage(draggingTile.image, tileX, tileY);
            // map_solve_context.strokeRect(tileX, tileY, draggingTile.width, draggingTile.height);
        }
        //draggingTile.image.style.zIndex = 0;
        draggingTile = null;
    }
});


// map_puzzle.addEventListener("mouseleave", function() {
//     draggingTile = null;
// });

    });
});







