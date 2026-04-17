import React, { Fragment, useRef, useState, useEffect, useMemo } from "react";
import {
  Image as ImageIcon,
  ChevronDown,
  Check,
  CalendarDays,
  Loader2,
} from "lucide-react";
import { Listbox, Transition } from "@headlessui/react";
import { motion } from "framer-motion";
import DatePicker from "react-datepicker";
import Modal from "react-modal";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import debounce from "lodash.debounce";
import { fetchLocationSuggestions } from "../../../services/locationApi";
import "react-datepicker/dist/react-datepicker.css";
import api from "../../../services/api";

Modal.setAppElement("#root");

const categoryData = {
  Biodegradable: [
    "Food Waste",
    "Garden Waste",
    "Paper Products",
    "Wood & Natural Fibers",
    "Biodegradable Packaging",
    "Other Organic Waste",
  ],
  "Non Biodegradable": [
    "Plastic",
    "Metals",
    "Glass",
    "E-Waste",
    "Synthetic Fibers",
    "Rubber",
    "Chemical",
    "Construction Waste",
  ],
  Recycle: [
    "Paper & Cardboard",
    "Metals",
    "Textiles",
    "Electronics",
    "Batteries",
  ],
};

const ReportWaste = () => {
  const [editId, setEditId] = useState(null);
  const [wasteName, setWasteName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [colorInput, setColorInput] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [locationResults, setLocationResults] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState(null);
  const [modalMessage, setModalMessage] = useState("");

  const fileInputRef = useRef(null);
  const datePickerRef = useRef(null);

  useEffect(() => {
    const editItem = JSON.parse(localStorage.getItem("editReportedWaste"));
    if (editItem) {
      setWasteName(editItem.wasteName);
      setSelectedCategory(editItem.selectedCategory);
      setSubCategory(editItem.subCategory);
      setColorInput(editItem.colorInput);
      setLocationQuery(editItem.locationQuery);
      setSelectedDate(new Date(editItem.dateReported));
      setDescription(editItem.description);
      setImagePreview(editItem.imageUrl);
      setEditId(editItem.id);
      localStorage.removeItem("editReportedWaste");
    }
  }, []);

  const debouncedLocationFetch = useMemo(
    () =>
      debounce(async (query) => {
        const results = await fetchLocationSuggestions(query);
        setLocationResults(results);
      }, 300),
    []
  );

  const handleImageClick = () => fileInputRef.current?.click();
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleLocationChange = (e) => {
    const query = e.target.value;
    setLocationQuery(query);
    if (query.length > 2) debouncedLocationFetch(query);
    else setLocationResults([]);
  };

  const handleLocationSelect = (place) => {
    setLocationQuery(place.display_name);
    setLocationResults([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !wasteName ||
      !selectedCategory ||
      !subCategory ||
      !colorInput ||
      !locationQuery ||
      !description ||
      !selectedDate
    ) {
      setModalStatus("error");
      setModalMessage("Please fill in all required fields.");
      setModalIsOpen(true);
      setTimeout(() => setModalIsOpen(false), 3000);
      return;
    }
    if (!editId && !imageFile) {
      setModalStatus("error");
      setModalMessage("Please select an image.");
      setModalIsOpen(true);
      setTimeout(() => setModalIsOpen(false), 3000);
      return;
    }

    const formData = new FormData();
    formData.append("wasteName", wasteName);
    formData.append("category", selectedCategory);
    formData.append("subCategory", subCategory);
    formData.append("color", colorInput);
    formData.append("location", locationQuery);
    formData.append("dateReported", selectedDate.toISOString().split("T")[0]);
    formData.append("description", description);
    if (imageFile) formData.append("image", imageFile);

    setIsUploading(true);
    try {
      let response;
      if (editId) {
        response = await api.put(`/report-waste/${editId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await api.post("/report-waste", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      if (response.data.success) {
        setModalStatus("success");
        setModalMessage(
          editId ? "Report updated successfully!" : "Waste reported successfully!"
        );
        setModalIsOpen(true);
        // Reset form
        setWasteName("");
        setSelectedCategory("");
        setSubCategory("");
        setColorInput("");
        setLocationQuery("");
        setSelectedDate(new Date());
        setDescription("");
        setImageFile(null);
        setImagePreview(null);
        setEditId(null);
        setTimeout(() => {
          setModalIsOpen(false);
          window.location.href = "/waste-timeline";
        }, 2000);
      } else {
        throw new Error(response.data.message || "Submission failed");
      }
    } catch (error) {
      console.error("Submit error:", error);
      setModalStatus("error");
      setModalMessage(
        error.response?.data?.message || "Failed to submit report. Please try again."
      );
      setModalIsOpen(true);
      setTimeout(() => setModalIsOpen(false), 3000);
    } finally {
      setIsUploading(false);
    }
  };

  // Modern input style
  const inputStyle =
    "w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm";
  const dropdownStyle =
    "relative w-full cursor-pointer rounded-xl border border-gray-300 bg-white/80 backdrop-blur-sm py-3 pl-4 pr-10 text-left text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500";

  const renderDropdown = (options, selected, setSelected, placeholder) => (
    <Listbox value={selected} onChange={setSelected}>
      <div className="relative">
        <Listbox.Button className={dropdownStyle}>
          <span className="block truncate">
            {selected || <span className="text-gray-400">{placeholder}</span>}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ChevronDown className="h-5 w-5 text-gray-500" />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-xl bg-white py-2 text-base shadow-lg ring-1 ring-black/5 focus:outline-none">
            {options.map((item, idx) => (
              <Listbox.Option
                key={idx}
                value={item}
                className={({ active }) =>
                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                    active ? "bg-green-100 text-green-900" : "text-gray-900"
                  }`
                }
              >
                {({ selected }) => (
                  <>
                    <span
                      className={`block truncate ${
                        selected ? "font-medium" : "font-normal"
                      }`}
                    >
                      {item}
                    </span>
                    {selected && (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-green-600">
                        <Check className="h-5 w-5" />
                      </span>
                    )}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl bg-white/70 backdrop-blur-lg rounded-2xl shadow-2xl p-6 md:p-8 border border-white/30"
      >
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center text-green-700 mb-2"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          Report Waste
        </motion.h2>
        <p className="text-center text-gray-600 mb-6">
          Help us keep the environment clean by reporting waste you find.
        </p>

        <motion.form
          className="space-y-5"
          onSubmit={handleSubmit}
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
          }}
        >
          <motion.div variants={{ hidden: { x: -20 }, visible: { x: 0 } }}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Waste Name
            </label>
            <input
              type="text"
              value={wasteName}
              onChange={(e) => setWasteName(e.target.value)}
              placeholder="e.g., Plastic Bottle"
              className={inputStyle}
              required
            />
          </motion.div>

          <motion.div variants={{ hidden: { x: -20 }, visible: { x: 0 } }}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Type
            </label>
            {renderDropdown(
              Object.keys(categoryData),
              selectedCategory,
              setSelectedCategory,
              "Select Category"
            )}
          </motion.div>

          {selectedCategory && (
            <motion.div
              variants={{ hidden: { x: -20 }, visible: { x: 0 } }}
              initial="hidden"
              animate="visible"
            >
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sub Category
              </label>
              {renderDropdown(
                categoryData[selectedCategory],
                subCategory,
                setSubCategory,
                "Select Sub-Category"
              )}
            </motion.div>
          )}

          <motion.div variants={{ hidden: { x: -20 }, visible: { x: 0 } }}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <input
              type="text"
              value={colorInput}
              onChange={(e) => setColorInput(e.target.value)}
              placeholder="e.g., Blue, Green, Mixed"
              className={inputStyle}
              required
            />
          </motion.div>

          <motion.div variants={{ hidden: { x: -20 }, visible: { x: 0 } }}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={locationQuery}
              onChange={handleLocationChange}
              placeholder="Start typing address..."
              className={inputStyle}
              autoComplete="off"
              required
            />
            {locationResults.length > 0 && (
              <ul className="bg-white/90 backdrop-blur-sm border border-gray-200 mt-2 max-h-48 overflow-y-auto rounded-xl shadow-lg text-sm">
                {locationResults.map((place, index) => (
                  <li
                    key={index}
                    onClick={() => handleLocationSelect(place)}
                    className="p-3 hover:bg-green-50 cursor-pointer transition-colors"
                  >
                    {place.display_name}
                  </li>
                ))}
              </ul>
            )}
          </motion.div>

          <motion.div variants={{ hidden: { x: -20 }, visible: { x: 0 } }}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Reported
            </label>
            <div className="relative w-full">
              <DatePicker
                ref={datePickerRef}
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                className={`${inputStyle} pr-12`}
                dateFormat="yyyy-MM-dd"
                placeholderText="Select a date"
                required
              />
              <CalendarDays
                className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600 cursor-pointer hover:text-green-700"
                onClick={() => datePickerRef.current.setFocus()}
              />
            </div>
          </motion.div>

          <motion.div variants={{ hidden: { x: -20 }, visible: { x: 0 } }}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              placeholder="Describe the waste (e.g., quantity, condition, exact location)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className={inputStyle}
              required
            />
          </motion.div>

          <motion.div variants={{ hidden: { x: -20 }, visible: { x: 0 } }}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Photo
            </label>
            <div
              className="w-full h-48 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-green-500 transition-colors bg-gray-50/50"
              onClick={handleImageClick}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="text-center">
                  <ImageIcon className="w-12 h-12 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Click to upload image</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            <p className="text-xs text-gray-500 mt-1">
              {editId
                ? "Leave empty to keep current image"
                : "Image required (max 5MB)"}
            </p>
          </motion.div>

          <motion.div
            variants={{ hidden: { y: 20 }, visible: { y: 0 } }}
            className="text-center pt-2"
          >
            <button
              type="submit"
              disabled={isUploading}
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl shadow-md hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              {isUploading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Submitting...
                </>
              ) : editId ? (
                "Update Report"
              ) : (
                "Report Waste"
              )}
            </button>
          </motion.div>
        </motion.form>
      </motion.div>

      {/* Modern Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Waste Report Status"
        className="bg-white rounded-2xl shadow-2xl max-w-md mx-auto p-6 outline-none"
        overlayClassName="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50"
      >
        <div className="text-center">
          <div className="text-6xl mb-4">
            {modalStatus === "success" ? (
              <FaCheckCircle className="text-green-500 mx-auto" />
            ) : (
              <FaTimesCircle className="text-red-500 mx-auto" />
            )}
          </div>
          <h2
            className={`text-2xl font-semibold ${
              modalStatus === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {modalMessage}
          </h2>
          <button
            onClick={() => setModalIsOpen(false)}
            className="mt-6 px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ReportWaste;