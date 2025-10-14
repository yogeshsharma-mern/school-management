// import React from "react";
// import Avatar, { genConfig } from "react-nice-avatar";
// import { Navigate, useNavigate } from "react-router-dom";
// import {
//   FaEnvelope,
//   FaPhoneAlt,
//   FaUserShield,
//   FaMapMarkerAlt,
// } from "react-icons/fa";

// export default function AdminProfile() {
//   const user = JSON.parse(localStorage.getItem("user") || "{}");
//   const config = genConfig({
//     sex: "man",
//     faceColor: "#f9d3b4",
//     bgColor: "#c7d2fe",
//   });

//   const activities = [
//     { action: "Added a role 'Teacher'", date: "11/02/2025 10:45 AM" },
//     { action: "Updated student 'Rahul Sharma' details", date: "11/02/2025 10:15 AM" },
//     { action: "Assigned task to 'Worker - 1'", date: "11/02/2025 09:45 AM" },
//     { action: "Approved leave for 'Aditi Patel'", date: "11/02/2025 09:30 AM" },
//   ];
//   const navigate=useNavigate();

//   return (
//     <>
//           <button
//         onClick={() => navigate(-1)}
//         className="mb-4 cursor-pointer px-4 py-1 bg-gray-100 rounded-lg hover:bg-gray-200"
//       >
//         ← Back
//       </button>

//     <div className="min-h-screen bg-gray-100 md:p-8 flex justify-center">
//       <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden">
//         {/* Header Banner */}
//         <div className="relative h-44 bg-gradient-to-r from-yellow-500 via-yellow-200 to-yellow-500">
//           <div className="absolute left-10 top-28 flex items-center gap-4">
//             <Avatar
//               className="rounded-full border-4 border-white shadow-lg"
//               style={{ width: "100px", height: "100px" }}
//               {...config}
//             />
//             <div>
//               <h1 className="text-2xl font-bold text-white">
//                 {user.fullName || "Clay Jensen"}
//               </h1>
//               <p className="text-sm text-black">Administrator</p>
//             </div>
//           </div>
//           <button className="absolute top-32 right-10 bg-white text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-white px-5 py-2 rounded-lg shadow transition-all">
//             Edit Profile
//           </button>
//         </div>

//         {/* Content */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-10 pt-20">
//           {/* Left Content */}
//           <div className="md:col-span-2 space-y-8">
//             {/* Basic Info */}
//             <div className="grid grid-cols-2 gap-y-3 text-gray-700">
//               <div className="flex items-center gap-2">
//                 <FaMapMarkerAlt className="text-blue-500" />
//                 <span>
//                   {user.location || "Northridge, California (CA), 91326, USA"}
//                 </span>
//               </div>
//               <div>
//                 <span className="font-semibold">Age:</span> 24
//               </div>
//               <div>
//                 <span className="font-semibold">Gender:</span> Male
//               </div>
//               <div>
//                 <span className="font-semibold">Status:</span>{" "}
//                 <span className="text-green-600 font-semibold">Active</span>
//               </div>
//             </div>

//             {/* Detailed Info */}
//             <div className="space-y-4 mt-4">
//               <div className="flex items-center gap-3">
//                 <FaUserShield className="text-blue-500" />
//                 <span className="w-24 font-semibold text-gray-600">Role:</span>
//                 <span className="text-gray-800">Administrator</span>
//               </div>

//               <div className="flex items-center gap-3">
//                 <FaEnvelope className="text-blue-500" />
//                 <span className="w-24 font-semibold text-gray-600">Email:</span>
//                 <span className="text-gray-800">
//                   {user.email || "clay.jensen@email.com"}
//                 </span>
//               </div>

//               <div className="flex items-center gap-3">
//                 <FaPhoneAlt className="text-blue-500" />
//                 <span className="w-24 font-semibold text-gray-600">Contact:</span>
//                 <span className="text-gray-800">(+1) 45687-45687</span>
//               </div>

//               <div className="flex items-center gap-3">
//                 <FaMapMarkerAlt className="text-blue-500" />
//                 <span className="w-24 font-semibold text-gray-600">Region:</span>
//                 <span className="text-gray-800">Central US</span>
//               </div>
//             </div>

//             {/* Your Activities */}
//             <div className="mt-10 bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm">
//               <h2 className="text-lg font-semibold text-gray-800 mb-3">
//                 Your Activities
//               </h2>
//               <ul className="space-y-2 text-sm text-gray-600">
//                 <li>
//                   You added a role <b>‘Sales Lead’</b> —{" "}
//                   <span className="text-gray-400">19/02/2025</span>
//                 </li>
//                 <li>
//                   Assigned task ‘API Integration’ to{" "}
//                   <b>‘Technical Lead - BE’</b>
//                 </li>
//                 <li>Updated student record <b>‘Riya Sharma’</b></li>
//               </ul>
//             </div>
//           </div>

