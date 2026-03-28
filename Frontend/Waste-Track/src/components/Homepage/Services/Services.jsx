import { motion } from "framer-motion";
import { LayoutDashboard, Trash2, Flag, CalendarClock } from "lucide-react";

const cardVariants = {
  hidden: { rotateY: 90, opacity: 0 },
  visible: {
    rotateY: 0,
    opacity: 1,
    transition: {
      duration: 1.2,
      ease: "easeInOut",
    },
  },
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.4,
      delayChildren: 0.3,
    },
  },
};

export default function Services() {
  const features = [
    {
      title: "Waste Dashboard",
      desc: "Get an overview of your waste activities, including reports, collection stats, and user engagement metrics.",
      icon: <LayoutDashboard size={28} className="text-green-600" />,
    },
    {
      title: "Collect Waste",
      desc: "Track the quantity and types of waste collected to ensure proper documentation and encourage sustainable practices.",
      icon: <Trash2 size={28} className="text-green-600" />,
    },
    {
      title: "Report Waste",
      desc: "Report uncollected or improperly disposed waste with photos and descriptions to assist in cleanup efforts.",
      icon: <Flag size={28} className="text-green-600" />,
    },
    {
      title: "Waste Timeline",
      desc: "Review a visual timeline of all waste-related activities to observe progress and identify trends over time.",
      icon: <CalendarClock size={28} className="text-green-600" />,
    },
  ];

  return (
    <section
      id="services"
      className="px-6 pt-32 pb-24 bg-gradient-to-br from-green-200 via-white to-green-200 text-gray-800"
    >
      <motion.h2
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.0, ease: "easeOut" }}
        className="text-3xl sm:text-4xl font-bold text-green-600 text-center mb-4"
      >
        Explore Our Core Features
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.0, delay: 0.3, ease: "easeOut" }}
        className="text-base sm:text-lg text-black text-center max-w-3xl mx-auto mb-12"
      >
        Our system empowers users to take part in sustainable waste management.
        From monitoring waste collection to reporting and analyzing trends,
        every feature is designed to make a difference in your community.
      </motion.p>

      <motion.div
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            className="bg-white rounded-xl shadow-lg p-6 border border-green-100 hover:border-green-300 hover:shadow-2xl transition-all duration-300"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 rounded-lg">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-green-700">
                {feature.title}
              </h3>
            </div>
            <p className="text-sm text-gray-600">{feature.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}