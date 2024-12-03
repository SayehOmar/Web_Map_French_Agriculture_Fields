// Initialize the map centered on a given latitude and longitude
const map = L.map('map').setView([46.8, 0.12], 12); // Adjust coordinates and zoom as needed

// Add a base layer (e.g., OpenStreetMap) to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Replace the original GeoServer URL with the proxy URL
const wmsLayer = L.tileLayer.wms('http://localhost:3000/geoserver/work/wms', {
  layers: 'work:boundaries_france_2020_SmallerArea',
  format: 'image/png',
  transparent: true,
  tiled: true,
  attribution: 'GeoServer WMS'
}).addTo(map);

// Add a base layer (OpenStreetMap) to the map
const baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);
// Add Layer Control for toggling
const overlayMaps = {
    "Crops Layers ": wmsLayer
};


L.control.layers({ "Base Map": baseLayer }, overlayMaps, { collapsed: false }).addTo(map);

// Example to force visibility in case CSS is hiding it inadvertently
document.querySelector('.leaflet-control-layers').style.display = 'block';

// Placeholder for highlighted polygon
let highlightLayer;
// Handle the click event on the map
map.on('click', function (e) {
    // Get the coordinates from the click event
    const latlng = e.latlng;
    
    // Get the pixel coordinates of the click event
    const point = map.latLngToContainerPoint(latlng);  // Convert latlng to pixel coordinates
    const x = Math.round(point.x);
    const y = Math.round(point.y);


    // Get the map's bounding box (BBOX) and size
    const bounds = map.getBounds();
    const bbox = bounds.toBBoxString();  // Convert map bounds to BBOX string format
    const width = map.getSize().x;
    const height = map.getSize().y;

    // Construct the URL for the GetFeatureInfo request
    const url = `http://localhost:3000/geoserver/work/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo&FORMAT=image%2Fpng&TRANSPARENT=true&QUERY_LAYERS=work%3Aboundaries_france_2020_SmallerArea&STYLES&LAYERS=work%3Aboundaries_france_2020_SmallerArea&exceptions=application%2Fvnd.ogc.se_inimage&INFO_FORMAT=application%2Fjson&FEATURE_COUNT=50&X=${x}&Y=${y}&SRS=EPSG%3A4326&WIDTH=${width}&HEIGHT=${height}&BBOX=${bbox}`;
    console.log("Fetching URL:", url);
    // Fetch data from GeoServer
    fetch(url)
        .then(response => response.json())  // Parse the JSON response
        .then(data => {
            // Check if there are features returned
            if (data.features && data.features.length > 0) {
                // Remove existing highlight if any
                if (highlightLayer) {
                    map.removeLayer(highlightLayer);
                }
                // Get the properties of the first feature
                const feature = data.features[0];
                const properties = feature.properties;
                
                // Format the properties into HTML
                const infoHtml = `
                    <h3>Feature Information</h3>
                    <ul>
                        <li><strong>ID:</strong> ${properties.id}</li>
                        <li><strong>Area:</strong> ${properties.area}</li>
                        <li><strong>Crop Code:</strong> ${properties.crop_code}</li>
                        <li><strong>Crop Code (Numeric):</strong> ${properties.crop_code_}</li>
                
                        <li><strong>Crop Label:</strong> ${properties.crop_label}</li>
                    </ul>
                `;

                // Create GeoJSON layer for highlighting
                highlightLayer = L.geoJSON(feature, {
                    style: {
                        color: 'Gold',
                        weight: 10,
                        opacity: 0.7,
                        fillOpacity: 0.3
                    }
                }).addTo(map);
                


                

                // Inject formatted HTML into the #info div
                document.getElementById('info').innerHTML = infoHtml;
            } else {
                document.getElementById('info').innerHTML = "No feature information available.";
            }
        })
        .catch(error => {
            console.error("Error retrieving information:", error);

            // Retry logic
            if (retryCount > 0) {
                console.log(`Retrying... (${retryCount} attempts left)`);
                setTimeout(() => fetchFeatureInfo(url, retryCount - 1), 1000);
            } else {
                document.getElementById('info').innerHTML = "Failed to retrieve information after multiple attempts.";
            }
        });

});





// Function to update coordinates in the bottom div
function updateCoordinates(e) {
    const lat = e.latlng.lat.toFixed(6);  // Round to 6 decimal places
    const lon = e.latlng.lng.toFixed(6);  // Round to 6 decimal places
    document.getElementById('coordinates').textContent = `Coordinates: ${lat}, ${lon}`;
}

// Listen for mousemove events on the map to track coordinates
map.on('mousemove', updateCoordinates);


/*ANIMATION SCRIPT*/


document.getElementById('toggle-btn').addEventListener('click', function() {
    const sidePanel = document.getElementById('side-panel');
    const arrow = document.getElementById('arrow');
    
    sidePanel.classList.toggle('hidden'); // Toggle the 'hidden' class

    // Toggle arrow direction based on side panel visibility
    if (sidePanel.classList.contains('hidden')) {
        arrow.textContent = "⏵"; // Change to left arrow
    } else {
        arrow.textContent = "⏴"; // Change to right arrow
    }
});






// ------------- Highlight CODE -------------------------



