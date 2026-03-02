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
  const [errors, setErrors] = useState({});
  const validateForm = () => {
    const newErrors = {};

    // Old password
    if (!form.oldPassword.trim()) {
      newErrors.oldPassword = "Old password is required";
    }

    // New password
    if (!form.password.trim()) {
      newErrors.password = "New password is required";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/.test(form.password)) {
      newErrors.password =
        "Password must include uppercase, lowercase and a number";
    }

    // Confirm password
    if (!form.confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    // ✅ true = no errors, ❌ false = errors exist
    return Object.keys(newErrors).length === 0;
  };

  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await apiPost(`${BASE_URL}admins/auth/change-password`, data);
      return res;
    },
    onSuccess: (data) => {
      // // console.log(data);
      // toast.success("Password changed successfully! Please login again.");
      toast.success(data?.message);
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

    // 🔴 Stop if validation fails
    if (!validateForm()) return;

    mutation.mutate({
      oldPassword: form.oldPassword,
      newPassword: form.password,
    });
  };


  return (
    <div className="h-[85vh]  flex items-center justify-center  ">
      {/* <Toaster position="top-right" /> */}
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 p-8 transition-all duration-300 shadow-[0_0_30px_rgba(59,130,246,0.2)] hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]">
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
              value={form.oldPassword}
              onChange={(e) => {
                setForm((p) => ({ ...p, oldPassword: e.target.value }));
                setErrors((p) => ({ ...p, oldPassword: "" }));
              }}
              placeholder="******"
              className={`w-full h-12 border rounded-xl px-4 pr-10
    ${errors.oldPassword ? "border-red-500" : "border-gray-300"}
  `}
            />
            {errors.oldPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.oldPassword}</p>
            )}

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
              value={form.password}
              onChange={(e) => {
                setForm((p) => ({ ...p, password: e.target.value }));
                setErrors((p) => ({ ...p, password: "" }));
              }}
              placeholder="******"
              className={`w-full h-12 border rounded-xl px-4 pr-10
    ${errors.password ? "border-red-500" : "border-gray-300"}
  `}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}

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
              value={form.confirmPassword}
              placeholder="******"
              onChange={(e) => {
                setForm((p) => ({ ...p, confirmPassword: e.target.value }));
                setErrors((p) => ({ ...p, confirmPassword: "" }));
              }}
              className={`w-full h-12 border rounded-xl px-4 pr-10
    ${errors.confirmPassword ? "border-red-500" : "border-gray-300"}
  `}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword}
              </p>
            )}

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
            className={`w-full h-12 rounded-xl  font-semibold text-lg transition-all duration-200 shadow-md ${mutation.isPending
              ? "bg-yellow-400 cursor-not-allowed"
              : "bg-[image:var(--gradient-primary)] cursor-pointer hover:from-yellow-500 hover:to-yellow-500"
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
