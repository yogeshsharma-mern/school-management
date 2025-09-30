import { useState } from "react";
import { Outlet } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import Sidebar from "../components/Sidebar";
import { useSelector } from "react-redux";
import Avatar, { genConfig } from 'react-nice-avatar'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
const user = localStorage.getItem("user");
const newUser = JSON.parse(user);
const config = genConfig({ sex: "man"}) 

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <div className="flex h-screen w-full bg-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ">
        {/* Header */}
        <header className="h-16 bg-white shadow flex items-center  w-full justify-between px-6 md:px-8">
          <div className="flex items-center space-x-4">
            {/* Mobile Hamburger */}
            <button
              className="text-gray-700 md:hidden focus:outline-none"
              onClick={toggleSidebar}
            >
              <FaBars size={24} />
            </button>
            <h1 className="text-xl font-semibold">Admin Panel</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div>
<span className="font-bold">Hello,</span> {newUser.fullName}
            </div>
            {/* <input
              type="text"
              placeholder="Search..."
              className="px-3 py-1 border rounded-lg text-sm focus:outline-none"
            /> */}
            {/* <div className="w-8 h-8 rounded-full bg-gray-300"></div> */}
            <Avatar style={{ width: '32px', height: '32px' }} {...config} />
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
