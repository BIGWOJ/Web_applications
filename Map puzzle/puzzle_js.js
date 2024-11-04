let map = L.map('map_box').setView([53.432826892328116, 14.548091452802913], 15);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

document.getElementById("download_icon").addEventListener("click", function() {
    leafletImage(map, function (err, canvas) {
        if (!err) {
            let raster_map = document.getElementById("raster_map");
            raster_map.width = canvas.width;
            raster_map.height = canvas.height;
            let raster_context = raster_map.getContext("2d");
            raster_context.drawImage(canvas, 0, 0);

            let map_puzzle = document.getElementById("map_puzzle");
            let mini_square_width = Math.round(raster_map.width / 4);
            let mini_square_height = Math.round(raster_map.height / 4);


            let map_puzzle_context = map_puzzle.getContext("2d");



            // // Loop through each cell in a 4x4 grid to copy sections of the map
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    // Copy a section of the raster_map to the map_puzzle
                    map_puzzle_context.drawImage(
                        raster_map,
                        j * mini_square_width,            // Source x
                        i * mini_square_height,           // Source y
                        mini_square_width,                // Source width
                        mini_square_height,               // Source height
                        j * mini_square_width,            // Destination x
                        i * mini_square_height,           // Destination y
                        50,                // Destination width
                        50                // Destination height
                    );

                    // Draw a border around each cell
                    map_puzzle_context.strokeStyle = 'black';
                    map_puzzle_context.lineWidth = 1;
                    map_puzzle_context.strokeRect(
                        j * mini_square_width,
                        i * mini_square_height,
                        mini_square_width,
                        mini_square_height
                    );
                }
            }
        }
    });
});



            //
            //
            // for (let i = 0; i < 4; i++) {
            //     for (let j = 0; j < 4; j++) {
            //         let mini_square = raster_context.getImageData(j * mini_square_width, i * mini_square_height, mini_square_width, mini_square_height);
            //         let mini_square_canvas = document.createElement("canvas");
            //         mini_square_canvas.width = mini_square_width;
            //         mini_square_canvas.height = mini_square_height;
            //         mini_square_canvas.getContext("2d").putImageData(mini_square, 0, 0);
            //         let mini_square_img = document.createElement("img");
            //         mini_square_img.src = mini_square_canvas.toDataURL("image/png");
            //         mini_square_img.width = mini_square_width;
            //         mini_square_img.height = mini_square_height;
            //         mini_square_img.style.border = "1px solid black";
            //         document.getElementById("map_puzzle").appendChild(mini_square_img);
            //     }
            // }

