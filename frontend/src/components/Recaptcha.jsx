import React from "react";
const siteKey = import.meta.env.VITE_SITE_KEY;
import { useAuthStore } from "../store/useAuthStore";
import ReCAPTCHA from "react-google-recaptcha";

const Recaptcha = () => {
  const { setCaptcha } = useAuthStore();
  return (
    <ReCAPTCHA sitekey={siteKey} onChange={(value) => setCaptcha(value)} />
  );
};

export default Recaptcha;
