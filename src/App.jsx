import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  MapPin,
  Edit2,
  Trash2,
  Loader,
  X,
  Plus,
  User,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Initial profiles data remains the same
const initialProfiles = [
  {
    id: 1,
    name: "Jane Smith",
    description: "Software Engineer",
    address: "123 Tech Street, Silicon Valley, CA",
    lat: 37.7749,
    lng: -122.4194,
    interests: ["Coding", "Hiking", "Photography"],
    email: "jane@example.com",
    phone: "+1 234 567 8900",
  },
  {
    id: 2,
    name: "John Doe",
    description: "Product Designer",
    address: "456 Design Avenue, New York, NY",
    lat: 40.7128,
    lng: -74.006,
    interests: ["UI/UX", "Art", "Music"],
    email: "john@example.com",
    phone: "+1 234 567 8901",
  },
];

const MapComponent = ({ profile, onClose }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    // Load Google Maps script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY`;
    script.async = true;
    script.defer = true;
    script.onload = initializeMap;

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
      if (mapInstanceRef.current) {
        // Clean up map instance if needed
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const initializeMap = () => {
    if (window.google && mapRef.current && profile) {
      // Create map instance
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        zoom: 14,
        center: profile.coordinates,
        disableDefaultUI: true,
        zoomControl: true,
      });

      // Create marker
      markerRef.current = new window.google.maps.Marker({
        position: profile.coordinates,
        map: mapInstanceRef.current,
        title: profile.name,
      });
    }
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Location Map</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="rounded-lg overflow-hidden border border-gray-200">
        <div ref={mapRef} style={{ width: "100%", height: "400px" }} />
      </div>
      <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-500" />
          <span>{profile.address}</span>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          Coordinates: {profile.lat}, {profile.lng}
        </div>
      </div>
    </div>
  );
};

