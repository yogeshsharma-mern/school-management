import { useState } from "react";
import { apiPost } from "../api/apiFetch";
import toast from "react-hot-toast";

export default function CreateStudentPage() {
  const [student, setStudent] = useState({
    name: "",
    dob: "",
    gender: "",
    bloodGroup: "",
    email: "",
    password: "",
    phone: "",
    address: { street: "", city: "", state: "", zip: "", country: "" },
    parents: [{ name: "", occupation: "", phone: "", email: "" }],
    guardian: { name: "", relation: "", occupation: "", phone: "" },
    emergencyContact: { name: "", relation: "", phone: "", address: "" },
    classId: "",
    academicYear: "",
    physicalDisability: false,
    disabilityDetails: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e, parentIndex = null, section = null) => {
    const { name, value, type, checked } = e.target;

    if (parentIndex !== null) {
      const updatedParents = [...student.parents];
      updatedParents[parentIndex][name] = value;
      setStudent({ ...student, parents: updatedParents });
    } else if (section) {
      setStudent({
        ...student,
        [section]: { ...student[section], [name]: value },
      });
    } else if (type === "checkbox") {
      setStudent({ ...student, [name]: checked });
    } else {
      setStudent({ ...student, [name]: value });
    }
  };

  const addParent = () => {
    setStudent({
      ...student,
      parents: [...student.parents, { name: "", occupation: "", phone: "", email: "" }],
    });
  };

  const removeParent = (index) => {
    const updatedParents = student.parents.filter((_, i) => i !== index);
    setStudent({ ...student, parents: updatedParents });
  };

  const validate = () => {
    const newErrors = {};
    if (!student.name) newErrors.name = "Name is required";
    if (!student.dob) newErrors.dob = "Date of Birth is required";
    if (!student.email) newErrors.email = "Email is required";
    if (!student.password) newErrors.password = "Password is required";
    if (!student.classId) newErrors.classId = "Class ID required";
    if (!student.academicYear) newErrors.academicYear = "Academic Year required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await apiPost("http://localhost:5678/api/admins/students/reg", student);
      toast.success("Student created successfully ✅");
      setStudent({
        name: "",
        dob: "",
        gender: "",
        bloodGroup: "",
        email: "",
        password: "",
        phone: "",
        address: { street: "", city: "", state: "", zip: "", country: "" },
        parents: [{ name: "", occupation: "", phone: "", email: "" }],
        guardian: { name: "", relation: "", occupation: "", phone: "" },
        emergencyContact: { name: "", relation: "", phone: "", address: "" },
        classId: "",
        academicYear: "",
        physicalDisability: false,
        disabilityDetails: "",
      });
      setErrors({});
    } catch (err) {
      toast.error("Failed to create student ❌");
    }
  };

  const inputClass = "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none";

  return (
    <div className="max-w-5xl mx-auto p-8 bg-gray-50 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold mb-8 text-center ">Create Student</h1>
      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Personal Info */}
        <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Personal Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-600 font-medium mb-1">Full Name</label>
              <input
                name="name"
                value={student.name}
                onChange={handleChange}
                className={inputClass}
                placeholder="John Doe"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={student.dob}
                onChange={handleChange}
                className={inputClass}
              />
              {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1">Gender</label>
              <select
                name="gender"
                value={student.gender}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1">Blood Group</label>
              <input
                name="bloodGroup"
                value={student.bloodGroup}
                onChange={handleChange}
                className={inputClass}
                placeholder="A+"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={student.email}
                onChange={handleChange}
                className={inputClass}
                placeholder="example@email.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={student.password}
                onChange={handleChange}
                className={inputClass}
                placeholder="********"
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1">Phone</label>
              <input
                name="phone"
                value={student.phone}
                onChange={handleChange}
                className={inputClass}
                placeholder="+1 234 567 890"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Address</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {["street", "city", "state", "zip", "country"].map((field) => (
              <input
                key={field}
                name={field}
                value={student.address[field]}
                onChange={(e) => handleChange(e, null, "address")}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                className={inputClass}
              />
            ))}
          </div>
        </div>

        {/* Parents */}
        <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Parents</h2>
          {student.parents.map((parent, index) => (
            <div key={index} className="grid md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg relative">
              <input
                name="name"
                value={parent.name}
                onChange={(e) => handleChange(e, index)}
                placeholder="Parent Name"
                className={inputClass}
              />
              <input
                name="occupation"
                value={parent.occupation}
                onChange={(e) => handleChange(e, index)}
                placeholder="Occupation"
                className={inputClass}
              />
              <input
                name="phone"
                value={parent.phone}
                onChange={(e) => handleChange(e, index)}
                placeholder="Phone"
                className={inputClass}
              />
              <input
                name="email"
                value={parent.email}
                onChange={(e) => handleChange(e, index)}
                placeholder="Email"
                className={inputClass}
              />
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeParent(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addParent}
            className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600"
          >
            + Add Parent
          </button>
        </div>

        {/* Guardian & Emergency Contact */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Guardian */}
          <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Guardian</h2>
            {["name", "relation", "occupation", "phone"].map((field) => (
              <input
                key={field}
                name={field}
                value={student.guardian[field]}
                onChange={(e) => handleChange(e, null, "guardian")}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                className={inputClass}
              />
            ))}
          </div>

          {/* Emergency Contact */}
          <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Emergency Contact</h2>
            {["name", "relation", "phone"].map((field) => (
              <input
                key={field}
                name={field}
                value={student.emergencyContact[field]}
                onChange={(e) => handleChange(e, null, "emergencyContact")}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                className={inputClass}
              />
            ))}
            <input
              name="address"
              value={student.emergencyContact.address}
              onChange={(e) => handleChange(e, null, "emergencyContact")}
              placeholder="Address"
              className={inputClass}
            />
          </div>
        </div>

        {/* Class & Academic */}
        <div className="bg-white p-6 rounded-xl shadow-md space-y-4 grid md:grid-cols-2 gap-6">
          <input
            name="classId"
            value={student.classId}
            onChange={handleChange}
            placeholder="Class ID"
            className={inputClass}
          />
          {errors.classId && <p className="text-red-500 text-sm mt-1">{errors.classId}</p>}
          <input
            name="academicYear"
            value={student.academicYear}
            onChange={handleChange}
            placeholder="Academic Year"
            className={inputClass}
          />
          {errors.academicYear && <p className="text-red-500 text-sm mt-1">{errors.academicYear}</p>}
        </div>

        {/* Disability */}
        <div className="bg-white p-6 rounded-xl shadow-md space-y-2">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="physicalDisability"
              checked={student.physicalDisability}
              onChange={handleChange}
              className="w-5 h-5 accent-blue-500"
            />
            <span className="text-gray-700 font-medium">Physical Disability</span>
          </label>
          <textarea
            name="disabilityDetails"
            value={student.disabilityDetails}
            onChange={handleChange}
            placeholder="Disability Details"
            className={inputClass}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3 bg-yellow-500  text-lg font-semibold rounded-xl hover:bg-green-700 transition"
        >
          Create Student
        </button>
      </form>
    </div>
  );
}
