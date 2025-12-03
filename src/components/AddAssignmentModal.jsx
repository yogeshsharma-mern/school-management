// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   TextField,
//   MenuItem,
//   Select,
//   InputLabel,
//   FormControl,
//   Typography,
// } from "@mui/material";
// import toast from "react-hot-toast";

// export default function AddAssignmentModal({
//   open,
//   onClose,
//   slotData,
//   timeslots = [],
//   classId,
//   day,
//   teachers = [],
//   subjects = [],
//   assignments = [],
//   createAssignment,
// }) {
//   const existing = slotData?.existing;
//   const slot = slotData?.slot;

//   const defaultStart = slot?.startTime || "";
//   const defaultEnd = slot?.endTime || "";
  

//   // console.log("assignment",assignments);

//   const [teacherId, setTeacherId] = useState(existing?.teacherId || "");
//   const [subjectId, setSubjectId] = useState(existing?.subjectId || "");
//   const [section, setSection] = useState(existing?.section || "A");
//   const [startTime, setStartTime] = useState(defaultStart);
//   const [endTime, setEndTime] = useState(defaultEnd);
//   const [loading, setLoading] = useState(false);

//   // reset modal on open or data change
//   useEffect(() => {
//     setTeacherId(existing?.teacherId || "");
//     setSubjectId(existing?.subjectId || "");
//     setSection(existing?.section || "A");
//     setStartTime(existing?.startTime || defaultStart);
//     setEndTime(existing?.endTime || defaultEnd);
//   }, [existing, defaultStart, defaultEnd, open]);

//   // 🔹 Compute unavailable teachers for the same day & slot
//   const teacherConflict = useMemo(() => {
//   if (!slot || !assignments?.length) return new Set();
//   const set = new Set();

//   for (const a of assignments) {
//     const sameTime =
//       (a.startTime === slot.startTime && a.endTime === slot.endTime) ||
//       a.timeSlotId === slot.id;

//     if (sameTime && a.teacherId) {
//       set.add(a.teacherId);
//     }
//   }

//   return set;
// }, [assignments, slot]);

//   const unavailableTeachers = useMemo(() => {
//     if (!slot || !assignments) return new Set();
//     const map = new Set();
//     for (const a of assignments) {
//       const sameDay = (a.day || "").toLowerCase() === (day || "").toLowerCase();
//       const sameSlot =
//         (a.startTime && a.startTime === slot.startTime) ||
//         (a.timeSlotId && a.timeSlotId === slot.id);
//       if (sameDay && sameSlot) {
//         if (a.teacherId) map.add(a.teacherId);
//         if (a.teacher) map.add(a.teacher);
//       }
//     }
//     return map;
//   }, [slot, day, assignments]);

//   const filteredTeachers = useMemo(() => {
//   if (!subjectId) return teachers;
//   return teachers.filter((t) =>
//     (t.subjectsHandled || t.subjects || []).some(
//       (s) =>
//         s._id === subjectId ||
//         s.id === subjectId ||
//         s.subjectId === subjectId
//     )
//   );
// }, [teachers, subjectId]);


//   // 🔹 Find selected teacher
//   const selectedTeacher = teachers.find(
//     (t) => t._id === teacherId || t.id === teacherId || t.teacherId === teacherId
//   );

//   // 🔹 Subjects handled by selected teacher
//   const teacherSubjects =
//     selectedTeacher?.subjectsHandled ||
//     selectedTeacher?.subjects ||
//     [];

// const handleSubmit = (e) => {
//   e.preventDefault();
//   if (!teacherId || !subjectId) {
//     toast.error("Please select both teacher and subject");
//     return;
//   }

//   if (
//     unavailableTeachers.has(teacherId) &&
//     (!existing || existing.teacherId !== teacherId)
//   ) {
//     toast.error("Teacher already assigned in this slot");
//     return;
//   }

//   const payload = {
//     teacherId,
//     subjectId,
//     section,
//     startTime,
//     endTime,
//   };

//   // ⚡ Update local state in parent (no API call here)
//   createAssignment.mutateAsync(payload);

//   onClose();
// };

