export const geocodeAddress = async (address) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=YOUR_GOOGLE_MAPS_API_KEY`
    );
    const data = await response.json();

    if (data.status === "OK" && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng };
    }
    throw new Error("Unable to geocode address");
  } catch (error) {
    console.error("Geocoding error:", error);
    return { lat: 0, lng: 0 };
  }
};
