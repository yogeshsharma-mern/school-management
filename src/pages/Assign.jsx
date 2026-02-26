
import React, { useMemo, useState, useEffect } from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiDelete, apiGet, apiPost, apiPut } from "../api/apiFetch";
import apiPath from "../api/apiPath";
import AddAssignmentModal from "../components/AddAssignmentModal";
import toast from "react-hot-toast";
import { CircularProgress } from "@mui/material";
import { PaymentOutlined } from "@mui/icons-material";


// 🔹 Generate Time Slots
// export function generateTimeSlotsFromSettings(settings) {
//   if (!settings?.schoolTiming || !settings?.periods) return [];
//   console.log("setting", settings);
//   const { schoolTiming, periods } = settings;
//   const totalPeriods = Number(periods.totalPeriods || 6);
//   const periodDuration = Number(periods.periodDuration || 60);
//   const breakDuration = Number(periods.breakDuration);
//   const lunch = periods.lunchBreak || { isEnabled: false };
//   console.log("lunchtime", lunch?.time);

//   const parseHM = (hm) => {
//     const [h, m] = hm.split(":").map(Number);
//     return new Date(1970, 0, 1, h, m);
//   };
//   const fmt = (d) =>
//     d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });

//   const start = parseHM(schoolTiming.startTime || "09:00")
//   console.log("start", start)
//   const end = parseHM(schoolTiming.endTime || "15:00");
//   const lunchStart = lunch.isEnabled ? parseHM(lunch.time) : null;
//   const lunchDuration = Number(lunch.duration || 0);

//   const slots = [];
//   let current = new Date(start);
//   console.log("current", current);
//   console.log("enddddd", end);
//   let count = 0;
//   let id = 1;
//   let lunchDone = false;

//   while (count < totalPeriods && current < end) {
//     if (
//       lunch.isEnabled &&
//       !lunchDone &&
//       lunchStart &&
//       lunchStart >= current &&
//       lunchStart < new Date(current.getTime() + periodDuration * 60000)
//     ) {
//       const ls = new Date(lunchStart);
//       console.log("lunchstart", lunchStart);
//       console.log("ls", ls);

//       const le = new Date(lunchStart.getTime() + lunchDuration * 60000);
//       console.log("le", le);
//       slots.push({
//         id: `L${id++}`,
//         period: "Lunch Break",
//         startTime: fmt(ls),
//         endTime: fmt(le),
//         isBreak: true,
//       });
//       lunchDone = true;
//       current = new Date(le);
//       continue;
//     }

//     const pStart = new Date(current);
//     const pEnd = new Date(pStart.getTime() + periodDuration * 60000);
//     slots.push({
//       id: id++,
//       period: `${count + 1}`,
//       startTime: fmt(pStart),
//       endTime: fmt(pEnd),
//       isBreak: false,
//       timeSlotId: count + 1,
//     });
//     count++;
//     current = new Date(pEnd.getTime() + breakDuration * 60000);
//   }

//   return slots;
// }
// export function generateTimeSlotsFromSettings(settings) {
//   console.log("settings", settings);
//   if (!settings?.schoolTiming || !settings?.periods) return [];

//   const { schoolTiming, periods } = settings;

//   const totalPeriods = Number(periods.totalPeriods);
//   const periodDuration = Number(periods.periodDuration);
//   const breakDuration = Number(periods.breakDuration || 0);

//   const lunch = periods.lunchBreak || { isEnabled: false };

//   // -------------------------
//   // Helpers
//   // -------------------------
//   const parseHM = (hm) => {
//     const [h, m] = hm.split(":").map(Number);
//     return new Date(1970, 0, 1, h, m, 0, 0);
//   };

//   // 🔒 FORCE 12-HOUR FORMAT (NO 24H LEAK EVER)
//   const fmt = (date) => {
//     let h = date.getHours();
//     const m = String(date.getMinutes()).padStart(2, "0");
//     const ampm = h >= 12 ? "PM" : "AM";

//     h = h % 12;
//     h = h === 0 ? 12 : h;

//     return `${h}:${m} ${ampm}`;
//   };

