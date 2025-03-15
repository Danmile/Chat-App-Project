import mongoose from "mongoose";

const avatarSchema = new mongoose.Schema({
  avatarImg: {
    type: String,
  },
});

const Avatar = mongoose.model("Avatar", avatarSchema);

export default Avatar;