//   return (
//     <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
//       <DialogTitle>
//         {existing ? "Edit Assignment" : "Assign Teacher To Time Slot"}
//       </DialogTitle>

//       <DialogContent>
//         <form id="assign-form" onSubmit={handleSubmit} className="space-y-4 mt-2">
//           {/* 🔹 Teacher + Subject */}
//           <div className="grid grid-cols-2 gap-4">
//             <FormControl fullWidth>
//               <InputLabel id="teacher-label">Teacher</InputLabel>
//          <Select
//   labelId="teacher-label"
//   value={teacherId}
//   label="Teacher"
//   onChange={(e) => {
//     const selectedId = e.target.value;

//     // Check conflict immediately on change
//     if (
//       teacherConflict.has(selectedId) &&
//       (!existing || existing.teacherId !== selectedId)
//     ) {
//       toast.error(
//         "This teacher is already assigned in another class at this time!"
//       );
//       return; // prevent selection
//     }

//     setTeacherId(selectedId);
//     setSubjectId(""); // reset subject when teacher changes
//   }}
//   required
// >
//   {teachers.map((t) => {
//     const id = t._id || t.id || t.teacherId;
//     const name = t.name || t.fullName || t.teacherName;
//     return <MenuItem key={id} value={id}>{name}</MenuItem>;
//   })}
// </Select>

//             </FormControl>

//             <FormControl fullWidth disabled={!selectedTeacher}>
//               <InputLabel id="subject-label">Subject</InputLabel>
//               <Select
//                 labelId="subject-label"
//                 value={subjectId}
//                 label="Subject"
//                 onChange={(e) => setSubjectId(e.target.value)}
//                 required
//               >
//                 {teacherSubjects.length === 0 ? (
//                   <MenuItem disabled>No subjects assigned</MenuItem>
//                 ) : (
//                   teacherSubjects.map((s) => (
//                     <MenuItem key={s._id || s.id} value={s._id || s.id}>
//                       {s.subjectCode
//                         ? `${s.subjectCode} — ${s.subjectName}`
//                         : s.subjectName || s.name}
//                     </MenuItem>
//                   ))
//                 )}
//               </Select>
//             </FormControl>
//           </div>

//           {/* 🔹 Section + Times */}
//           <div className="grid grid-cols-3 gap-4">
//             <TextField
//               label="Section"
//               value={section}
//               onChange={(e) => setSection(e.target.value)}
//             />
//             <TextField
//               label="Start Time"
//               value={startTime}
//               onChange={(e) => setStartTime(e.target.value)}
//             />
//             <TextField
//               label="End Time"
//               value={endTime}
//               onChange={(e) => setEndTime(e.target.value)}
//             />
//           </div>

//           {/* 🔹 Info */}
//           <Typography variant="caption" color="textSecondary">
//             Day: {day} • Slot: {slot?.period || "-"} ({slot?.startTime} -{" "}
//             {slot?.endTime})
//           </Typography>
          
//         </form>
//       </DialogContent>

//       <DialogActions>
//         <Button onClick={onClose} disabled={loading}>
//           Cancel
//         </Button>
//         <Button
//           type="submit"
//           form="assign-form"
//           variant="contained"
//           disabled={loading}
//         >
//           {loading ? "Saving..." : existing ? "Update" : "Create"}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// }
// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   TextField,
//   MenuItem,
//   Select,
//   InputLabel,
//   FormControl,
//   Typography,
// } from "@mui/material";
// import { useMutation } from "@tanstack/react-query";
// import toast from "react-hot-toast";
// import { apiPost } from "../api/apiFetch";
// import apiPath from "../api/apiPath";

// export default function AddAssignmentModal({
//   open,
//   onClose,
//   slotData,
//   classId,
//   day,
//   teachers = [],
//   subjects = [],
//   assignments = [],
//   createAssignment,
// }) {
//   const existing = slotData?.existing;
//   const slot = slotData?.slot;

//   const defaultStart = slot?.startTime || "";
//   const defaultEnd = slot?.endTime || "";

