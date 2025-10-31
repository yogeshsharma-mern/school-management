import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Select from "react-select";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  IconButton,
  Divider,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { Edit, School } from "@mui/icons-material";
import { FaPlusCircle } from "react-icons/fa";
import toast from "react-hot-toast";

import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from "../api/apiFetch";
import apiPath from "../api/apiPath";
import Modal from "../components/Modal";
import ToggleButton from "../components/ToggleButton";

export default function FeesStructure() {
  const queryClient = useQueryClient();

  const [selectedClass, setSelectedClass] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;

  const [formData, setFormData] = useState({
    academicYear: `${currentYear}-${nextYear}`,
    feeHeads: [
      { type: "Tuition Fee", amount: 0, isOptional: false },
      { type: "Exam Fee", amount: 0, isOptional: false },
    ],
    totalAmount: 0,
  });

  // Fetch classes
  const { data: classData, isLoading: classLoading } = useQuery({
    queryKey: ["classesdata"],
    queryFn: () => apiGet(apiPath.classes),
  });

  // Fetch fees structure
  const { data: feesData, isLoading: feesLoading } = useQuery({
    queryKey: ["feesStructure", selectedClass],
    queryFn: () =>
      apiGet(`${apiPath.getFeesStructure}?classIdentifier=${selectedClass}`),
    enabled: !!selectedClass,
  });

  // Mutations
  const mutation = useMutation({
    mutationFn: async (payload) => {
      if (editData) return apiPut(`${apiPath.updateFeesStructure}/${editData._id}`, payload);
      return apiPost(apiPath.createFeesStructure, payload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["feesStructure", selectedClass]);
      toast.success(data.message || "Fees structure saved successfully");
      setIsModalOpen(false);
      setEditData(null);
      resetForm();
    },
    onError: (error) => toast.error(error?.response?.data?.message || "Something went wrong"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => apiDelete(`${apiPath.deleteFeesStructure}/${id}`),
    onSuccess: () => {
      // Force refresh of selected class's fees
      queryClient.invalidateQueries(["feesStructure", selectedClass]);
      toast.success("Fees structure deleted successfully");
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Delete failed"),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, newStatus }) =>
      apiPatch(`${apiPath.feestoggleFeesStructure}/${id}`, { status: newStatus }),
    onSuccess: (data) => {
      queryClient.invalidateQueries(["feesStructure", selectedClass]),
        toast.success(data.message || "Status updated successfully");
    }
  });

  const resetForm = () =>
    setFormData({
      academicYear: `${currentYear}-${nextYear}`,
      feeHeads: [
        { type: "Tuition Fee", amount: 0, isOptional: false },
        { type: "Exam Fee", amount: 0, isOptional: false },
      ],
      totalAmount: 0,
    });

  const handleEdit = () => {
    const data = feesData?.results;
    if (!data) return;

    setEditData(data);
    setFormData({
      academicYear: data.academicYear || `${currentYear}-${nextYear}`,
      feeHeads: data.feeHeads || [
        { type: "Tuition Fee", amount: 0, isOptional: false },
        { type: "Exam Fee", amount: 0, isOptional: false },
      ],
      totalAmount: data.totalAmount || 0,
    });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    resetForm();
    setEditData(null);
    setIsModalOpen(true);
  };

  const handleFeeHeadChange = (index, field, value) => {
    const newHeads = [...formData.feeHeads];
    newHeads[index][field] = value;
    setFormData({ ...formData, feeHeads: newHeads });
  };

  const addFeeHead = () =>
    setFormData({
      ...formData,
      feeHeads: [...formData.feeHeads, { type: "", amount: 0, isOptional: false }],
    });

  const removeFeeHead = (index) =>
    setFormData({
      ...formData,
      feeHeads: formData.feeHeads.filter((_, i) => i !== index),
    });

  const handleSubmit = (e) => {
    e.preventDefault();
    const totalAmount = formData.feeHeads.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    mutation.mutate({ ...formData, classIdentifier: selectedClass, totalAmount });
  };

  // Deduplicate class list (ignore section)
  const classOptions = (() => {
    if (!classData?.results?.docs) return [];

    const uniqueMap = new Map();

    classData.results.docs.forEach((cls) => {
      // Extract base class name (e.g., "10th" from "10th A" or "10th-B")
      const baseName = cls.name.split(" ")[0].trim();

      if (!uniqueMap.has(baseName)) {
        uniqueMap.set(baseName, {
          value: baseName, // or cls.classIdentifier if consistent
          label: baseName,
        });
      }
    });

    return Array.from(uniqueMap.values());
  })();


  const selectedClassLabel =
    classOptions.find((cls) => cls.value === selectedClass)?.label || "N/A";

  return (
    <div className="p-8  min-h-screen">
      <Typography
        variant="h5"
        align="center"
        gutterBottom
        className="text-black font-extrabold drop-shadow-md"
      >
        🏫 Fees Structure Management
      </Typography>

      <div className="max-w-4xl mx-auto mt-10">
        {/* Class Selector */}
        <div className="mb-6">
          <label className="block text-gray-800 mb-2 font-medium">Select Class</label>
          <Select
            options={classOptions}
            isLoading={classLoading}
            placeholder="Choose class..."
            onChange={(opt) => setSelectedClass(opt.value)}
            className="shadow-md rounded-md"
            theme={(theme) => ({
              ...theme,
              colors: {
                ...theme.colors,
                primary25: "#fef08a", // light yellow on hover
                primary: "#facc15",   // main yellow (border, selected)
              },
            })}
          />
        </div>

        {/* Fees Structure Display */}
        {feesLoading ? (
          <div className="text-center py-10">
            <CircularProgress color="warning" />
            <p className="mt-2 text-gray-600">Loading fees structure...</p>
          </div>
        ) : feesData?.results ? (
          <Card className="shadow-2xl border border-yellow-300 rounded-xl">
            <CardHeader
              title={
                <div className="flex items-center gap-2 text-yellow-800 font-bold">
                  <School fontSize="large" />
                  <Typography variant="h6">{selectedClassLabel}</Typography>
                </div>
              }
              action={
                <div className="flex items-center gap-3">
                  <Tooltip title="Edit Fees Structure">
                    <IconButton onClick={handleEdit} className="text-yellow-700">
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Fees Structure">
                    <IconButton
                      onClick={() => {
                        if (window.confirm("Are you sure you want to delete this fees structure?")) {
                          deleteMutation.mutate(feesData.results._id);
                        }
                      }}
                      className="text-red-500"
                    >
                      🗑️
                    </IconButton>
                  </Tooltip>
                </div>
              }
            />
            <Divider />
            <CardContent>
              <Typography className="mb-4 text-gray-700 font-medium">
                Academic Year: <b>{feesData.results.academicYear}</b>
              </Typography>

              <div className="bg-yellow-50 p-4 rounded-xl shadow-inner">
                {feesData.results.feeHeads.map((head, idx) => (
                  <div
                    key={idx}
                    className="flex flex-wrap justify-between items-center p-3 mb-2 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    <Typography className="w-1/3 font-semibold text-gray-700">{head.type}</Typography>
                    <Typography className="w-1/3 text-center text-gray-600">₹{head.amount}</Typography>
                    <Typography
                      className={`w-1/3 text-right font-medium ${head.isOptional ? "text-blue-500" : "text-green-600"
                        }`}
                    >
                      {head.isOptional ? "Optional" : "Mandatory"}
                    </Typography>
                  </div>
                ))}
              </div>

              {/* Total + Toggle */}
              <div className="flex justify-between items-center mt-6 bg-yellow-100 p-3 rounded-lg shadow-md">
                <Typography variant="h6" className="text-yellow-900 font-bold">
                  Total: ₹{feesData.results.totalAmount}
                </Typography>

                <div className="flex items-center gap-3">
                  <Typography className="text-gray-700 text-sm font-medium">
                    {feesData.results.status === "active" ? "Active" : "Inactive"}
                  </Typography>
                  <ToggleButton
                    isActive={feesData.results.status}
                    onToggle={() =>
                      toggleMutation.mutate({
                        id: feesData.results._id,
                        newStatus: feesData.results.status === "active" ? false : true,
                      })
                    }
                    disabled={toggleMutation.isPending}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center text-gray-600 mt-10">
            No fees structure found.
            {selectedClass && (
              <button
                onClick={handleAdd}
                className="text-yellow-700 underline font-semibold ml-2 hover:text-yellow-900"
              >
                Add New
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editData ? "Edit Fees Structure" : "Add Fees Structure"}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const tuition = formData.feeHeads.find((f) => f.type === "Tuition Fee");
            const exam = formData.feeHeads.find((f) => f.type === "Exam Fee");

            if (!tuition?.amount || !exam?.amount) {
              toast.error("Tuition Fee and Exam Fee are required!");
              return;
            }
            handleSubmit(e);
          }}
          className="space-y-4"
        >
          {/* Academic Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
            <input
              type="text"
              value={formData.academicYear}
              readOnly
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-sm text-gray-700 cursor-not-allowed"
            />
          </div>

          {/* Fee Heads */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fee Heads</label>

            {formData.feeHeads.map((head, index) => {
              const feeTypeOptions = [
                { value: "Tuition Fee", label: "Tuition Fee" },
                { value: "Exam Fee", label: "Exam Fee" },
                { value: "Transport Fee", label: "Transport Fee" },
                { value: "Miscellaneous", label: "Miscellaneous" },
              ];
              const selectedTypes = formData.feeHeads.map((f) => f.type);
              const availableOptions = feeTypeOptions.map((opt) => ({
                ...opt,
                isDisabled: selectedTypes.includes(opt.value) && opt.value !== head.type,
              }));
              const isMandatory = head.type === "Tuition Fee" || head.type === "Exam Fee";

              return (
                <div key={index} className="flex flex-wrap items-center gap-3 border p-3 rounded-md mb-2 bg-yellow-50 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-full sm:w-[260px]">
                    <Select
                      options={availableOptions}
                      value={head.type ? { value: head.type, label: head.type } : null}
                      placeholder="Select Fee Type"
                      onChange={(opt) => handleFeeHeadChange(index, "type", opt?.value || "")}
                      isDisabled={isMandatory}
                    />
                  </div>

                  <input
                    type="number"
                    placeholder="Amount"
                    value={head.amount}
                    onChange={(e) => handleFeeHeadChange(index, "amount", Number(e.target.value))}
                    className="w-full sm:w-[140px] border border-gray-300 rounded-md px-2 py-1 text-xs"
                  />

                  <label className="flex items-center gap-1 text-sm w-auto">
                    <input
                      type="checkbox"
                      checked={head.isOptional}
                      onChange={(e) => handleFeeHeadChange(index, "isOptional", e.target.checked)}
                      disabled={isMandatory}
                    />
                    Optional
                  </label>

                  {!isMandatory && (
                    <button
                      type="button"
                      onClick={() => removeFeeHead(index)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })}

            {formData.feeHeads.length < 4 && (
              <Button
                variant="outlined"
                startIcon={<FaPlusCircle />}
                onClick={addFeeHead}
                className="text-yellow-700 border-yellow-400 hover:bg-yellow-100 mt-2"
              >
                Add Optional Fee
              </Button>
            )}
          </div>

          {/* Save / Cancel */}
          <div className="flex justify-end gap-3 pt-4">
            <Button onClick={() => setIsModalOpen(false)} variant="outlined" color="inherit">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={mutation.isPending}
              sx={{
                '--gradient-primary': 'linear-gradient(to right, #facc15, #eab308)',
                background: 'var(--gradient-primary)',
                color: '#333',
              }}
            >
              {mutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}





