import React, { useState } from "react";
import toast from "react-hot-toast";
import { apiPut } from "../api/apiFetch";
import apiPath from "../api/apiPath";

export default function AddFeesForm({ studentId, onClose, queryClient, remainingFee }) {
  const [amountPaid, setAmountPaid] = useState("");
  const [confirmAmountPaid, setConfirmAmountPaid] = useState("");
  const [remarks, setRemarks] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAmountChange = (value) => {
    if (Number(value) > Number(remainingFee)) {
      setErrors((prev) => ({
        ...prev,
        amountPaid: `Amount cannot exceed remaining fee (₹${remainingFee})`,
      }));
      setAmountPaid(remainingFee.toString());
    } else {
      setAmountPaid(value);
      setErrors((prev) => ({ ...prev, amountPaid: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // ✅ Validation rules
    if (!amountPaid) newErrors.amountPaid = "Amount Paid is required";
    if (!confirmAmountPaid) newErrors.confirmAmountPaid = "Please confirm the amount";
    if (amountPaid && confirmAmountPaid && Number(amountPaid) !== Number(confirmAmountPaid)) {
      newErrors.confirmAmountPaid = "Amounts do not match";
    }
    if (Number(amountPaid) > Number(remainingFee)) {
      newErrors.amountPaid = `Amount cannot exceed remaining fee (₹${remainingFee})`;
    }
    if (!remarks.trim()) newErrors.remarks = "Remarks are required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        amountPaid: Number(amountPaid),
        remarks,
      };

      const res = await apiPut(`${apiPath.AddFees}/${studentId}/payment`, payload);

      if (res.success) toast.success(res.message || "Payment added successfully");
      else toast.error(res.message || "Failed to add payment");

      queryClient.invalidateQueries(["studentDetail", studentId]);
      onClose();
    } catch (err) {
      toast.error(err.message || "Something went wrong");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg">
      {/* Amount Paid */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Amount Paid (₹) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={amountPaid}
          onChange={(e) => handleAmountChange(e.target.value)}
          className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 ${
            errors.amountPaid
              ? "border-red-400 focus:ring-red-400"
              : "border-gray-300 focus:ring-blue-400"
          }`}
          placeholder={`Enter amount (Max ₹${remainingFee})`}
          min="1"
        />
        {errors.amountPaid && (
          <p className="text-red-500 text-xs mt-1">{errors.amountPaid}</p>
        )}
      </div>

      {/* Confirm Amount Paid */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Amount Paid <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={confirmAmountPaid}
          onChange={(e) => {
            setConfirmAmountPaid(e.target.value);
            setErrors((prev) => ({ ...prev, confirmAmountPaid: "" }));
          }}
          className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 ${
            errors.confirmAmountPaid
              ? "border-red-400 focus:ring-red-400"
              : "border-gray-300 focus:ring-blue-500"
          }`}
          placeholder="Re-enter amount"
          min="1"
        />
        {errors.confirmAmountPaid && (
          <p className="text-red-500 text-xs mt-1">{errors.confirmAmountPaid}</p>
        )}
      </div>

      {/* Remarks */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Remarks <span className="text-red-500">*</span>
        </label>
        <textarea
          value={remarks}
          onChange={(e) => {
            setRemarks(e.target.value);
            setErrors((prev) => ({ ...prev, remarks: "" }));
          }}
          className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 ${
            errors.remarks
              ? "border-red-400 focus:ring-red-400"
              : "border-gray-300 focus:ring-blue-500"
          }`}
          rows="3"
          placeholder="Enter remarks (e.g. Fee payment for October)"
        />
        {errors.remarks && (
          <p className="text-red-500 text-xs mt-1">{errors.remarks}</p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 mt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 cursor-pointer py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-[image:var(--gradient-primary)] cursor-pointer  rounded-lg hover:bg-yellow-600 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Add Fee"}
        </button>
      </div>
    </form>
  );
}
