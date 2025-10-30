// import { FaHome, FaUserGraduate, FaChalkboardTeacher, FaBook, FaMoneyBill } from "react-icons/fa";
// import { Link } from "react-router-dom";
// import { SiGoogleclassroom } from "react-icons/si";
// import { useDispatch } from "react-redux";
// import { logout } from "../redux/features/auth/authslice";
// import { NavLink } from "react-router-dom";
// import { IoIosSettings } from "react-icons/io";
// import { TbLockPassword } from "react-icons/tb";




// export default function Sidebar({ isOpen, toggleSidebar }) {
//   const dispatch = useDispatch();
//   return (
//     <aside
//       className={`
//         fixed top-0 z-[100] left-0 h-full bg-[#0d1b2a] text-white flex flex-col shadow-lg
//         w-64 transform transition-transform duration-300 ease-in-out
//         ${isOpen ? "translate-x-0" : "-translate-x-full"} 
//         md:translate-x-0 md:static md:w-64
//       `}
//     >
//       {/* Logo */}
//       <div className="p-6 font-bold text-2xl tracking-wide flex items-center space-x-2">
//         <span className="bg-yellow-400 text-black px-2 py-1 rounded-lg">L</span>
//         <span>Learnyos</span>
//       </div>

//       {/* Navigation */}
//       <nav className="flex-1 px-4 space-y-2">
//         <NavLink
//           to="/admin/dashboard"
//           className={({ isActive }) =>
//             `flex items-center space-x-3 p-3 rounded-xl transition ${isActive ? "bg-[#1b263b] text-yellow-400" : "hover:bg-[#1b263b]"
//             }`
//           }
//           onClick={toggleSidebar}
//         >
//           <FaHome size={20} />
//           <span>Dashboard</span>
//         </NavLink>

