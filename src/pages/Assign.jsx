// import React, { useMemo, useState, useEffect } from "react";
// import { Box, Button, Typography, Paper } from "@mui/material";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { apiGet, apiPost } from "../api/apiFetch";
// import apiPath from "../api/apiPath";
// import AddAssignmentModal from "../components/AddAssignmentModal";

// // 🔹 Generate Time Slots
// export function generateTimeSlotsFromSettings(settings) {
//   if (!settings?.schoolTiming || !settings?.periods) return [];

//   const { schoolTiming, periods } = settings;
//   console.log("perr",periods)
//   const totalPeriods = Number(periods.totalPeriods || 6);
//   const periodDuration = Number(periods.periodDuration || 60);
//   const breakDuration = Number(periods.breakDuration || 8);
//   const lunch = periods.lunchBreak || { isEnabled: false };

//   const parseHM = (hm) => {
//     const [h, m] = hm.split(":").map(Number);
//     return new Date(1970, 0, 1, h, m);
//   };
//   const fmt = (d) =>
//     d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });

//   const start = parseHM(schoolTiming.startTime || "09:00");
//   const end = parseHM(schoolTiming.endTime || "15:00");
//   const lunchStart = lunch.isEnabled ? parseHM(lunch.time) : null;
//   const lunchDuration = Number(lunch.duration || 0);

//   const slots = [];
//   let current = new Date(start);
//   let count = 0;
//   let id = 1;
//   let lunchDone = false;

//   while (count < totalPeriods && current < end) {
//     if (lunch.isEnabled && !lunchDone && lunchStart && lunchStart <= current) {
//       const ls = new Date(lunchStart);
//       const le = new Date(lunchStart.getTime() + lunchDuration * 60000);
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


// // inside AddAssignmentModal.js




// export default function TimetableManager() {
//   const queryClient = useQueryClient();
//   const [selectedClassId, setSelectedClassId] = useState(null);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [modalSlot, setModalSlot] = useState(null);
//   const [localAssignments, setLocalAssignments] = useState({});
//   console.log("localassignments", localAssignments);

//   // 🔹 Queries
//   const settingsQuery = useQuery({
//     queryKey: ["settings"],
//     queryFn: () => apiGet(apiPath.getSettings || "/api/admins/settings"),
//   });
//   const classesQuery = useQuery({
//     queryKey: ["classes"],
//     queryFn: () => apiGet(apiPath.classes || "/api/admins/classes"),
//   });
//   const teachersQuery = useQuery({
//     queryKey: ["teachers"],
//     queryFn: () => apiGet(apiPath.getTeachers || "/api/admins/teachers"),
//   });
//   const subjectsQuery = useQuery({
//     queryKey: ["subjects"],
//     queryFn: () => apiGet(apiPath.getSubjects || "/api/admins/subjects"),
//   });
//   const assignmentsQuery = useQuery({
//     queryKey: ["assignments", selectedClassId],
//     queryFn: () =>
//       apiGet(
//         `${apiPath.getAssignments || "/api/admins/teachers/assign-teacher"}/${selectedClassId}`
//       ),
//   });


//   // 🔹 Data extraction
//   const classes = classesQuery.data?.results?.docs || classesQuery.data || [];
//   const teachers = teachersQuery.data?.results?.docs || teachersQuery.data || [];
//   const subjects = subjectsQuery.data?.results?.docs || subjectsQuery.data || [];
//   const allAssignments =
//     assignmentsQuery.data?.timetable?.timetable || assignmentsQuery.data || [];

//   // 🔹 Default class
//   console.log("allassignmennts",allAssignments);
//   useEffect(() => {
//     if (!selectedClassId && classes.length) {
//       setSelectedClassId(classes[0]._id || classes[0].id);
//     }
//   }, [classes, selectedClassId]);


//   // Whenever selectedClassId changes, reset localAssignments
//   useEffect(() => {
//     if (!selectedClassId) return;

//     // fetch backend assignments for this class automatically
//     queryClient.invalidateQueries(["assignments", selectedClassId]);

