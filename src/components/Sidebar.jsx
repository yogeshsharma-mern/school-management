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
// import { IoCalendar } from "react-icons/io5";


// export default function Sidebar({ isOpen, toggleSidebar }) {
//   const dispatch = useDispatch();
//   const [openTeacherMenu, setOpenTeacherMenu] = useState(false);
//   const [openSchoolSettingMenu, setOpenSchoolSettingMenu] = useState(false);

//   // ✅ When clicking any main nav item (not submenu), close teacher menu
//   const handleMainNavClick = () => {
//     if (openTeacherMenu) setOpenTeacherMenu(false);
//     if (openSchoolSettingMenu) setOpenSchoolSettingMenu(false);
//     if (toggleSidebar) toggleSidebar();
//   };

//   // ✅ When clicking submenu item — only close sidebar (for mobile)
//   const handleSubmenuClick = () => {
//     if (toggleSidebar) toggleSidebar();
//   };

//   const navItemClass = ({ isActive }) =>
//     `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
//       ? "bg-[image:var(--gradient-primary)]  text-black shadow-lg"
//       : "text-gray-300 hover:text-[var(--heading-hover)] hover:bg-[#1a263b]/70"
//     }`;

//   const subItemClass = ({ isActive }) =>
//     `flex items-center space-x-3 px-4 py-2.5 text-sm rounded-lg transition-all duration-200 ${isActive
//       ? "bg-[#1b263b] text-[var(--heading-hover)]"
//       : "text-gray-400 hover:text-[var(--heading-hover)] hover:bg-[#1b263b]/60"
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
//           <div className="bg-[image:var(--gradient-primary)] text-black font-bold text-xl w-10 h-10 flex items-center justify-center rounded-2xl shadow-lg">
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
//         <NavLink to="/admin/dashboard" className={navItemClass} onClick={handleMainNavClick}>
//           <FaHome size={18} />
//           <span>Dashboard</span>
//         </NavLink>

//         <NavLink to="/admin/classess" className={navItemClass} onClick={handleMainNavClick}>
//           <SiGoogleclassroom size={18} />
//           <span>Classes</span>
//         </NavLink>

//         <NavLink to="/admin/subjects" className={navItemClass} onClick={handleMainNavClick}>
//           <LuNotebookTabs size={18} />
//           <span>Subjects</span>
//         </NavLink>

//         <NavLink to="/admin/assign" className={navItemClass} onClick={handleMainNavClick}>
//           <MdAssignmentAdd size={18} />
//           <span>Assign</span>
//         </NavLink>

//         <NavLink to="/admin/students" className={navItemClass} onClick={handleMainNavClick}>
//           <FaUserGraduate size={18} />
//           <span>Students</span>
//         </NavLink>

//         {/* ==== Teachers Section (with icons in submenu) ==== */}
//         <button
//           onClick={() => setOpenTeacherMenu(!openTeacherMenu)}
//           className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${openTeacherMenu
//               ? "bg-[image:var(--gradient-primary)]  text-black shadow-lg"
//               : "text-gray-300 hover:text-[var(--heading-hover)] hover:bg-[#1a263b]/70"
//             }`}
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
//               <NavLink to="/admin/teachers" className={subItemClass} onClick={handleSubmenuClick}>
//                 <BsPeopleFill size={15} />
//                 <span>All Teachers</span>
//               </NavLink>

