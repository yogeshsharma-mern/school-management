// import React, { useState } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { apiGet, apiPost } from "../api/apiFetch";
// import apiPath from "../api/apiPath";
// import toast from "react-hot-toast";
// import { Loader2, Plus, ShieldCheck, ShieldX } from "lucide-react";

// export default function IpSettings() {
//   const queryClient = useQueryClient();
//   const [activeTab, setActiveTab] = useState("whitelist");
//   const [form, setForm] = useState({ ipAddress: "", note: "" });

//   // ✅ Fetch IPs according to active tab
//   const { data, isLoading, isFetching } = useQuery({
//     queryKey: ["ipAddresses", activeTab],
//     queryFn: () =>
//       apiGet(`${apiPath.getIpAddress}`, { status: activeTab }),
//   });

//   const ipList = data?.results?.items?.filter((i) => i.status === activeTab) || [];

//   // ✅ Add new IP Mutation
//   const addIpMutation = useMutation({
//     mutationFn: (payload) => apiPost(apiPath.registerIp, payload),
//     onSuccess: (res) => {
//       toast.success(res.message || "IP added successfully ✅");
//       setForm({ ipAddress: "", note: "" });
//       queryClient.invalidateQueries(["ipAddresses"]);
//     },
//     onError: (err) => {
//       toast.error(err?.response?.data?.message || "Failed to add IP ❌");
//     },
//   });

//   // ✅ Handle Input Change
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   // ✅ Handle Submit
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!form.ipAddress.trim()) return toast.error("IP Address is required!");

//     addIpMutation.mutate({
//       ipAddress: form.ipAddress,
//       note: form.note,
//       status: activeTab, // ← set automatically from tab
//     });
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-6 py-8 text-gray-800">
//       <h1 className="text-2xl font-bold mb-6">IP Settings</h1>

//       {/* Tabs */}
//       <div className="flex gap-4 mb-6 border-b border-gray-300">
//         {["whitelist", "blacklist"].map((tab) => (
//           <button
//             key={tab}
//             onClick={() => setActiveTab(tab)}
//             className={`px-5 py-2 text-sm font-medium border-b-2 transition-all duration-200 ${
//               activeTab === tab
//                 ? "border-yellow-500 text-yellow-600"
//                 : "border-transparent text-gray-500 hover:text-gray-700"
//             }`}
//           >
//             {tab === "whitelist" ? "Whitelist" : "Blacklist"}
//           </button>
//         ))}
//       </div>

//       {/* Add IP Form */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
//         <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
//           {activeTab === "whitelist" ? (
//             <>
//               <ShieldCheck className="w-5 h-5 text-green-600" /> Add Whitelist IP
//             </>
//           ) : (
//             <>
//               <ShieldX className="w-5 h-5 text-red-600" /> Add Blacklist IP
//             </>
//           )}
//         </h2>

//         <form
//           onSubmit={handleSubmit}
//           className="grid grid-cols-1 md:grid-cols-3 gap-4"
//         >
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               IP Address <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="text"
//               name="ipAddress"
//               value={form.ipAddress}
//               onChange={handleChange}
//               placeholder="e.g. 192.168.2.53"
//               className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-400 outline-none"
//             />
//           </div>

//           <div className="md:col-span-2">
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Note
//             </label>
//             <input
//               type="text"
//               name="note"
//               value={form.note}
//               onChange={handleChange}
//               placeholder="e.g. Main office system"
//               className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-400 outline-none"
//             />
//           </div>

//           <div className="md:col-span-3 flex justify-end mt-3">
//             <button
//               type="submit"
//               disabled={addIpMutation.isLoading}
//               className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-4 py-2 rounded-lg shadow-md transition cursor-pointer"
//             >
//               {addIpMutation.isLoading ? (
//                 <>
//                   <Loader2 className="animate-spin w-4 h-4" /> Adding...
//                 </>
//               ) : (
//                 <>
//                   <Plus className="w-4 h-4" /> Add IP
//                 </>
//               )}
//             </button>
//           </div>
//         </form>
//       </div>

