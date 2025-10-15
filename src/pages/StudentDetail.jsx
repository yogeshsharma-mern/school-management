import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPut } from "../api/apiFetch";
import Loader from "../components/Loading";
import toast from "react-hot-toast";
import { useState } from "react";
import apiPath from "../api/apiPath";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
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

  const { data, isLoading, error } = useQuery({
    queryKey: ["studentDetail", id],
    queryFn: () => apiGet(`${apiPath.getParticularStudent}/${id}`),
    enabled: !!id,
  });

  const student = data?.results?.[0];

  // ✅ Function to download single image as PDF
  const downloadImageAsPDF = async (fileUrl, filename) => {
    if (!fileUrl) return;
    const url = `${import.meta.env.VITE_API_BASE_URL}${fileUrl}`;
    const img = await loadImage(url);
    const pdf = new jsPDF({
      orientation: img.width > img.height ? "landscape" : "portrait",
    });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    pdf.addImage(img, "JPEG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${filename}.pdf`);
  };

  const loadImage = (url) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous"; // important for CORS images
      img.src = url;
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
    });

  // ✅ Bulk download marksheets as PDFs in ZIP
  const downloadAllMarksheetsAsPDF = async () => {
    if (!student?.marksheets?.length) return;
    const zip = new JSZip();

    for (const ms of student.marksheets) {
      const url = `${import.meta.env.VITE_API_BASE_URL}${ms.fileUrl}`;
      const img = await loadImage(url);
      const pdf = new jsPDF({
        orientation: img.width > img.height ? "landscape" : "portrait",
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(img, "JPEG", 0, 0, pdfWidth, pdfHeight);
      const pdfBlob = pdf.output("blob");
      zip.file(`${ms.exam}.pdf`, pdfBlob);
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `${student.name}_marksheets.zip`);
  };

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
        <div className="flex items-center gap-6">
          <img
            className="rounded-full w-[100px] h-[100px]"
            width={100}
            height={100}
            src={`${student.profilePic}`}
            alt="profile-picture"
          />
          <div>
            <h1 className="text-2xl font-bold">{student.name}</h1>
            <p className="text-sm opacity-90">
              Admission No: {student.admissionNo}
            </p>
          </div>
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
        {[
          "profile",
          "enrollment",
          "fees",
          "assignments",
          "attendance",
          "documents",
        ].map((tab) => (
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
        ))}
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
                <strong>DOB:</strong>{" "}
                {new Date(student.dob).toLocaleDateString()}
              </p>
              <p>
                <strong>Gender:</strong> {student.gender}
              </p>
              <p>
                <strong>Blood Group:</strong> {student.bloodGroup}
              </p>
              <p className="col-span-2 flex items-start gap-2">
                <Home className="w-4 h-4 mt-1 text-gray-500" />
              </p>
            </div>

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

        {/* Documents & Marksheets Tab */}
{activeTab === "documents" && (
          <div className="bg-white shadow rounded-2xl p-6 space-y-6">
            <h2 className="text-xl font-semibold mb-4">
              Documents 
            </h2>

            {/* Profile & ID */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: "Profile Picture", file: student.profilePic },
                { label: "Aadhar Front", file: student.aadharFront },
                { label: "Aadhar Back", file: student.aadharBack },
              ].map((doc, i) => (
                <div
                  key={i}
                  className="p-4 border border-gray-300 rounded-lg flex flex-col items-center gap-2 hover:shadow-md transition"
                >
                  {doc.file ? (
                    <img
                      src={`${doc.file}`}
                      alt={doc.label}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gray-100 flex items-center justify-center rounded-lg text-gray-400">
                      No File
                    </div>
                  )}
                  <p className="font-medium">{doc.label}</p>
                  {doc.file && (
                    <button
                      onClick={() =>
                        downloadImageAsPDF(doc.file, `${student.name}_${doc.label}`)
                      }
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Download PDF
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Marksheets */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Marksheets</h3>
              {student.marksheets?.length ? (
                <div className="grid grid-cols-3 gap-4">
                  {student.marksheets.map((ms) => (
                    <div
                      key={ms._id}
                      className="p-4 border border-gray-300 rounded-lg flex flex-col items-center gap-2 hover:shadow-md transition"
                    >
                      <img
                        src={`${ms.fileUrl}`}
                        alt={ms.exam}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <p className="font-medium text-center">{ms.exam}</p>
                      <button
                        onClick={() =>
                          downloadImageAsPDF(ms.fileUrl, `${student.name}_${ms.exam}`)
                        }
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Download PDF
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No marksheets uploaded</p>
              )}
              <button
                onClick={downloadAllMarksheetsAsPDF}
                className="px-4 py-2 bg-yellow-500 text-black rounded-sm hover:bg-yellow-600 cursor-pointer transition mt-4"
              >
                Download All Marksheets as ZIP
              </button>
            </div>

            {/* Certificates */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Certificates</h3>
              {student.certificates?.length ? (
                <div className="grid grid-cols-3 gap-4">
                  {student.certificates.map((cert) => (
                    <div
                      key={cert._id}
                      className="p-4 border rounded-lg shadow-sm flex flex-col items-center gap-2 hover:shadow-md transition"
                    >
                      <img
                        src={`${cert.fileUrl}`}
                        alt={cert.name || "Certificate"}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <p className="font-medium text-center">
                        {cert.name || "Certificate"}
                      </p>
                      <button
                        onClick={() =>
                          downloadImageAsPDF(
                            cert.fileUrl,
                            `${student.name}_${cert.name || "Certificate"}`
                          )
                        }
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Download PDF
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No certificates uploaded</p>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
