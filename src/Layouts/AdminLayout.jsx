// import { useState } from "react";
// import { Outlet } from "react-router-dom";
// import { FaBars } from "react-icons/fa";
// import Sidebar from "../components/Sidebar";
// import { useSelector } from "react-redux";
// import Avatar, { genConfig } from 'react-nice-avatar';
// import { useEffect } from "react";


// export default function AdminLayout() {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
//   const user = localStorage.getItem("user");
//   const newUser = JSON.parse(user);
//   const config = genConfig({ sex: "man", faceColor: "#d2a679", bgColor: "yellow" })

//   const toggleSidebar = () => setSidebarOpen((prev) => !prev);

//   useEffect(() => {
//     if (theme === "dark") {
//       document.documentElement.classList.add("dark");
//     } else {
//       document.documentElement.classList.remove("dark");
//     }
//     localStorage.setItem("theme", theme);
//   }, [theme]);

//   const toggleTheme = () => {
//     setTheme((prev) => (prev === "light" ? "dark" : "light"));
//   };
//   return (
//     <div className="flex h-screen w-full bg-[var(--color-neutral)] ">
//       {/* Sidebar */}
//       <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

//       {/* Main Content Area */}
//       <div className="flex-1 flex flex-col ">
//         {/* Header */}
//         <header className="h-16   shadow flex items-center bg-[var(--color-neutral)]   w-full justify-between px-6 md:px-8">
//           <div className="flex items-center space-x-4">
//             {/* Mobile Hamburger */}
//             <button
//               className="text-gray-700 cursor-pointer md:hidden focus:outline-none"
//               onClick={toggleSidebar}
//             >
//               <FaBars size={20} />
//             </button>
//             <h1 className="text-xl font-semibold">Admin Panel</h1>
//           </div>
//           <div className="flex items-center space-x-4">
//             <div>
//               <button
//                 onClick={toggleTheme}
//                 className="px-4 py-2 cursor-pointer"
//               >
//                 {theme === "light" ? "🌙" : "☀️"}
//               </button>
//               <span className="font-bold">Hello,</span> {newUser.fullName}
//             </div>
//             {/* <input
//               type="text"
//               placeholder="Search..."
//               className="px-3 py-1 border rounded-lg text-sm focus:outline-none"
//             /> */}
//             {/* <div className="w-8 h-8 rounded-full bg-gray-300"></div> */}

//             <Avatar style={{ width: '32px', height: '32px' }} {...config} />
//           </div>
//         </header>

//         {/* Page Content */}
//         <main className="flex-1 p-6 overflow-auto">
//           <div className="w-full overflow-x-auto">
//             <Outlet />
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }
import { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import Sidebar from "../components/Sidebar";
import Avatar, { genConfig } from "react-nice-avatar";
import { logout } from "../redux/features/auth/authslice";
import { useDispatch } from "react-redux";
import { User } from "lucide-react";


export default function AdminLayout() {
  const dispacth = useDispatch();
  const baseurl = import.meta.env.VITE_API_BASE_URL;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  console.log("user",user);
  const config = genConfig({ sex: "man", faceColor: "#d2a679", bgColor: "yellow" });

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  const goToProfile = () => {
    navigate("/admin/profile");
    setMenuOpen(false);
  };

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex h-screen w-full bg-[var(--color-neutral)]">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 shadow flex items-center bg-[var(--color-neutral)] w-full justify-between px-6 md:px-8">
          <div className="flex items-center space-x-4">
            <button
              className="text-gray-700 cursor-pointer md:hidden focus:outline-none"
              onClick={toggleSidebar}
            >
              <FaBars size={20} />
            </button>
            <h1 className="text-xl font-semibold">Admin Panel</h1>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4 relative" ref={menuRef}>
            <button
              onClick={toggleTheme}
              className="px-4 py-2 cursor-pointer   rounded transition"
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>

            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setMenuOpen((prev) => !prev)}>
                     <span className="hidden md:block font-semibold">{user.firstName} {user.lastName}</span>
              {/* <Avatar style={{ width: "32px", height: "32px" }} {...config} /> */}
              <img className="w-[40px] h-[40px] cursor-pointer rounded-full" src={`${baseurl}${user.profilePic}`} alt="profilePicture" />
       
            </div>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div className="absolute right-0 mt-12 w-40 bg-[var(--color-neutral)] shadow-lg rounded-md overflow-hidden z-50">
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-yellow-100 dark:hover:bg-yellow-500 transition"
                  onClick={goToProfile}
                >
                  My Profile
                </button>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-yellow-100 dark:hover:bg-yellow-500 transition"
                onClick={()=>dispacth(logout())}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="w-full overflow-x-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
