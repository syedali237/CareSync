import axios from "axios";

export async function getLatLong(address) {
    try {
      const response = await axios.get(
        "https://maps.googleapis.com/maps/api/geocode/json",
        {
          params: {
            address: address,
            key: process.env.API_KEY,
          },
        }
      );
  
      // Check if the request was successful
      if (response.data.status === "OK") {
        // Extract latitude and longitude
        const location = response.data.results[0].geometry.location;
        const latitude = location.lat;
        const longitude = location.lng;
  
        return { latitude, longitude };
      } else {
        throw new Error("Failed to fetch location information");
      }
    } catch (error) {
      console.error("Error:", error.message);
      return null;
    }
  }