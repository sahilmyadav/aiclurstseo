import React, { createContext, useState, useCallback } from "react";
import axios from "axios";

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1
  });

  
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE || "http://localhost:8000",
    headers: { "Content-Type": "application/json" },
  });


  api.interceptors.request.use((config) => {
    const raw = localStorage.getItem("auth");
    if (raw) {
      const token = JSON.parse(raw)?.token;
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });


  const fetchUsers = useCallback(async (url) => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get(url);
      const usersData = res.data?.data || [];
      
      // Update pagination info
      console.log(res.data);
      if (res.data?.pagination) {
        setPagination(res.data.pagination);
      }

      setUsers(Array.isArray(usersData) ? usersData : []);
      
      // Fetch all users for counts (without pagination)
      const allRes = await api.get("/api/admin/users?limit=1000");
      setAllUsers(Array.isArray(allRes.data?.data) ? allRes.data.data : []);
      
      return res;
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.response?.data?.message || "Failed to fetch users");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserRole = useCallback(async (userId, newRole) => {
    try {
      await api.put(`/api/admin/assign-role`, { userId, role: newRole });
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (err) {
      console.error(" Error updating role:", err);
      throw err;
    }
  }, []);


  const deleteUser = useCallback(async (userId) => {
    try {
      await api.delete('/api/admin/delete-user', { 
        data: { userId } 
      });
      // Update the users list by removing the deleted user
      setUsers((prev) => prev.filter((user) => user._id !== userId));
      // Also update allUsers to keep counts in sync
      setAllUsers((prev) => prev.filter((user) => user._id !== userId));
    } catch (err) {
      console.error("Error deleting user:", err);
      throw err;
    }
  }, []);

  const blockUnblockUser = useCallback(async (userId) => {
    try {
      const response = await api.put('/api/admin/block-user', { userId });
      const updatedUser = response.data.data;
      
      // Update users list
      setUsers(prev => 
        prev.map(user => 
          user._id === userId 
            ? { ...user, isBlocked: updatedUser.isBlocked } 
            : user
        )
      );
      
      // Also update allUsers to keep counts in sync
      setAllUsers(prev => 
        prev.map(user => 
          user._id === userId 
            ? { ...user, isBlocked: updatedUser.isBlocked } 
            : user
        )
      );
      
      return updatedUser;
    } catch (err) {
      console.error("Error toggling user block status:", err);
      throw err;
    }
  }, []);

  return (
    <AdminContext.Provider
      value={{
        users,
        allUsers,
        loading,
        error,
        pagination,
        fetchUsers,
        updateUserRole,
        deleteUser,
        blockUnblockUser
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};
