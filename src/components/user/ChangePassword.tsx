import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import zxcvbn from "zxcvbn";

// For Vite, use import.meta.env instead of process.env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match");
      setLoading(false);
      return;
    }

    if (passwordStrength < 3) {
      setError("New password is too weak. Please choose a stronger password.");
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/change-password`, {
        currentPassword,
        newPassword,
      });
      alert("Password changed successfully");
      navigate("/");
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const checkPasswordStrength = (password: string) => {
    const result = zxcvbn(password);
    setPasswordStrength(result.score);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Change Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-black bg-white"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                checkPasswordStrength(e.target.value);
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-black bg-white"
              required
            />
            <div className="mt-1">
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className={`h-full rounded-full ${
                    passwordStrength === 0
                      ? "w-0"
                      : passwordStrength === 1
                      ? "w-1/4 bg-red-500"
                      : passwordStrength === 2
                      ? "w-1/2 bg-yellow-500"
                      : passwordStrength === 3
                      ? "w-3/4 bg-blue-500"
                      : "w-full bg-green-500"
                  }`}
                ></div>
              </div>
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmNewPassword"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-black bg-white"
              required
            />
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
            disabled={loading}
          >
            {loading ? "Changing Password..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;
