export default function InputField({ label, name, value, onChange, placeholder, type = "text", error }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none text-gray-700 ${
          error ? "border-red-500 focus:ring-red-400" : "focus:ring-indigo-400"
        }`}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
