import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { motion } from "framer-motion";
import { Lock, KeyRound, Eye, EyeOff } from "lucide-react";
import apiPath from "../api/apiPath";
import { apiPost } from "../api/apiFetch";
import toast from "react-hot-toast";
// import { useParams } from "react-router-dom";

export default function ResetPassword() {
  const { token } = useParams();
  const {id} =useParams();
  console.log("token",token);
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // const {token} = useParams();


  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiPost(`${apiPath.LinkresetApi}/${id}`, { password });
      return res.data;
    },
    onSuccess: (data) => {
      // alert("🎉 Password reset successful! Please log in again.");
      toast.success(data.message);
      navigate("/login");
    },
    onError: (err) => {
      // setError(err.response?.data?.message || "Something went wrong!");
      toast.error(err.response?.data?.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    setError("");
    mutation.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-pink-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-2xl rounded-2xl w-full max-w-md p-8 border border-indigo-100"
      >
        <div className="text-center mb-6">
          <div className="flex justify-center items-center mb-2">
            <Lock className="text-yellow-500 w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Reset Your Password
          </h2>
          <p className="text-gray-500 text-sm">Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <div className="relative mt-1">
              <KeyRound className="absolute left-3 top-3 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                className="pl-10 pr-10 w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="relative mt-1">
              <KeyRound className="absolute left-3 top-3 text-gray-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                className="pl-10 pr-10 w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <p className="text-red-500 text-sm font-medium text-center">
              {error}
            </p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={mutation.isLoading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 cursor-pointer text-white font-semibold py-2.5 rounded-lg transition-all duration-200 shadow-md"
          >
            {mutation.isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
