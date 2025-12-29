// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useMutation } from "@tanstack/react-query";
// import axios from "axios";
// import { motion } from "framer-motion";
// import { Mail, Send } from "lucide-react";
// import apiPath from "../api/apiPath";
// import { apiPost,apiPut,apiGet,apiDelete } from "../api/apiFetch";
// import toast from "react-hot-toast";

// export default function ForgotPassword() {
//   const [email, setEmail] = useState("");
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const mutation = useMutation({
//     mutationFn: async () => {
//       const res = await apiPost(apiPath.resetPassword, { email });
//       return res;
//     },
//     onSuccess: (data) => {
//       setMessage(data.message || "Password reset link sent successfully!");
//       console.log(
//         "data",data
//       );
//       toast.success(data.message);
//       setError("");
//     },
//     onError: (err) => {
//       setError(err.response?.data?.message || "Something went wrong!");
//       toast.error(err.response?.data?.message);
//       setMessage("");
//     },
//   });

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!email.includes("@")) {
//       setError("Please enter a valid email address.");
//       return;
//     }
//     setError("");
//     mutation.mutate();
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 via-indigo-100 to-pink-100 p-4">
//       <motion.div
//         initial={{ opacity: 0, y: 40 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6 }}
//         className="bg-white shadow-2xl rounded-2xl w-full max-w-md p-8 border border-indigo-100"
//       >
//         <div className="text-center mb-6">
//           <div className="flex justify-center items-center mb-2">
//             <Mail className="text-yellow-500 w-10 h-10" />
//           </div>
//           <h2 className="text-2xl font-bold text-gray-800">Forgot Password?</h2>
//           <p className="text-gray-500 text-sm">
//             Enter your registered email, and we’ll send you a reset link.
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-5">
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Email Address</label>
//             <div className="relative mt-1">
//               <Mail className="absolute left-3 top-3 text-gray-400" />
//               <input
//                 type="email"
//                 placeholder="Enter your email"
//                 className="pl-10 w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//               />
//             </div>
//           </div>

//           {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}
//           {message && <p className="text-green-600 text-sm font-medium text-center">{message}</p>}

//           <button
//             type="submit"
//             disabled={mutation.isLoading}
//             className="w-full bg-[image:var(--gradient-primary)] cursor-pointer text-white font-semibold py-2.5 rounded-lg transition-all duration-200 shadow-md flex items-center justify-center gap-2"
//           >
//             {mutation.isLoading ? "Sending..." : <>
//               <Send className="w-4 h-4" /> Send Reset Link
//             </>}
//           </button>
//         </form>

//         <p className="text-center text-sm text-gray-500 mt-6">
//           Remembered your password?{" "}
//           <span
//             onClick={() => navigate("/")}
//             className="text-yellow-500 hover:underline cursor-pointer font-medium"
//           >
//             Go back to login
//           </span>
//         </p>
//       </motion.div>
//     </div>
//   );
// }



import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Mail, Send, Loader2 } from "lucide-react";
import apiPath from "../api/apiPath";
import { apiPost } from "../api/apiFetch";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiPost(apiPath.resetPassword, { email });
      return res;
    },
    onSuccess: (data) => {
      setMessage(data.message || "Password reset link sent successfully!");
      toast.success(data.message || "Reset link sent!");
      setError("");
    },
    onError: (err) => {
      setError(err.response?.data?.message || "Something went wrong!");
      toast.error(err.response?.data?.message || "Failed to send reset link");
      setMessage("");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      toast.error("Please enter a valid email address.");
      return;
    }
    setError("");
    setMessage("");
    mutation.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 via-indigo-100 to-pink-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-2xl rounded-2xl w-full max-w-md p-8 border border-indigo-100 relative"
      >
        {/* Overlay loader */}
        {mutation.isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl z-10 flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="mb-4"
            >
              <Loader2 className="w-12 h-12 text-indigo-600" />
            </motion.div>
            <p className="text-lg font-medium text-gray-700">Sending reset link...</p>
            <p className="text-sm text-gray-500 mt-2">Please wait a moment</p>
          </motion.div>
        )}

        <div className="text-center mb-6">
          <div className="flex justify-center items-center mb-2">
            <Mail className="text-yellow-500 w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Forgot Password?</h2>
          <p className="text-gray-500 text-sm">
            Enter your registered email, and we'll send you a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="email"
                placeholder="Enter your email address"
                className={`w-full pl-11 py-3 border rounded-lg focus:ring-=1 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all duration-200 placeholder:text-gray-400 ${mutation.isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                value={email}
                onChange={(e) => !mutation.isPending && setEmail(e.target.value)}
                disabled={mutation.isPending}
                required
              />
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Success message */}
          {message && (
            <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
              <p className="text-green-700 text-sm">{message}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={mutation.isLoading}
            className={`w-full bg-[image:var(--gradient-primary)] cursor-pointer  text-white font-semibold py-3.5 rounded-lg transition-all duration-200 shadow-sm flex items-center justify-center gap-2 ${mutation.isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:from-indigo-700 hover:to-purple-700 hover:shadow'}`}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send Reset Link
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Remembered your password?{" "}
          <button
            type="button"
            onClick={() => navigate("/")}
            disabled={mutation.isPending}
            className={`text-yellow-500 hover:underline font-medium ${mutation.isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            Go back to login
          </button>
        </p>
      </motion.div>
    </div>
  );
}