//   // -------------------------
//   // Base Times
//   // -------------------------
//   const schoolStart = parseHM(schoolTiming.startTime);
//   console.log("schoolstart", schoolStart)
//   const schoolEnd = parseHM(schoolTiming.endTime);

//   const lunchStart =
//     lunch.isEnabled && lunch.time ? parseHM(lunch.time) : null;

//   const lunchEnd =
//     lunch.isEnabled && lunch.time && lunch.duration
//       ? new Date(lunchStart.getTime() + lunch.duration * 60000)
//       : null;

//   // -------------------------
//   // Slot Generation
//   // -------------------------
//   const slots = [];
//   let current = new Date(schoolStart);
//   let periodCount = 0;
//   let lunchInserted = false;
//   let id = 1;

//   while (periodCount < totalPeriods && current < schoolEnd) {
//     // 🍱 Insert lunch EXACTLY at lunch time
//     if (
//       lunch.isEnabled &&
//       lunchStart &&
//       lunchEnd &&
//       !lunchInserted &&
//       current.getTime() === lunchStart.getTime()
//     ) {
//       slots.push({
//         id: `L${id++}`,
//         period: "Lunch Break",
//         startTime: fmt(lunchStart),
//         endTime: fmt(lunchEnd),
//         isBreak: true,
//       });

//       current = new Date(lunchEnd);
//       lunchInserted = true;
//       continue;
//     }

//     // 📘 Period slot
//     const pStart = new Date(current);
//     const pEnd = new Date(pStart.getTime() + periodDuration * 60000);

//     slots.push({
//       id: id++,
//       period: periodCount + 1,
//       startTime: fmt(pStart),
//       endTime: fmt(pEnd),
//       isBreak: false,
//       timeSlotId: periodCount + 1,
//     });

//     periodCount++;
//     current = new Date(pEnd);

//     // ❌ NO break:
//     // - after last period
//     // - before lunch
//     if (
//       periodCount === totalPeriods ||
//       (lunch.isEnabled &&
//         lunchStart &&
//         current.getTime() === lunchStart.getTime())
//     ) {
//       continue;
//     }

//     // ☕ Normal break
//     current = new Date(current.getTime() + breakDuration * 60000);
//   }

//   return slots;
// }




