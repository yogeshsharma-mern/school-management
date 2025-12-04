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
import Modal from "../components/Modal";
// import EditFeesForm from "../components/EditFeesForm";
import { GraduationCap, Badge, Clock, BookOpen } from "lucide-react";
import {
  Wallet,
  PlusCircle,
  Receipt,
  FileWarning,
  Coins,
  CreditCard
} from "lucide-react";


import AddFeesForm from "../pages/AddFeesForm";
import { Link } from "react-router-dom";
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

  const [showFeesModal, setShowFeesModal] = useState(false);

  const student = data?.results?.[0];
  // console.log("studentdata", student);

  // ✅ Function to download single image as PDF
  const downloadImageAsPDF = async (fileUrl, filename) => {
    if (!fileUrl) return;
    const url = `${fileUrl}`;
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
      const url = `${ms.fileUrl}`;
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
    <div className="md:p-6 p-2 w-[98vw] md:w-[80vw] mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
      >
        ← Back
      </button>

      {/* Header */}
      <div className="flex justify-between items-center  p-6 rounded-2xl shadow text-white bg-[#0b132b]/95">
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
        {/* <button
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
        </button> */}
      </div>

      {/* Tabs */}
      <div className="flex w-[98vw] md:w-[77vw] border-b mb-4 space-x-6">
        {[
          "profile",
          "enrollment",
          "fees",
          // "assignments",
          // "attendance",
          "documents",
        ].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-2 capitalize text-sm font-medium transition ${activeTab === tab
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
          <div className="bg-gradient-to-br from-white to-blue-50 shadow-lg rounded-2xl lg:p-8 p-3 space-y-8 border border-gray-100">
            {/* Title */}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-full">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">
                Personal Information
              </h2>
            </div>

            {/* Personal Info Section */}
            <div className="grid  md:grid-cols-2 lg:gap-6 gap-3">
              {[
                { label: "Admission Date", value: new Date(student.admissionDate).toLocaleDateString(), icon: <Calendar className="w-4 h-4 text-blue-500" /> },
                { label: "Email", value: student.email, icon: <Mail className="w-4 h-4 text-blue-500" /> },
                { label: "Phone", value: student.phone, icon: <Phone className="w-4 h-4 text-blue-500" /> },
                { label: "Date of Birth", value: new Date(student.dob).toLocaleDateString(), icon: <Calendar className="w-4 h-4 text-blue-500" /> },
                { label: "Gender", value: student.gender, icon: <Users className="w-4 h-4 text-blue-500" /> },
                { label: "Blood Group", value: student.bloodGroup, icon: <Shield className="w-4 h-4 text-blue-500" /> },
              ].map((info, i) => (
                <div
                  key={i}
                  className="flex items-center   gap-3 p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition"
                >
                  {info.icon}
                  <div>
                    <p className="text-sm text-gray-500">{info.label}</p>
                    <p className="font-medium text-gray-800">{info.value || "—"}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Parent Info */}
            <div>
              <h3 className="text-xl font-semibold mt-8 mb-3 text-gray-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" /> Parent Information
              </h3>

              {student.parentDetails?.length ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {student.parentDetails.map((parent) => (
                    <div
                      key={parent._id}
                      className="p-5 rounded-2xl bg-gradient-to-tr from-indigo-50 to-white border border-indigo-100 shadow-sm hover:shadow-md transition"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-indigo-800 text-lg">
                          {parent.name}
                        </p>
                        <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">
                          {parent.occupation || "N/A"}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">📞 Phone:</span> {parent.phone}
                        </p>
                        <p>
                          <span className="font-medium">✉️ Email:</span>{" "}
                          {parent.email || "—"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No parent info available</p>
              )}
            </div>

            {/* Guardian Info */}
            <div>
              <h3 className="text-xl font-semibold mt-8 mb-3 text-gray-800 flex items-center gap-2">
                <Home className="w-5 h-5 text-green-600" /> Guardian Information
              </h3>

              {student.guardian ? (
                <div className="p-5 rounded-2xl bg-gradient-to-tr from-green-50 to-white border border-green-100 shadow-sm hover:shadow-md transition">
                  <div className="grid md:grid-cols-2 gap-3 text-gray-700">
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
                </div>
              ) : (
                <p className="text-gray-500 italic">No guardian info available</p>
              )}
            </div>

            {/* Emergency Contact */}
            <div>
              <h3 className="text-xl font-semibold mt-8 mb-3 text-gray-800 flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-500" /> Emergency Contact
              </h3>

              {student.emergencyContact ? (
                <div className="p-5 rounded-2xl bg-gradient-to-tr from-red-50 to-white border border-red-100 shadow-sm hover:shadow-md transition">
                  <div className="grid md:grid-cols-2 gap-3 text-gray-700">
                    <p>
                      <strong>Name:</strong> {student.emergencyContact.name}
                    </p>
                    <p>
                      <strong>Relation:</strong> {student.emergencyContact.relation}
                    </p>
                    <p>
                      <strong>Phone:</strong> {student.emergencyContact.phone}
                    </p>
                    <p className="md:col-span-2">
                      <strong>Address:</strong> {student.emergencyContact.address}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic">No emergency contact info</p>
              )}
            </div>
          </div>
        )}


        {/* Enrollment Tab */}
        {activeTab === "enrollment" && (
          <div className="bg-gradient-to-br from-white to-indigo-50 shadow-lg rounded-2xl p-8 space-y-6 border border-gray-100">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 rounded-full">
                <GraduationCap className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">
                Enrollment Details
              </h2>
            </div>

            {/* Enrollment Cards */}
            {student.enrollmentDetails?.length ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {student.enrollmentDetails.map((enroll) => (
                  <div
                    key={enroll._id}
                    className="group relative p-6 rounded-2xl bg-gradient-to-br from-white via-indigo-50 to-indigo-100 border border-indigo-100 shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    {/* Decorative corner accent */}
                    <div className="absolute top-0 right-0 w-10 h-10 bg-indigo-500 rounded-bl-2xl opacity-10 group-hover:opacity-20 transition" />

                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold text-indigo-700">
                        {enroll.classInfo?.name} ({enroll.classInfo?.section})
                      </h3>
                      <span
                        className={`text-xs font-medium px-3 py-1 rounded-full ${enroll.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                          }`}
                      >
                        {enroll.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-gray-700">
                      <p className="flex items-center gap-2">
                        <Badge className="w-4 h-4 text-indigo-500" />
                        <span>
                          <strong>Roll No:</strong> {enroll.rollNo}
                        </span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-500" />
                        <span>
                          <strong>Academic Year:</strong> {enroll.academicYear}
                        </span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-indigo-500" />
                        <span>
                          <strong>Timing:</strong> {enroll.classInfo?.startTime} –{" "}
                          {enroll.classInfo?.endTime}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-2xl border border-gray-200">
                <BookOpen className="w-12 h-12 text-gray-400 mb-3" />
                <p className="text-gray-500 text-center">
                  No enrollment records found.
                </p>
              </div>
            )}
          </div>
        )}


        {/* Fees Tab */}
        {activeTab === "fees" && (
          <div className=" shadow-md rounded-2xl p-6 space-y-6 border border-gray-100">
            {/* Add Fee Modal */}
            <Modal
              isOpen={showFeesModal}
              onClose={() => setShowFeesModal(false)}
              title="Add Fees"
            >
              <AddFeesForm
                studentId={student._id}
                onClose={() => setShowFeesModal(false)}
                queryClient={queryClient}
                remainingFee={student?.feesDetails[0]?.remaining}
              />
            </Modal>

            {/* Header */}
            <div className="flex flex-wrap justify-between items-center">
              <div className="flex items-center gap-3">
                <Wallet className="w-6 h-6 text-yellow-500" />
                <h2 className="text-2xl font-semibold text-gray-800">Fee Details</h2>
              </div>

              <button
                onClick={() => setShowFeesModal(true)}
                className="flex items-center gap-2 bg-[image:var(--gradient-primary)]  cursor-pointer font-medium px-4 py-2 rounded-lg shadow-sm transition"
              >
                <PlusCircle className="w-4 h-4" />
                Add Fees
              </button>
            </div>

            {/* Fee Structures */}
            <section>
              <h3 className="text-lg font-semibold bg-[var(--color-neutral)] mb-3">Fee Structures</h3>

              {student.feeStructures?.length ? (
                <div className="grid md:grid-cols-2 gap-5">
                  {student.feeStructures.map((structure) => (
                    <div
                      key={structure._id}
                      className="p-5 bg-[var(--color-neutral)] border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-yellow-600">
                          {structure.academicYear}
                        </h4>
                        <span
                          className={`text-xs font-medium px-3 py-1 rounded-full ${structure.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                            }`}
                        >
                          {structure.status}
                        </span>
                      </div>

                      <div className="text-gray-700 text-sm space-y-1">
                        <p>
                          <strong>Class:</strong> {structure.classIdentifier}
                        </p>
                        <p>
                          <strong>Total Amount:</strong> ₹{structure.totalAmount}
                        </p>
                      </div>

                      <div className="mt-3">
                        <h5 className="font-medium text-gray-800 mb-1">
                          Fee Heads
                        </h5>
                        <ul className="list-disc ml-5 text-sm text-gray-600 space-y-1">
                          {structure.feeHeads.map((fh) => (
                            <li key={fh._id}>
                              {fh.type}: ₹{fh.amount}{" "}
                              {fh.isOptional && (
                                <span className="italic text-gray-500">(Optional)</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 bg-gray-50 border rounded-xl">
                  <FileWarning className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  No fee structures available.
                </div>
              )}
            </section>

            {/* Fee Records */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Payment Records
              </h3>

              {student.feesDetails?.length ? (
                <div className="grid md:grid-cols-2 gap-5">
                  {student.feesDetails.map((fee) => (
                    <div
                      key={fee._id}
                      className="p-5 bg-[var(--color-neutral)] border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-green-700">
                          Fee Payment Record
                        </h4>
                        <span
                          className={`text-xs font-medium px-3 py-1 rounded-full ${fee.status === "Paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                            }`}
                        >
                          {fee.status}
                        </span>
                      </div>

                      <div className="text-gray-700 text-sm grid grid-cols-2 gap-2 mb-2">
                        <p>
                          <strong>Total Fee:</strong> ₹{fee.totalFee}
                        </p>
                        <p>
                          <strong>Paid:</strong> ₹{fee.paidTillNow}
                        </p>
                        <p>
                          <strong>Remaining:</strong> ₹{fee.remaining}
                        </p>
                      </div>

                      <h5 className="font-medium text-gray-800 mb-1 mt-2">
                        Payments
                      </h5>
                      {fee.payments.length ? (
                        <ul className="list-disc ml-5 text-sm text-gray-600 space-y-1">
                          {fee.payments.map((pay) => (
                            <li key={pay.transactionId}>
                              ₹{pay.amountPaid} via {pay.mode} on{" "}
                              {new Date(pay.date).toLocaleDateString()} –{" "}
                              <span className="font-medium">{pay.status}</span>{" "}
                              ({pay.remarks})
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 text-sm ml-5">
                          No payments recorded.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 bg-gray-50 border rounded-xl">
                  <Coins className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  No fee payment records available.
                </div>
              )}
            </section>
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
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
                      className="text-sm text-blue-600 cursor-pointer hover:underline"
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
                <div className="grid  md:grid-cols-3 gap-4">
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
                        className="text-sm text-blue-600 cursor-pointer hover:underline"
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
                className="px-4 py-2 bg-[image:var(--gradient-primary)] text-black rounded-sm cursor-pointer transition mt-4"
              >
                Download All Marksheets as ZIP
              </button>
            </div>

            {/* Certificates */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Certificates</h3>
              {student.certificates?.length ? (
                <div className="grid md:grid-cols-3 gap-4">
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
                        className="text-sm text-blue-600 cursor-pointer hover:underline"
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