//     setLocalAssignments({}); // clear old assignments so modal uses new data
//   }, [selectedClassId]);

//   // 🔹 Filtered assignments
//   // const filteredAssignments = useMemo(() => {
//   //   return allAssignments.filter(
//   //     (a) =>
//   //       a.classId === selectedClassId ||
//   //       a.classId?._id === selectedClassId ||
//   //       a.class?._id === selectedClassId
//   //   );
//   // }, [allAssignments, selectedClassId]);
// const flattenedAssignments = useMemo(() => {
//   if (!allAssignments) return [];
//   if (Array.isArray(allAssignments)) return allAssignments;
//   return Object.values(allAssignments).flat();
// }, [allAssignments]);

// const filteredAssignments = useMemo(() => {
//   return flattenedAssignments.filter(
//     (a) =>
//       a.classId === selectedClassId ||
//       a.classId?._id === selectedClassId ||
//       a.class?._id === selectedClassId
//   );
// }, [flattenedAssignments, selectedClassId]);

//   // 🔹 Time slots
//   const settingsData = settingsQuery.data?.results;
//   const timeSlots = useMemo(
//     () => (settingsData ? generateTimeSlotsFromSettings(settingsData) : []),
//     [settingsData]
//   );
//   console.log("timeslots",timeSlots);

//   // 🔹 Load existing assignments (merge)
//   useEffect(() => {
//     const assignments = assignmentsQuery.data?.results || [];
//     if (!assignments?.length) return;

//     setLocalAssignments((prev) => {
//       const map = { ...prev };
//       for (const a of assignments) {
//         const day = a.day || "Monday";
//         const slot = timeSlots.find(
//           (s) => a.timeSlotId === s.id || s.startTime === a.startTime
//         );
//         if (!slot) continue;

//         const key = `${day}_${slot.startTime}_${slot.endTime}`;
//         map[key] = {
//           ...a,
//           _remoteId: a._id || a.id,
//           saved: true,
//         };
//       }
//       return map;
//     });
//   }, [assignmentsQuery.data, timeSlots]);

//   // useEffect(() => {
//   //   if (!filteredAssignments?.length) return;
//   //   setLocalAssignments((prev) => {
//   //     const map = { ...prev };
//   //     for (const a of filteredAssignments) {
//   //       const day = a.day || "Monday";
//   //       const slot = timeSlots.find(
//   //         (s) => a.timeSlotId === s.id || s.startTime === a.startTime
//   //       );
//   //       if (!slot) continue;
//   //       const key = `${day}_${slot.startTime}_${slot.endTime}`;
//   //       map[key] = {
//   //         ...a,
//   //         _remoteId: a._id || a.id,
//   //         saved: true,
//   //       };
//   //     }
//   //     return map;
//   //   });
//   // }, [filteredAssignments, timeSlots]);

//   // 🔹 Helpers
 
 
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


//   const getAssignmentFor = (day, slot) => {
//     const key = `${day}_${slot.startTime}_${slot.endTime}`;
//     return localAssignments[key] || null;
//   };

//   const handleLocalAssign = ({ day, slot, teacherId, subjectId }) => {
//     console.log("period",slot);
//     const teacher =
//       teachers.find((t) => t._id === teacherId || t.id === teacherId) || {};
//     const subject =
//       subjects.find((s) => s._id === subjectId || s.id === subjectId) || {};
//     const selectedClass =
//       classes.find((c) => c._id === selectedClassId || c.id === selectedClassId) ||
//       {};

//     const key = `${day}_${slot.startTime}_${slot.endTime}`;
//     const newItem = {
//       classId: selectedClassId,
//       // className: selectedClass.name || selectedClass.className,
//       teacherId,
//       teacherName: teacher.name || teacher.fullName || "",
//       subjectId,
//       // subjectName: subject.name || subject.title || "",
//       period: slot.period,
//       // timeSlotId: slot.id,
//       day,
//       startTime: slot.startTime,
//       endTime: slot.endTime,
//       // saved: false,
//     };