//       {/* IP List */}
//       <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-x-auto">
//         {isLoading || isFetching ? (
//           <div className="flex justify-center py-10">
//             <Loader2 className="animate-spin w-6 h-6 text-yellow-500" />
//           </div>
//         ) : ipList.length === 0 ? (
//           <p className="text-center py-6 text-gray-500">
//             No {activeTab} IPs found
//           </p>
//         ) : (
//           <table className="w-full text-sm">
//             <thead className="bg-gray-100 text-gray-700 border-b border-gray-200">
//               <tr>
//                 <th className="text-left px-4 py-3 font-semibold">IP Address</th>
//                 <th className="text-left px-4 py-3 font-semibold">Note</th>
//                 <th className="text-left px-4 py-3 font-semibold">Created At</th>
//               </tr>
//             </thead>
//             <tbody>
//               {ipList.map((ip) => (
//                 <tr
//                   key={ip._id}
//                   className="border-b border-gray-200 hover:bg-gray-50 transition text-gray-700"
//                 >
//                   <td className="px-4 py-3 font-medium">{ip.ipAddress}</td>
//                   <td className="px-4 py-3">{ip.note || "—"}</td>
//                   <td className="px-4 py-3">
//                     {new Date(ip.createdAt).toLocaleString()}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>
//     </div>
//   );
// }
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "../api/apiFetch";
import apiPath from "../api/apiPath";
import toast from "react-hot-toast";
import { Loader2, Plus, ShieldCheck, ShieldX } from "lucide-react";

