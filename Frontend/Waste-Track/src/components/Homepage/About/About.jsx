import { motion } from "framer-motion";
import AboutWaste from "../../../assets/AboutWaste.png";

export default function About() {
  return (
    <section
      id="about"
      className="flex flex-col md:flex-row items-center justify-center gap-12 py-24 px-6 max-w-6xl mx-auto bg-white text-black"
    >
      <motion.img
        src={AboutWaste}
        alt="About Waste"
        className="w-72 h-72 md:w-[400px] md:h-[400px] object-contain drop-shadow-md"
        initial={{ opacity: 0, x: -80 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />

      <motion.div
        className="max-w-xl text-center md:text-left"
        initial={{ opacity: 0, x: 80 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          About <span className="text-green-600">Waste Track</span>
        </h2>
        <p className="text-sm md:text-base leading-relaxed text-gray-700">
          <span className="text-green-600 font-semibold">Waste Track</span> is a
          user-friendly web application designed to help individuals and
          communities manage and monitor waste-related activities. It allows
          users to record the types and amounts of waste they collect, report
          improperly disposed waste in specific locations, and view all
          activities through a Waste Timeline. This timeline provides a clear
          overview of both personal and community waste contributions.
          Additionally, the platform features a Dashboard that presents an
          overall summary of collected and reported waste data. By offering
          these tools,{" "}
          <span className="text-green-600 font-semibold">Waste Track</span>{" "}
          encourages environmental responsibility, promotes awareness, and
          supports cleaner, more sustainable communities.
        </p>
      </motion.div>
    </section>
  );
}