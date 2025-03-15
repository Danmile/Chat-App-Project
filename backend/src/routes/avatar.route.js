import express from "express";
import Avatar from "../models/avatars.model.js";
const router = express.Router();

router.get("/getavatars", async (req, res) => {
  try {
    const avatars = await Avatar.find();
    res.status(200).json({ avatars });
  } catch (error) {
    console.log("Error in get avatars: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/postavatars", async (req, res) => {
  try {
    const { avatarImg } = req.body;
    const newAvatar = new Avatar({
      avatarImg,
    });
    await newAvatar.save();
    res.status(201).send(newAvatar);
  } catch (error) {
    console.log("Error in post avatars: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});
export default router;
