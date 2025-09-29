import { FaHome, FaUserGraduate, FaChalkboardTeacher, FaBook, FaMoneyBill } from "react-icons/fa";
import { Link } from "react-router-dom";
import { SiGoogleclassroom } from "react-icons/si";

export default function Sidebar({ isOpen, toggleSidebar }) {
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
        <Link
          to="/admin/dashboard"
          className="flex items-center space-x-3 p-3 rounded-xl hover:bg-[#1b263b] transition"
          onClick={toggleSidebar}
        >
          <FaHome size={20} />
          <span>Dashboard</span>
        </Link>
             <Link
          to="/admin/classess"
          className="flex items-center space-x-3 p-3 rounded-xl hover:bg-[#1b263b] transition"
          onClick={toggleSidebar}
        >
          <SiGoogleclassroom size={20} />
          <span>Classes</span>
        </Link>
        <Link
          to="/admin/students"
          className="flex items-center space-x-3 p-3 rounded-xl hover:bg-[#1b263b] transition"
          onClick={toggleSidebar}
        >
          <FaUserGraduate size={20} />
          <span>Students</span>
        </Link>
        <Link
          to="/admin/teachers"
          className="flex items-center space-x-3 p-3 rounded-xl hover:bg-[#1b263b] transition"
          onClick={toggleSidebar}
        >
          <FaChalkboardTeacher size={20} />
          <span>Teachers</span>
        </Link>
        <Link
          to="/admin/assignments"
          className="flex items-center space-x-3 p-3 rounded-xl hover:bg-[#1b263b] transition"
          onClick={toggleSidebar}
        >
          <FaBook size={20} />
          <span>Assignments</span>
        </Link>
        <Link
          to="/admin/fees"
          className="flex items-center space-x-3 p-3 rounded-xl hover:bg-[#1b263b] transition"
          onClick={toggleSidebar}
        >
          <FaMoneyBill size={20} />
          <span>Fees</span>
        </Link>
      </nav>

      {/* Bottom Upgrade Box */}
      <div className="p-4 m-4 rounded-xl bg-[#1b263b] text-center">
        <p className="text-sm text-gray-300">Update your plan</p>
        <p className="text-lg font-bold mt-1">$30.3 / Monthly</p>
        <button className="mt-3 px-3 py-2 bg-yellow-400 text-black rounded-lg font-semibold hover:bg-yellow-300 transition">
          Upgrade
        </button>
      </div>
    </aside>
  );
}
