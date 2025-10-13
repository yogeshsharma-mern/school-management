// import React, { useState } from "react";
// import { apiPost } from "../api/apiFetch";
// import apiPath from "../api/apiPath";
// import { useDispatch } from "react-redux";
// import { loginSuccess } from "../redux/features/auth/authslice";
// import { useNavigate } from "react-router-dom";


// export default function Login() {
//   const [formData, setFormData] = useState({ email: "", password: "" });
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [apiError, setApiError] = useState("");
// const dispatch = useDispatch();
// const navigate = useNavigate();
//   // Handle input changes
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     setErrors((prev) => ({ ...prev, [name]: "" })); // Clear error on change
//   };

//   // Validate form
//   const validate = () => {
//     const newErrors = {};
//     if (!formData.email) newErrors.email = "Email is required";
//     else if (!/\S+@\S+\.\S+/.test(formData.email))
//       newErrors.email = "Email is invalid";

//     if (!formData.password) newErrors.password = "Password is required";
//     else if (formData.password.length < 6)
//       newErrors.password = "Password must be at least 6 characters";

//     return newErrors;
//   };

//   // Handle form submit
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setApiError("");
//     const validationErrors = validate();
//     if (Object.keys(validationErrors).length > 0) {
//       setErrors(validationErrors);
//       return;
//     }

//     setLoading(true);

// try {
//   const res = await apiPost(apiPath.loginadmin, formData);
//   console.log("res",res);

//   if (res.success === true && res.results?.token) {
//     dispatch(
//       loginSuccess({ user: res.results, token: res.results.token })
//     );
//     navigate("/admin/dashboard");
//   } else {
//     setApiError(res.data.message || "Login failed");
//   }
// }  catch (err) {
//       setApiError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gray-100">
//       <div className="bg-white rounded-2xl w-full max-w-md p-8">
//         {/* Heading */}
//         <div className="text-center mb-6">
//           <h1 className="text-3xl font-bold text-gray-800">
//             Welcome Back To Admin Panel
//           </h1>
//           <p className="text-gray-500 text-sm mt-2">
//             Sign in to access your admin panel
//           </p>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="space-y-5">
//           {/* API error */}
        

//           {/* Email */}
//           <div>
//             <label className="block text-sm font-medium text-gray-600">
//               Email Address
//             </label>
//             <input
//               type="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               placeholder="Enter your email"
//               className={`mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none text-gray-700 ${
//                 errors.email ? "border-red-500 focus:ring-red-400" : "focus:ring-indigo-400"
//               }`}
//             />
//             {errors.email && (
//               <p className="text-red-500 text-sm mt-1">{errors.email}</p>
//             )}
//           </div>

//           {/* Password */}
//           <div>
//             <label className="block text-sm font-medium text-gray-600">
//               Password
//             </label>
//             <input
//               type="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               placeholder="Enter your password"
//               className={`mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none text-gray-700 ${
//                 errors.password ? "border-red-500 focus:ring-red-400" : "focus:ring-indigo-400"
//               }`}
//             />
//             {errors.password && (
//               <p className="text-red-500 text-sm mt-1">{errors.password}</p>
//             )}
//           </div>
//   {apiError && <p className="text-red-500 text-sm">{apiError}</p>}
//           {/* Remember + Forgot */}
//           <div className="flex items-center justify-between text-sm">
//             <label className="flex items-center space-x-2">
//               <input type="checkbox" className="h-4 w-4 text-indigo-600" />
//               <span className="text-gray-600">Remember me</span>
//             </label>
//             <a href="#" className="text-indigo-600 hover:underline">
//               Forgot password?
//             </a>
//           </div>

//           {/* Login Button */}
//           <button
//             type="submit"
//             disabled={loading}
//             className={`w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition font-semibold ${
//               loading ? "opacity-50 cursor-not-allowed" : ""
//             }`}
//           >
//             {loading ? "Signing In..." : "Sign In"}
            
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }
// import React, { useState } from "react";
// import { apiPost } from "../api/apiFetch";
// import apiPath from "../api/apiPath";
// import { useDispatch } from "react-redux";
// import { loginSuccess } from "../redux/features/auth/authslice";
// import { useNavigate } from "react-router-dom";
// import { FiMail, FiLock } from "react-icons/fi";
// import { FaArrowRight } from "react-icons/fa";