// 🔹 Main Component
export default function TimetableManager() {
  const queryClient = useQueryClient();
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSlot, setModalSlot] = useState(null);
  const [id, setId] = useState();
  console.log("modalslot", modalSlot);
  const [localAssignments, setLocalAssignments] = useState({});

  // 🔹 Queries
  const settingsQuery = useQuery({
    queryKey: ["settings"],
    queryFn: () => apiGet(apiPath.getSettings || "/api/admins/settings"),
  });
  const classesQuery = useQuery({
    queryKey: ["classessss"],
    queryFn: () => apiGet(apiPath.activeClasses || "/api/admins/classes"),
  });
  const teachersQuery = useQuery({
    queryKey: ["teachers"],
    queryFn: () => apiGet(apiPath.getallTeachers || "/api/admins/teachers"),
  });
  const subjectsQuery = useQuery({
    queryKey: ["subjectsss"],
    queryFn: () => apiGet(apiPath.getallSubjectsWithoutPagination || "/api/admins/subjects"),
  });
  const assignmentsQuery = useQuery({
    queryKey: ["assignments", selectedClassId],
    queryFn: () =>
      apiGet(
        `${apiPath.getAssignments || "/api/admins/teachers/assign-teacher"}/${selectedClassId}`
      ),
    enabled: !!selectedClassId,
  });


  const resetMutation = useMutation({
    mutationFn: async (classId) => {
      return apiDelete(
        `${apiPath.resetAssign || "/api/admins/teachers/assign-teacher"}/${classId}`
      );
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Assignments reset successfully!");
      // Invalidate assignment data to refresh UI
      queryClient.invalidateQueries(["assignments", selectedClassId]);
      setLocalAssignments({});
    },
    onError: (err) => {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to reset assignments");
    },
  });
  // 🔹 Data extraction
  const classes = classesQuery.data?.results?.docs || classesQuery.data || [];
  const teachers = teachersQuery.data?.results?.docs || teachersQuery.data || [];
  const subjects = subjectsQuery.data?.results?.docs || subjectsQuery.data || [];
  // console.log("subjects",subjects);
  const allAssignments =
    assignmentsQuery.data?.timetable?.timetable || assignmentsQuery.data || [];
  console.log("allassignments", allAssignments);
  // const filterdTeachers = teachers.filter((teacher)=> teacher?.classes?.includes(selectedClassId));
  const filteredTeachers = Array.isArray(teachers)
    ? teachers.filter((teacher) =>
      Array.isArray(teacher.classes) &&
      teacher.classes.includes(String(selectedClassId))
    )
    : [];


  // console.log("teachers",teachers);
  // console.log("filterdteachers",filteredTeachers);
  // 🔹 Default class
  useEffect(() => {
    if (!selectedClassId && classes.length) {
      setSelectedClassId(classes[0]._id || classes[0].id);
    }
  }, [classes, selectedClassId]);
  function handleReset() {
    resetMutation.mutate(selectedClassId);
  }

  // 🔹 Reset when class changes
  useEffect(() => {
    if (!selectedClassId) return;
    queryClient.invalidateQueries(["assignments", selectedClassId]);
    setLocalAssignments({});
  }, [selectedClassId]);

  // 🔹 Flatten assignments
  const flattenedAssignments = useMemo(() => {
    if (!allAssignments) return [];
    if (Array.isArray(allAssignments)) return allAssignments;
    return Object.values(allAssignments).flat();
  }, [allAssignments]);
  console.log("flattenedassignements", flattenedAssignments);
  const filteredAssignments = useMemo(() => {
    return flattenedAssignments.filter(
      (a) =>
        // // console.log("aaaa",a);
        a.classId === selectedClassId ||
        a.classId?._id === selectedClassId ||
        a.class?._id === selectedClassId
    );
  }, [flattenedAssignments, selectedClassId]);
  // console.log("filteredassiignmennts",filteredAssignments);

  // 🔹 Time slots
  const settingsData = settingsQuery.data?.results;
  console.log("settingdata", settingsData);
  // console.log("generatetimeslots", generateTimeSlotsFromSettings(settingsData))
  // const timeSlots = useMemo(
  //   () => (settingsData ? generateTimeSlotsFromSettings(settingsData) : []),
  //   [settingsData]
  // );

  useEffect(() => {
    if (!settingsData) return;
    setId(settingsData._id);

  }, [settingsData])
  const { data: timeslots } = useQuery(
    {
      queryKey: ["timeslotdata"],
      queryFn: async () => apiGet(`${apiPath.generateTimeSlots}/${id}`),
      enabled: !!id,
    }
  )
  // console.log("timeslots",timeslots)
  const timeSlots = timeslots?.results?.periodTimings;


  // 🔹 Load existing assignments
  // useEffect(() => {
  //   if (!filteredAssignments?.length || !timeSlots?.length) return;

  //   setLocalAssignments(() => {
  //     const map = {};
  //     for (const a of filteredAssignments) {
  //       const day = a.day || "Monday";
  //       const slot = timeSlots.find((s) => s.period == a.period);
  //       if (!slot) continue;

  //       const key = `${day}_${slot.startTime}_${slot.endTime}`;
  //       map[key] = {
  //         ...a,
  //         startTime: slot.startTime,
  //         endTime: slot.endTime,
  //         saved: true,
  //       };
  //     }
  //     return map;
  //   });
  // }, [filteredAssignments, timeSlots]);

  // 🔹 Load existing assignments correctly
  // 🔹 Load backend timetable and map to time slots
  const updateAssignmentMutation = useMutation({
    mutationFn: ({ id, payload }) =>
      apiPut(
        `${apiPath.updateAssignment || "/api/admins/teachers/assign-teacher"}/${id}`,
        payload
      ),
    onSuccess: (res) => {
      toast.success(res?.message || "Assignment updated successfully");
      queryClient.invalidateQueries(["assignments", selectedClassId]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Update failed");
    },
  });
  const resetSingleAssignmentMutation = useMutation({
    mutationFn: (id) =>
      apiDelete(
        `${apiPath.resetSingleAssignment || "/api/admins/teachers/assign-teacher"}/${id}`
      ),
    onSuccess: (res) => {
      toast.success(res?.message);
      queryClient.invalidateQueries(["assignments", selectedClassId]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to reset slot");
    },
  });


  useEffect(() => {
    if (!assignmentsQuery.data?.timetable || !timeSlots?.length) return;

    const map = {};
    const timetable = assignmentsQuery.data.timetable; // backend timetable object
    console.log("timetable", timetable);

    for (const [day, dayAssignments] of Object.entries(timetable)) {
      // // console.log("dayassigent",dayAssignments);
      if (!Array.isArray(dayAssignments)) continue; // safety
      dayAssignments.forEach((a) => {
        console.log("aaa", a);
        // Find matching time slot by period
        const slot = timeSlots.find((s) => Number(s.period) === Number(a.period));
        if (!slot) return;

        const key = `${day}_${slot.startTime}_${slot.endTime}`;
        map[key] = {
          _id: a._id,
          classId: selectedClassId,
          day,
          period: a.period,
          teacherId: a.teacherId || null,
          subjectId: a.subjectId || null,
          teacherName: a.teacher || "", // from backend
          subjectName: a.subject || "", // from backend
          startTime: slot.startTime,
          endTime: slot.endTime,
          saved: true, // mark as already saved
        };
      });
    }

    setLocalAssignments(map); // update frontend state


  }, [assignmentsQuery.data, timeSlots, selectedClassId]);

  const removeLocalAssignment = (day, slot) => {
    const key = `${day}_${slot.startTime}_${slot.endTime}`;

    setLocalAssignments((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };


  // 🔹 Helpers
  const getAssignmentFor = (day, slot) => {
    const key = `${day}_${slot.startTime}_${slot.endTime}`;
    return localAssignments[key] || null;
  };

  const handleLocalAssign = ({ day, slot, teacherId, subjectId }) => {
    // console.log("subjecgid",subjectId)
    const teacher =
      teachers.find((t) => t._id === teacherId || t.id === teacherId) || {};
    // console.log("subjectsssss",subjects);

    const subject =
      subjects.find((s) => s._id === subjectId || s.id === subjectId) || {};
    // console.log("subjectttttt",subject);
    // console.log("teacher",teacher)


    const key = `${day}_${slot.startTime}_${slot.endTime}`;
    const newItem = {
      classId: selectedClassId,
      teacherId,
      teacherName: teacher.name || teacher.fullName || "",
      subjectId: subject._id,
      subjectName: subject.name || subject.title || "",
      period: slot.period,
      day,
      startTime: slot.startTime,
      endTime: slot.endTime,
    };

    setLocalAssignments((prev) => ({ ...prev, [key]: newItem }));
    setModalOpen(false);
  };

  // 🔹 Bulk Save (excluding Lunch Break)
  const bulkSaveMutation = useMutation({
    mutationFn: async (payloads) => {
      // console.log(     "payloadds",payload   )
      return apiPost(
        apiPath.postAssignmentBulk || "/api/admins/teachers/assign-teacher-bulk",
        payloads
      );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["assignments"]);
      setLocalAssignments((prev) => {
        const updated = {};
        for (const [k, v] of Object.entries(prev))
          updated[k] = { ...v, saved: true };
        return updated;
      });
      toast.success(data.message);
    },
    onError: (error) => {
      console.error("❌ Bulk Save Failed:", error);
      toast.error(error.message);
    },
  });
  // console.log("loaclassilgnment",localAssignments);
  const collectUnsavedPayloads = () =>
    Object.values(localAssignments).filter(
      (v) => !v.saved && v.period !== "Lunch Break"
    );

  const handleSaveAll = () => {
    const payloads = collectUnsavedPayloads();
    console.log("payloads", payloads);

    if (!payloads.length) return;
    bulkSaveMutation.mutate(payloads);
  };

  // ✅ Loader condition: wait for all essential queries
  const isLoading =
    settingsQuery.isLoading ||
    classesQuery.isLoading ||
    teachersQuery.isLoading ||
    subjectsQuery.isLoading ||
    (selectedClassId && assignmentsQuery.isLoading);

  // ✅ Show loader while data is loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh] bg-opacity-70 z-[99999]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  // ✅ Error handling
  if (
    settingsQuery.isError ||
    classesQuery.isError ||
    teachersQuery.isError ||
    subjectsQuery.isError
  ) {
    return (
      <Box className="flex flex-col items-center justify-center h-screen text-red-500">
        <Typography variant="h6">⚠️ Failed to load data. Please try again.</Typography>
      </Box>
    );
  }
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // 🔹 Render
  return (

    <Box className="p-8 bg-gradient-to-b from-indigo-50 to-white min-h-screen">

      <Typography variant="h5" className="font-extrabold mb-6 text-black">
        Timetable Management
      </Typography>

      {/* Header Controls */}
      <Paper className="p-6 mb-6 rounded-3xl shadow-lg bg-white">
        <Box className="flex flex-wrap gap-6 items-center">
          <Box>
            <Typography variant="subtitle2" className="text-gray-500">
              Select Class
            </Typography>
            <select
              className="mt-2 border border-indigo-300 rounded-xl px-4 py-2"
              value={selectedClassId || ""}
              onChange={(e) => setSelectedClassId(e.target.value)}
            >
              {classes.map((c) => (
                <option key={c._id || c.id} value={c._id || c.id}>
                  {c.name} Section {c.section}
                </option>
              ))}
            </select>
          </Box>

          <Box className="ml-auto flex items-center gap-3">
            <Button
              variant="outlined"
              className="border-indigo-400 text-indigo-600"
              onClick={() => {
                setLocalAssignments({});
                handleReset()
              }}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveAll}
              disabled={collectUnsavedPayloads().length === 0}
              className="bg-indigo-600 text-white rounded-xl"
            >
              {bulkSaveMutation.isMutating
                ? "Saving..."
                : `Save Details (${collectUnsavedPayloads().length})`}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Timetable Grid */}
      <Paper className="p-4 rounded-3xl shadow-xl bg-white overflow-x-auto">
        <Box className="grid grid-cols-[150px_repeat(6,1fr)] gap-2">
          <Box></Box>
          {days.map((day) => (
            <Typography
              key={day}
              className="font-semibold text-center text-indigo-700 p-2 border-b border-gray-300"
            >
              {day}
            </Typography>
          ))}

          {timeSlots?.map((slot) => (
            <React.Fragment key={slot.id}>
              <Box className="font-medium text-gray-700 p-2 text-center bg-indigo-50">
                <div>{slot.period}</div>
                <div className="text-xs text-gray-500">
                  {slot.startTime} - {slot.endTime}
                </div>
              </Box>

              {days.map((day) => {
                const a = getAssignmentFor(day, slot);

                console.log("aaaaa", a);
                const isLunch = slot.isBreak && slot.period === "Lunch Break";

                if (isLunch) {
                  return (
                    <Box
                      key={`${day}_${slot.id}`}
                      className="p-2 rounded-lg h-24 flex flex-col justify-center items-center bg-orange-50 border border-orange-200 text-orange-600 font-medium"
                    >
                      🍱 Lunch Break
                    </Box>
                  );
                }

                return (
                  <Box
                    key={`${day}_${slot.id}`}
                    onClick={() => {
                      setModalSlot({ day, slot, existing: a || null });
                      setModalOpen(true);
                    }}
                    className={`p-2 rounded-lg cursor-pointer h-24 flex flex-col justify-center items-center border ${a
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

      {/* Add Assignment Modal */}

      {modalOpen && modalSlot && (
        <AddAssignmentModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          slotData={modalSlot}
          updateAssignment={updateAssignmentMutation}
          resetAssignment={resetSingleAssignmentMutation}
          day={modalSlot.day}
          teachers={filteredTeachers}
          subjects={subjects}
          assignments={filteredAssignments}
          onLocalReset={removeLocalAssignment}
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
