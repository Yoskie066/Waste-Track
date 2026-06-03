import React, { useEffect, useState, useRef, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRecycle, FaExclamationTriangle, FaEllipsisV, FaEdit, FaTrashAlt } from 'react-icons/fa';
import { format } from 'date-fns';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import api from '../../../services/api';
import { toast } from 'react-toastify';

Modal.setAppElement('#root');

const WasteTimeline = () => {
  const navigate = useNavigate();
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, type: null });
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRef = useRef(null);

  // Robust date parser for display only (no sorting needed)
  const parseEventDate = (dateValue) => {
    if (!dateValue) return new Date(0);
    let dateObj = new Date(dateValue);
    if (!isNaN(dateObj.getTime())) return dateObj;
    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      const [year, month, day] = dateValue.split('-').map(Number);
      dateObj = new Date(year, month - 1, day);
      if (!isNaN(dateObj.getTime())) return dateObj;
    }
    const parts = dateValue.split(/[-T:]/);
    if (parts.length >= 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        return new Date(year, month, day);
      }
    }
    return new Date(0);
  };

  // Fetch data from API
  const fetchTimeline = async () => {
    try {
      const response = await api.get('/waste-timeline');
      if (response.data.success) {
        setTimeline(response.data.data);
      } else {
        toast.error('Failed to load timeline');
      }
    } catch (error) {
      console.error('Timeline fetch error:', error);
      if (error.response?.status === 403 || error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('accessToken');
        navigate('/login');
      } else {
        toast.error('Error loading timeline');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUpdate = (item) => {
    setOpenDropdownId(null);
    if (item.type === 'collect') {
      navigate(`/collect-waste?editId=${item.original_id}`);
    } else {
      navigate(`/report-waste?editId=${item.original_id}`);
    }
  };

  const handleDeleteClick = (id, type) => {
    setOpenDropdownId(null);
    setDeleteModal({ isOpen: true, id, type });
  };

  const confirmDelete = async () => {
    const { id, type } = deleteModal;
    if (!id) return;

    try {
      let response;
      if (type === 'collect') {
        response = await api.delete(`/collect-waste/${id}`);
      } else {
        response = await api.delete(`/report-waste/${id}`);
      }

      if (response.data.success) {
        toast.success(`${type === 'collect' ? 'Collection' : 'Report'} deleted successfully`);
        fetchTimeline();
      } else {
        toast.error(response.data.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete entry');
    } finally {
      setDeleteModal({ isOpen: false, id: null, type: null });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
        <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto pt-6 md:pt-10">
        <motion.h1
          className="text-3xl md:text-4xl font-bold text-center text-green-700 mb-2"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          My Waste Timeline
        </motion.h1>
        <motion.p
          className="text-center text-gray-600 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Every contribution matters — track your waste journey
        </motion.p>

        {timeline.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/60 backdrop-blur-sm rounded-2xl p-12 text-center shadow-lg"
          >
            <div className="text-6xl mb-4">🌱</div>
            <p className="text-gray-600 text-lg">
              No entries yet. Start by collecting or reporting waste.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {timeline.map((item, idx) => {
              const dropdownKey = `${item.type}-${item.id}`;
              const isOpen = openDropdownId === dropdownKey;

              return (
                <motion.div
                  key={dropdownKey}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                  whileHover={{ scale: 1.01 }}
                  className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden border border-white/40 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-56 h-56 md:h-auto bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                      {item.photo_url ? (
                        <img
                          src={item.photo_url}
                          alt={item.waste_name}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {item.type === 'collect' ? (
                            <FaRecycle className="text-green-600 text-6xl opacity-80" />
                          ) : (
                            <FaExclamationTriangle className="text-yellow-600 text-6xl opacity-80" />
                          )}
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        {item.type === 'collect' ? (
                          <span className="bg-green-600/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md backdrop-blur-sm">
                            <FaRecycle size={12} /> Collected
                          </span>
                        ) : (
                          <span className="bg-red-600/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md backdrop-blur-sm">
                            <FaExclamationTriangle size={12} /> Reported
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 p-6 relative">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-gray-800 mb-2">
                            {item.waste_name}
                          </h3>
                          <p className="text-gray-600 leading-relaxed">
                            {item.description || 'No description provided.'}
                          </p>
                          <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
                            <span>📅</span>
                            <span>
                              {item.event_date
                                ? format(parseEventDate(item.event_date), 'PPP')
                                : 'Date not available'}
                            </span>
                          </div>
                        </div>

                        <div
                          className="relative flex-shrink-0"
                          ref={isOpen ? dropdownRef : null}
                        >
                          <button
                            onClick={() =>
                              setOpenDropdownId(isOpen ? null : dropdownKey)
                            }
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 text-gray-600 focus:outline-none"
                            aria-label="Actions"
                          >
                            <FaEllipsisV size={20} />
                          </button>

                          <AnimatePresence>
                            {isOpen && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                transition={{ duration: 0.1 }}
                                className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden"
                              >
                                <button
                                  onClick={() => handleUpdate(item)}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-green-50 transition-colors duration-150"
                                >
                                  <FaEdit size={16} className="text-blue-500" />
                                  <span className="text-sm font-medium">Update</span>
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteClick(item.original_id, item.type)
                                  }
                                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-red-50 transition-colors duration-150 border-t border-gray-100"
                                >
                                  <FaTrashAlt size={14} className="text-red-500" />
                                  <span className="text-sm font-medium">Delete</span>
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        isOpen={deleteModal.isOpen}
        onRequestClose={() =>
          setDeleteModal({ isOpen: false, id: null, type: null })
        }
        className="bg-white rounded-2xl shadow-2xl max-w-md mx-auto p-6 outline-none"
        overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Confirm Delete
          </h2>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete this{' '}
            {deleteModal.type === 'collect' ? 'collection' : 'report'}? This
            action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() =>
                setDeleteModal({ isOpen: false, id: null, type: null })
              }
              className="px-5 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-medium"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-5 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium shadow-md"
            >
              Delete
            </button>
          </div>
        </motion.div>
      </Modal>
    </div>
  );
};

export default WasteTimeline;