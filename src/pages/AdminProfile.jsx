import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Avatar, { genConfig } from "react-nice-avatar";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaPhoneAlt, FaUserShield, FaMapMarkerAlt } from "react-icons/fa";
import Modal from "../components/Modal";
import apiPath from "../api/apiPath";
import { apiPost, apiGet, apiPut } from "../api/apiFetch";
import toast from "react-hot-toast";
import PhoneInput from "react-phone-input-2";

export default function AdminProfile() {
  const baseurl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch admin profile
  const { data, isLoading, error: isError } = useQuery({
    queryKey: ["adminDetails"],
    queryFn: () => apiGet(`${apiPath.getAdminProfile}`),
  });

  const profile = data?.results || {};

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contact: "",
    region: "",
    address: "",
  });

  const [profilePic, setProfilePic] = useState(null); // for file upload
  const [preview, setPreview] = useState(""); // for image preview
  const fileInputRef = useRef();

  // Open modal and pre-fill form
  const handleOpenModal = () => {
    setFormData({
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      email: profile.email || "",
      contact: profile.contact || "",
      region: profile.region || "",
      address: profile.address || "",
    });
    setPreview(profile.profilePic ? `${profile.profilePic}` : "");
    setProfilePic(null);
    setIsModalOpen(true);
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    const formattedValue =
      value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setPreview(URL.createObjectURL(file)); // preview the selected image
    }
  };

  // Update mutation (FormData)
  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const formDataToSend = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value) formDataToSend.append(key, value);
      });
      if (profilePic) formDataToSend.append("profilePic", profilePic);

      return apiPost(apiPath.updateAdminProfile, formDataToSend);
    },
