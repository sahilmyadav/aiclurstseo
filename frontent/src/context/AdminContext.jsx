import React, { createContext, useState, useCallback } from "react";
import axios from "axios";

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  
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


  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get("/api/admin/users");
      const usersData = res.data?.data || res.data || [];
      console.log(usersData)

      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.response?.data?.message || "Failed to fetch users");
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
    console.log("userid",userId)
    try {
      await api.delete(`/api/admin/delete-user`, { userId });
      setUsers((prev) => prev.filter((user) => user._id !== userId));
    } catch (err) {
      console.error(" Error deleting user:", err);
      throw err;
    }
  }, []);

  const blockUnblockUser = useCallback(async (userId) => {
    try {
      await api.put(`/api/admin/block-user`, { userId });
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, isBlocked: true } : user
        )
      );
    } catch (err) {
      console.error(" Error blocking user:", err);
      throw err;
    }
  }, []);

  return (
    <AdminContext.Provider
      value={{
        users,
        loading,
        error,
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
