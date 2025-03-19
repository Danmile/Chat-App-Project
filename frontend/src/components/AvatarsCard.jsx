import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const AvatarsCard = ({ setShowAvatars, showAvatars }) => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const { avatars, getAvatars } = useAuthStore();

  const handleImageUpload = async (image) => {
    try {
      console.log(avatars);
      console.log("Updating profile with:", image);
      await updateProfile({ profilePic: image });
      setShowAvatars(false); // Close the modal after updating
    } catch (error) {
      console.error("Error updating profile picture:", error);
    }
  };
  return (
    <div className="flex justify-center items-center">
      <div className="bg-white shadow-lg rounded-xl w-64 p-4">
        <div className="flex justify-end pb-2">
          <button
            onClick={() => {
              setShowAvatars(false);
            }}
          >
            <X />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {avatars.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Avatar ${index}`}
              className="w-16 h-16 p-1 rounded-full cursor-pointer border-2 border-gray-300"
              onClick={() => handleImageUpload(image)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AvatarsCard;
