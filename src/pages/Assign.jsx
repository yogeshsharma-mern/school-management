import React, { useMemo, useState, useEffect } from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "../api/apiFetch";
import apiPath from "../api/apiPath";
import AddAssignmentModal from "../components/AddAssignmentModal";

/**
 * settings: object in the shape you pasted:
 * {
 *   schoolTiming: { startTime: "09:00", endTime: "15:00" },
 *   periods: {
 *     totalPeriods: 5,
 *     periodDuration: 60,    // minutes
 *     breakDuration: 8,      // minutes
 *     lunchBreak: { isEnabled: true, time: "12:00", duration: 45 }
 *   }
 * }
 *
 * Returns array of slots. Each slot:
 *  { id, period, startTime, endTime, isBreak?, timeSlotId? }
 */
export function generateTimeSlotsFromSettings(settings) {
  if (!settings || !settings.schoolTiming || !settings.periods) return [];

  const { schoolTiming, periods } = settings;
  const totalPeriods = Number(periods.totalPeriods || 6);
  const periodDuration = Number(periods.periodDuration || 60); // minutes
  const breakDuration = Number(periods.breakDuration || 8); // minutes
  const lunch = periods.lunchBreak || { isEnabled: false };

  // Helpers
  const parseHM = (hm) => {
    // parse "HH:mm" into a Date at epoch-day (1970-01-01) to avoid timezone surprises
    const [h, m] = (hm || "").split(":").map((x) => Number(x));
    const d = new Date(1970, 0, 1, h || 0, m || 0, 0, 0);
    return d;
  };
  const fmt = (d) =>
    d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });

  const start = parseHM(schoolTiming.startTime || "09:00");
  const end = parseHM(schoolTiming.endTime || "15:00");
  const lunchStart = lunch.isEnabled && lunch.time ? parseHM(lunch.time) : null;
  const lunchDuration = Number(lunch.duration || 0);

  const slots = [];
  let current = new Date(start.getTime());
  let scheduledPeriods = 0;
  let idCounter = 1;
  let lunchInserted = false;

  // Safety: if start >= end, return empty
  if (current.getTime() >= end.getTime()) return [];

  while (scheduledPeriods < totalPeriods && current.getTime() < end.getTime()) {
    // If lunch is enabled and its start time is <= current (meaning it's time for lunch now),
    // insert lunch slot first (and only once).
    if (lunch.isEnabled && !lunchInserted && lunchStart && lunchStart.getTime() <= current.getTime()) {
      const ls = new Date(lunchStart.getTime());
      const le = new Date(lunchStart.getTime() + lunchDuration * 60 * 1000);

      // ensure lunch fits inside school end
      if (ls.getTime() < end.getTime()) {
        slots.push({
          id: `L${idCounter++}`,
          period: "Lunch Break",
          startTime: fmt(ls),
          endTime: fmt(le > end ? end : le),
          isBreak: true,
        });
        lunchInserted = true;
        // move current to end of lunch + no extra break (break after lunch not applied)
        current = new Date(le.getTime());
        continue;
      } else {
        // lunch starts after school end — ignore
        lunchInserted = true;
      }
    }

    // Normal teaching period
    const pStart = new Date(current.getTime());
    const pEnd = new Date(pStart.getTime() + periodDuration * 60 * 1000);

    // If proposed period ends after school end, trim it and stop afterwards
    if (pStart.getTime() >= end.getTime()) break;
    const actualPEnd = pEnd.getTime() > end.getTime() ? new Date(end.getTime()) : pEnd;

    slots.push({
      id: idCounter++,
      period: `Period ${scheduledPeriods + 1}`,
      startTime: fmt(pStart),
      endTime: fmt(actualPEnd),
      isBreak: false,
      timeSlotId: scheduledPeriods + 1,
    });

    scheduledPeriods += 1;

    // advance current by period duration + break
    current = new Date(actualPEnd.getTime() + breakDuration * 60 * 1000);

    // AFTER moving current forward, check if lunch falls between the previous period end and the new current
    // If lunchStart is between previous period end and current (i.e., during the break or right after),
    // insert lunch before scheduling the next period.
    if (lunch.isEnabled && !lunchInserted && lunchStart) {
      const prevPeriodEnd = actualPEnd;
      const breakWindowStart = prevPeriodEnd.getTime();
      const breakWindowEnd = current.getTime(); // includes break time
      if (lunchStart.getTime() >= breakWindowStart && lunchStart.getTime() < breakWindowEnd) {
        const ls = new Date(lunchStart.getTime());
        const le = new Date(lunchStart.getTime() + lunchDuration * 60 * 1000);
        if (ls.getTime() < end.getTime()) {
          slots.push({
            id: `L${idCounter++}`,
            period: "Lunch Break",
            startTime: fmt(ls),
            endTime: fmt(le > end ? end : le),
            isBreak: true,
          });
          lunchInserted = true;
          // set current after lunch
          current = new Date(le.getTime());
        } else {
          lunchInserted = true;
        }
      }
    }
  }

  // If lunch is enabled but not yet inserted, and it occurs after the last scheduled slot & within school hours,
  // add it at the end (edge case).
  if (lunch.isEnabled && !lunchInserted && lunchStart) {
    if (lunchStart.getTime() < end.getTime()) {
      const ls = new Date(lunchStart.getTime());
      const le = new Date(lunchStart.getTime() + lunchDuration * 60 * 1000);
      slots.push({
        id: `L${idCounter++}`,
        period: "Lunch Break",
        startTime: fmt(ls),
        endTime: fmt(le > end ? end : le),
        isBreak: true,
      });
    }
  }

  return slots;
}