//         <NavLink
//           to="/admin/classess"
//           className={({ isActive }) =>
//             `flex items-center space-x-3 p-3 rounded-xl transition ${isActive ? "bg-[#1b263b] text-yellow-400" : "hover:bg-[#1b263b]"
//             }`
//           }
//           onClick={toggleSidebar}
//         >
//           <SiGoogleclassroom size={20} />
//           <span>Classes</span>
//         </NavLink>
//         <NavLink
//           to="/admin/subjects"
//           className={({ isActive }) =>
//             `flex items-center space-x-3 p-3 rounded-xl transition ${isActive ? "bg-[#1b263b] text-yellow-400" : "hover:bg-[#1b263b]"
//             }`
//           }
//           onClick={toggleSidebar}
//         >
//           <SiGoogleclassroom size={20} />
//           <span>Subjects</span>
//         </NavLink>
//          <NavLink
//           to="/admin/assign"
//           className={({ isActive }) =>
//             `flex items-center space-x-3 p-3 rounded-xl transition ${isActive ? "bg-[#1b263b] text-yellow-400" : "hover:bg-[#1b263b]"
//             }`
//           }
//           onClick={toggleSidebar}
//         >
//           <SiGoogleclassroom size={20} />
//           <span>Assign</span>
//         </NavLink>
//         <NavLink
//           to="/admin/students"
//           className={({ isActive }) =>
//             `flex items-center space-x-3 p-3 rounded-xl transition ${isActive ? "bg-[#1b263b] text-yellow-400" : "hover:bg-[#1b263b]"
//             }`
//           }
//           onClick={toggleSidebar}
//         >
//           <FaUserGraduate size={20} />
//           <span>Students</span>
//         </NavLink>
//         <NavLink
//           to="/admin/teachers"
//           className={({ isActive }) =>
//             `flex items-center space-x-3 p-3 rounded-xl transition ${isActive ? "bg-[#1b263b] text-yellow-400" : "hover:bg-[#1b263b]"
//             }`
//           }
//           onClick={toggleSidebar}
//         >
//           <FaChalkboardTeacher size={20} />
//           <span>Teachers </span>
//         </NavLink>
//              <NavLink
//           to="/admin/teacher/attendance"
//           className={({ isActive }) =>
//             `flex items-center space-x-3 p-3 rounded-xl transition ${isActive ? "bg-[#1b263b] text-yellow-400" : "hover:bg-[#1b263b]"
//             }`
//           }
//           onClick={toggleSidebar}
//         >
//           <FaChalkboardTeacher size={20} />
//           <span>Teachers Attendance</span>
//         </NavLink>
//                  <NavLink
//           to="/admin/teacher/salary"
//           className={({ isActive }) =>
//             `flex items-center space-x-3 p-3 rounded-xl transition ${isActive ? "bg-[#1b263b] text-yellow-400" : "hover:bg-[#1b263b]"
//             }`
//           }
//           onClick={toggleSidebar}
//         >
//           <FaChalkboardTeacher size={20} />
//           <span>Teachers salary</span>
//         </NavLink>
//         {/* <NavLink
//           to="/admin/assignments"
//           className={({ isActive }) =>
//             `flex items-center space-x-3 p-3 rounded-xl transition ${isActive ? "bg-[#1b263b] text-yellow-400" : "hover:bg-[#1b263b]"
//             }`
//           }
//           onClick={toggleSidebar}
//         >
//           <FaBook size={20} />
//           <span>Assignments</span>
//         </NavLink> */}
//         <NavLink
//           to="/admin/fees"
//           className={({ isActive }) =>
//             `flex items-center space-x-3 p-3 rounded-xl transition ${isActive ? "bg-[#1b263b] text-yellow-400" : "hover:bg-[#1b263b]"
//             }`
//           }
//           onClick={toggleSidebar}
//         >
//           <FaMoneyBill size={20} />
//           <span>Fees</span>
//         </NavLink>
//          <NavLink
//           to="/admin/settings"
//           className={({ isActive }) =>
//             `flex items-center space-x-3 p-3 rounded-xl transition ${isActive ? "bg-[#1b263b] text-yellow-400" : "hover:bg-[#1b263b]"
//             }`
//           }
//           onClick={toggleSidebar}
//         >
//           <IoIosSettings  size={20} />
//           <span>School Settings</span>
//         </NavLink>
//          <NavLink
//           to="/admin/password"
//           className={({ isActive }) =>
//             `flex items-center space-x-3 p-3 rounded-xl transition ${isActive ? "bg-[#1b263b] text-yellow-400" : "hover:bg-[#1b263b]"
//             }`
//           }
//           onClick={toggleSidebar}
//         >
//           <TbLockPassword size={20} />
//           <span>Change Password</span>
//         </NavLink>
//       </nav>

//       {/* Bottom Upgrade Box */}
//       <div className="p-4 m-4 rounded-xl bg-[#1b263b] text-center">
//         {/* <p className="text-sm text-gray-300">Update your plan</p> */}
//         {/* <p className="text-lg font-bold mt-1">$30.3 / Monthly</p> */}
//         <button onClick={() => dispatch(logout())} className="mt-3 px-3 cursor-pointer py-2 bg-yellow-400 text-black rounded-lg font-semibold hover:bg-yellow-300 transition">
//           Logout
//         </button>
//       </div>
//     </aside>
//   );
// }
// import {
//   FaHome,
//   FaUserGraduate,
//   FaChalkboardTeacher,
//   FaMoneyBill,
// } from "react-icons/fa";
// import { SiGoogleclassroom } from "react-icons/si";
// import { IoIosSettings } from "react-icons/io";
// import { TbLockPassword } from "react-icons/tb";
// import { IoChevronDown, IoChevronUp } from "react-icons/io5";
// import { NavLink } from "react-router-dom";
// import { useDispatch } from "react-redux";
// import { logout } from "../redux/features/auth/authslice";
// import { useState } from "react";
// import { MdAssignmentAdd } from "react-icons/md";
// import { LuNotebookTabs } from "react-icons/lu";


// export default function Sidebar({ isOpen, toggleSidebar }) {
//   const dispatch = useDispatch();
//   const [openTeacherMenu, setOpenTeacherMenu] = useState(false);

//   const navItemClass = ({ isActive }) =>
//     `flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
//       isActive
//         ? "bg-[#1b263b] text-yellow-400 shadow-md"
//         : "text-gray-300 hover:bg-[#1b263b] hover:text-yellow-300"
//     }`;