//   const [teacherId, setTeacherId] = useState(existing?.teacherId || "");
//   const [subjectId, setSubjectId] = useState(existing?.subjectId || "");
//   const [section, setSection] = useState(existing?.section || "A");
//   const [startTime, setStartTime] = useState(defaultStart);
//   const [endTime, setEndTime] = useState(defaultEnd);
//   const [loading, setLoading] = useState(false);

//   // 🔹 Reset modal on open or data change
//   useEffect(() => {
//     setTeacherId(existing?.teacherId || "");
//     setSubjectId(existing?.subjectId || "");
//     setSection(existing?.section || "A");
//     setStartTime(existing?.startTime || defaultStart);
//     setEndTime(existing?.endTime || defaultEnd);
//   }, [existing, defaultStart, defaultEnd, open]);

//   // 🔹 Compute unavailable teachers for the same day & slot
//   const teacherConflict = useMemo(() => {
//     if (!slot || !assignments?.length) return new Set();
//     const set = new Set();

//     for (const a of assignments) {
//       const sameTime =
//         (a.startTime === slot.startTime && a.endTime === slot.endTime) ||
//         a.timeSlotId === slot.id;

//       if (sameTime && a.teacherId) {
//         set.add(a.teacherId);
//       }
//     }

//     return set;
//   }, [assignments, slot]);

//   const selectedTeacher = teachers.find(
//     (t) => t._id === teacherId || t.id === teacherId || t.teacherId === teacherId
//   );

//   const teacherSubjects = selectedTeacher?.subjectsHandled || selectedTeacher?.subjects || [];

//   // 🔹 Mutation to verify teacher availability
// const verifyMutation = useMutation({
//   mutationFn: async (payload) => {
//     return apiPost(apiPath.verifyAssignment || "/api/admins/verify-assignment", payload);
//   },
//   onSuccess: (res) => {
//     // console.log("res", res.data); // ✅ Always log response

//     if (res.success) {
//       toast.success("Teacher is available for this slot ✅");

//       // ⚡ Update local state in parent (frontend only)
//       createAssignment.mutateAsync({
//         teacherId,
//         subjectId,
//         section,
//         startTime,
//         endTime,
//       });

//       onClose();
//     } else {
//       toast.error(res.data || "Teacher is already assigned in this slot!");
//     }
//   },
//   onError: (err) => {
//     console.error("API call failed:", err);
// toast.error(err.response.data.message);
//   },
// });


//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!teacherId || !subjectId) {
//       toast.error("Please select both teacher and subject");
//       return;
//     }

//     const payload = {
//       teacherId,
//       subjectId,
//       section,
//       day,
//       startTime,
//       endTime,
//       slotId: slot?.id,
//       classId,
//     };

//     try {
//       setLoading(true);
//       const res = await verifyMutation.mutateAsync(payload);
//       // console.log("res",res);


//     } catch (err) {
//       console.error(err);
//       // toast.error("Failed to verify teacher availability");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
//       <DialogTitle>{existing ? "Edit Assignment" : "Assign Teacher To Time Slot"}</DialogTitle>

//       <DialogContent>
//         <form id="assign-form" onSubmit={handleSubmit} className="space-y-4 mt-2">
//           {/* 🔹 Teacher + Subject */}
//           <div className="grid grid-cols-2 gap-4">
//             <FormControl fullWidth>
//               <InputLabel id="teacher-label">Teacher</InputLabel>
//               <Select
//                 labelId="teacher-label"
//                 value={teacherId}
//                 label="Teacher"
//                 onChange={(e) => {
//                   const selectedId = e.target.value;

//                   if (teacherConflict.has(selectedId) && (!existing || existing.teacherId !== selectedId)) {
//                     toast.error("This teacher is already assigned in another class at this time!");
//                     return;
//                   }

//                   setTeacherId(selectedId);
//                   setSubjectId(""); // reset subject when teacher changes
//                 }}
//                 required
//               >
//                 {teachers.map((t) => {
//                   const id = t._id || t.id || t.teacherId;
//                   const name = t.name || t.fullName || t.teacherName;
//                   return <MenuItem key={id} value={id}>{name}</MenuItem>;
//                 })}
//               </Select>
//             </FormControl>