export default function TimetableManager() {
  const queryClient = useQueryClient();
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSlot, setModalSlot] = useState(null);

  // 🔹 Queries
  const settingsQuery = useQuery({
    queryKey: ["settings"],
    queryFn: () => apiGet(apiPath.getSettings || "/api/admins/settings"),
  });

  const classesQuery = useQuery({
    queryKey: ["classes"],
    queryFn: () => apiGet(apiPath.classes || "/api/admins/classes"),
  });

  const teachersQuery = useQuery({
    queryKey: ["teachers"],
    queryFn: () => apiGet(apiPath.getTeachers || "/api/admins/teachers"),
  });

  const subjectsQuery = useQuery({
    queryKey: ["subjects"],
    queryFn: () => apiGet(apiPath.getSubjects || "/api/admins/subjects"),
  });

  const assignmentsQuery = useQuery({
    queryKey: ["assignments"],
    queryFn: () =>
      apiGet(apiPath.getAssignments || "/api/admins/teachers/assign-teacher"),
  });

  // 🔹 Data extraction
  const classes = classesQuery.data?.results?.docs || classesQuery.data || [];
  const teachers = teachersQuery.data?.results?.docs || teachersQuery.data || [];
  const subjects = subjectsQuery.data?.results?.docs || subjectsQuery.data || [];
  const allAssignments =
    assignmentsQuery.data?.results || assignmentsQuery.data || [];

  // 🔹 Default class
  useEffect(() => {
    if (!selectedClassId && classes.length) {
      setSelectedClassId(classes[0]._id || classes[0].id);
    }
  }, [classes, selectedClassId]);

  // 🔹 Filtered assignments
  const filteredAssignments = useMemo(() => {
    return allAssignments.filter(
      (a) =>
        a.classId === selectedClassId ||
        a.classId?._id === selectedClassId ||
        a.class?._id === selectedClassId
    );
  }, [allAssignments, selectedClassId]);

  // 🔹 Time slots
  const schoolStart = settingsQuery.data?.results?.schoolTiming?.startTime || "09:00 AM";
  const schoolEnd = settingsQuery.data?.results?.schoolTiming?.endTime || "03:00 PM";
  const periods = settingsQuery.data?.results?.periods?.totalPeriods || 6;