onSuccess: (data) => {
  toast.success("Profile updated");

  // Update React Query cache
  queryClient.setQueryData(["adminDetails"], {
    results: data.results,
  });
  
  console.log("data.resutls",data.results);
  // Persist for refresh / new tab
  localStorage.setItem("user", JSON.stringify(data.results));

  setIsModalOpen(false);
},

    onError:(error)=>
    {
      console.log(error)
      toast.error(error?.message);
    }
  });

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();

    const requiredFields = ["firstName", "lastName", "email", "contact", "region", "address"];
    const missing = requiredFields.filter((f) => !formData[f].trim());

    if (missing.length > 0) {
      toast.error("Please fill all required fields before saving.");
      return;
    }

    updateMutation.mutate(formData);
  };


  // Avatar config
  const config = genConfig({
    sex: "man",
    faceColor: "#f9d3b4",
    bgColor: "#c7d2fe",
  });

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading profile...
      </div>
    );

  if (isError)
    return (
      <div className="flex justify-center items-center h-screen text-red-600">
        Failed to load profile. Please try again.
      </div>
    );

  return (
    <div className="p-3">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 cursor-pointer px-4 py-1 bg-gray-100 rounded-lg hover:bg-gray-200"
      >
        ← Back
      </button>

      <div className="min-h-screen bg-gray-100 md:p-8 flex justify-center">
        <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="relative h-44 bg-gradient-to-r from-yellow-500 via-yellow-200 to-yellow-500">
            <div className="absolute left-10 top-28 flex items-center gap-4">
              {profile.profilePic ? (
                <img
                  src={`${profile.profilePic}`}
                  alt="Profile"
                  className="rounded-full border-4 border-white shadow-lg w-[100px] h-[100px] object-cover"
                />
              ) : (
                <Avatar
                  className="rounded-full border-4 border-white shadow-lg"
                  style={{ width: "100px", height: "100px" }}
                  {...config}
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {profile.firstName} {profile.lastName}
                </h1>
                <p className="text-sm text-black capitalize">{profile.role}</p>
              </div>
            </div>

            <button
              onClick={handleOpenModal}
              className="absolute md:top-32 top-4 right-10 bg-white text-yellow-500 border border-yellow-500 cursor-pointer px-5 py-2 rounded-lg shadow transition-all hover:bg-yellow-500 hover:text-white"
            >
              Edit Profile
            </button>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-10 pt-20">
            {/* Left - Details */}
            <div className="md:col-span-2 space-y-8">
              <div className="grid grid-cols-2 gap-y-3 text-gray-700">
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-blue-500" />
                  <span>{profile.address || "N/A"}</span>
                </div>
                <div>
                  <span className="font-semibold">Account ID:</span> {profile._id}
                </div>
                <div>
                  <span className="font-semibold">Role:</span>{" "}
                  <span className="capitalize">{profile.role}</span>
                </div>
                <div>
                  <span className="font-semibold">Status:</span>{" "}
                  <span
                    className={`font-semibold ${profile.status === "active" ? "text-green-600" : "text-red-600"
                      }`}
                  >
                    {profile.status}
                  </span>
                </div>
              </div>

              {/* Detailed Info */}
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-3">
                  <FaUserShield className="text-blue-500" />
                  <span className="w-24 font-semibold text-gray-600">Role:</span>
                  <span className="text-gray-800 capitalize">{profile.role}</span>
                </div>

                <div className="flex items-center gap-3">
                  <FaEnvelope className="text-blue-500" />
                  <span className="w-24 font-semibold text-gray-600">Email:</span>
                  <span className="text-gray-800">{profile.email}</span>
                </div>

                <div className="flex items-center gap-3">
                  <FaPhoneAlt className="text-blue-500" />
                  <span className="w-24 font-semibold text-gray-600">Contact:</span>
                  <span className="text-gray-800">{profile.contact || "N/A"}</span>
                </div>

                <div className="flex items-center gap-3">
                  <FaMapMarkerAlt className="text-blue-500" />
                  <span className="w-24 font-semibold text-gray-600">Region:</span>
                  <span className="text-gray-800">{profile.region || "N/A"}</span>
                </div>
              </div>

              {/* Wallet Balance Highlight Card */}
              {/* Structured Wallet Balance Card */}
              <div className="mt-8">
                <div className="
    border border-gray-200 bg-white 
    rounded-xl p-6 shadow-md
  ">

                  <div className="flex items-center justify-between">

                    {/* Title */}
                    <div>
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Wallet Balance
                      </p>
                      <h2 className="text-2xl font-bold text-gray-800 mt-1">
                        ₹ {profile.walletBalance?.toLocaleString() || 0}
                      </h2>
                    </div>

                    {/* Icon */}
                    <div className="
        w-14 h-14 flex items-center justify-center rounded-lg 
        bg-yellow-100 border border-yellow-200
      ">
                      <span className="text-3xl text-yellow-600">💰</span>
                    </div>

                  </div>

                  {/* Divider Line */}
                  <div className="border-t mt-4 pt-3 border-gray-200">
                    <p className="text-xs text-gray-500">
                      This balance is system-managed and cannot be edited by the admin.
                    </p>
                  </div>

                </div>
              </div>



              {/* Activities */}
              <div className="mt-10 bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                  Your Activities
                </h2>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>
                    {/* Logged in last at <b>{new Date(profile.lastLogin).toLocaleString()}</b> */}
                  </li>
                  <li>
                    Account created on{" "}
                    <b>{new Date(profile.createdAt).toLocaleDateString()}</b>
                  </li>
                  <li>
                    Last updated on{" "}
                    <b>{new Date(profile.updatedAt).toLocaleDateString()}</b>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✏️ Edit Profile Modal */}
      <Modal isOpen={isModalOpen} title="Edit Profile" onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload Section */}
          <div className="flex flex-col items-center">
            <div className="relative w-28 h-28">
              <img
                src={preview || `${profile.profilePic}` || ""}
                alt="Preview"
                className="w-28 h-28 rounded-full object-cover border-2 border-yellow-400"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="absolute bottom-0 right-0 cursor-pointer bg-yellow-500 text-white rounded-full p-2 text-xs shadow-md hover:bg-yellow-600"
              >
                📸
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">Click camera icon to change</p>
          </div>

          {/* Input Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className={`w-full border rounded-md px-3 py-2 focus:ring-yellow-400 focus:border-yellow-400 ${!formData.firstName && "border-red-400"
                  }`}
              />
              {!formData.firstName && (
                <p className="text-xs text-red-500 mt-1">First name is required</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className={`w-full border rounded-md px-3 py-2 focus:ring-yellow-400 focus:border-yellow-400 ${!formData.lastName && "border-red-400"
                  }`}
              />
              {!formData.lastName && (
                <p className="text-xs text-red-500 mt-1">Last name is required</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              onChange={handleChange}
              required
              className={`w-full border rounded-md px-3 py-2 focus:ring-yellow-400 focus:border-yellow-400 ${!formData.email && "border-red-400"
                }`}
            />
            {!formData.email && (
              <p className="text-xs text-red-500 mt-1">Email is required</p>
            )}
          </div>

          <div>

            {/* <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              required
              className={`w-full border rounded-md px-3 py-2 focus:ring-yellow-400 focus:border-yellow-400 ${!formData.contact && "border-red-400"
                }`}
            />
            {!formData.contact && (
              <p className="text-xs text-red-500 mt-1">Contact number is required</p>
            )} */}
            <PhoneInput
              country="in"
              enableSearch
              value={formData.contact}
              onChange={(phone) =>
                setFormData((prev) => ({ ...prev, contact: phone }))
              }
              inputClass="w-full py-1 px-2 rounded-lg border border-gray-300"
            />

          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Region <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="region"
              value={formData.region}
              onChange={handleChange}
              required
              className={`w-full border rounded-md px-3 py-2 focus:ring-yellow-400 focus:border-yellow-400 ${!formData.region && "border-red-400"
                }`}
            />
            {!formData.region && (
              <p className="text-xs text-red-500 mt-1">Region is required</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Address <span className="text-red-500">*</span>
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              rows="3"
              className={`w-full border rounded-md px-3 py-2 focus:ring-yellow-400 focus:border-yellow-400 resize-none ${!formData.address && "border-red-400"
                }`}
              placeholder="Enter your address"
            ></textarea>
            {!formData.address && (
              <p className="text-xs text-red-500 mt-1">Address is required</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-gray-200 cursor-pointer text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-4 py-2 cursor-pointer bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
