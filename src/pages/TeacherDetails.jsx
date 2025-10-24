import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPut } from "../api/apiFetch";
import Loader from "../components/Loading";
import toast from "react-hot-toast";
import { useState } from "react";
import apiPath from "../api/apiPath";
import jsPDF from "jspdf";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Home,
  Shield,
  Users,
  Download,
  FileText,
  FileImage,
  BookOpen,
  CheckCircle2,
  Award,
  Star,
  Activity,
} from "lucide-react";

export default function TeacherDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");
  const apiBase = import.meta.env.VITE_API_BASE_URL;

  // 🔍 Fetch teacher details
  const { data, isLoading, error } = useQuery({
    queryKey: ["teacherDetail", id],
    queryFn: () => apiGet(`${apiPath.getParticularTeacher}/${id}`),
    enabled: !!id,
  });

  const teacher = data?.results;

  // 🖼️ Helper to load image for PDF
  const loadImage = (url) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = url;
      img.onload = () => resolve(img);
      img.onerror = reject;
    });

  // 📄 Download individual document as PDF
  const downloadDocument = async (fileUrl, label) => {
    if (!fileUrl) return toast.error("No file available");
    const url = `${apiBase}${fileUrl}`;
    const isPDF = typeof url === "string" && url.toLowerCase().endsWith(".pdf");

    if (isPDF) {
      const response = await fetch(url);
      const blob = await response.blob();
      saveAs(blob, `${label}.pdf`);
    } else {
      const img = await loadImage(url);
      const pdf = new jsPDF({
        orientation: img.width > img.height ? "landscape" : "portrait",
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(img, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${label}.pdf`);
    }
  };

  // 📦 Download all docs as ZIP
  const downloadAllDocs = async () => {
    const files = [
      { label: "Profile Picture", file: teacher?.profilePic },
      { label: "Aadhar Front", file: teacher?.aadharFront?.fileUrl },
      { label: "Aadhar Back", file: teacher?.aadharBack?.fileUrl },
    ].filter((f) => f.file);

    if (!files.length) return toast.error("No documents found");

    const zip = new JSZip();
    for (const doc of files) {
      const url = `${apiBase}${doc.file}`;
      const response = await fetch(url);
      const blob = await response.blob();
      zip.file(`${doc.label}.${blob.type.includes("pdf") ? "pdf" : "jpg"}`, blob);
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `${teacher.name}_documents.zip`);
    toast.success("All documents downloaded successfully 🎉");
  };

  // 🔁 Toggle teacher status
  const toggleStatus = useMutation({
    mutationFn: () =>
      apiPut(`${apiPath.updateTeacherStatus}/${id}`, {
        status: teacher?.status === "active" ? "inactive" : "active",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["teacherDetail", id]);
      toast.success("Status updated ✅");
    },
    onError: () => toast.error("Failed to update ❌"),
  });

  if (isLoading) return <Loader />;
  if (error) return <p className="text-red-500 text-center">Error loading teacher.</p>;
  if (!teacher) return <p>No teacher found</p>;

  const docs = [teacher.aadharFront, teacher.aadharBack];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* 🔙 Back */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
      >
        ← Back
      </button>

      {/* 🧑‍🏫 Header */}
      <div className="flex justify-between items-center bg-[#1b263b] p-6 rounded-2xl text-white ">
        <div className="flex items-center gap-6">
          <img
            src={`${apiBase}${teacher.profilePic}`}
            alt="profile"
            className="rounded-full w-[100px] h-[100px] object-cover border-4 border-white shadow-xl"
          />
          <div>
            <h1 className="text-3xl font-bold capitalize tracking-wide">{teacher.name}</h1>
            <p className="opacity-90">{teacher.designation}</p>
            <p className="mt-1">
              Status:{" "}
              <span
                className={`font-semibold ${
                  teacher.status === "active" ? "text-green-200" : "text-red-200"
                }`}
              >
                {teacher.status}
              </span>
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          {/* <button
            onClick={() => toggleStatus.mutate()}
            disabled={toggleStatus.isLoading}
            className={`px-4 py-2 rounded-lg font-medium shadow-md transition ${
              teacher.status === "active"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {toggleStatus.isLoading
              ? "Updating..."
              : teacher.status === "active"
              ? "Set Inactive"
              : "Set Active"}
          </button> */}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-4 space-x-6 overflow-x-auto">
        {["profile", "subjects", "documents"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-2 capitalize text-sm font-medium transition ${
              activeTab === tab
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-500 hover:text-indigo-500"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 🧾 Profile Tab */}
      {activeTab === "profile" && (
        <div className="bg-white shadow-xl rounded-2xl p-6 grid md:grid-cols-2 gap-4">
          <p><strong><Mail className="inline w-4 h-4 mr-2" />Email:</strong> {teacher.email}</p>
          <p><strong><Phone className="inline w-4 h-4 mr-2" />Phone:</strong> {teacher.phone}</p>
          <p><strong>Gender:</strong> {teacher.gender}</p>
          <p><strong>Blood Group:</strong> {teacher.bloodGroup}</p>
          <p><strong>Date of Joining:</strong> {new Date(teacher.dateOfJoining).toLocaleDateString()}</p>
          <p><strong>Experience:</strong> {teacher.experience} years</p>
          <p><strong>Qualifications:</strong> {teacher.qualifications?.join(", ")}</p>
          {/* <p><strong>Specializations:</strong> {teacher.specialization?.join(", ")}</p> */}
          <p><strong>Physical Disability:</strong> {teacher.physicalDisability ? "Yes" : "No"}</p>
          <p><strong>Emergency Contact:</strong> {teacher.emergencyContact?.name} ({teacher.emergencyContact?.phone})</p>
          <p className="col-span-2"><strong><Home className="inline w-4 h-4 mr-2" />Address:</strong> {teacher.address.street}, {teacher.address.city}, {teacher.address.state}</p>

          {/* 🏫 Classes handled */}
          <div className="col-span-2 mt-4">
            <h3 className="text-lg font-semibold text-indigo-700 mb-2 flex items-center gap-2">
              <Users className="w-5 h-5" /> Classes Assigned
            </h3>
            {teacher.classData?.length ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {teacher.classData.map((cls) => (
                  <div
                    key={cls._id}
                    className="p-3 border border-gray-300 shadow-sm hover:shadow-md "
                  >
                    <p><strong>{cls.name}</strong> - Section {cls.section}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No classes assigned</p>
            )}
          </div>
        </div>
      )}

      {/* 📚 Subjects Handled */}
      {activeTab === "subjects" && (
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl shadow-inner">
          <h2 className="text-xl font-semibold mb-6 text-indigo-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5" /> Subjects Handled
          </h2>
          {teacher.subjectsHandled?.length ? (
            <div className="grid md:grid-cols-3 gap-6">
              {teacher.subjectsHandled.map((sub, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition transform hover:-translate-y-1 hover:bg-gradient-to-tr from-white to-indigo-50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-indigo-700">{sub.subjectCode}</h3>
                    <CheckCircle2 className="text-green-500 w-5 h-5" />
                  </div>
                  <p className="text-gray-700"><strong>Subject ID:</strong> {sub.subjectName}</p>
                  <p className="text-gray-700"><strong>Class ID:</strong> {sub.classId}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No subjects handled</p>
          )}
        </div>
      )}

      {/* 📂 Documents */}
      {activeTab === "documents" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-indigo-700">Documents</h2>
            <button
              onClick={downloadAllDocs}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <Download className="w-4 h-4" /> Download All
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {docs.map((doc, i) => {
              const fileUrl = doc || "";
              const isPDF =
                typeof fileUrl === "string" &&
                fileUrl.toLowerCase().endsWith(".pdf");

              return (
                <div
                  key={i}
                  className="overflow-hidden border-gray-200 shadow transition rounded-lg relative group"
                >
                  {isPDF ? (
                    <iframe
                      src={`${apiBase}${fileUrl}`}
                      title={`Document ${i}`}
                      className="w-full h-56"
                    />
                  ) : (
                    <img
                      src={`${apiBase}${fileUrl}`}
                      alt={`Aadhar ${i}`}
                      className="w-full h-56 object-cover"
                    />
                  )}
                  <button
                    onClick={() =>
                      downloadDocument(fileUrl, i === 0 ? "Aadhar Front" : "Aadhar Back")
                    }
                    className="absolute bottom-3 right-3 bg-indigo-600 text-white px-3 py-1.5 text-sm rounded-md flex items-center gap-1 opacity-0 group-hover:opacity-100 transition"
                  >
                    <Download className="w-4 h-4" /> Download PDF
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