//           {/* Right Sidebar */}
//           <div className="bg-gray-50 border border-gray-200 rounded-xl shadow-sm p-6 h-fit">
//             <h3 className="text-lg font-semibold text-gray-800 mb-4">
//               Recent Activities
//             </h3>
//             <div className="space-y-4 text-sm text-gray-700">
//               {activities.map((a, i) => (
//                 <div
//                   key={i}
//                   className="border-b border-gray-200 pb-2 last:border-none"
//                 >
//                   <p>{a.action}</p>
//                   <span className="text-xs text-gray-400">{a.date}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>

//     </>

//   );
// }
import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Avatar, { genConfig } from "react-nice-avatar";
import { useNavigate } from "react-router-dom";
import apiPath from "../api/apiPath";
import { apiPut,apiGet,apiPost,apiDelete } from "../api/apiFetch";
import {
  FaEnvelope,
  FaPhoneAlt,
  FaUserShield,
  FaMapMarkerAlt,
} from "react-icons/fa";

// Fetch function for React Query
// const fetchAdminProfile = async () => {
//   const { data } = await apiGet(apiPath.getAdminProfile);
//   console.log("dataprofile",data)
//   return data.results;
// };

export default function AdminProfile() {
  const baseurl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const { data, isLoading, error:isError } = useQuery({
    queryKey: ["adminDetails"],
    queryFn: () => apiGet(`${apiPath.getAdminProfile}`)
  });
  const profile = data?.results || {};
  console.log("profile",profile);
  // Query to fetch admin profile
  // const { data: profile, isLoading, isError } = useQuery({
  //   queryKey: ["adminProfile"],
  //   queryFn: fetchAdminProfile,
  // });
  // console.log("profiledetails",profile)

  // Avatar config (for placeholder)
  const config = genConfig({
    sex: "man",
    faceColor: "#f9d3b4",
    bgColor: "#c7d2fe",
  });

  // Dummy recent activities
  const activities = [
    { action: "Added a role 'Teacher'", date: "11/02/2025 10:45 AM" },
    { action: "Updated student 'Rahul Sharma' details", date: "11/02/2025 10:15 AM" },
    { action: "Assigned task to 'Worker - 1'", date: "11/02/2025 09:45 AM" },
    { action: "Approved leave for 'Aditi Patel'", date: "11/02/2025 09:30 AM" },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading profile...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600">
        Failed to load profile. Please try again.
      </div>
    );
  }

  return (
    <>
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
              {`${baseurl}/${profile.profilePic}` ? (
                <img
                  src={profile.profilePic}
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

            <button className="absolute top-32 right-10 bg-white text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-white px-5 py-2 rounded-lg shadow transition-all">
              Edit Profile
            </button>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-10 pt-20">
            {/* Left - Details */}
            <div className="md:col-span-2 space-y-8">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-y-3 text-gray-700">
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-blue-500" />
                  <span>Northridge, California (CA), 91326, USA</span>
                </div>
                <div>
                  <span className="font-semibold">Account ID:</span>{" "}
                  {profile._id}
                </div>
                <div>
                  <span className="font-semibold">Role:</span>{" "}
                  <span className="capitalize">{profile.role}</span>
                </div>
                <div>
                  <span className="font-semibold">Status:</span>{" "}
                  <span
                    className={`font-semibold ${
                      profile.status === "active" ? "text-green-600" : "text-red-600"
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
                  <span className="text-gray-800">(+1) 45687-45687</span>
                </div>

                <div className="flex items-center gap-3">
                  <FaMapMarkerAlt className="text-blue-500" />
                  <span className="w-24 font-semibold text-gray-600">Region:</span>
                  <span className="text-gray-800">Central US</span>
                </div>
              </div>

              {/* Activities */}
              <div className="mt-10 bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                  Your Activities
                </h2>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>
                    Logged in last at{" "}
                    <b>{new Date(profile.lastLogin).toLocaleString()}</b>
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

            {/* Right - Recent Activities */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl shadow-sm p-6 h-fit">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Recent Activities
              </h3>
              <div className="space-y-4 text-sm text-gray-700">
                {activities.map((a, i) => (
                  <div
                    key={i}
                    className="border-b border-gray-200 pb-2 last:border-none"
                  >
                    <p>{a.action}</p>
                    <span className="text-xs text-gray-400">{a.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