export default function IpSettings() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("whitelist");
    const [form, setForm] = useState({ ipAddress: "", note: "" });
    const [ipError, setIpError] = useState("");
    const [noteError, setNoteError] = useState("");


    // ✅ Fetch IPs according to active tab
    const { data, isLoading, isFetching } = useQuery({
        queryKey: ["ipAddresses", activeTab],
        queryFn: () => apiGet(`${apiPath.getIpAddress}`, { status: activeTab }),
    });

    const ipList =
        data?.results?.items?.filter((i) => i.status === activeTab) || [];

    // ✅ IP Validation Function
    const validateIp = (ip) => {
        const ipRegex =
            /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
        return ipRegex.test(ip);
    };

    // ✅ Handle Input Change + Validation
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));

        if (name === "ipAddress") {
            if (value.trim() === "") {
                setIpError("");
            } else if (!validateIp(value)) {
                setIpError("Enter a valid IPv4 address (e.g. 192.168.0.1)");
            } else {
                setIpError("");
            }
        }
        if (name === "note") {
            if (value.trim() === "") {
                setNoteError("");
            }
            // ❌ If it contains anything other than letters
            else if (!/^[A-Za-z\s]+$/.test(value)) {
                setNoteError("Only alphabets are allowed in note");
            }
            else {
                setNoteError("");
            }
        }
    };

    // ✅ Add new IP Mutation
    const addIpMutation = useMutation({
        mutationFn: (payload) => apiPost(apiPath.registerIp, payload),
        onSuccess: (res) => {
            toast.success(res.message || "IP added successfully ✅");
            setForm({ ipAddress: "", note: "" });
            setIpError("");
            queryClient.invalidateQueries(["ipAddresses"]);
        },
        onError: (err) => {
            const msg =
                err?.response?.data?.message ||
                "Failed to add IP ❌";
            toast.error(msg);
            if (msg.toLowerCase().includes("duplicate") || msg.includes("exists")) {
                setIpError("This IP address already exists.");
            }
        },
    });

    // ✅ Handle Submit
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!form.ipAddress.trim()) return toast.error("IP Address is required!");
        if (ipError) return toast.error("Please enter a valid IP address!");

        addIpMutation.mutate({
            ipAddress: form.ipAddress,
            note: form.note,
            status: activeTab,
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-6 py-8 text-gray-800">
            <h1 className="text-2xl font-bold mb-6">IP Settings</h1>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-300">
                {["whitelist", "blacklist"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-2 text-sm font-medium border-b-2 transition-all duration-200 ${activeTab === tab
                            ? "border-yellow-500 text-yellow-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        {tab === "whitelist" ? "Whitelist" : "Blacklist"}
                    </button>
                ))}
            </div>

            {/* Add IP Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    {activeTab === "whitelist" ? (
                        <>
                            <ShieldCheck className="w-5 h-5 text-green-600" /> Add Whitelist IP
                        </>
                    ) : (
                        <>
                            <ShieldX className="w-5 h-5 text-red-600" /> Add Blacklist IP
                        </>
                    )}
                </h2>

                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                    {/* IP Address */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            IP Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="ipAddress"
                            value={form.ipAddress}
                            onChange={handleChange}
                            onKeyDown={(e) => {
                                // Allow control keys (Backspace, Tab, Delete, Arrows)
                                if (
                                    e.key === "Backspace" ||
                                    e.key === "Tab" ||
                                    e.key === "Delete" ||
                                    e.key === "ArrowLeft" ||
                                    e.key === "ArrowRight"
                                ) {
                                    return;
                                }

                                // Allow only digits (0-9) and dots (.)
                                if (!/[0-9.]/.test(e.key)) {
                                    e.preventDefault();
                                    setIpError("Only numbers and dots are allowed (e.g. 192.168.1.1)");
                                } else {
                                    setIpError(""); // clear error when valid
                                }
                            }}
                            placeholder="e.g. 192.168.2.53"
                            className={`w-full border rounded-lg px-3 py-2 focus:ring-2 outline-none ${ipError
                                ? "border-red-400 focus:ring-red-400"
                                : "border-gray-300 focus:ring-yellow-400"
                                }`}
                        />
                        {ipError && (
                            <p className="text-xs text-red-500 mt-1">{ipError}</p>
                        )}
                    </div>

                    {/* Note */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Note
                        </label>
                        <input
                            type="text"
                            name="note"
                            value={form.note}
                            onChange={handleChange}
                            onKeyDown={(e) => {
                                if (/[0-9]/.test(e.key)) {
                                    e.preventDefault(); // stop typing numbers
                                    setNoteError("Only alphabets are allowed");
                                }
                            }}
                            placeholder="e.g. Main Office"
                            className={`w-full border rounded-lg px-3 py-2 focus:ring-2 outline-none ${noteError
                                ? "border-red-400 focus:ring-red-400"
                                : "border-gray-300 focus:ring-yellow-400"
                                }`}
                        />

                        {noteError && (
                            <p className="text-xs text-red-500 mt-1">{noteError}</p>
                        )}
                    </div>

                    {/* Submit */}
                    <div className="md:col-span-3 flex justify-end mt-3">
                        <button
                            type="submit"
                            disabled={addIpMutation.isLoading || !!ipError}
                            className={`flex items-center gap-2 font-medium px-4 py-2 rounded-lg shadow-md transition cursor-pointer ${addIpMutation.isLoading || ipError
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-[image:var(--gradient-primary)] hover:bg-yellow-600 "
                                }`}
                        >
                            {addIpMutation.isLoading ? (
                                <>
                                    <Loader2 className="animate-spin w-4 h-4" /> Adding...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" /> Add IP
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* IP List */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-x-auto">
                {isLoading || isFetching ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="animate-spin w-6 h-6 text-yellow-500" />
                    </div>
                ) : ipList.length === 0 ? (
                    <p className="text-center py-6 text-gray-500">
                        No {activeTab} IPs found
                    </p>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 text-gray-700 border-b border-gray-200">
                            <tr>
                                <th className="text-left px-4 py-3 font-semibold">IP Address</th>
                                <th className="text-left px-4 py-3 font-semibold">Note</th>
                                <th className="text-left px-4 py-3 font-semibold">Created At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ipList.map((ip) => (
                                <tr
                                    key={ip._id}
                                    className="border-b border-gray-200 hover:bg-gray-50 transition text-gray-700"
                                >
                                    <td className="px-4 py-3 font-medium">{ip.ipAddress}</td>
                                    <td className="px-4 py-3">{ip.note || "—"}</td>
                                    <td className="px-4 py-3">
                                        {new Date(ip.createdAt).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