//               {/* <NavLink to="/admin/teacher/attendance" className={subItemClass} onClick={handleSubmenuClick}>
//                 <BsClockHistory size={15} />
//                 <span>Attendance</span>
//               </NavLink> */}
//               <NavLink to="/admin/teacher/attendance/clockwise" className={subItemClass} onClick={handleSubmenuClick}>
//                 <BsClockHistory size={15} />
//                 <span>Attendance</span>
//               </NavLink>
//               <NavLink to="/admin/teacher/salary" className={subItemClass} onClick={handleSubmenuClick}>
//                 <BsWallet2 size={15} />
//                 <span>Salary</span>
//               </NavLink>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         <NavLink to="/admin/fees" className={navItemClass} onClick={handleMainNavClick}>
//           <FaMoneyBill size={18} />
//           <span>Fees</span>
//         </NavLink>
//         {/* 
//         <NavLink to="/admin/settings" className={navItemClass} onClick={handleMainNavClick}>
//           <IoIosSettings size={18} />
//           <span>School Settings</span>
//         </NavLink> */}
//         <button
//           onClick={() => setOpenSchoolSettingMenu(!openSchoolSettingMenu)}
//           className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${openSchoolSettingMenu
//               ? "bg-[image:var(--gradient-primary)]  text-black shadow-lg"
//               : "text-gray-300 hover:text-[var(--heading-hover)] hover:bg-[#1a263b]/70"
//             }`}
//         >
//           <div className="flex items-center space-x-3">
//             <FaChalkboardTeacher size={18} />
//             <span>School Setting</span>
//           </div>
//           {openSchoolSettingMenu ? <IoChevronUp size={18} /> : <IoChevronDown size={18} />}
//         </button>
//         <AnimatePresence>
//           {openSchoolSettingMenu && (
//             <motion.div
//               initial={{ height: 0, opacity: 0 }}
//               animate={{ height: "auto", opacity: 1 }}
//               exit={{ height: 0, opacity: 0 }}
//               transition={{ duration: 0.3 }}
//               className="ml-6 mt-2 space-y-1 border-l border-[#1b263b]/60 pl-3"
//             >
//               <NavLink to="/admin/settings" className={subItemClass} onClick={handleSubmenuClick}>
//                 <BsPeopleFill size={15} />
//                 <span>School Setting</span>
//               </NavLink>

//               <NavLink to="/admin/school/ip-setting" className={subItemClass} onClick={handleSubmenuClick}>
//                 <BsClockHistory size={15} />
//                 <span>Ip Setting</span>
//               </NavLink>

//             </motion.div>
//           )}
//         </AnimatePresence>
//         <NavLink to="/admin/event-calendar" className={navItemClass} onClick={handleMainNavClick}>
//           <IoCalendar size={18} />
//           <span>Event Calendar</span>
//         </NavLink>
//         {/* // */}
//         <NavLink to="/admin/password" className={navItemClass} onClick={handleMainNavClick}>
//           <TbLockPassword size={18} />
//           <span>Change Password</span>
//         </NavLink>
//       </nav>

