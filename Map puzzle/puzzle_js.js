let map = L.map('map_box').setView([53.432826892328116, 14.548091452802913], 15);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

document.getElementById("download_icon").addEventListener("click", function() {
    leafletImage(map, function (err, canvas) {
        if (!err) {
            // Display the downloaded map in the 1st-row, 2nd-column canvas
            let rasterMap = document.getElementById("raster_map");
            rasterMap.width = canvas.width;
            rasterMap.height = canvas.height;
            let rasterContext = rasterMap.getContext("2d");
            rasterContext.drawImage(canvas, 0, 0);

        }
    });
});