const settingsData = settingsQuery.data?.results;

// then
const timeSlots = useMemo(
  () => (settingsData ? generateTimeSlotsFromSettings(settingsData) : []),
  [settingsData]
);
  const [localAssignments, setLocalAssignments] = useState({});

  // 🔹 Reset when class changes
  useEffect(() => {
    setLocalAssignments({});
  }, [selectedClassId]);

  // 🔹 Load existing class assignments
  useEffect(() => {
  if (!filteredAssignments || filteredAssignments.length === 0) return;
  const map = {};
  for (const a of filteredAssignments) {
    const day = a.day || "Monday";
    const slot = timeSlots.find(
      (s) =>
        a.timeSlotId === s.id || s.startTime === a.startTime
    );
    const slotId = slot ? String(slot.id) : String(a.timeSlotId || 0); // normalize
    const key = `${day}_${slotId}`;
    map[key] = {
      ...a,
      _remoteId: a._id || a.id,
      saved: true,
    };
  }
  setLocalAssignments(map);
}, [filteredAssignments, timeSlots]);

// get assignment for slot
const getAssignmentFor = (day, slot) => {
  const key = `${day}_${String(slot.id)}`;
  return localAssignments[key] || null;
};

  // 🔹 Local Save (UI only)
  const handleLocalAssign = ({ day, slot, teacherId, subjectId }) => {
    const teacher =
      teachers.find((t) => t._id === teacherId || t.id === teacherId) || {};
    const subject =
      subjects.find((s) => s._id === subjectId || s.id === subjectId) || {};
    const selectedClass =
      classes.find((c) => c._id === selectedClassId || c.id === selectedClassId) ||
      {};

    const key = `${day}_${slot.id}`;
    const newItem = {
      classId: selectedClassId,
      className: selectedClass.name || selectedClass.className,
      teacherId,
      teacherName: teacher.name || teacher.fullName || "",
      subjectId,
      subjectName: subject.name || subject.title || "",
      period: slot.period,
      timeSlotId: slot.id,
      day,
      startTime: slot.startTime,
      endTime: slot.endTime,
      saved: false,
    };

    setLocalAssignments((prev) => ({ ...prev, [key]: newItem }));
    setModalOpen(false);
  };

  // 🔹 Bulk Save (API)
  const bulkSaveMutation = useMutation({
    mutationFn: async (payloadArr) => {
      if (apiPath.postAssignmentBulk)
        return apiPost(apiPath.postAssignmentBulk, payloadArr);
      const results = [];
      for (const p of payloadArr) {
        const res = await apiPost(
          apiPath.postAssignment || "/api/admins/teachers/assign-teacher",
          p
        );
        results.push(res);
      }
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      setLocalAssignments((prev) => {
        const next = {};
        for (const [k, v] of Object.entries(prev)) next[k] = { ...v, saved: true };
        return next;
      });
    },
  });

  // 🔹 Collect unsaved assignments for saving
  const collectUnsavedPayloads = () => {
    const payloads = [];
    for (const v of Object.values(localAssignments)) {
      if (!v.saved) {
        payloads.push({
          classId: v.classId,
          className: v.className,
          teacherId: v.teacherId,
          teacherName: v.teacherName,
          subjectId: v.subjectId,
          subjectName: v.subjectName,
          period: v.period,
          timeSlotId: v.timeSlotId,
          day: v.day,
          startTime: v.startTime,
          endTime: v.endTime,
        });
      }
    }
    return payloads;
  };

  const handleSaveAll = () => {
    const payloads = collectUnsavedPayloads();
    if (payloads.length === 0) return;
    bulkSaveMutation.mutate(payloads);
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  return (
    <Box className="p-8 bg-gradient-to-b from-indigo-50 to-white min-h-screen">
      <Typography variant="h4" className="font-extrabold mb-6 text-indigo-800">
        Timetable Management
      </Typography>

      {/* 🔹 Controls */}
      <Paper className="p-6 mb-6 rounded-3xl shadow-lg bg-white">
        <Box className="flex flex-wrap gap-6 items-center">
          <Box>
            <Typography variant="subtitle2" className="text-gray-500">
              Select Class
            </Typography>
            <select
              className="mt-2 border border-indigo-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-200"
              value={selectedClassId || ""}
              onChange={(e) => setSelectedClassId(e.target.value)}
            >
              {classes.map((c) => (
                <option key={c._id || c.id} value={c._id || c.id}>
                  {c.name || c.className}
                </option>
              ))}
            </select>
          </Box>

          <Box className="ml-auto flex items-center gap-3">
            <Button
              variant="outlined"
              className="border-indigo-400 text-indigo-600 hover:bg-indigo-50"
              onClick={() => {
                setLocalAssignments({});
                queryClient.invalidateQueries({ queryKey: ["assignments"] });
              }}
            >
              Reset
            </Button>

            <Button
              variant="contained"
              onClick={handleSaveAll}
              disabled={
                bulkSaveMutation.isMutating ||
                collectUnsavedPayloads().length === 0
              }
              className="bg-indigo-600 text-white rounded-xl"
            >
              {bulkSaveMutation.isMutating
                ? "Saving..."
                : `Save Details (${collectUnsavedPayloads().length})`}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* 🔹 Timetable */}
      <Paper className="p-4 rounded-3xl shadow-xl bg-white overflow-x-auto">
        <Box className="grid grid-cols-[150px_repeat(5,1fr)] gap-2">
          <Box></Box>
          {days.map((day) => (
            <Typography
              key={day}
              className="font-semibold text-center text-indigo-700 p-2 border-b border-gray-300"
            >
              {day}
            </Typography>
          ))}

          {timeSlots.map((slot) => (
            <React.Fragment key={slot.id}>
              <Box className="font-medium text-gray-700 p-2 border-r border-gray-300 text-center bg-indigo-50">
                <div>{slot.period}</div>
                <div className="text-xs text-gray-500">
                  {slot.startTime} - {slot.endTime}
                </div>
              </Box>

              {days.map((day) => {
                const a = getAssignmentFor(day, slot);
                return (
                  <Box
                    key={`${day}_${slot.id}`}
                    onClick={() => {
                      setModalSlot({ day, slot });
                      setModalOpen(true);
                    }}
                    className={`p-2 rounded-lg cursor-pointer transition h-24 flex flex-col justify-center items-center border ${
                      a
                        ? a.saved
                          ? "bg-green-50 border-green-300"
                          : "bg-yellow-50 border-yellow-400"
                        : "bg-white border-dashed border-gray-300 hover:bg-blue-50"
                    }`}
                  >
                    {a ? (
                      <>
                        <Typography className="font-medium text-indigo-800 text-sm text-center">
                          {a.subjectName}
                        </Typography>
                        <Typography className="text-xs text-gray-600 text-center">
                          {a.teacherName}
                        </Typography>
                        {!a.saved && (
                          <Box
                            className="w-3 h-3 bg-yellow-500 rounded-full mt-1"
                            title="Unsaved change"
                          />
                        )}
                      </>
                    ) : (
                      <Typography className="text-gray-400 text-sm text-center">
                        Click to assign
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </React.Fragment>
          ))}
        </Box>
      </Paper>

      {/* 🔹 Modal */}
      {modalOpen && modalSlot && (
        <AddAssignmentModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          slotData={{
            slot: modalSlot.slot,
            existing: getAssignmentFor(modalSlot.day, modalSlot.slot),
          }}
          day={modalSlot.day}
          teachers={teachers}
          subjects={subjects}
          assignments={filteredAssignments}
          createAssignment={{
            mutateAsync: (payload) =>
              new Promise((resolve) => {
                handleLocalAssign({
                  ...payload,
                  day: modalSlot.day,
                  slot: modalSlot.slot,
                });
                resolve();
              }),
          }}
          classId={selectedClassId}
        />
      )}
    </Box>
  );
}