//   return (
//     <aside
//       className={`
//         fixed top-0 left-0 h-full bg-[#0d1b2a] text-white flex flex-col shadow-2xl
//         w-64 transform transition-transform duration-300 ease-in-out z-[100]
//         ${isOpen ? "translate-x-0" : "-translate-x-full"} 
//         md:translate-x-0 md:static md:w-64
//       `}
//     >
//       {/* Logo Section */}
//       <div className="p-6 font-bold text-2xl tracking-wide flex items-center space-x-2 border-b border-[#1b263b]">
//         <span className="bg-yellow-400 text-black px-2 py-1 rounded-lg">L</span>
//         <span>Learnyos</span>
//       </div>

//       {/* Navigation */}
//       <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
//         <NavLink to="/admin/dashboard" className={navItemClass} onClick={toggleSidebar}>
//           <FaHome size={20} />
//           <span>Dashboard</span>
//         </NavLink>

//         <NavLink to="/admin/classess" className={navItemClass} onClick={toggleSidebar}>
//           <SiGoogleclassroom size={20} />
//           <span>Classes</span>
//         </NavLink>

//         <NavLink to="/admin/subjects" className={navItemClass} onClick={toggleSidebar}>
//           <LuNotebookTabs size={20} />
//           <span>Subjects</span>
//         </NavLink>

//         <NavLink to="/admin/assign" className={navItemClass} onClick={toggleSidebar}>
//           <MdAssignmentAdd  size={20} />
//           <span>Assign</span>
//         </NavLink>

//         <NavLink to="/admin/students" className={navItemClass} onClick={toggleSidebar}>
//           <FaUserGraduate size={20} />
//           <span>Students</span>
//         </NavLink>

//         {/* ===== Teacher Section with Submenu ===== */}
//         <button
//           onClick={() => setOpenTeacherMenu(!openTeacherMenu)}
//           className={`flex items-center justify-between w-full p-3 rounded-xl transition-all duration-200 ${
//             openTeacherMenu ? "bg-[#1b263b] text-yellow-400" : "text-gray-300 hover:bg-[#1b263b] hover:text-yellow-300"
//           }`}
//         >
//           <div className="flex items-center space-x-3">
//             <FaChalkboardTeacher size={20} />
//             <span>Teachers</span>
//           </div>
//           {openTeacherMenu ? <IoChevronUp size={18} /> : <IoChevronDown size={18} />}
//         </button>

//         {/* Submenu */}
//         <div
//           className={`ml-8 mt-1 space-y-1 transition-all overflow-hidden ${
//             openTeacherMenu ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
//           }`}
//         >
//                 <NavLink
//             to="/admin/teachers"
//             className={navItemClass}
//             onClick={toggleSidebar}
//           >
//             <span className="ml-6">All Teachers</span>
//           </NavLink>
//           <NavLink
//             to="/admin/teacher/attendance"
//             className={navItemClass}
//             onClick={toggleSidebar}
//           >
//             <span className="ml-6">Attendance</span>
//           </NavLink>
//           <NavLink
//             to="/admin/teacher/salary"
//             className={navItemClass}
//             onClick={toggleSidebar}
//           >
//             <span className="ml-6">Salary</span>
//           </NavLink>
//         </div>

//         <NavLink to="/admin/fees" className={navItemClass} onClick={toggleSidebar}>
//           <FaMoneyBill size={20} />
//           <span>Fees</span>
//         </NavLink>

//         <NavLink to="/admin/settings" className={navItemClass} onClick={toggleSidebar}>
//           <IoIosSettings size={20} />
//           <span>School Settings</span>
//         </NavLink>

//         <NavLink to="/admin/password" className={navItemClass} onClick={toggleSidebar}>
//           <TbLockPassword size={20} />
//           <span>Change Password</span>
//         </NavLink>
//       </nav>

