import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState(null);

  const deviceId = 'mobile_primary_session_' + (localStorage.getItem('unicom_dev_id') || Math.random().toString(36).substring(7));
  localStorage.setItem('unicom_dev_id', deviceId);

  const loadUserProfile = async () => {
    try {
      const token = api.getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      const res = await api.getProfile();
      setUser(res.user);
    } catch (err) {
      if (err.code === 'DEVICE_SESSION_TERMINATED') {
        setSessionError('Your account was logged in on another device. UNICOM allows 1 primary active device for security.');
      }
      api.clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loginWithPhone = async (phone, mode) => {
    return await api.requestOtp(phone, mode);
  };

  const verifyOtp = async (phone, code) => {
    const res = await api.verifyOtp(phone, code, deviceId);
    api.setToken(res.token);
    setUser(res.user);
    setSessionError(null);
    return res;
  };

  const loginWithFirebase = async (idToken) => {
    const res = await api.verifyFirebaseToken(idToken, deviceId);
    api.setToken(res.token);
    setUser(res.user);
    setSessionError(null);
    return res;
  };

  const switchDemoUser = async (userId) => {
    const res = await api.devDemoLogin(userId, deviceId);
    api.setToken(res.token);
    setUser(res.user);
    setSessionError(null);
    return res;
  };

  const updateUserProfile = async (profileData) => {
    const res = await api.updateProfile(profileData);
    setUser(res.user);
    return res;
  };

  const logout = () => {
    api.clearToken();
    setUser(null);
  };

  const deleteAccount = async () => {
    await api.deleteAccount();
    logout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        sessionError,
        deviceId,
        loginWithPhone,
        verifyOtp,
        loginWithFirebase,
        switchDemoUser,
        updateUserProfile,
        logout,
        deleteAccount,
        refreshUser: loadUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
