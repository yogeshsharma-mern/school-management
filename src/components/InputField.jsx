// export default function InputField({ label, name, value, onChange, placeholder, type = "text", error ,disabled}) {
//   return (
//     <div>
//       <label className="block text-sm font-medium text-gray-600">{label}</label>
//       <input
//         type={type}
//         name={name}
//         value={value}
//         onChange={onChange}
//         placeholder={placeholder}
//         disabled={disabled}
//         className={`mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none text-gray-700 ${
//           error ? "border-red-500 focus:ring-red-400" : "focus:ring-indigo-400"
//         }`
//    }
//       />
//       {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
//     </div>
//   );
// }


export default function InputField({ 
  label, 
  name, 
  value, 
  onChange, 
  placeholder, 
  type = "text", 
  error,
  disabled = false  // Default to false
}) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-600">{label}</label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
          error 
            ? "border-red-500 focus:ring-red-400" 
            : "border-gray-300 focus:ring-indigo-400 focus:border-indigo-400"
        } ${
          disabled 
            ? "bg-gray-100 cursor-not-allowed text-gray-500" 
            : "bg-white text-gray-900"
        }`}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}