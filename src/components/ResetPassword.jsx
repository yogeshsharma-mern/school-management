import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { motion } from "framer-motion";
import { Mail, Send } from "lucide-react";
import apiPath from "../api/apiPath";
import { apiPost,apiPut,apiGet,apiDelete } from "../api/apiFetch";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiPost("http://localhost:5000/api/forgot-password", { email });
      return res.data;
    },
    onSuccess: (data) => {
      setMessage(data.message || "Password reset link sent successfully!");
      setError("");
    },
    onError: (err) => {
      setError(err.response?.data?.message || "Something went wrong!");
      setMessage("");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
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
            <Mail className="text-indigo-600 w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Forgot Password?</h2>
          <p className="text-gray-500 text-sm">
            Enter your registered email, and we’ll send you a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                placeholder="Enter your email"
                className="pl-10 w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}
          {message && <p className="text-green-600 text-sm font-medium text-center">{message}</p>}

          <button
            type="submit"
            disabled={mutation.isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 shadow-md flex items-center justify-center gap-2"
          >
            {mutation.isLoading ? "Sending..." : <>
              <Send className="w-4 h-4" /> Send Reset Link
            </>}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Remembered your password?{" "}
          <span
            onClick={() => navigate("/")}
            className="text-indigo-600 hover:underline cursor-pointer font-medium"
          >
            Go back to login
          </span>
        </p>
      </motion.div>
    </div>
  );
}
