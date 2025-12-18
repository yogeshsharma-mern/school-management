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
  // console.log("token",token);
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
      return res;
    },
    onSuccess: (data) => {
      // alert("🎉 Password reset successful! Please log in again.");
      toast.success(data.message);
      navigate("/");
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 via-indigo-100 to-pink-100 p-4">
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

<form onSubmit={handleSubmit} className="space-y-6">
  {/* New Password */}
  <div className="space-y-1.5">
    <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
      New Password
    </label>
    <div className="relative">
      <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
      <input
        id="new-password"
        type={showPassword ? "text" : "password"}
        placeholder="Create a strong password"
        className="w-full pl-11 pr-11 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-gray-400"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        aria-describedby="password-requirements"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:text-gray-600 focus:outline-none focus:ring-1 focus:ring-yellow-200 rounded p-1 transition-colors duration-200"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          <EyeOff className="w-5 h-5" />
        ) : (
          <Eye className="w-5 h-5" />
        )}
      </button>
    </div>
    <p id="password-requirements" className="text-xs text-gray-500 pt-1">
      Use at least 8 characters with a mix of letters, numbers, and symbols
    </p>
  </div>

  {/* Confirm Password */}
  <div className="space-y-1.5">
    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
      Confirm Password
    </label>
    <div className="relative">
      <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
      <input
        id="confirm-password"
        type={showConfirmPassword ? "text" : "password"}
        placeholder="Re-enter your password"
        className="w-full pl-11 pr-11 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-gray-400"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        aria-describedby="password-match"
      />
      <button
        type="button"
        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:text-gray-600 focus:outline-none focus:ring-1 focus:ring-yellow-200 rounded p-1 transition-colors duration-200"
        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
      >
        {showConfirmPassword ? (
          <EyeOff className="w-5 h-5" />
        ) : (
          <Eye className="w-5 h-5" />
        )}
      </button>
    </div>
    <div id="password-match" className="text-xs pt-1">
      {password && confirmPassword && (
        <span className={password === confirmPassword ? "text-green-600" : "text-amber-600"}>
          {password === confirmPassword ? "✓ Passwords match" : "⚠ Passwords do not match"}
        </span>
      )}
    </div>
  </div>

  {/* Error message */}
  {error && (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      </div>
    </div>
  )}

  {/* Submit button */}
  <button
    type="submit"
    disabled={mutation.isPending || (password !== confirmPassword && confirmPassword !== '')}
    className="w-full bg-[image:var(--gradient-primary)] text-white font-semibold py-3.5 rounded-lg transition-all duration-200 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
  >
    {mutation.isPending ? (
      <span className="flex items-center justify-center">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Resetting Password...
      </span>
    ) : (
      "Reset Password"
    )}
  </button>
</form>
      </motion.div>
    </div>
  );
}
