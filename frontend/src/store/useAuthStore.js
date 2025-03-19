import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/";

import { io } from "socket.io-client";
export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigninUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  onlineUsers: [],
  socket: null,
  captchaValue: null,
  isResetPasswod: false,
  avatars: [],

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  signup: async (data) => {
    set({ isSigninUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      toast.success("Account created succesfully");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigninUp: false });
    }
  },
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },
  sendResetEmail: async (email) => {
    set({ isResetPasswod: true });
    try {
      await axiosInstance.post("/auth/forgot-password", email);
      toast.success("Reset Email sent!");
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isResetPasswod: false });
    }
  },
  resetPassword: async (password, token) => {
    set({ isResetPasswod: true });
    try {
      const res = await axiosInstance.post(
        `/auth/reset-password/${token}`,
        password
      );
      toast.success("Password Changed");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    } finally {
      set({ isResetPasswod: false });
    }
  },
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;
    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();
    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket?.disconnect();
  },
  setCaptcha: (value) => {
    set({ captchaValue: value });
    // console.log(captchaValue);
  },
  removeCaptcha: () => {
    if (get().captchaValue) set({ captchaValue: null });
    // console.log(captchaValue);
  },
  getAvatars: async () => {
    try {
      const res = await axiosInstance.get("/avatars/getavatars");
      const avatarImages = res.data.avatars?.map((avatar) => avatar.avatarImg);

      set({ avatars: avatarImages });
    } catch (error) {
      console.log("error in get avatars:", error);
      toast.error(error.response.data.message);
    }
  },
}));