//       {/* Footer */}
//       <div className="p-5 border-t border-[#1b263b] text-center">
//         <button
//           onClick={() => dispatch(logout())}
//           className="w-full py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black rounded-lg font-semibold hover:from-yellow-300 hover:to-yellow-400 transition-all duration-200 shadow-md"
//         >
//           Logout
//         </button>
//       </div>
//     </aside>
//   );
// }
// import {
//   FaHome,
//   FaUserGraduate,
//   FaChalkboardTeacher,
//   FaMoneyBill,
// } from "react-icons/fa";
// import { SiGoogleclassroom } from "react-icons/si";
// import { IoIosSettings } from "react-icons/io";
// import { TbLockPassword } from "react-icons/tb";
// import { IoChevronDown, IoChevronUp } from "react-icons/io5";
// import { MdAssignmentAdd } from "react-icons/md";
// import { LuNotebookTabs } from "react-icons/lu";
// import { BsPeopleFill, BsClockHistory, BsWallet2 } from "react-icons/bs";
// import { NavLink } from "react-router-dom";
// import { useDispatch } from "react-redux";
// import { useState } from "react";
// import { logout } from "../redux/features/auth/authslice";
// import { motion, AnimatePresence } from "framer-motion";

// export default function Sidebar({ isOpen, toggleSidebar }) {
//   const dispatch = useDispatch();
//   const [openTeacherMenu, setOpenTeacherMenu] = useState(false);

//   const navItemClass = ({ isActive }) =>
//     `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
//       isActive
//         ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-lg"
//         : "text-gray-300 hover:text-yellow-400 hover:bg-[#1a263b]/70"
//     }`;

//   const subItemClass = ({ isActive }) =>
//     `flex items-center space-x-3 px-4 py-2.5 text-sm rounded-lg transition-all duration-200 ${
//       isActive
//         ? "bg-[#1b263b] text-yellow-400"
//         : "text-gray-400 hover:text-yellow-300 hover:bg-[#1b263b]/60"
//     }`;

//   return (
//     <aside
//       className={`
//         fixed top-0 left-0 h-full bg-[#0b132b]/95 backdrop-blur-xl text-white flex flex-col border-r border-[#1b263b]
//         shadow-2xl transition-transform duration-300 ease-in-out z-[100]
//         ${isOpen ? "translate-x-0" : "-translate-x-full"} 
//         md:translate-x-0 md:static md:w-64
//       `}
//     >
//       {/* ==== Logo Section ==== */}
//       <div className="p-6 flex items-center justify-center border-b border-[#1b263b]">
//         <div className="flex items-center space-x-3">
//           <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold text-xl w-10 h-10 flex items-center justify-center rounded-2xl shadow-lg">
//             L
//           </div>
//           <div>
//             <h1 className="text-xl font-extrabold tracking-wide">Learnyos</h1>
//             <p className="text-xs text-gray-400 tracking-widest">Admin Panel</p>
//           </div>
//         </div>
//       </div>

//       {/* ==== Navigation ==== */}
//       <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
//         <NavLink to="/admin/dashboard" className={navItemClass} onClick={toggleSidebar}>
//           <FaHome size={18} />
//           <span>Dashboard</span>
//         </NavLink>

//         <NavLink to="/admin/classess" className={navItemClass} onClick={toggleSidebar}>
//           <SiGoogleclassroom size={18} />
//           <span>Classes</span>
//         </NavLink>

//         <NavLink to="/admin/subjects" className={navItemClass} onClick={toggleSidebar}>
//           <LuNotebookTabs size={18} />
//           <span>Subjects</span>
//         </NavLink>

//         <NavLink to="/admin/assign" className={navItemClass} onClick={toggleSidebar}>
//           <MdAssignmentAdd size={18} />
//           <span>Assign</span>
//         </NavLink>

//         <NavLink to="/admin/students" className={navItemClass} onClick={toggleSidebar}>
//           <FaUserGraduate size={18} />
//           <span>Students</span>
//         </NavLink>

