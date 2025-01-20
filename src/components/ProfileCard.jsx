import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin, Edit2, Trash2, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { geocodeAddress } from "../utils/geoLocationHelper";

const ProfileCard = ({
  profile,
  setIsLoading,
  setProfiles,
  isAdminMode,
  setSelectedProfile,
  setShowMap,
  profiles,
}) => {
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

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex space-x-4 items-center">
            <User className="w-10 h-10 rounded-full bg-gray-200"></User>
            <div className="space-y-2">
              <CardTitle>{profile.name}</CardTitle>
              <CardDescription>{profile.description}</CardDescription>
            </div>
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
};

export default ProfileCard;
