let map = L.map('map_box').setView([53.432826892328116, 14.548091452802913], 15);
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
            map_puzzle.width = canvas.width;
            map_puzzle.height = canvas.height;
            let map_puzzle_context = map_puzzle.getContext("2d");

            map_puzzle_context.clearRect(0, 0, map_puzzle.width, map_puzzle.height);

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
                }
            }

            tiles.forEach(tile => {
                // tile.image.classList.add('item');
                tile.draggable = true;
                // tile.image.draggable = true;
                // tile.image.id = `item_${tile.x}_${tile.y}`;

            });
}


map_puzzle.addEventListener("mousedown", function(event) {
    const mouseX = event.offsetX;
    const mouseY = event.offsetY;

    for (let tile of tiles) {
        if (
            mouseX > tile.x && mouseX < tile.x + tile.width &&
            mouseY > tile.y && mouseY < tile.y + tile.height
        ) {
            draggingTile = tile;
            offsetX = mouseX - tile.x;
            offsetY = mouseY - tile.y;
            break;
        }
    }
});

map_puzzle.addEventListener("mousemove", function(event) {
    if (draggingTile) {
        const mouseX = event.offsetX;
        const mouseY = event.offsetY;

        draggingTile.x = mouseX - offsetX;
        draggingTile.y = mouseY - offsetY;

        let map_puzzle_context = map_puzzle.getContext("2d");
        map_puzzle_context.clearRect(0, 0, map_puzzle.width, map_puzzle.height);

        for (let tile of tiles) {
            map_puzzle_context.drawImage(tile.image, tile.x, tile.y);
            map_puzzle_context.strokeRect(tile.x, tile.y, tile.width, tile.height);
        }
    }
});

map_puzzle.addEventListener("mouseup", function() {
    if (draggingTile) {
        draggingTile.x = Math.round(draggingTile.x / draggingTile.width) * draggingTile.width;
        draggingTile.y = Math.round(draggingTile.y / draggingTile.height) * draggingTile.height;

        draggingTile = null;

        let map_puzzle_context = map_puzzle.getContext("2d");
        map_puzzle_context.clearRect(0, 0, map_puzzle.width, map_puzzle.height);
        for (let tile of tiles) {
            map_puzzle_context.drawImage(tile.image, tile.x, tile.y);
            map_puzzle_context.strokeRect(tile.x, tile.y, tile.width, tile.height);
        }
    }
});

map_puzzle.addEventListener("mouseleave", function() {
    draggingTile = null;
});

    });
});







