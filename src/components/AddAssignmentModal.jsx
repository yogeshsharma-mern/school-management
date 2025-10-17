import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Typography,
} from "@mui/material";
import toast from "react-hot-toast";

export default function AddAssignmentModal({
  open,
  onClose,
  slotData, // {slot, existing}
  timeslots = [],
  classId,
  day,
  teachers = [],
  subjects = [],
  assignments = [],
  createAssignment, // react-query mutation passed in
}) {
  const existing = slotData?.existing;
  const slot = slotData?.slot;

  const defaultStart = slot?.startTime || "";
  const defaultEnd = slot?.endTime || "";

  const [teacherId, setTeacherId] = useState(existing?.teacherId || "");
  const [subjectId, setSubjectId] = useState(existing?.subjectId || "");
  const [section, setSection] = useState(existing?.section || "A");
  const [startTime, setStartTime] = useState(defaultStart);
  const [endTime, setEndTime] = useState(defaultEnd);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTeacherId(existing?.teacherId || "");
    setSubjectId(existing?.subjectId || "");
    setSection(existing?.section || "A");
    setStartTime(existing?.startTime || defaultStart);
    setEndTime(existing?.endTime || defaultEnd);
  }, [existing, defaultStart, defaultEnd, open]);

  // 🔹 Compute teachers unavailable at same day/slot
  const unavailableTeachers = useMemo(() => {
    if (!slot || !assignments) return new Set();
    const map = new Set();
    for (const a of assignments) {
      const sameDay = (a.day || "").toLowerCase() === (day || "").toLowerCase();
      const sameSlot =
        (a.startTime && a.startTime === slot.startTime) ||
        (a.timeSlotId && a.timeSlotId === slot.id);
      if (sameDay && sameSlot) {
        if (a.teacherId) map.add(a.teacherId);
        if (a.teacher) map.add(a.teacher); // fallback if payload different
      }
    }
    return map;
  }, [slot, day, assignments]);

  // 🔹 Get selected teacher object
  const selectedTeacher = teachers.find(
    (t) => t._id === teacherId || t.id === teacherId
  );

  // 🔹 Subjects handled by the selected teacher
  const teacherSubjects = selectedTeacher?.subjectsHandled || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teacherId || !subjectId) {
      toast.error("Please select teacher and subject");
      return;
    }
    if (
      unavailableTeachers.has(teacherId) &&
      (!existing || existing.teacherId !== teacherId)
    ) {
      toast.error("Teacher already assigned at this slot");
      return;
    }

    const payload = {
      classId,
      teacherId,
      section,
      subjectId,
      startTime,
      endTime,
      day,
    };

    try {
      setLoading(true);
      await createAssignment.mutateAsync(payload);
      toast.success("Assignment saved");
      onClose();
    } catch (err) {
      toast.error("Failed to save assignment");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {existing ? "Edit Assignment" : "Assign Teacher To Time Slot"}
      </DialogTitle>
      <DialogContent>
        <form id="assign-form" onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* 🔹 Teacher + Subject */}
          <div className="grid grid-cols-2 gap-4">
            <FormControl fullWidth>
              <InputLabel id="teacher-label">Teacher</InputLabel>
              <Select
                labelId="teacher-label"
                value={teacherId}
                label="Teacher"
                onChange={(e) => {
                  setTeacherId(e.target.value);
                  setSubjectId(""); // reset subject when teacher changes
                }}
                required
              >
                {teachers.map((t) => {
                  const id = t._id || t.id || t.teacherId;
                  const name = t.name || t.fullName || t.teacherName;
                  const disabled =
                    unavailableTeachers.has(id) &&
                    (!existing || existing.teacherId !== id);
                  return (
                    <MenuItem key={id} value={id} disabled={disabled}>
                      {name} {disabled ? "— Unavailable" : ""}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            <FormControl fullWidth disabled={!selectedTeacher}>
              <InputLabel id="subject-label">Subject</InputLabel>
              <Select
                labelId="subject-label"
                value={subjectId}
                label="Subject"
                onChange={(e) => setSubjectId(e.target.value)}
                required
              >
                {teacherSubjects.map((s) => (
                  <MenuItem key={s._id} value={s._id}>
                    {s.subjectCode
                      ? `${s.subjectCode} — ${s.subjectName}`
                      : s.subjectName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {/* 🔹 Section + Times */}
          <div className="grid grid-cols-3 gap-4">
            <TextField
              label="Section"
              value={section}
              onChange={(e) => setSection(e.target.value)}
            />
            <TextField
              label="Start Time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            <TextField
              label="End Time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>

          {/* 🔹 Info */}
          <div>
            <Typography variant="caption" color="textSecondary">
              Day: {day} • Slot: {slot?.period || "-"} ({slot?.startTime} -{" "}
              {slot?.endTime})
            </Typography>
          </div>
        </form>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="assign-form"
          variant="contained"
          disabled={loading}
        >
          {loading ? "Saving..." : existing ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