//     setLocalAssignments((prev) => ({ ...prev, [key]: newItem }));
//     setModalOpen(false);
//   };

//   // 🔹 Bulk Save
//   const bulkSaveMutation = useMutation({
//     mutationFn: async (payloads) => {
//       console.log("📤 Sending Payloads to API:", payloads);

//       // 🔹 Directly send the array to your bulk endpoint
//       return apiPost(
//         apiPath.postAssignmentBulk || "/api/admins/teachers/assign-teacher-bulk",
//         payloads
//       );
//     },

//     onSuccess: (res) => {
//       console.log("✅ Bulk Save Success:", res);
//       queryClient.invalidateQueries(["assignments"]);
//       setLocalAssignments((prev) => {
//         const updated = {};
//         for (const [k, v] of Object.entries(prev))
//           updated[k] = { ...v, saved: true };
//         return updated;
//       });
//     },

//     onError: (error) => {
//       console.error("❌ Bulk Save Failed:", error);
//     },
//   });


//   const collectUnsavedPayloads = () =>
//     Object.values(localAssignments).filter((v) => !v.saved);

//   const handleSaveAll = () => {
//     const payloads = collectUnsavedPayloads();
//     console.log("📦 Final Payload:", payloads);
//     if (!payloads.length) return;
//     bulkSaveMutation.mutate(payloads);
//   };

//   const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

//   return (
//     <Box className="p-8 bg-gradient-to-b from-indigo-50 to-white min-h-screen">
//       <Typography variant="h4" className="font-extrabold mb-6 text-indigo-800">
//         Timetable Management
//       </Typography>

//       <Paper className="p-6 mb-6 rounded-3xl shadow-lg bg-white">
//         <Box className="flex flex-wrap gap-6 items-center">
//           <Box>
//             <Typography variant="subtitle2" className="text-gray-500">
//               Select Class
//             </Typography>
//             <select
//               className="mt-2 border border-indigo-300 rounded-xl px-4 py-2"
//               value={selectedClassId || ""}
//               onChange={(e) => setSelectedClassId(e.target.value)}
//             >
//               {classes.map((c) => (
//                 <option key={c._id || c.id} value={c._id || c.id}>
//                   {c.name} Section {c.section}
//                 </option>
//               ))}
//             {/* <option value="1st">1st</option>
//             <option value="2nd">2nd</option>
//             <option value="3rd">3rd</option>
//             <option value="4th">4th</option> */}
//             </select>
//           </Box>

//           <Box className="ml-auto flex items-center gap-3">
//             <Button
//               variant="outlined"
//               className="border-indigo-400 text-indigo-600"
//               onClick={() => setLocalAssignments({})}
//             >
//               Reset
//             </Button>
//             <Button
//               variant="contained"
//               onClick={handleSaveAll}
//               disabled={collectUnsavedPayloads().length === 0}
//               className="bg-indigo-600 text-white rounded-xl"
//             >
//               {bulkSaveMutation.isMutating
//                 ? "Saving..."
//                 : `Save Details (${collectUnsavedPayloads().length})`}
//             </Button>
//           </Box>
//         </Box>
//       </Paper>

//       <Paper className="p-4 rounded-3xl shadow-xl bg-white overflow-x-auto">
//         <Box className="grid grid-cols-[150px_repeat(5,1fr)] gap-2">
//           <Box></Box>
//           {days.map((day) => (
//             <Typography
//               key={day}
//               className="font-semibold text-center text-indigo-700 p-2 border-b border-gray-300"
//             >
//               {day}
//             </Typography>
//           ))}

//           {timeSlots.map((slot) => (
//             <React.Fragment key={slot.id}>
//               <Box className="font-medium text-gray-700 p-2 text-center bg-indigo-50">
//                 <div>{slot.period}</div>
//                 <div className="text-xs text-gray-500">
//                   {slot.startTime} - {slot.endTime}
//                 </div>
//               </Box>

