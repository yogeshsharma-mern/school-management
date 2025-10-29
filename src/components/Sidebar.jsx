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
import { NavLink } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../redux/features/auth/authslice";
import { useState } from "react";

export default function Sidebar({ isOpen, toggleSidebar }) {
  const dispatch = useDispatch();
  const [openTeacherMenu, setOpenTeacherMenu] = useState(false);

  const navItemClass = ({ isActive }) =>
    `flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
      isActive
        ? "bg-[#1b263b] text-yellow-400 shadow-md"
        : "text-gray-300 hover:bg-[#1b263b] hover:text-yellow-300"
    }`;

  return (
    <aside
      className={`
        fixed top-0 left-0 h-full bg-[#0d1b2a] text-white flex flex-col shadow-2xl
        w-64 transform transition-transform duration-300 ease-in-out z-[100]
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:static md:w-64
      `}
    >
      {/* Logo Section */}
      <div className="p-6 font-bold text-2xl tracking-wide flex items-center space-x-2 border-b border-[#1b263b]">
        <span className="bg-yellow-400 text-black px-2 py-1 rounded-lg">L</span>
        <span>Learnyos</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        <NavLink to="/admin/dashboard" className={navItemClass} onClick={toggleSidebar}>
          <FaHome size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/admin/classess" className={navItemClass} onClick={toggleSidebar}>
          <SiGoogleclassroom size={20} />
          <span>Classes</span>
        </NavLink>

        <NavLink to="/admin/subjects" className={navItemClass} onClick={toggleSidebar}>
          <SiGoogleclassroom size={20} />
          <span>Subjects</span>
        </NavLink>

        <NavLink to="/admin/assign" className={navItemClass} onClick={toggleSidebar}>
          <SiGoogleclassroom size={20} />
          <span>Assign</span>
        </NavLink>

        <NavLink to="/admin/students" className={navItemClass} onClick={toggleSidebar}>
          <FaUserGraduate size={20} />
          <span>Students</span>
        </NavLink>

        {/* ===== Teacher Section with Submenu ===== */}
        <button
          onClick={() => setOpenTeacherMenu(!openTeacherMenu)}
          className={`flex items-center justify-between w-full p-3 rounded-xl transition-all duration-200 ${
            openTeacherMenu ? "bg-[#1b263b] text-yellow-400" : "text-gray-300 hover:bg-[#1b263b] hover:text-yellow-300"
          }`}
        >
          <div className="flex items-center space-x-3">
            <FaChalkboardTeacher size={20} />
            <span>Teachers</span>
          </div>
          {openTeacherMenu ? <IoChevronUp size={18} /> : <IoChevronDown size={18} />}
        </button>

        {/* Submenu */}
        <div
          className={`ml-8 mt-1 space-y-1 transition-all overflow-hidden ${
            openTeacherMenu ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
                <NavLink
            to="/admin/teachers"
            className={navItemClass}
            onClick={toggleSidebar}
          >
            <span className="ml-6">All Teachers</span>
          </NavLink>
          <NavLink
            to="/admin/teacher/attendance"
            className={navItemClass}
            onClick={toggleSidebar}
          >
            <span className="ml-6">Attendance</span>
          </NavLink>
          <NavLink
            to="/admin/teacher/salary"
            className={navItemClass}
            onClick={toggleSidebar}
          >
            <span className="ml-6">Salary</span>
          </NavLink>
        </div>

        <NavLink to="/admin/fees" className={navItemClass} onClick={toggleSidebar}>
          <FaMoneyBill size={20} />
          <span>Fees</span>
        </NavLink>

        <NavLink to="/admin/settings" className={navItemClass} onClick={toggleSidebar}>
          <IoIosSettings size={20} />
          <span>School Settings</span>
        </NavLink>

        <NavLink to="/admin/password" className={navItemClass} onClick={toggleSidebar}>
          <TbLockPassword size={20} />
          <span>Change Password</span>
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="p-5 border-t border-[#1b263b] text-center">
        <button
          onClick={() => dispatch(logout())}
          className="w-full py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black rounded-lg font-semibold hover:from-yellow-300 hover:to-yellow-400 transition-all duration-200 shadow-md"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
