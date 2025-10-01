import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPut } from "../api/apiFetch";
import Loader from "../components/Loading";
import toast from "react-hot-toast";
import { useState } from "react";
import apiPath from "../api/apiPath";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Home,
  Shield,
  Users,
} from "lucide-react";

export default function StudentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");

  // ✅ Fetch student details
  const { data, isLoading, error } = useQuery({
    queryKey: ["studentDetail", id],
    queryFn: () =>
      apiGet(
        `${apiPath.getParticularStudent}/${id}`
      ),
    enabled: !!id,
  });

  const student = data?.results?.[0];

  // ✅ Mutation for toggling status
  const toggleStatusMutation = useMutation({
    mutationFn: () =>
      apiPut(`/api/admins/students/update/status/${id}`, {
        status: student?.status === "active" ? "inactive" : "active",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["studentDetail", id]);
      toast.success("Status updated successfully ✅");
    },
    onError: () => {
      toast.error("Failed to update status ❌");
    },
  });

  if (isLoading) return <Loader />;
  if (error)
    return <p className="text-red-500 text-center">Failed to load student.</p>;
  if (!student) return <p>No student found</p>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
      >
        ← Back
      </button>

      {/* Header */}
      <div className="flex justify-between items-center bg-[#1b263b] p-6 rounded-2xl shadow text-white">
        <div>
          <h1 className="text-2xl font-bold">{student.name}</h1>
          <p className="text-sm opacity-90">Admission No: {student.admissionNo}</p>
        </div>
        <button
          onClick={() => toggleStatusMutation.mutate()}
          disabled={toggleStatusMutation.isLoading}
          className={`px-4 py-2 rounded-lg text-white font-medium shadow ${
            student.status === "active"
              ? "bg-red-500 hover:bg-red-600"
              : "bg-green-500 hover:bg-green-600"
          } transition`}
        >
          {toggleStatusMutation.isLoading
            ? "Updating..."
            : student.status === "active"
            ? "Set Inactive"
            : "Set Active"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-4 space-x-6">
        {["profile", "enrollment", "fees", "assignments", "attendance"].map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-2 capitalize text-sm font-medium transition ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-blue-500"
              }`}
            >
              {tab}
            </button>
          )
        )}
      </div>

      {/* TAB CONTENT */}
      <div className="space-y-6">
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="bg-white shadow rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" /> Personal Information
            </h2>
            <div className="grid grid-cols-2 gap-4 text-gray-700">
              <p>
                <strong>Admission Date:</strong>{" "}
                {new Date(student.admissionDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Email:</strong> {student.email}
              </p>
              <p>
                <strong>Phone:</strong> {student.phone}
              </p>
              <p>
                <strong>DOB:</strong> {new Date(student.dob).toLocaleDateString()}
              </p>
              <p>
                <strong>Gender:</strong> {student.gender}
              </p>
              <p>
                <strong>Blood Group:</strong> {student.bloodGroup}
              </p>
              <p className="col-span-2 flex items-start gap-2">
                <Home className="w-4 h-4 mt-1 text-gray-500" />
                {`${student.address.street}, ${student.address.city}, ${student.address.state}, ${student.address.zip}, ${student.address.country}`}
              </p>
            </div>

            {/* Parents */}
{/* Parents */}
{/* Parents */}
<h3 className="text-lg font-semibold mt-6">Parents</h3>
{student.parentDetails?.length ? (
  <div className="grid md:grid-cols-2 gap-4 mt-2">
    {student.parentDetails.map((parent) => (
      <div
        key={parent._id}
        className="p-4 bg-gray-50 rounded-lg border shadow-sm hover:shadow-md transition"
      >
        <p className="font-semibold text-gray-800">{parent.name}</p>
        <p className="text-sm text-gray-600">{parent.occupation}</p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">📞 Phone:</span> {parent.phone}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">✉️ Email:</span> {parent.email}
        </p>
      </div>
    ))}
  </div>
) : (
  <p className="text-gray-500">No parent info available</p>
)}



            {/* Guardian */}
            <h3 className="text-lg font-semibold mt-6">Guardian</h3>
            {student.guardian ? (
              <div className="p-4 border rounded-xl shadow-sm bg-gray-50">
                <p>
                  <strong>Name:</strong> {student.guardian.name}
                </p>
                <p>
                  <strong>Relation:</strong> {student.guardian.relation}
                </p>
                <p>
                  <strong>Occupation:</strong> {student.guardian.occupation}
                </p>
                <p>
                  <strong>Phone:</strong> {student.guardian.phone}
                </p>
              </div>
            ) : (
              <p className="text-gray-500">No guardian info</p>
            )}

            {/* Emergency Contact */}
            <h3 className="text-lg font-semibold mt-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-500" /> Emergency Contact
            </h3>
            {student.emergencyContact ? (
              <div className="p-4 border rounded-xl shadow-sm bg-red-50">
                <p>
                  <strong>Name:</strong> {student.emergencyContact.name}
                </p>
                <p>
                  <strong>Relation:</strong> {student.emergencyContact.relation}
                </p>
                <p>
                  <strong>Phone:</strong> {student.emergencyContact.phone}
                </p>
                <p>
                  <strong>Address:</strong> {student.emergencyContact.address}
                </p>
              </div>
            ) : (
              <p className="text-gray-500">No emergency contact info</p>
            )}
          </div>
        )}

        {/* Enrollment Tab */}
        {activeTab === "enrollment" && (
          <div className="bg-white shadow rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Enrollment Details</h2>
            {student.enrollmentDetails?.map((enroll) => (
              <div
                key={enroll._id}
                className="p-4 mb-4 border rounded-xl bg-gray-50"
              >
                <p>
                  <strong>Class:</strong> {enroll.classInfo?.name} (
                  {enroll.classInfo?.section})
                </p>
                <p>
                  <strong>Roll No:</strong> {enroll.rollNo}
                </p>
                <p>
                  <strong>Academic Year:</strong> {enroll.academicYear}
                </p>
                <p>
                  <strong>Status:</strong> {enroll.status}
                </p>
                <p>
                  <strong>Timing:</strong> {enroll.classInfo?.startTime} -{" "}
                  {enroll.classInfo?.endTime}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Fees Tab */}
        {activeTab === "fees" && (
          <div className="bg-white shadow rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Fee Details</h2>
            {student.feeStructuresDetails?.map((structure) => (
              <div
                key={structure._id}
                className="p-4 mb-4 border rounded-xl bg-gray-50"
              >
                <p>
                  <strong>Academic Year:</strong> {structure.academicYear}
                </p>
                <p>
                  <strong>Total Amount:</strong> ₹{structure.totalAmount}
                </p>
                <h3 className="font-semibold mt-2">Fee Heads:</h3>
                <ul className="list-disc ml-6">
                  {structure.feeHeads.map((fh) => (
                    <li key={fh._id}>
                      {fh.type}: ₹{fh.amount}{" "}
                      {fh.isOptional ? "(Optional)" : ""}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {student.feesDetails?.map((fee) => (
              <div
                key={fee._id}
                className="p-4 border rounded-xl shadow-sm bg-green-50"
              >
                <p>
                  <strong>Total Fee:</strong> ₹{fee.totalFee}
                </p>
                <p>
                  <strong>Paid:</strong> ₹{fee.paidTillNow}
                </p>
                <p>
                  <strong>Remaining:</strong> ₹{fee.remaining}
                </p>
                <p>
                  <strong>Status:</strong> {fee.status}
                </p>
                <h3 className="font-semibold mt-2">Payments:</h3>
                <ul className="list-disc ml-6">
                  {fee.payments.map((pay) => (
                    <li key={pay.transactionId}>
                      ₹{pay.amountPaid} via {pay.mode} on{" "}
                      {new Date(pay.date).toLocaleDateString()} - {pay.status} (
                      {pay.remarks})
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === "assignments" && (
          <div className="bg-white shadow rounded-2xl p-6">
            <h2 className="text-xl font-semibold">Assignments</h2>
            {student.assignmentsDetails?.length ? (
              <ul className="list-disc ml-6">
                {student.assignmentsDetails.map((a) => (
                  <li key={a._id}>{a.title}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No assignments found</p>
            )}
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === "attendance" && (
          <div className="bg-white shadow rounded-2xl p-6">
            <h2 className="text-xl font-semibold">Attendance</h2>
            {student.attendanceDetails?.length ? (
              <ul className="list-disc ml-6">
                {student.attendanceDetails.map((a) => (
                  <li key={a._id}>
                    {a.date} - {a.status}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No attendance records found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
