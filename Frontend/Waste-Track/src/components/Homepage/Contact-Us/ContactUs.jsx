import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Modal from "react-modal";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import emailjs from "@emailjs/browser";
import ContactImg from "../../../assets/Contact-Us.png";

export default function ContactUs() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    // Set app element once when component mounts
    Modal.setAppElement("body");
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { name, email, message } = formData;

    if (name && email && message) {
      const serviceID = "service_hjeoj7r";
      const templateID = "template_oqdpwqs";
      const publicKey = "cvuKtXJ5BhrX8FxVN";

      const templateParams = { name, email, message };

      emailjs
        .send(serviceID, templateID, templateParams, publicKey)
        .then(() => {
          setStatus("success");
          setFormData({ name: "", email: "", message: "" });
        })
        .catch((error) => {
          console.error("Email send error:", error);
          setStatus("error");
        })
        .finally(() => {
          setModalIsOpen(true);
          setTimeout(() => {
            setModalIsOpen(false);
            setStatus(null);
          }, 3000);
        });
    } else {
      setStatus("error");
      setModalIsOpen(true);
      setTimeout(() => {
        setModalIsOpen(false);
        setStatus(null);
      }, 3000);
    }
  };

  return (
    <section id="contact" className="py-24 px-6 max-w-6xl mx-auto bg-white text-black">
      <motion.h2
        className="text-4xl font-bold text-center mb-4 text-green-600"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.0, ease: "easeOut" }}
      >
        Get in Touch
      </motion.h2>

      <motion.p
        className="text-center max-w-2xl mx-auto text-base md:text-lg text-gray-600 mb-12"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ delay: 0.3, duration: 1.0, ease: "easeOut" }}
      >
        We’d love to hear from you! Whether you have a question, concern, or feedback,
        feel free to send us a message.
      </motion.p>

      <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-12">
        <motion.form
          onSubmit={handleSubmit}
          className="w-full md:w-1/2 space-y-5"
          initial={{ opacity: 0, x: -80 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: 0.4, duration: 1.2, ease: "easeOut" }}
        >
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-lg text-sm md:text-base focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition"
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-lg text-sm md:text-base focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition"
          />
          <textarea
            name="message"
            placeholder="Your Message"
            rows={5}
            value={formData.message}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-lg text-sm md:text-base resize-none focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition"
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-5 py-2.5 rounded-md text-sm sm:text-base font-medium hover:bg-yellow-400 hover:text-black transition duration-300 shadow-md hover:shadow-lg w-full md:w-auto"
          >
            Send Message
          </button>
        </motion.form>

        <motion.img
          src={ContactImg}
          alt="Contact Us"
          className="w-full md:w-1/2 max-w-sm md:max-w-md object-contain drop-shadow-md"
          initial={{ opacity: 0, x: 80 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: 0.4, duration: 1.2, ease: "easeOut" }}
        />
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Contact Form Status"
        className="bg-white w-11/12 max-w-md mx-auto p-6 rounded-lg shadow-xl outline-none flex flex-col items-center text-center"
        overlayClassName="fixed inset-0 backdrop-blur-md bg-transparent flex justify-center items-center z-50"
      >
        <div className="text-6xl mb-4">
          {status === "success" ? (
            <FaCheckCircle className="text-green-600" />
          ) : (
            <FaTimesCircle className="text-red-600" />
          )}
        </div>
        <h2
          className={`text-lg font-semibold ${
            status === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {status === "success"
            ? "Message sent successfully!"
            : "Please fill in all fields."}
        </h2>
      </Modal>
    </section>
  );
}