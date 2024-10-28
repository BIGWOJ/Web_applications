const map = L.map('map_box').setView([53.432826892328116, 14.548091452802913], 15);
const map_ss = document.getElementById('download_icon');

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

function take_screenshot() {

}