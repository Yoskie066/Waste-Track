import React from "react";
import Home from "../Home/Home";
import About from "../About/About";
import Services from "../Services/Services";
import ContactUs from "../Contact-Us/ContactUs";

export default function LandingPage() {
  const scrollToAbout = () => {
    const aboutSection = document.getElementById("about");
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <section id="home">
        <Home scrollToAbout={scrollToAbout} />
      </section>
      <section id="about">
        <About />
      </section>
      <section id="services">
        <Services />
      </section>
      <section id="contact-us">
        <ContactUs />
      </section>
    </>
  );
}