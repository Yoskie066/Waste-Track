import { Outlet } from "react-router-dom";
import Header from "../header/header";
import Footer from "../footer/footer";

export default function HomepageLayout() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-16">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}