// export default function Login() {
//   const [formData, setFormData] = useState({ email: "", password: "" });
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [apiError, setApiError] = useState("");
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   // Handle input changes
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     setErrors((prev) => ({ ...prev, [name]: "" }));
//   };

//   // Validation
//   const validate = () => {
//     const newErrors = {};
//     if (!formData.email) newErrors.email = "Email is required";
//     else if (!/\S+@\S+\.\S+/.test(formData.email))
//       newErrors.email = "Email is invalid";

//     if (!formData.password) newErrors.password = "Password is required";
//     else if (formData.password.length < 6)
//       newErrors.password = "Password must be at least 6 characters";

//     return newErrors;
//   };

//   // Submit handler
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setApiError("");
//     const validationErrors = validate();
//     if (Object.keys(validationErrors).length > 0) {
//       setErrors(validationErrors);
//       return;
//     }

//     setLoading(true);
//     try {
//       const res = await apiPost(apiPath.loginadmin, formData);
//       if (res.success === true && res.results?.token) {
//         dispatch(loginSuccess({ user: res.results, token: res.results.token }));
//         navigate("/admin/dashboard");
//       } else {
//         setApiError(res.message || "Login failed");
//       }
//     } catch (err) {
//       setApiError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       {/* Left Section */}
//       <div className="flex flex-col justify-center w-full lg:w-1/2 px-8 sm:px-16 md:px-20 lg:px-24">
//         <div className="max-w-md mx-auto w-full">
//           {/* Logo */}
//           <div className="flex justify-center mb-8">
//             <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
//               <span className="text-white text-2xl font-bold">A</span>
//             </div>
//           </div>

//           <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">
//             Welcome Back!
//           </h1>
//           <p className="text-gray-500 text-center mb-8">
//             Please enter your credentials to continue
//           </p>

//           <form onSubmit={handleSubmit} className="space-y-5">
//             {/* Email */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Email Address
//               </label>
//               <div className="relative">
//                 <FiMail className="absolute left-3 top-3 text-gray-400" size={18} />
//                 <input
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   placeholder="you@example.com"
//                   className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 text-gray-700 focus:outline-none ${
//                     errors.email
//                       ? "border-red-500 focus:ring-red-400"
//                       : "border-gray-300 focus:ring-indigo-400"
//                   }`}
//                 />
//               </div>
//               {errors.email && (
//                 <p className="text-red-500 text-sm mt-1">{errors.email}</p>
//               )}
//             </div>

//             {/* Password */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Password
//               </label>
//               <div className="relative">
//                 <FiLock className="absolute left-3 top-3 text-gray-400" size={18} />
//                 <input
//                   type="password"
//                   name="password"
//                   value={formData.password}
//                   onChange={handleChange}
//                   placeholder="••••••••"
//                   className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 text-gray-700 focus:outline-none ${
//                     errors.password
//                       ? "border-red-500 focus:ring-red-400"
//                       : "border-gray-300 focus:ring-indigo-400"
//                   }`}
//                 />
//               </div>
//               {errors.password && (
//                 <p className="text-red-500 text-sm mt-1">{errors.password}</p>
//               )}
//             </div>

//             {/* API error */}
//             {apiError && <p className="text-red-500 text-sm">{apiError}</p>}

//             {/* Remember + Forgot */}
//             <div className="flex items-center justify-between text-sm">
//               <label className="flex items-center space-x-2">
//                 <input type="checkbox" className="h-4 w-4 text-indigo-600 rounded" />
//                 <span className="text-gray-600">Remember me</span>
//               </label>
//               <a href="#" className="text-indigo-600 hover:underline">
//                 Forgot Password?
//               </a>
//             </div>

//             {/* Submit */}
//             <button
//               type="submit"
//               disabled={loading}
//               className={`w-full flex items-center justify-center bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition ${
//                 loading ? "opacity-60 cursor-not-allowed" : ""
//               }`}
//             >
//               {loading ? "Signing In..." : "Login"}
//               {!loading && <FaArrowRight className="ml-2" />}
//             </button>