//         {/* ==== Teachers Section (with icons in submenu) ==== */}
//         <button
//           onClick={() => setOpenTeacherMenu(!openTeacherMenu)}
//           className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
//             openTeacherMenu
//               ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-lg"
//               : "text-gray-300 hover:text-yellow-400 hover:bg-[#1a263b]/70"
//           }`}
//         >
//           <div className="flex items-center space-x-3">
//             <FaChalkboardTeacher size={18} />
//             <span>Teachers</span>
//           </div>
//           {openTeacherMenu ? <IoChevronUp size={18} /> : <IoChevronDown size={18} />}
//         </button>

//         <AnimatePresence>
//           {openTeacherMenu && (
//             <motion.div
//               initial={{ height: 0, opacity: 0 }}
//               animate={{ height: "auto", opacity: 1 }}
//               exit={{ height: 0, opacity: 0 }}
//               transition={{ duration: 0.3 }}
//               className="ml-6 mt-2 space-y-1 border-l border-[#1b263b]/60 pl-3"
//             >
//               <NavLink to="/admin/teachers" className={subItemClass} onClick={toggleSidebar}>
//                 <BsPeopleFill size={15} />
//                 <span>All Teachers</span>
//               </NavLink>

//               <NavLink to="/admin/teacher/attendance" className={subItemClass} onClick={toggleSidebar}>
//                 <BsClockHistory size={15} />
//                 <span>Attendance</span>
//               </NavLink>

//               <NavLink to="/admin/teacher/salary" className={subItemClass} onClick={toggleSidebar}>
//                 <BsWallet2 size={15} />
//                 <span>Salary</span>
//               </NavLink>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         <NavLink to="/admin/fees" className={navItemClass} onClick={toggleSidebar}>
//           <FaMoneyBill size={18} />
//           <span>Fees</span>
//         </NavLink>

//         <NavLink to="/admin/settings" className={navItemClass} onClick={toggleSidebar}>
//           <IoIosSettings size={18} />
//           <span>School Settings</span>
//         </NavLink>

//         <NavLink to="/admin/password" className={navItemClass} onClick={toggleSidebar}>
//           <TbLockPassword size={18} />
//           <span>Change Password</span>
//         </NavLink>
//       </nav>

//       {/* ==== Footer ==== */}
//       <div className="p-5 border-t border-[#1b263b] text-center bg-[#0b132b]/80">
//         <button
//           onClick={() => dispatch(logout())}
//           className="w-full py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black rounded-xl font-semibold shadow-lg hover:from-yellow-300 hover:to-yellow-400 transition-all duration-300 transform hover:scale-[1.02]"
//         >
//           Logout
//         </button>
//         <p className="text-xs text-gray-500 mt-3">© 2025 Learnyos</p>
//       </div>
//     </aside>
//   );
// }
import {
  FaHome,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaMoneyBill,
} from "react-icons/fa";
import { SiGoogleclassroom } from "react-icons/si";
import { IoIosSettings } from "react-icons/io";
import { TbLockPassword } from "react-icons/tb";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";
import { MdAssignmentAdd } from "react-icons/md";
import { LuNotebookTabs } from "react-icons/lu";
import { BsPeopleFill, BsClockHistory, BsWallet2 } from "react-icons/bs";
import { NavLink } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useState } from "react";
import { logout } from "../redux/features/auth/authslice";
import { motion, AnimatePresence } from "framer-motion";