//             <FormControl fullWidth disabled={!selectedTeacher}>
//               <InputLabel id="subject-label">Subject</InputLabel>
//               <Select
//                 labelId="subject-label"
//                 value={subjectId}
//                 label="Subject"
//                 onChange={(e) => setSubjectId(e.target.value)}
//                 required
//               >
//                 {teacherSubjects.length === 0 ? (
//                   <MenuItem disabled>No subjects assigned</MenuItem>
//                 ) : (
//                   teacherSubjects.map((s) => (
//                     <MenuItem key={s._id || s.id} value={s._id || s.id}>
//                       {s.subjectCode ? `${s.subjectCode} — ${s.subjectName}` : s.subjectName || s.name}
//                     </MenuItem>
//                   ))
//                 )}
//               </Select>
//             </FormControl>
//           </div>

//           {/* 🔹 Section + Times */}
//           <div className="grid grid-cols-3 gap-4">
//             <TextField label="Section" value={section} onChange={(e) => setSection(e.target.value)} />
//             <TextField label="Start Time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
//             <TextField label="End Time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
//           </div>

//           {/* 🔹 Info */}
//           <Typography variant="caption" color="textSecondary">
//             Day: {day} • Slot: {slot?.period || "-"} ({slot?.startTime} - {slot?.endTime})
//           </Typography>
//         </form>
//       </DialogContent>

//       <DialogActions>
//         <Button onClick={onClose} disabled={loading}>Cancel</Button>
//         <Button type="submit" form="assign-form" variant="contained" disabled={loading}>
//           {loading ? "Checking..." : existing ? "Update" : "Create"}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// }

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
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { apiPost } from "../api/apiFetch";
import apiPath from "../api/apiPath";

