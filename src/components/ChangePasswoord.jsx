import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { Link } from "react-router-dom";
import { logout } from "../redux/features/auth/authslice";
import { useDispatch } from "react-redux";
import { apiPost } from "../api/apiFetch";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.example.com";

const ResetPassword = () => {
  const [form, setForm] = useState({
    oldPassword: "",
    password: "",
    confirmPassword: "",
  });
  const dispatch = useDispatch();
  const [show, setShow] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await apiPost(`${BASE_URL}/admins/auth/change-password`, data);
      return res.data;
    },
    onSuccess: (data) => {
      // console.log(data);
      toast.success("Password changed successfully! Please login again.");
      setForm({ oldPassword: "", password: "", confirmPassword: "" });
      dispatch(logout());
    },
    onError: (error) => {
      console.error("Error changing password:", error);
      toast.error(error?.response?.data?.message || "Something went wrong!");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.oldPassword || !form.password || !form.confirmPassword)
      return toast.error("Please fill all fields");

    if (form.password.length < 8)
      return toast.error("New password must be at least 8 characters");

    if (form.password !== form.confirmPassword)
      return toast.error("New passwords do not match");

    mutation.mutate({
      oldPassword: form.oldPassword,
      newPassword: form.password,
    });
  };

  return (
    <div className="h-[85vh]  flex items-center justify-center  ">
      <Toaster position="top-right" />
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl  rounded-3xl border border-gray-100 p-8 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]">
        {/* Header */}
        <div className="flex flex-col cursor-pointer items-center mb-8">
          <div className="bg-blue-100 text-yellow-500  p-4 rounded-full shadow-inner">
            <FaLock className="text-3xl" />
          </div>
          <h1 className="text-3xl font-semibold text-gray-800 mt-4">
            Change Password
          </h1>
          <p className="text-gray-500 text-sm mt-2 text-center">
            Enter your old password and create a new one.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Old Password */}
          <div className="relative">
            <input
              type={show.old ? "text" : "password"}
              name="oldPassword"
              placeholder="Old Password"
              value={form.oldPassword}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, oldPassword: e.target.value }))
              }
              className="w-full h-12 border border-gray-300 rounded-xl px-4 pr-10 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShow((p) => ({ ...p, old: !p.old }))}
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
            >
              {show.old ? (
                <FaEyeSlash className="w-5 h-5" />
              ) : (
                <FaEye className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* New Password */}
          <div className="relative">
            <input
              type={show.new ? "text" : "password"}
              name="password"
              placeholder="New Password"
              value={form.password}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, password: e.target.value }))
              }
              className="w-full h-12 border border-gray-300 rounded-xl px-4 pr-10 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShow((p) => ({ ...p, new: !p.new }))}
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
            >
              {show.new ? (
                <FaEyeSlash className="w-5 h-5" />
              ) : (
                <FaEye className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={show.confirm ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm New Password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              className="w-full h-12 border border-gray-300 rounded-xl px-4 pr-10 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShow((p) => ({ ...p, confirm: !p.confirm }))}
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
            >
              {show.confirm ? (
                <FaEyeSlash className="w-5 h-5" />
              ) : (
                <FaEye className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={mutation.isPending}
            className={`w-full h-12 rounded-xl text-white font-semibold text-lg transition-all duration-200 shadow-md ${mutation.isPending
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-gradient-to-r from-yellow-500 to-yellow-500 cursor-pointer hover:from-yellow-500 hover:to-orange-300"
              }`}
          >
            {mutation.isPending ? "Updating..." : "Change Password"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-sm text-center text-gray-600 mt-8">
          {/* Remember your password?{" "} */}
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-700 font-medium transition-all"
          >
            {/* Back to Login */}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