//               {days.map((day) => {
//                 const a = getAssignmentFor(day, slot);
//                 return (
//                   <Box
//                     key={`${day}_${slot.id}`}
//                     onClick={() => {
//                       setModalSlot({ day, slot });
//                       setModalOpen(true);
//                     }}
//                     className={`p-2 rounded-lg cursor-pointer h-24 flex flex-col justify-center items-center border ${a
//                       ? a.saved
//                         ? "bg-green-50 border-green-300"
//                         : "bg-yellow-50 border-yellow-400"
//                       : "bg-white border-dashed border-gray-300 hover:bg-blue-50"
//                       }`}
//                   >
//                     {a ? (
//                       <>
//                         <Typography className="font-medium text-indigo-800 text-sm text-center">
//                           {a.subjectName}
//                         </Typography>
//                         <Typography className="text-xs text-gray-600 text-center">
//                           {a.teacherName}
//                         </Typography>
//                       </>
//                     ) : (
//                       <Typography className="text-gray-400 text-sm text-center">
//                         Click to assign
//                       </Typography>
//                     )}
//                   </Box>
//                 );
//               })}
//             </React.Fragment>
//           ))}
//   <>
//   {/* 8:00 - 9:00 */}


//   {/* 9:00 - 10:00 */}
  

//   {/* इसी pattern को 10–11, 11–12, 12–1 के लिए भी कॉपी कर सकते हो */}
// </>


//         </Box>
//       </Paper>

//       {modalOpen && modalSlot && (
//         <AddAssignmentModal
//           open={modalOpen}
//           onClose={() => setModalOpen(false)}
//           slotData={{
//             slot: modalSlot.slot,
//             existing: getAssignmentFor(modalSlot.day, modalSlot.slot),
//           }}
//           day={modalSlot.day}
//           teachers={teachers}
//           subjects={subjects}
//           assignments={filteredAssignments}
//           createAssignment={{
//             mutateAsync: (payload) =>
//               new Promise((resolve) => {
//                 handleLocalAssign({
//                   ...payload,
//                   day: modalSlot.day,
//                   slot: modalSlot.slot,
//                 });
//                 resolve();
//               }),
//           }}
//           classId={selectedClassId}
//         />
//       )}
//     </Box>
//   );
// }
import React, { useMemo, useState, useEffect } from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiDelete, apiGet, apiPost, apiPut } from "../api/apiFetch";
import apiPath from "../api/apiPath";
import AddAssignmentModal from "../components/AddAssignmentModal";
import toast from "react-hot-toast";

// 🔹 Generate Time Slots
export function generateTimeSlotsFromSettings(settings) {
  if (!settings?.schoolTiming || !settings?.periods) return [];

  const { schoolTiming, periods } = settings;
  const totalPeriods = Number(periods.totalPeriods || 6);
  const periodDuration = Number(periods.periodDuration || 60);
  const breakDuration = Number(periods.breakDuration );
  const lunch = periods.lunchBreak || { isEnabled: false };

  const parseHM = (hm) => {
    const [h, m] = hm.split(":").map(Number);
    return new Date(1970, 0, 1, h, m);
  };
  const fmt = (d) =>
    d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });

  const start = parseHM(schoolTiming.startTime || "09:00");
  const end = parseHM(schoolTiming.endTime || "15:00");
  const lunchStart = lunch.isEnabled ? parseHM(lunch.time) : null;
  const lunchDuration = Number(lunch.duration || 0);

  const slots = [];
  let current = new Date(start);
  let count = 0;
  let id = 1;
  let lunchDone = false;

  while (count < totalPeriods && current < end) {
    if (lunch.isEnabled && !lunchDone && lunchStart && lunchStart <= current) {
      const ls = new Date(lunchStart);
      const le = new Date(lunchStart.getTime() + lunchDuration * 60000);
      slots.push({
        id: `L${id++}`,
        period: "Lunch Break",
        startTime: fmt(ls),
        endTime: fmt(le),
        isBreak: true,
      });
      lunchDone = true;
      current = new Date(le);
      continue;
    }

    const pStart = new Date(current);
    const pEnd = new Date(pStart.getTime() + periodDuration * 60000);
    slots.push({
      id: id++,
      period: `${count + 1}`,
      startTime: fmt(pStart),
      endTime: fmt(pEnd),
      isBreak: false,
      timeSlotId: count + 1,
    });
    count++;
    current = new Date(pEnd.getTime() + breakDuration * 60000);
  }

  return slots;
}

