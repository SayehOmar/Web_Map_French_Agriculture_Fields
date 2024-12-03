import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = 3000;

// Define a root route (optional)
app.get('/', (req, res) => {
    res.send('Proxy server is running. Use /geoserver for GeoServer requests.');
});

// Proxy route to handle requests to GeoServer WMS
app.use('/geoserver', async (req, res) => {
    // Construct the GeoServer URL based on the original request
    const geoserverURL = 'http://localhost:8090' + req.originalUrl;

    // Log the GeoServer URL for debugging
    console.log('Proxying request to GeoServer:', geoserverURL);

    // Set CORS headers to allow requests from localhost:5500
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5500');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    try {
        // Fetch from GeoServer
        const response = await fetch(geoserverURL);

        // Check if the response from GeoServer is OK
        if (!response.ok) {
            throw new Error('Failed to fetch from GeoServer: ' + response.statusText);
        }

        // Handle image response (e.g., PNG, JPEG)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('image')) {
            // Pipe the image data directly to the response
            res.setHeader('Content-Type', contentType);
            response.body.pipe(res);
        } else if (contentType && contentType.includes('application/json')) {
            // Handle JSON response
            const data = await response.json();
            res.json(data); // Send JSON data directly to the frontend
        } else if (contentType && contentType.includes('text/xml')) {
            // Handle XML response (e.g., GetCapabilities)
            const data = await response.text();
            res.setHeader('Content-Type', 'text/xml');
            res.send(data);
        } else {
            // For other content types
            const data = await response.text();
            res.send(data);
        }

    } catch (error) {
        console.error('Error fetching from GeoServer:', error);
        res.status(500).send('Error retrieving information from GeoServer'); // Handle errors gracefully
    }
});

// Start the Express server
app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});