//             <p className="text-center text-gray-500 text-sm mt-4">
//               Don’t have an account?{" "}
//               <a href="#" className="text-indigo-600 hover:underline font-medium">
//                 Sign Up
//               </a>
//             </p>
//           </form>
//         </div>
//       </div>

//       {/* Right Section */}
//       <div className="hidden lg:flex w-1/2 bg-gradient-to-tr from-indigo-600 to-indigo-400 items-center justify-center relative">
//         <div className="text-center text-white max-w-sm px-6">
//           <img
//             src="/assets/login-illustration.png" // ← replace with your illustration or /mnt/data/64bb1fd2-fd0e-425d-a1a9-6331c2ff712c.png
//             alt="Illustration"
//             className="w-80 mx-auto drop-shadow-2xl mb-6"
//           />
//           <h2 className="text-2xl font-semibold mb-2">
//             Seamless Work Experience
//           </h2>
//           <p className="text-indigo-100 text-sm">
//             Everything you need in an easily customizable dashboard.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }
import React, { useState } from "react";
import { apiPost } from "../api/apiFetch";
import apiPath from "../api/apiPath";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/features/auth/authslice";
import { useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Validation
  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    return newErrors;
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await apiPost(apiPath.loginadmin, formData);
      if (res.success === true && res.results?.token) {
        dispatch(loginSuccess({ user: res.results, token: res.results.token }));
        navigate("/admin/dashboard");
      } else {
        setApiError(res.message || "Login failed");
      }
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[100vh] bg-gray-50">
      {/* Left Section */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 px-8 sm:px-16 md:px-20 lg:px-24">
        <div className="max-w-md mx-auto w-full">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white text-2xl font-bold">A</span>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">
            Welcome Back!
          </h1>
          <p className="text-gray-500 text-center mb-8">
            Please enter your credentials to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 text-gray-700 focus:outline-none ${
                    errors.email
                      ? "border-red-500 focus:ring-red-400"
                      : "border-gray-300 focus:ring-indigo-400"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 text-gray-700 focus:outline-none ${
                    errors.password
                      ? "border-red-500 focus:ring-red-400"
                      : "border-gray-300 focus:ring-indigo-400"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* API error */}
            {apiError && <p className="text-red-500 text-sm">{apiError}</p>}

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="h-4 w-4 text-indigo-600 rounded" />
                <span className="text-gray-600">Remember me</span>
              </label>
              <Link to="/reset-password" className="text-yellow-500 hover:underline">
                Forgot Password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center bg-yellow-500 text-white py-2.5 rounded-lg font-semibold hover:bg-yellow-600 transition ${
                loading ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Signing In..." : "Login"}
              {!loading && <FaArrowRight className="ml-2" />}
            </button>

            <p className="text-center text-gray-500 text-sm mt-4">
              Don’t have an account?{" "}
              <a href="#" className="text-yellow-500 hover:underline font-medium">
                Sign Up
              </a>
            </p>
          </form>
        </div>
      </div>

      {/* Right Section */}
    <div className="hidden lg:flex w-1/2 bg-gradient-to-tr from-yellow-500 to-indigo-400 items-center relative">
  <div className="text-center text-white h-full w-full grid grid-rows-2">
    {/* Top half - Image */}
    <div className="w-full h-full">
      <img
        src="https://i.pinimg.com/1200x/9a/c8/b6/9ac8b6c7e2b5744245154b9b78c7b0ce.jpg"
        alt="Illustration"
        className="w-full h-full object-cover drop-shadow-2xl"
      />
    </div>

    {/* Bottom half - Text */}
    <div className="flex flex-col items-center justify-center px-6 w-full h-full">
      <h2 className="text-2xl font-semibold mb-2">Seamless Work Experience</h2>
      <p className="text-indigo-100 text-sm">
        Everything you need in an easily customizable dashboard.
      </p>
    </div>
  </div>
</div>


    </div>
  );
}
