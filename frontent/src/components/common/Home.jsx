import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import Hero from "../home/Hero";
import HowItWorks from "../home/HowItWorks";
import WhyItWorks from "../home/WhyItWorks";
import Pricing from "../home/Pricing";
import WhoIsFor from "../home/WhoIsFor";
import Testimonials from "../home/Testimonials";
import FAQ from "../home/FAQ";
import FinalCTA from "../home/FinalCTA";
import Footer from "../home/Footer";
import Features from "../home/HomeFeatures";

export const goToLogin = () => navigate("/login");
export default function Home() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";





  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <WhyItWorks />
      <Pricing />
      <WhoIsFor />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      {/* <Footer/> */}
    </>
  );
}