export default function AddAssignmentModal({
  open,
  onClose,
  slotData,
  classId,
  day,
  teachers = [],
  subjects = [],
  assignments = [],
  createAssignment,
}) {
  const existing = slotData?.existing;
  // console.log("existing",existing);
  const slot = slotData?.slot;

  const defaultStart = slot?.startTime || "";
  const defaultEnd = slot?.endTime || "";

  const [teacherId, setTeacherId] = useState(existing?.teacherId || "");
  const [subjectId, setSubjectId] = useState(existing?.subjectId || "");
  // console.log("subjectid",subjectId);
  const [section, setSection] = useState(existing?.section || "A");
  const [startTime, setStartTime] = useState(defaultStart);
  const [endTime, setEndTime] = useState(defaultEnd);
  const [loading, setLoading] = useState(false);

  // 🔹 Reset modal on open or data change
// 👇 Ensure teacherSubjects load correctly when editing existing assignment
useEffect(() => {
  if (existing?.teacherId && !teacherId) {
    setTeacherId(existing.teacherId);
    setTeacherId("fjdsjf");
  }
  if (existing?.subjectId && !subjectId) {
    setSubjectId(existing.subjectId);
  }
}, [existing, teacherId, subjectId]);


  // 🔹 Compute unavailable teachers for the same day & slot
  const teacherConflict = useMemo(() => {
    if (!slot || !assignments?.length) return new Set();
    const set = new Set();

    for (const a of assignments) {
      const sameTime =
        (a.startTime === slot.startTime && a.endTime === slot.endTime) ||
        a.timeSlotId === slot.id;

      if (sameTime && a.teacherId) {
        set.add(a.teacherId);
      }
    }

    return set;
  }, [assignments, slot]);

  // 🔹 Get currently selected teacher object
  const selectedTeacher = teachers.find(
    (t) => t._id === teacherId || t.id === teacherId || t.teacherId === teacherId
  );

  // 🔹 Subjects for selected teacher
  // const teacherSubjects = selectedTeacher?.subjectsHandled || selectedTeacher?.subjects || [];
  const teacherSubjects = selectedTeacher?.subjectsHandled || selectedTeacher?.subjects || [];

// ✅ Remove duplicates by `subjectId`
const uniqueSubjects = teacherSubjects.filter(
  (subj, index, self) =>
    index === self.findIndex((s) => s.subjectId === subj.subjectId)
);

  // console.log("teachersubject",teacherSubjects);

  // 🔹 Reset subject if teacher changes and current subject is invalid
  useEffect(() => {
    if (!teacherId) return;
    if (!teacherSubjects.some((s) => s.subjectId === subjectId || s.id === subjectId)) {
      setSubjectId("");
    }
  }, [teacherId, teacherSubjects, subjectId]);

  // 🔹 Mutation to verify teacher availability
  const verifyMutation = useMutation({
    mutationFn: async (payload) => {
      return apiPost(apiPath.verifyAssignment || "/api/admins/verify-assignment", payload);
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.data?.message || "Teacher is available ✅");

        // ⚡ Update local assignment state
        createAssignment.mutateAsync({
          teacherId,
          subjectId,
          section,
          startTime,
          endTime,
        });

        onClose();
      } else {
        toast.error(res.data || "Teacher is already assigned in this slot!");
      }
    },
    onError: (err) => {
      console.error("API call failed:", err);
      toast.error(err.response?.data?.message || "Failed to verify teacher availability");
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teacherId || !subjectId) {
      toast.error("Please select both teacher and subject");
      return;
    }

    const payload = {
      teacherId,
      subjectId,
      section,
      day,
      startTime,
      endTime,
      slotId: slot?.id,
      classId,
    };

    try {
      setLoading(true);
      await verifyMutation.mutateAsync(payload);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{existing ? "Edit Assignment" : "Assign Teacher To Time Slot"}</DialogTitle>

      <DialogContent>
        <form id="assign-form" onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* 🔹 Teacher + Subject */}
          <div className="grid grid-cols-2 gap-4">
            <FormControl fullWidth>
              <InputLabel id="teacher-label">Teacher *</InputLabel>
              <Select
                labelId="teacher-label"
                value={teacherId}
                label="Teacher"
                onChange={(e) => {
                  const selectedId = e.target.value;

                  if (teacherConflict.has(selectedId) && (!existing || existing.teacherId !== selectedId)) {
                    toast.error("This teacher is already assigned in another class at this time!");
                    return;
                  }

                  setTeacherId(selectedId);
                  setSubjectId(""); // Reset subject when teacher changes
                }}
                required
              >
                {teachers.map((t) => {
                  const id = t._id || t.id || t.teacherId;
                  const name = t.name || t.fullName || t.teacherName;
                  return <MenuItem key={id} value={id}>{name}</MenuItem>;
                })}
              </Select>
            </FormControl>

            <FormControl fullWidth disabled={!selectedTeacher}>
              <InputLabel id="subject-label">Subject *</InputLabel>
              <Select
                labelId="subject-label"
                value={subjectId}
                label="Subject"
                onChange={(e) => setSubjectId(e.target.value)}
                required
              >
                {uniqueSubjects.length === 0 ? (
                  <MenuItem disabled>No subjects assigned</MenuItem>
                ) : (
                  uniqueSubjects.map((s) => (
                    <MenuItem key={s._id || s.id} value={s.subjectId }>
                      {s.subjectCode ? `${s.subjectCode} — ${s.subjectName}` : s.subjectName || s.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </div>

          {/* 🔹 Section + Times */}
          <div className="grid grid-cols-3 gap-4">
            {/* <TextField label="Section" value={section} onChange={(e) => setSection(e.target.value)} /> */}
            <TextField label="Start Time" disabled value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            <TextField label="End Time" disabled value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>

          {/* 🔹 Info */}
          <Typography variant="caption" color="textSecondary">
            Day: {day} • Slot: {slot?.period || "-"} ({slot?.startTime} - {slot?.endTime})
          </Typography>
        </form>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} sx={{
      // backgroundColor: '#e4e40dff',
      color: '#84782bff',
    }}  disabled={loading}>Cancel</Button>
        <Button type="submit" sx={{
    '--gradient-primary': 'linear-gradient(to right, #facc15, #eab308)',
    background: 'var(--gradient-primary)',
    color: '#333',
  }} form="assign-form" variant="contained" disabled={loading}>
          {loading ? "Checking..." : existing ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
