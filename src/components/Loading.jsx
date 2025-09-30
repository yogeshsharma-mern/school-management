import React from 'react'

export default function Loader() {
  return (
 function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="relative flex items-center justify-center">
        {/* Outer Ring */}
        <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        {/* Inner Pulse */}
        <div className="absolute w-8 h-8 bg-blue-500 rounded-full animate-ping"></div>
      </div>
    </div>
  );
}

  )
}
