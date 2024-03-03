import axios from 'axios';

export async function fetchNearbyPlaces(location, type) {
    try {
        // Make request to Google Maps API
        const response = await axios.get(
            "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
            {
                params: {
                    location: location,
                    radius: "5000",
                    type: type,
                    key: process.env.API_KEY,
                },
            }
        );

        const result = response.data;
        const places = result.results.map((result) => {
            return {
                name: result.name,
                vicinity: result.vicinity,
                rating: result.rating || "Not available",
            };
        });

        return places;
    } catch (error) {
        console.error('Error fetching nearby places:', error);
        throw new Error('Failed to fetch nearby places');
    }
}
