import React, {
  useState,
  useEffect,
  useContext,
  useMemo,
  useCallback,
} from "react";
import { AdminContext } from "../../context/AdminContext";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Search,
  Trash2,
  UserCog,
  Loader2,
  Users,
  Shield,
  User,
  ChevronLeft,
  ChevronRight,
  Lock,
  Unlock,
  CreditCard,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(
      <button
        key={i}
        onClick={() => onPageChange(i)}
        className={`px-3 py-1 rounded-md ${
          currentPage === i
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-700 hover:bg-gray-100"
        }`}
      >
        {i}
      </button>
    );
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
      <div className="hidden sm:flex sm:items-center sm:justify-between w-full">
        <div>
          <p className="text-sm text-gray-700">
            Page <span className="font-medium">{currentPage}</span> of{" "}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          {pages}
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="p-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Debounce helper
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const AllUsers = () => {
  const { theme } = useTheme();
  const { 
    users, 
    allUsers, 
    loading, 
    error, 
    pagination, 
    fetchUsers, 
    updateUserRole, 
    deleteUser,
    blockUnblockUser 
  } = useContext(AdminContext);
  
  // Check if user is the main admin
  const isMainAdmin = (user) => {
    return user.role === 'admin' && user.email === 'admin@example.com'; // Replace with your main admin email
  };
  
  // Count admin users
  const adminUsersCount = useMemo(() => {
    return allUsers.filter(user => user.role === 'admin').length;
  }, [allUsers]);

  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isDeleting, setIsDeleting] = useState(null);
  const [isUpdating, setIsUpdating] = useState(null);
  const [isBlocking, setIsBlocking] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter users based on active tab and search term
  const filteredUsers = useMemo(() => {
    return allUsers.filter(user => {
      // Filter by search term
      const matchesSearch = searchTerm === '' || 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by role if a specific tab is selected
      if (activeTab === 'admins') {
        return user.role === 'admin' && matchesSearch;
      } else if (activeTab === 'users') {
        return user.role === 'user' && matchesSearch;
      }
      
      return matchesSearch;
    });
  }, [allUsers, searchTerm, activeTab]);

  // Paginate the filtered users
  const currentUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  // Calculate total pages for pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo(0, 0);
  };

  // Reset to first page when search term or tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

  // Fetch all users on component mount and when search/active tab changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchUsers('/api/admin/users?limit=1000'); // Fetch all users with a high limit
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };
    
    fetchData();
  }, [fetchUsers]);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((val) => setSearchTerm(val), 300),
    []
  );

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  // Update Role
  const handleRoleChange = async (id, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    setIsUpdating(id);
    try {
      await updateUserRole(id, newRole);
      toast.success(`User role changed to ${newRole}`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to update role", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsUpdating(null);
    }
  };

  // Block/Unblock user
  const handleBlockUnblock = async (userId, isCurrentlyBlocked) => {
    setIsBlocking(userId);
    try {
      await blockUnblockUser(userId);
      toast.success(
        `User ${isCurrentlyBlocked ? 'unblocked' : 'blocked'} successfully`,
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    } catch (err) {
      console.error('Error toggling block status:', err);
      toast.error(err.response?.data?.message || 'Failed to update user status', {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsBlocking(null);
    }
  };

  // Delete user
  const handleDelete = (id) => {
    // Show confirmation dialog
    toast(({ closeToast }) => (
      <div className="p-2">
        <p className="text-gray-800 mb-4">Are you sure you want to delete this user?</p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={async () => {
              closeToast();
              setIsDeleting(id);
              try {
                await deleteUser(id);
                toast.success("User deleted successfully", {
                  position: "top-right",
                  autoClose: 3000,
                });
              } catch (err) {
                console.error(err);
                toast.error("Failed to delete user", {
                  position: "top-right",
                  autoClose: 3000,
                });
              } finally {
                setIsDeleting(null);
              }
            }}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            {isDeleting === id ? (
              <span className="flex items-center">
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Deleting...
              </span>
            ) : (
              "Delete"
            )}
          </button>
          <button
            onClick={closeToast}
            className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      position: "top-center",
      autoClose: false,
      closeButton: false,
      draggable: false,
      closeOnClick: false,
      pauseOnHover: true,
      className: 'w-full max-w-md',
    });
  };

  // Navigate to billing page for a specific user
  const handleViewBilling = (userId) => {
    navigate(`/ad-dashboard/billing?userId=${userId}`);
  };

  // UI helpers
  const getTabClass = (tab) =>
    `px-4 py-2 text-sm font-medium rounded-md flex items-center space-x-2 ${
      activeTab === tab
        ? theme === 'dark'
          ? 'bg-blue-900/30 text-white border-b-2 border-blue-500'
          : 'bg-blue-100 text-blue-700 border-b-2 border-blue-500'
        : theme === 'dark'
          ? 'text-gray-400 hover:text-white hover:bg-gray-800/50'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
    }`;

  const roleBadge = (role) =>
    role === "admin"
      ? "bg-green-100 text-green-800"
      : "bg-blue-100 text-blue-800";

  // Loading state
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-3">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p>Loading users...</p>
      </div>
    );

  // Error state
  if (error)
    return (
      <div className="text-center mt-10 text-red-600">
        <p>{error}</p>
        <button
          onClick={() => fetchUsers()}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className={`min-h-screen w-full ${theme === 'dark' ? 'bg-[#0f1020] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className={`text-2xl font-bold mb-4 md:mb-0 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            User Management
          </h1>
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Search users..."
              onChange={handleSearchChange}
              className={`pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-64 ${
                theme === 'dark'
                  ? 'bg-[#121324] border border-gray-700 text-white placeholder-gray-400'
                  : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className={`mb-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <nav className="flex space-x-4">
            <button onClick={() => setActiveTab("all")} className={getTabClass("all")}>
              <Users className={`w-4 h-4 ${activeTab === "all" ? (theme === 'dark' ? 'text-white' : 'text-blue-700') : (theme === 'dark' ? 'text-gray-400' : 'text-gray-500')}`} />
              <span>All ({allUsers.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("admins")}
              className={getTabClass("admins")}
            >
              <Shield className={`w-4 h-4 ${activeTab === "admins" ? (theme === 'dark' ? 'text-white' : 'text-blue-700') : (theme === 'dark' ? 'text-gray-400' : 'text-gray-500')}`} />
              <span>Admins ({allUsers.filter(u => u.role === "admin").length})</span>
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={getTabClass("users")}
            >
              <User className={`w-4 h-4 ${activeTab === "users" ? (theme === 'dark' ? 'text-white' : 'text-blue-700') : (theme === 'dark' ? 'text-gray-400' : 'text-gray-500')}`} />
              <span>Users ({allUsers.filter(u => u.role === "user").length})</span>
            </button>
          </nav>
        </div>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />

        {/* Table */}
        <div className={`rounded-2xl overflow-hidden ${theme === 'dark' ? 'bg-[#121324]/90 border border-white/5' : 'bg-white border border-gray-200'} shadow-sm`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={theme === 'dark' ? 'bg-[#1a1b2e]' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase`}>
                    Name
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase`}>
                    Email
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase`}>
                    Role
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase`}>
                    Subscription
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase`}>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {currentUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center text-gray-500 py-6 text-sm"
                    >
                      No users found
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user) => (
                    <tr key={user._id} className={theme === 'dark' ? 'hover:bg-[#1a1b2e]' : 'hover:bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className={`h-10 w-10 rounded-full ${theme === 'dark' ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-600'} flex items-center justify-center font-semibold`}>
                            {user.name?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {user.name || "Unnamed User"}
                          </div>
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${
                          user.role === 'admin' 
                            ? theme === 'dark' 
                              ? 'bg-green-900/30 text-green-300' 
                              : 'bg-green-100 text-green-800' 
                            : theme === 'dark' 
                              ? 'bg-blue-900/30 text-blue-300' 
                              : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                        {user.subscription?.currentSubscriptionId ? (
                          <div className="space-y-1">
                            <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {user.subscription.currentSubscriptionId.planType || 'No Plan'}
                            </div>
                            <div className={`text-xs px-2 py-1 rounded-full inline-flex items-center ${
                              user.subscription.currentSubscriptionId.status === 'active' 
                                ? theme === 'dark'
                                  ? 'bg-green-900/30 text-green-300'
                                  : 'bg-green-100 text-green-800'
                                : user.subscription.currentSubscriptionId.status === 'expired' 
                                  ? theme === 'dark'
                                    ? 'bg-red-900/30 text-red-300'
                                    : 'bg-red-100 text-red-800'
                                  : theme === 'dark'
                                    ? 'bg-gray-800/50 text-gray-300'
                                    : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.subscription.currentSubscriptionId.status === 'active' 
                                ? 'Active' 
                                : user.subscription.currentSubscriptionId.status === 'expired' 
                                  ? 'Expired' 
                                  : 'Inactive'}
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-400">No subscription</div>
                        )}
                      </td>
                      <td className={`px-6 py-4 text-sm font-medium space-x-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                        {!isMainAdmin(user) && (adminUsersCount > 1 || user.role !== 'admin') ? (
                          <div className="flex space-x-2">
                            {user.role !== 'admin' && (
                              <button
                                onClick={() => handleViewBilling(user._id)}
                                className="inline-flex items-center px-3 py-1.5 text-xs rounded-md text-white bg-purple-600 hover:bg-purple-700"
                              >
                                <CreditCard className="w-3 h-3 mr-1" />
                                View Billing
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(user._id)}
                              disabled={isDeleting === user._id}
                              className="inline-flex items-center px-3 py-1.5 text-xs rounded-md text-white bg-red-600 hover:bg-red-700"
                            >
                              {isDeleting === user._id ? (
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3 mr-1" />
                              )}
                              Delete
                            </button>
                          </div>
                        ) : (
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Admin actions not available
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default AllUsers;