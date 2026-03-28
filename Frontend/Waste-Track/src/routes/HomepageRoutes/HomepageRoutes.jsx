import { Routes, Route } from "react-router-dom";
import HomepageLayout from "../../components/Layout/layout/layout";
import LandingPage from "../../components/Homepage/LandingPage/LandingPage";
import Home from "../../components/Homepage/Home/Home";
import About from "../../components/Homepage/About/About";
import Services from "../../components/Homepage/Services/Services";
import ContactUs from "../../components/Homepage/Contact-Us/ContactUs";

function HomepageRoutes() {
  return (
    <Routes>
      <Route element={<HomepageLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact-us" element={<ContactUs />} />
      </Route>
    </Routes>
  );
}

export default HomepageRoutes;