export default function Sidebar({ isOpen, toggleSidebar }) {
  const dispatch = useDispatch();
  const [openTeacherMenu, setOpenTeacherMenu] = useState(false);

  // ✅ When clicking any main nav item (not submenu), close teacher menu
  const handleMainNavClick = () => {
    if (openTeacherMenu) setOpenTeacherMenu(false);
    if (toggleSidebar) toggleSidebar();
  };

  // ✅ When clicking submenu item — only close sidebar (for mobile)
  const handleSubmenuClick = () => {
    if (toggleSidebar) toggleSidebar();
  };

  const navItemClass = ({ isActive }) =>
    `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
      isActive
        ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-lg"
        : "text-gray-300 hover:text-yellow-400 hover:bg-[#1a263b]/70"
    }`;

  const subItemClass = ({ isActive }) =>
    `flex items-center space-x-3 px-4 py-2.5 text-sm rounded-lg transition-all duration-200 ${
      isActive
        ? "bg-[#1b263b] text-yellow-400"
        : "text-gray-400 hover:text-yellow-300 hover:bg-[#1b263b]/60"
    }`;

  return (
    <aside
      className={`
        fixed top-0 left-0 h-full bg-[#0b132b]/95 backdrop-blur-xl text-white flex flex-col border-r border-[#1b263b]
        shadow-2xl transition-transform duration-300 ease-in-out z-[100]
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:static md:w-64
      `}
    >
      {/* ==== Logo Section ==== */}
      <div className="p-6 flex items-center justify-center border-b border-[#1b263b]">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold text-xl w-10 h-10 flex items-center justify-center rounded-2xl shadow-lg">
            L
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-wide">Learnyos</h1>
            <p className="text-xs text-gray-400 tracking-widest">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* ==== Navigation ==== */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        <NavLink to="/admin/dashboard" className={navItemClass} onClick={handleMainNavClick}>
          <FaHome size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/admin/classess" className={navItemClass} onClick={handleMainNavClick}>
          <SiGoogleclassroom size={18} />
          <span>Classes</span>
        </NavLink>

        <NavLink to="/admin/subjects" className={navItemClass} onClick={handleMainNavClick}>
          <LuNotebookTabs size={18} />
          <span>Subjects</span>
        </NavLink>

        <NavLink to="/admin/assign" className={navItemClass} onClick={handleMainNavClick}>
          <MdAssignmentAdd size={18} />
          <span>Assign</span>
        </NavLink>

        <NavLink to="/admin/students" className={navItemClass} onClick={handleMainNavClick}>
          <FaUserGraduate size={18} />
          <span>Students</span>
        </NavLink>

        {/* ==== Teachers Section (with icons in submenu) ==== */}
        <button
          onClick={() => setOpenTeacherMenu(!openTeacherMenu)}
          className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
            openTeacherMenu
              ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-lg"
              : "text-gray-300 hover:text-yellow-400 hover:bg-[#1a263b]/70"
          }`}
        >
          <div className="flex items-center space-x-3">
            <FaChalkboardTeacher size={18} />
            <span>Teachers</span>
          </div>
          {openTeacherMenu ? <IoChevronUp size={18} /> : <IoChevronDown size={18} />}
        </button>

        <AnimatePresence>
          {openTeacherMenu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="ml-6 mt-2 space-y-1 border-l border-[#1b263b]/60 pl-3"
            >
              <NavLink to="/admin/teachers" className={subItemClass} onClick={handleSubmenuClick}>
                <BsPeopleFill size={15} />
                <span>All Teachers</span>
              </NavLink>

              <NavLink to="/admin/teacher/attendance" className={subItemClass} onClick={handleSubmenuClick}>
                <BsClockHistory size={15} />
                <span>Attendance</span>
              </NavLink>

              <NavLink to="/admin/teacher/salary" className={subItemClass} onClick={handleSubmenuClick}>
                <BsWallet2 size={15} />
                <span>Salary</span>
              </NavLink>
            </motion.div>
          )}
        </AnimatePresence>

        <NavLink to="/admin/fees" className={navItemClass} onClick={handleMainNavClick}>
          <FaMoneyBill size={18} />
          <span>Fees</span>
        </NavLink>

        <NavLink to="/admin/settings" className={navItemClass} onClick={handleMainNavClick}>
          <IoIosSettings size={18} />
          <span>School Settings</span>
        </NavLink>

        <NavLink to="/admin/password" className={navItemClass} onClick={handleMainNavClick}>
          <TbLockPassword size={18} />
          <span>Change Password</span>
        </NavLink>
      </nav>

      {/* ==== Footer ==== */}
      <div className="p-5 border-t border-[#1b263b] text-center bg-[#0b132b]/80">
        <button
          onClick={() => dispatch(logout())}
          className="w-full py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black rounded-xl font-semibold shadow-lg hover:from-yellow-300 hover:to-yellow-400 transition-all duration-300 transform hover:scale-[1.02]"
        >
          Logout
        </button>
        <p className="text-xs text-gray-500 mt-3">© 2025 Learnyos</p>
      </div>
    </aside>
  );
}
