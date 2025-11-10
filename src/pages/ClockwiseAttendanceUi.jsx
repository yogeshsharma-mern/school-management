import React from 'react';
import { Check, Clock, X, Star, Plane } from 'lucide-react';
import { FaFileExport } from "react-icons/fa";

const employees = [
  { name: 'Shakti Singh', role: 'Project Manager', attendance: ['x', 'x', 'x', 'x', 'x', '⚠️', 'x','⚠️'], total: 1 },
  { name: 'Gaurav Singh', role: 'Team Leader for Sales', attendance: ['x', 'x', 'x', 'x', 'x', 'x', 'x'], total: 0 },
  { name: 'Sachin Kumar Gudhniya', role: 'Linux Admin', attendance: ['✔️', '✔️', '✔️', '✔️', '✔️', 'x', '✔️'], total: 7 },
  { name: 'Akash Jaisawat', role: 'React Native Developer', attendance: ['⭐', '⚠️', '⚠️', '⚠️', 'x', 'x', '✔️'], total: 5 },
  { name: 'Pawan Verma', role: 'PHP Developer', attendance: ['✔️', '✔️', '✔️', '✔️', 'x', '✔️', '✔️'], total: 7 }
];

function getDaysInMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const days = new Date(year, month + 1, 0).getDate();
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return Array.from({ length: days }, (_, i) => {
    const date = new Date(year, month, i + 1);
    return {
      day: i + 1,
      weekday: weekdays[date.getDay()],
      isToday: date.toDateString() === now.toDateString()
    };
  });
}

export default function AttendanceTable() {
  const daysInMonth = getDaysInMonth();
  const today = new Date();
  const monthName = today.toLocaleString('default', { month: 'long' });
  const year = today.getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 sm:px-8 py-8 text-gray-800 font-['Inter']">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
            Attendance — {monthName} {year}
          </span>
        </h2>
        <button className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105">
          <FaFileExport className="text-white" /> Export Report
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-6 text-xs sm:text-sm text-gray-700">
        <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-md shadow-sm"><Star className="w-4 h-4 text-yellow-500" /> Holiday</span>
        <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-md shadow-sm"><Check className="w-4 h-4 text-green-500" /> Present</span>
        <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-md shadow-sm"><Clock className="w-4 h-4 text-orange-500" /> Late</span>
        <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-md shadow-sm"><X className="w-4 h-4 text-red-500" /> Absent</span>
        <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-md shadow-sm"><Plane className="w-4 h-4 text-blue-500" /> On Leave</span>
      </div>

      {/* Table Container */}
      <div className="bg-white/80 backdrop-blur-md rounded-xl border border-slate-200 shadow-lg overflow-x-auto">
        <table className="min-w-[900px] w-full text-xs sm:text-sm border-collapse">
          <thead className="bg-gradient-to-r from-slate-100 to-slate-200 sticky top-0 z-10">
            <tr className="text-gray-700">
              <th className="text-left px-4 py-3 font-semibold text-sm">Employee</th>
              {daysInMonth.map(({ day, weekday, isToday }) => (
                <th
                  key={day}
                  className={`text-center px-2 py-2 rounded-md transition-all duration-200 ${
                    isToday
                      ? 'bg-blue-100 font-bold text-blue-700 shadow-inner'
                      : 'text-gray-600'
                  }`}
                >
                  <div>{day}</div>
                  <div className="text-[10px] text-gray-400">{weekday}</div>
                </th>
              ))}
              <th className="text-center px-2 py-2 font-semibold text-gray-700">Total</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp, idx) => (
              <tr
                key={idx}
                className="border-b border-slate-100 hover:bg-slate-50 transition-all duration-150"
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900 text-sm">{emp.name}</div>
                  <div className="text-[11px] text-gray-500">{emp.role}</div>
                </td>

                {daysInMonth.map((_, i) => {
                  const status = emp.attendance[i];
                  return (
                    <td
                      key={i}
                      className="text-center px-2 py-2 transition hover:scale-105 duration-150"
                    >
                      {status === '✔️' && <Check className="w-4 h-4 text-green-500 mx-auto" />}
                      {status === '⚠️' && <Clock className="w-4 h-4 text-orange-500 mx-auto" />}
                      {status === 'x' && <X className="w-4 h-4 text-red-400 mx-auto" />}
                      {status === '⭐' && <Star className="w-4 h-4 text-yellow-500 mx-auto" />}
                      {!status && <span className="text-gray-300">—</span>}
                    </td>
                  );
                })}
                <td className="text-center font-semibold text-gray-800 bg-slate-50">
                  {emp.total}/{daysInMonth.length}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
