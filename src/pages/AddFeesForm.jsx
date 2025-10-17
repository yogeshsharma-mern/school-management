import React, { useState } from "react";
import toast from "react-hot-toast";
import { apiPut } from "../api/apiFetch";
import apiPath from "../api/apiPath";

export default function AddFeesForm({ studentId, onClose, queryClient }) {
  const [amountPaid, setAmountPaid] = useState("");
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amountPaid || !remarks) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        amountPaid: Number(amountPaid),
        remarks,
      };

  const res= await apiPut(`${apiPath.AddFees}/${studentId}/payment`, payload);
  if(res.success===true)
  {

      toast.success(res.message);
  }
else
{
  toast.error(res.message);
}
      queryClient.invalidateQueries(["studentDetail", studentId]);
      onClose();
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Amount Paid (₹)
        </label>
        <input
          type="number"
          value={amountPaid}
          onChange={(e) => setAmountPaid(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter amount"
          min="1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Remarks
        </label>
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
          placeholder="Enter remarks (e.g. Fee payment for October)"
        />
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-yellow-500 cursor-pointer text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Add Fee"}
        </button>
      </div>
    </form>
  );
}