// Geocoding function using fetch
const geocodeAddress = async (address) => {
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

const App = () => {
  // State to manage the list of profiles
  const [profiles, setProfiles] = useState(initialProfiles);
  // State to manage the currently selected profile for actions like viewing on the map
  const [selectedProfile, setSelectedProfile] = useState(null);
  // Loading state to display a spinner during async operations
  const [isLoading, setIsLoading] = useState(false);
  // State to handle search input for filtering profiles
  const [searchTerm, setSearchTerm] = useState("");
  // Toggles between admin mode and user mode
  const [isAdminMode, setIsAdminMode] = useState(false);
  // State to manage the visibility of the map
  const [showMap, setShowMap] = useState(false);
  // Tracks form data for adding a new profile
  const [newUser, setNewUser] = useState({
    name: "",
    description: "",
    address: "",
    lat: 0,
    lng: 0,
    interests: "",
    email: "",
    phone: "",
  });

  // Filter profiles based on search term
  const filteredProfiles = profiles.filter(
    (profile) =>
      profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handles adding a new profile
  const handleAddProfile = async (newProfile) => {
    setIsLoading(true); // Show loading spinner
    try {
      // Get geocoded coordinates for the address
      const coordinates = await geocodeAddress(newProfile.address);
      // Format the new profile data and generate a unique ID
      const profileWithCoordinates = {
        ...newProfile,
        coordinates,
        interests: newProfile.interests
          .split(",") // Convert comma-separated interests into an array
          .map((interest) => interest.trim()) // Trim extra spaces
          .filter((interest) => interest !== ""), // Remove empty strings
        id: profiles.length + 1, // Generate a unique ID
      };
      // Add the new profile to the list
      setProfiles([...profiles, profileWithCoordinates]);
      // Reset the new user form
      setNewUser({
        name: "",
        description: "",
        address: "",
        lat: 0,
        lng: 0,
        interests: "",
        email: "",
        phone: "",
      });
    } catch (error) {
      console.error("Error adding profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handles deleting a profile by ID
  const handleDeleteProfile = (id) => {
    setIsLoading(true);
    setTimeout(() => {
      setProfiles(profiles.filter((profile) => profile.id !== id));
      setIsLoading(false);
    }, 1000);
  };

  // Handles updating a profile
  const handleEditProfile = async (updatedProfile) => {
    setIsLoading(true);
    try {
      const coordinates = await geocodeAddress(updatedProfile.address);
      // Update the profile data with new coordinates
      const profileWithCoordinates = {
        ...updatedProfile,
        coordinates,
      };
      // Replace the updated profile in the list
      setProfiles(
        profiles.map((profile) =>
          profile.id === updatedProfile.id ? profileWithCoordinates : profile
        )
      );
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Profile card component remains the same
  const ProfileCard = ({ profile }) => (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{profile.name}</CardTitle>
            <CardDescription>{profile.description}</CardDescription>
          </div>
          {isAdminMode && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditProfile(profile)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteProfile(profile.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-4 w-4" />
          <span className="text-sm">{profile.address}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{profile.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Contact Information</h4>
                <p>Email: {profile.email}</p>
                <p>Phone: {profile.phone}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Interests</h4>
                <div className="flex gap-2 flex-wrap">
                  {profile?.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setSelectedProfile(profile);
            setShowMap(true);
          }}
        >
          Show on Map
        </Button>
      </CardFooter>
    </Card>
  );
  // Handles changes in form inputs for adding a new user
  const handleOnClick = (e) => {
    const { name, value } = e.target;

    // Update the specific field dynamically based on the "name" attribute of the input
    setNewUser((prevUser) => ({
      ...prevUser,
      [name]: value, // Dynamically update the field based on the input's name attribute
    }));
  };

  // Resets the "Add User" form when the canceling
  const handleClose = () => {
    setNewUser({
      name: "",
      description: "",
      address: "",
      lat: 0,
      lng: 0,
      interests: "",
      email: "",
      phone: "",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Profile Directory</h1>
          <Button
            variant="outline"
            onClick={() => setIsAdminMode(!isAdminMode)}
          >
            {isAdminMode ? "Exit Admin Mode" : "Enter Admin Mode"}
          </Button>
        </div>

        {/* Search input for filtering profiles */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search profiles..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      {/* Display loader if data is being processed */}
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isAdminMode && (
            <Card className="flex items-center justify-center h-full cursor-pointer hover:bg-gray-50">
              {/* Add new user form in a dialog */}
              <CardContent className="flex flex-col items-center p-6">
                <Dialog onClose={handleClose}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center justify-center"
                    >
                      <Plus className="h-8 w-8" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Details</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-5">
                      <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          type="name"
                          name="name"
                          value={newUser.name}
                          onChange={handleOnClick}
                          required
                          id="name"
                          placeholder="name"
                        />
                      </div>
                      <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="description">Role</Label>
                        <Input
                          type="text"
                          name="description"
                          required
                          value={newUser.description}
                          onChange={handleOnClick}
                          id="description"
                          placeholder="Add your Role like UI/UX"
                        />
                      </div>
                      <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="address">Address</Label>
                        <Input
                          type="text"
                          name="address"
                          required
                          value={newUser.address}
                          onChange={handleOnClick}
                          id="address"
                          placeholder="Add your address"
                        />
                      </div>
                      <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          type="text"
                          name="phone"
                          required
                          value={newUser.phone}
                          onChange={handleOnClick}
                          id="phone"
                          placeholder="Phone"
                        />
                      </div>
                      <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          type="email"
                          name="email"
                          required
                          value={newUser.email}
                          onChange={handleOnClick}
                          id="email"
                          placeholder="Email"
                        />
                      </div>
                      <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="interest">Interest</Label>
                        <Input
                          type="text"
                          name="interests"
                          required
                          value={newUser.interests}
                          onChange={handleOnClick}
                          id="interest"
                          placeholder="Add interest comma separated"
                        />
                      </div>
                      <div className="flex items-center justify-around">
                        <Button
                          variant="outline"
                          onClick={() => handleAddProfile(newUser)}
                        >
                          Save
                        </Button>
                        <Button variant="destructive" onClick={handleClose}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}
          {/* Render filtered profiles */}
          {filteredProfiles.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
      )}
      {/* Show map when a profile is selected */}
      {showMap && selectedProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl">
            <MapComponent
              profile={selectedProfile}
              onClose={() => setShowMap(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
