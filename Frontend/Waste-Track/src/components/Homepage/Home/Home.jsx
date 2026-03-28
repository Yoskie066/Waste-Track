import { motion } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";
import { useNavigate } from "react-router-dom";

export default function Home({ scrollToAbout }) {
  const navigate = useNavigate();

  return (
    <section
      id="home"
      className="flex flex-col items-center justify-center min-h-screen px-6 py-20 text-center pt-24 bg-gradient-to-br from-green-200 via-white to-green-200"
    >
      <motion.h1
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-green-600"
      >
        Smarter Solutions for Sustainable Waste
      </motion.h1>

      <motion.h2
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
        className="mt-6 text-xl sm:text-2xl md:text-3xl font-semibold text-black"
      >
        Streamlining Waste Actions:&nbsp;
        <span className="text-green-600">
          <Typewriter
            words={[
              "Waste Dashboard",
              "Collect Waste",
              "Report Waste",
              "Waste Timeline",
            ]}
            loop={0}
            cursor
            cursorStyle="_"
            typeSpeed={80}
            deleteSpeed={60}
            delaySpeed={1000}
          />
        </span>
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
        className="mt-6 max-w-2xl text-base sm:text-lg md:text-xl text-black"
      >
        Waste Track empowers communities and organizations with tools to track,
        manage, and enhance their waste collection and recycling efforts.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
        className="mt-10 flex flex-wrap justify-center gap-4"
      >
        <button
          onClick={() => navigate("/login")}
          className="bg-green-600 text-white px-5 py-2.5 rounded-md text-sm sm:text-base font-medium hover:bg-yellow-400 hover:text-black transition duration-300 shadow-md hover:shadow-lg"
        >
          Get Started
        </button>
        <button
          onClick={scrollToAbout}
          className="bg-white text-green-600 border border-green-600 px-5 py-2.5 sm:px-6 sm:py-3 rounded-md text-sm sm:text-base font-medium hover:bg-green-50 transition duration-300 shadow-md hover:shadow-lg"
        >
          Learn More
        </button>
      </motion.div>
    </section>
  );
}