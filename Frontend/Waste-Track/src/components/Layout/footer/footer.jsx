import { Link } from "react-router-dom";

export default function Footer() {
  const navLinks = [
    { name: "Home", path: "/home" },
    { name: "About", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Contact Us", path: "/contact-us" },
  ];

  return (
    <footer className="bg-white/80 backdrop-blur-md text-gray-700 text-center py-6 mt-10 shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center gap-4 mb-4">
          {navLinks.map(({ name, path }) => (
            <Link
              key={name}
              to={path}
              className="hover:text-green-600 transition"
            >
              {name}
            </Link>
          ))}
        </div>
        <p className="text-sm">
          &copy; {new Date().getFullYear()} WasteTrack. All rights reserved.
        </p>
      </div>
    </footer>
  );
}