// 🔹 Main Component
export default function TimetableManager() {
  const queryClient = useQueryClient();
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSlot, setModalSlot] = useState(null);
  const [localAssignments, setLocalAssignments] = useState({});

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
  const allAssignments =
    assignmentsQuery.data?.timetable?.timetable || assignmentsQuery.data || [];

  // 🔹 Default class
  useEffect(() => {
    if (!selectedClassId && classes.length) {
      setSelectedClassId(classes[0]._id || classes[0].id);
    }
  }, [classes, selectedClassId]);
  function handleReset(){
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

  const filteredAssignments = useMemo(() => {
    return flattenedAssignments.filter(
      (a) =>
        a.classId === selectedClassId ||
        a.classId?._id === selectedClassId ||
        a.class?._id === selectedClassId
    );
  }, [flattenedAssignments, selectedClassId]);
  console.log("filteredassiignmennts",filteredAssignments);

  // 🔹 Time slots
  const settingsData = settingsQuery.data?.results;
  const timeSlots = useMemo(
    () => (settingsData ? generateTimeSlotsFromSettings(settingsData) : []),
    [settingsData]
  );

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
useEffect(() => {
  if (!assignmentsQuery.data?.timetable || !timeSlots?.length) return;

  const map = {};
  const timetable = assignmentsQuery.data.timetable; // backend timetable object

  for (const [day, dayAssignments] of Object.entries(timetable)) {
    if (!Array.isArray(dayAssignments)) continue; // safety
    dayAssignments.forEach((a) => {
      // Find matching time slot by period
      const slot = timeSlots.find((s) => Number(s.period) === Number(a.period));
      if (!slot) return;

      const key = `${day}_${slot.startTime}_${slot.endTime}`;
      map[key] = {
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




  // 🔹 Helpers
  const getAssignmentFor = (day, slot) => {
    const key = `${day}_${slot.startTime}_${slot.endTime}`;
    return localAssignments[key] || null;
  };

  const handleLocalAssign = ({ day, slot, teacherId, subjectId }) => {
    const teacher =
      teachers.find((t) => t._id === teacherId || t.id === teacherId) || {};
    const subject =
      subjects.find((s) => s._id === subjectId || s.id === subjectId) || {};

    const key = `${day}_${slot.startTime}_${slot.endTime}`;
    const newItem = {
      classId: selectedClassId,
      teacherId,
      teacherName: teacher.name || teacher.fullName || "",
      subjectId,
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

  const collectUnsavedPayloads = () =>
    Object.values(localAssignments).filter(
      (v) => !v.saved && v.period !== "Lunch Break"
    );

  const handleSaveAll = () => {
    const payloads = collectUnsavedPayloads();
    if (!payloads.length) return;
    bulkSaveMutation.mutate(payloads);
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  // 🔹 Render
  return (
    <Box className="p-8 bg-gradient-to-b from-indigo-50 to-white min-h-screen">
      <Typography variant="h4" className="font-extrabold mb-6 text-indigo-800">
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
              <Box className="font-medium text-gray-700 p-2 text-center bg-indigo-50">
                <div>{slot.period}</div>
                <div className="text-xs text-gray-500">
                  {slot.startTime} - {slot.endTime}
                </div>
              </Box>

              {days.map((day) => {
                const a = getAssignmentFor(day, slot);
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
                      setModalSlot({ day, slot });
                      setModalOpen(true);
                    }}
                    className={`p-2 rounded-lg cursor-pointer h-24 flex flex-col justify-center items-center border ${
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