//       {/* ==== Footer ==== */}
//       <div className="p-5 border-t border-[#1b263b] text-center bg-[#0b132b]/80">
//         <button
//           onClick={() => dispatch(logout())}
//           className="w-full py-2 bg-[image:var(--gradient-primary)] text-black rounded-xl font-semibold shadow-lg hover:from-yellow-300 hover:to-yellow-400 transition-all duration-300 transform hover:scale-[1.02]"
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
// import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { logout } from "../redux/features/auth/authslice";
import { motion, AnimatePresence } from "framer-motion";
import { IoCalendar } from "react-icons/io5";
import { HiMenuAlt3 } from "react-icons/hi";
import { useSelector, useDispatch } from "react-redux";
import { toggleSidebarCollapse } from "../redux/features/ui/uislic";
import { RiLogoutCircleRLine } from "react-icons/ri";
export default function Sidebar({ isOpen, toggleSidebar }) {
  // const dispatch = useDispatch();

  // const [collapsed, setCollapsed] = useState(false);
  const collapsed = useSelector((state) => state.ui.sidebarCollapsed);
  const dispatch = useDispatch();
  // Load state from localStorage
  const [openTeacherMenu, setOpenTeacherMenu] = useState(
    localStorage.getItem("openTeacherMenu") === "true"
  );

  const [openSchoolSettingMenu, setOpenSchoolSettingMenu] = useState(
    localStorage.getItem("openSchoolSettingMenu") === "true"
  );
const closeAllSubmenus = () => {
  setOpenTeacherMenu(false);
  setOpenSchoolSettingMenu(false);
};


  // Save submenu state on change
  useEffect(() => {
    localStorage.setItem("openTeacherMenu", openTeacherMenu);
  }, [openTeacherMenu]);

  useEffect(() => {
    localStorage.setItem("openSchoolSettingMenu", openSchoolSettingMenu);
  }, [openSchoolSettingMenu]);

  // Close other submenu on opening new one
const toggleTeacherMenu = () => {
  closeAllSubmenus();
  setOpenTeacherMenu((prev) => !prev);
};



const toggleSchoolSettingMenu = () => {
  closeAllSubmenus();
  setOpenSchoolSettingMenu((prev) => !prev);
};



  // Close sidebar (mobile)
const handleMainNavClick = () => {
  closeAllSubmenus();   // CLOSE ALL SUBMENUS
  toggleSidebar?.();    // FOR MOBILE
};

  const handleSubmenuClick = () => {
    toggleSidebar?.();
  };

  const navItemClass = ({ isActive }) =>
    `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
      ? "bg-[image:var(--gradient-primary)] text-black shadow-lg"
      : "text-gray-300 hover:text-[var(--heading-hover)] hover:bg-[#1a263b]/70"
    }`;

  const subItemClass = ({ isActive }) =>
    `flex items-center space-x-3 px-4 py-2.5 text-sm rounded-lg transition-all duration-200 ${isActive
      ? "bg-[#1b263b] text-[var(--heading-hover)]"
      : "text-gray-400 hover:text-[var(--heading-hover)] hover:bg-[#1b263b]/60"
    }`;

  return (
    <aside
      className={`
        fixed top-0 left-0 h-full bg-[#0b132b]/95 backdrop-blur-xl text-white border-r border-[#1b263b]
        shadow-xl z-[200] transition-all duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        ${collapsed ? "md:w-20" : "md:w-64"}
        md:translate-x-0 md:static  flex flex-col  
      `}
    >
      {/* ==== Collapse Button (Desktop Only) ==== */}
      {/* <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden md:flex absolute -right-4 top-6 w-8 h-8 bg-[#0b132b] border border-[#1b263b] rounded-full items-center justify-center shadow-lg cursor-pointer"
      >
        <HiMenuAlt3 className="text-white" />
      </button> */}
      <button
        onClick={() => dispatch(toggleSidebarCollapse())}
        className="hidden md:flex absolute -right-4 top-6 w-8 h-8 bg-[#0b132b] border border-[#1b263b] rounded-full items-center justify-center shadow-lg cursor-pointer"
      >
        <HiMenuAlt3 className="text-white" />
      </button>

      {/* ==== Logo Section ==== */}
      <div className="p-6 flex items-center justify-center border-b border-[#1b263b]">
        {!collapsed ? (
          <div className="flex items-center space-x-3">
            <div className="bg-[image:var(--gradient-primary)] text-black font-bold text-xl w-10 h-10 flex items-center justify-center rounded-2xl shadow-lg">
              L
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-wide">Learnyos</h1>
              <p className="text-xs text-gray-400 tracking-widest">Admin Panel</p>
            </div>
          </div>
        ) : (
          <div className="bg-[image:var(--gradient-primary)] text-black font-bold text-xl w-10 h-10 flex items-center justify-center rounded-2xl shadow-lg">
            L
          </div>
        )}
      </div>

      {/* ==== Navigation ==== */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {/* Dashboard */}
        <NavLink to="/admin/dashboard" className={navItemClass} onClick={handleMainNavClick}>
          <FaHome size={18} />
          {!collapsed && <span>Dashboard</span>}
        </NavLink>

        {/* Classes */}
        <NavLink to="/admin/classess" className={navItemClass} onClick={handleMainNavClick}>
          <SiGoogleclassroom size={18} />
          {!collapsed && <span>Classes</span>}
        </NavLink>

        {/* Subjects */}
        <NavLink to="/admin/subjects" className={navItemClass} onClick={handleMainNavClick}>
          <LuNotebookTabs size={18} />
          {!collapsed && <span>Subjects</span>}
        </NavLink>

        {/* Assign */}
        <NavLink to="/admin/assign" className={navItemClass} onClick={handleMainNavClick}>
          <MdAssignmentAdd size={18} />
          {!collapsed && <span>Assign</span>}
        </NavLink>

        {/* Students */}
        <NavLink to="/admin/students" className={navItemClass} onClick={handleMainNavClick}>
          <FaUserGraduate size={18} />
          {!collapsed && <span>Students</span>}
        </NavLink>

        {/* ==== TEACHER MENU ==== */}
        <button
          onClick={toggleTeacherMenu}
          className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${openTeacherMenu ? "bg-[image:var(--gradient-primary)] text-black" : "text-gray-300"
            }`}
        >
          <div className="flex items-center space-x-3">
            <FaChalkboardTeacher size={18} />
            {!collapsed && <span>Teachers</span>}
          </div>
          {!collapsed && (openTeacherMenu ? <IoChevronUp /> : <IoChevronDown />)}
        </button>

        {/* Teacher submenu */}
        <AnimatePresence>
          {openTeacherMenu && !collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="ml-6 mt-2 space-y-1 border-l border-[#1b263b]/60 pl-3"
            >
              <NavLink to="/admin/teachers" className={subItemClass} onClick={handleSubmenuClick}>
                <BsPeopleFill size={15} />
                <span>All Teachers</span>
              </NavLink>

              <NavLink
                to="/admin/teacher/attendance/clockwise"
                className={subItemClass}
                onClick={handleSubmenuClick}
              >
                <BsClockHistory size={15} />
                <span>Attendance</span>
              </NavLink>

              <NavLink
                to="/admin/teacher/salary"
                className={subItemClass}
                onClick={handleSubmenuClick}
              >
                <BsWallet2 size={15} />
                <span>Salary</span>
              </NavLink>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ==== FEES ==== */}
        <NavLink to="/admin/fees" className={navItemClass} onClick={handleMainNavClick}>
          <FaMoneyBill size={18} />
          {!collapsed && <span>Fees</span>}
        </NavLink>

        {/* ==== SCHOOL SETTING MENU ==== */}
        <button
          onClick={toggleSchoolSettingMenu}
          className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${openSchoolSettingMenu ? "bg-[image:var(--gradient-primary)] text-black" : "text-gray-300"
            }`}
        >
          <div className="flex items-center space-x-3">
            <IoIosSettings size={18} />
            {!collapsed && <span>School Setting</span>}
          </div>
          {!collapsed && (openSchoolSettingMenu ? <IoChevronUp /> : <IoChevronDown />)}
        </button>

        {/* School setting submenu */}
        <AnimatePresence>
          {openSchoolSettingMenu && !collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="ml-6 mt-2 space-y-1 border-l border-[#1b263b]/60 pl-3"
            >
              <NavLink
                to="/admin/settings"
                className={subItemClass}
                onClick={handleSubmenuClick}
              >
                <BsPeopleFill size={15} />
                <span>School Setting</span>
              </NavLink>

              <NavLink
                to="/admin/school/ip-setting"
                className={subItemClass}
                onClick={handleSubmenuClick}
              >
                <BsClockHistory size={15} />
                <span>IP Setting</span>
              </NavLink>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Calendar */}
        <NavLink to="/admin/event-calendar" className={navItemClass} onClick={handleMainNavClick}>
          <IoCalendar size={18} />
          {!collapsed && <span>Event Calendar</span>}
        </NavLink>

        {/* Password */}
        <NavLink to="/admin/password" className={navItemClass} onClick={handleMainNavClick}>
          <TbLockPassword size={18} />
          {!collapsed && <span>Change Password</span>}
        </NavLink>
      </nav>

      {/* ==== Footer ==== */}
      <div className="p-5 mt-auto border-t border-[#1b263b] text-center bg-[#0b132b]/80">

         <button
          onClick={() => dispatch(logout())}
          className="w-full flex gap-2 justify-center  items-center py-2 bg-[image:var(--gradient-primary)] text-black rounded-xl font-semibold shadow-lg hover:scale-105 transition-all"
        >
     <RiLogoutCircleRLine />
{
  !collapsed &&
  (
         <span>Logout</span>
  )
}
        </button>

        {!collapsed && <p className="text-xs text-gray-500 mt-3">© 2025 Learnyos</p>}
      </div>
    </aside>
  );
}
