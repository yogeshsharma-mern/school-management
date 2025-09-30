import { FaHome, FaUserGraduate, FaChalkboardTeacher, FaBook, FaMoneyBill } from "react-icons/fa";
import { Link } from "react-router-dom";
import { SiGoogleclassroom } from "react-icons/si";
import { useDispatch } from "react-redux";
import { logout } from "../redux/features/auth/authslice";
import { NavLink } from "react-router-dom";


export default function Sidebar({ isOpen, toggleSidebar }) {
  const dispatch = useDispatch();
  return (
    <aside
      className={`
        fixed top-0 left-0 h-full bg-[#0d1b2a] text-white flex flex-col shadow-lg
        w-64 transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:static md:w-64
      `}
    >
      {/* Logo */}
      <div className="p-6 font-bold text-2xl tracking-wide flex items-center space-x-2">
        <span className="bg-yellow-400 text-black px-2 py-1 rounded-lg">L</span>
        <span>Learnyos</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            `flex items-center space-x-3 p-3 rounded-xl transition ${isActive ? "bg-[#1b263b] text-yellow-400" : "hover:bg-[#1b263b]"
            }`
          }
          onClick={toggleSidebar}
        >
          <FaHome size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/admin/classess"
          className={({ isActive }) =>
            `flex items-center space-x-3 p-3 rounded-xl transition ${isActive ? "bg-[#1b263b] text-yellow-400" : "hover:bg-[#1b263b]"
            }`
          }
          onClick={toggleSidebar}
        >
          <SiGoogleclassroom size={20} />
          <span>Classes</span>
        </NavLink>
        <NavLink
          to="/admin/subjects"
          className={({ isActive }) =>
            `flex items-center space-x-3 p-3 rounded-xl transition ${isActive ? "bg-[#1b263b] text-yellow-400" : "hover:bg-[#1b263b]"
            }`
          }
          onClick={toggleSidebar}
        >
          <SiGoogleclassroom size={20} />
          <span>Subjects</span>
        </NavLink>
        <NavLink
          to="/admin/students"
          className={({ isActive }) =>
            `flex items-center space-x-3 p-3 rounded-xl transition ${isActive ? "bg-[#1b263b] text-yellow-400" : "hover:bg-[#1b263b]"
            }`
          }
          onClick={toggleSidebar}
        >
          <FaUserGraduate size={20} />
          <span>Students</span>
        </NavLink>
        <NavLink
          to="/admin/teachers"
          className={({ isActive }) =>
            `flex items-center space-x-3 p-3 rounded-xl transition ${isActive ? "bg-[#1b263b] text-yellow-400" : "hover:bg-[#1b263b]"
            }`
          }
          onClick={toggleSidebar}
        >
          <FaChalkboardTeacher size={20} />
          <span>Teachers</span>
        </NavLink>
        <NavLink
          to="/admin/assignments"
          className={({ isActive }) =>
            `flex items-center space-x-3 p-3 rounded-xl transition ${isActive ? "bg-[#1b263b] text-yellow-400" : "hover:bg-[#1b263b]"
            }`
          }
          onClick={toggleSidebar}
        >
          <FaBook size={20} />
          <span>Assignments</span>
        </NavLink>
        <NavLink
          to="/admin/fees"
          className={({ isActive }) =>
            `flex items-center space-x-3 p-3 rounded-xl transition ${isActive ? "bg-[#1b263b] text-yellow-400" : "hover:bg-[#1b263b]"
            }`
          }
          onClick={toggleSidebar}
        >
          <FaMoneyBill size={20} />
          <span>Fees</span>
        </NavLink>
      </nav>

      {/* Bottom Upgrade Box */}
      <div className="p-4 m-4 rounded-xl bg-[#1b263b] text-center">
        {/* <p className="text-sm text-gray-300">Update your plan</p> */}
        {/* <p className="text-lg font-bold mt-1">$30.3 / Monthly</p> */}
        <button onClick={() => dispatch(logout())} className="mt-3 px-3 cursor-pointer py-2 bg-yellow-400 text-black rounded-lg font-semibold hover:bg-yellow-300 transition">
          Logout
        </button>
      </div>
    </aside>
  );
}
