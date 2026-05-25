import { useState, useEffect, Fragment, useCallback, useRef } from "react";
import Modal from "react-modal";
import { MoreVertical, Trash2, Filter, Download, Loader2, ChevronDown, Check, Search } from "lucide-react";
import { Listbox, Transition } from "@headlessui/react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { motion } from "framer-motion";
import adminApi from "../../../services/adminApi";

Modal.setAppElement("#root");

const months = [
  { value: "all", label: "All Months" },
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export default function UserManagement() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionDropdown, setActionDropdown] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [recordRoleToDelete, setRecordRoleToDelete] = useState(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState("success");
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [sortOrder, setSortOrder] = useState("DESC");

  const [yearOptions, setYearOptions] = useState(["all"]);
  const [loadingYears, setLoadingYears] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const pollingRef = useRef(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch distinct years
  useEffect(() => {
    const fetchYears = async () => {
      setLoadingYears(true);
      try {
        const response = await adminApi.get("/users/years");
        if (response.data.success) {
          setYearOptions(["all", ...response.data.data]);
        }
      } catch (error) {
        console.error("Failed to fetch years:", error);
        setYearOptions(["all"]);
      } finally {
        setLoadingYears(false);
      }
    };
    fetchYears();
  }, []);

  // Fetch records function (reusable)
  const fetchRecords = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        search: debouncedSearch,
        role: selectedRole,
        status: selectedStatus,
        month: selectedMonth,
        year: selectedYear,
        sortBy: "created_at",
        sortOrder,
      };
      const response = await adminApi.get("/users", { params });
      if (response.data.success) {
        setRecords(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        showFeedback("error", response.data.message || "Failed to fetch data");
      }
    } catch (error) {
      console.error(error);
      showFeedback("error", error.response?.data?.message || "Error fetching users");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [currentPage, debouncedSearch, selectedRole, selectedStatus, selectedMonth, selectedYear, sortOrder]);

  // Initial fetch + auto-polling every 10 seconds
  useEffect(() => {
    // Initial load
    fetchRecords(true);

    // Start polling – silently refresh every 10 seconds (no loading indicator)
    pollingRef.current = setInterval(() => {
      fetchRecords(false); // false = do not show loading spinner
    }, 10000);

    // Cleanup on unmount
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fetchRecords]);

  const showFeedback = (type, message) => {
    setFeedbackType(type);
    setFeedbackMessage(message);
    setFeedbackModalOpen(true);
    setTimeout(() => setFeedbackModalOpen(false), 3000);
  };

  const handleDelete = async () => {
    try {
      const response = await adminApi.delete(`/users/${recordToDelete}`, {
        data: { role: recordRoleToDelete }
      });
      if (response.data.success) {
        showFeedback("success", `${recordRoleToDelete === 'user' ? 'User' : 'Admin'} deleted successfully`);
        fetchRecords(true);
      } else {
        showFeedback("error", response.data.message || "Delete failed");
      }
    } catch (error) {
      showFeedback("error", error.response?.data?.message || "Error deleting record");
    }
    setDeleteModalOpen(false);
    setRecordToDelete(null);
    setRecordRoleToDelete(null);
    setActionDropdown(null);
  };

  const handleExport = async () => {
    try {
      const params = {
        search: debouncedSearch,
        role: selectedRole,
        status: selectedStatus,
        month: selectedMonth,
        year: selectedYear,
        sortBy: "created_at",
        sortOrder,
      };
      const response = await adminApi.get("/users/export", {
        params,
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "user_management_export.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showFeedback("success", "Export successful");
    } catch (error) {
      showFeedback("error", "Export failed");
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedRole("all");
    setSelectedStatus("all");
    setSelectedMonth("all");
    setSelectedYear("all");
    setSortOrder("DESC");
    setCurrentPage(1);
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleString();

  const inputStyle = "w-full border border-gray-300 rounded-xl px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white/80";
  const dropdownStyle = "relative w-full cursor-pointer rounded-xl border border-gray-300 bg-white/80 py-2 pl-4 pr-10 text-left text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500";

  const renderDropdown = (options, selected, setSelected, placeholder, displayMapper = null) => (
    <Listbox value={selected} onChange={setSelected}>
      <div className="relative">
        <Listbox.Button className={dropdownStyle}>
          <span className="block truncate">
            {selected !== "all" && selected 
              ? (displayMapper ? displayMapper(selected) : selected) 
              : <span className="text-gray-400">{placeholder}</span>}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ChevronDown className="h-5 w-5 text-gray-500" />
          </span>
        </Listbox.Button>
        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
          <Listbox.Options className="absolute z-20 mt-2 max-h-60 w-full overflow-auto rounded-xl bg-white py-2 text-base shadow-lg ring-1 ring-black/5 focus:outline-none">
            {options.map((item, idx) => {
              const displayValue = typeof item === 'object' ? item.label : item;
              const actualValue = typeof item === 'object' ? item.value : item;
              return (
                <Listbox.Option key={idx} value={actualValue} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? "bg-green-100 text-green-900" : "text-gray-900"}`}>
                  {({ selected: isSelected }) => (
                    <>
                      <span className={`block truncate ${isSelected ? "font-medium" : "font-normal"}`}>{displayValue}</span>
                      {isSelected && <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-green-600"><Check className="h-5 w-5" /></span>}
                    </>
                  )}
                </Listbox.Option>
              );
            })}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );

  const roleOptions = [
    { value: "all", label: "All Roles" },
    { value: "user", label: "User" },
    { value: "admin", label: "Admin" },
  ];
  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "online", label: "Online" },
    { value: "offline", label: "Offline" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
      <div className="w-full max-w-7xl bg-white/70 backdrop-blur-lg rounded-2xl shadow-2xl p-6 md:p-8 border border-white/30">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-green-700 mb-2">
            User Management
          </h1>
          <p className="text-gray-600">
            Manage all registered users and administrators – status updates every 10 seconds
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
            <button
              onClick={handleExport}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-xl shadow-md hover:from-green-700 hover:to-emerald-700 transition-all"
            >
              <Download className="w-4 h-4" /> Export Excel
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-xl shadow-md hover:from-green-700 hover:to-emerald-700 transition-all"
            >
              <Filter className="w-4 h-4" /> {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Auto‑refreshes every 10 seconds for real‑time status</p>
        </div>

        {/* Search and Filters */}
        {showFilters && (
          <div className="bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl p-4 mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={inputStyle + " pl-10"}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              {renderDropdown(roleOptions, selectedRole, setSelectedRole, "Select Role")}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              {renderDropdown(statusOptions, selectedStatus, setSelectedStatus, "Select Status")}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              {renderDropdown(months, selectedMonth, setSelectedMonth, "Select Month", (val) => {
                const month = months.find(m => m.value === val);
                return month ? month.label : val;
              })}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              {loadingYears ? (
                <div className={inputStyle + " text-gray-400"}>Loading years...</div>
              ) : (
                renderDropdown(yearOptions, selectedYear, setSelectedYear, "Select Year")
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort by Date</label>
              {renderDropdown(
                ["Most Recent", "Oldest First"],
                sortOrder === "DESC" ? "Most Recent" : "Oldest First",
                (val) => setSortOrder(val === "Most Recent" ? "DESC" : "ASC"),
                "Select Order"
              )}
            </div>
            <div className="md:col-span-2 lg:col-span-4 flex justify-end">
              <button onClick={resetFilters} className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl px-5 py-2 text-sm hover:from-green-700 hover:to-emerald-700 transition">
                Reset Filters
              </button>
            </div>
          </div>
        )}

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto rounded-xl bg-white/50 shadow-md">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-gradient-to-r from-green-600 to-emerald-600 text-white uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Created At</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={`${record.role}-${record.id}`} className="border-b border-gray-200 hover:bg-green-50">
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600">{record.email}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${record.role === 'user' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                      {record.role === 'user' ? 'User' : 'Admin'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${record.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {record.status === 'online' ? '● Online' : '○ Offline'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(record.created_at)}</td>
                  <td className="px-4 py-3 relative whitespace-nowrap">
                    <button
                      onClick={() => setActionDropdown(actionDropdown === record.id ? null : record.id)}
                      className="p-1 rounded hover:bg-gray-200"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {actionDropdown === record.id && (
                      <div className="absolute right-0 mt-1 w-36 bg-white border rounded-md shadow-lg z-10">
                        <button
                          onClick={() => {
                            setRecordToDelete(record.id);
                            setRecordRoleToDelete(record.role);
                            setDeleteModalOpen(true);
                            setActionDropdown(null);
                          }}
                          className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    {loading ? <Loader2 className="animate-spin mx-auto" /> : "No records found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden grid grid-cols-1 gap-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin h-8 w-8 text-green-600" />
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-white/30 rounded-xl">
              No records found
            </div>
          ) : (
            records.map((record) => (
              <div key={`${record.role}-${record.id}`} className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 mr-2">
                      <p className="text-sm font-bold text-gray-800 break-all">{record.email}</p>
                      <div className="flex gap-2 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${record.role === 'user' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                          {record.role === 'user' ? 'User' : 'Admin'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${record.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {record.status === 'online' ? '● Online' : '○ Offline'}
                        </span>
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setActionDropdown(actionDropdown === record.id ? null : record.id)}
                        className="p-1.5 rounded-full hover:bg-gray-100"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>
                      {actionDropdown === record.id && (
                        <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                          <button
                            onClick={() => {
                              setRecordToDelete(record.id);
                              setRecordRoleToDelete(record.role);
                              setDeleteModalOpen(true);
                              setActionDropdown(null);
                            }}
                            className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Created: {formatDate(record.created_at)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4">
          <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
          <div className="flex gap-3">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="px-5 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl shadow-md disabled:opacity-50 hover:from-green-700 hover:to-emerald-700"
            >
              Previous
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="px-5 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl shadow-md disabled:opacity-50 hover:from-green-700 hover:to-emerald-700"
            >
              Next
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModalOpen}
          onRequestClose={() => setDeleteModalOpen(false)}
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
              Are you sure you want to delete this {recordRoleToDelete === 'user' ? 'user' : 'admin'}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium shadow-md"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </Modal>

        {/* Feedback Modal */}
        <Modal
          isOpen={feedbackModalOpen}
          onRequestClose={() => setFeedbackModalOpen(false)}
          className="bg-white rounded-2xl max-w-sm w-full p-6 text-center outline-none mx-4"
          overlayClassName="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <div className="text-6xl mb-4">
            {feedbackType === "success" ? <FaCheckCircle className="text-green-500 mx-auto" /> : <FaTimesCircle className="text-red-500 mx-auto" />}
          </div>
          <p className="text-lg font-semibold">{feedbackMessage}</p>
          <button onClick={() => setFeedbackModalOpen(false)} className="mt-6 px-5 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl shadow-md">Close</button>
        </Modal>
      </div>
    </div>
  );
}