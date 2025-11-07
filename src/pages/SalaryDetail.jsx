// import React, { useState, useMemo } from "react";
// import { useParams } from "react-router-dom";
// import { useQuery } from "@tanstack/react-query";
// import { apiGet } from "../api/apiFetch";
// import {
//   Box,
//   Card,
//   CardContent,
//   Typography,
//   MenuItem,
//   Select,
//   FormControl,
//   InputLabel,
//   CircularProgress,
//   Grid,
//   Chip,
// } from "@mui/material";
// import { motion } from "framer-motion";
// import toast from "react-hot-toast";

// export default function SalaryDetail() {
//   const { id } = useParams(); // teacherId
//   const currentYear = new Date().getFullYear();
//   const [year, setYear] = useState(currentYear);

//   // ✅ Dynamically generate last 6 years (current + previous 5)
//   const yearOptions = useMemo(() => {
//     return Array.from({ length: 6 }, (_, i) => currentYear - i);
//   }, [currentYear]);

//   // ✅ Fetch salary transactions using React Query
//   const { data, isLoading, isFetching, error } = useQuery({
//     queryKey: ["teacherTransactions", id, year],
//     queryFn: () =>
//       apiGet(
//         `/admins/teachersalary/get-transction?teacherId=${id}&year=${year}`
//       ),
//     enabled: !!id,
//   });

//   const transactions = useMemo(() => data?.results?.docs || [], [data]);

//   if (error) {
//     toast.error("Failed to fetch transactions");
//   }

//   return (
//     <Box sx={{ p: 4, minHeight: "100vh", bgcolor: "#f5f6fa" }}>
//       <Typography variant="h5" fontWeight="bold" color="text.primary" mb={3}>
//         Teacher Salary Details
//       </Typography>

//       {/* Year Filter */}
//       <Box mb={4} display="flex" alignItems="center" gap={2}>
//         <Typography variant="subtitle1" color="text.secondary">
//           Filter by Year:
//         </Typography>
//         <FormControl sx={{ minWidth: 120 }} size="small">
//           <InputLabel>Year</InputLabel>
//           <Select
//             value={year}
//             label="Year"
//             onChange={(e) => setYear(e.target.value)}
//           >
//             {yearOptions.map((y) => (
//               <MenuItem key={y} value={y}>
//                 {y}
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl>
//       </Box>

//       {/* Loader */}
//       {(isLoading || isFetching) && (
//         <Box display="flex" justifyContent="center" alignItems="center" mt={5}>
//           <CircularProgress />
//         </Box>
//       )}

//       {/* No data message */}
//       {!isLoading && transactions.length === 0 && (
//         <Typography
//           align="center"
//           color="text.secondary"
//           variant="body1"
//           mt={6}
//         >
//           No transactions found for {year}.
//         </Typography>
//       )}

//       {/* Transactions Grid */}
//       <Grid container spacing={3}>
//         {transactions.map((tx, index) => (
//           <Grid item xs={12} sm={6} md={4} key={tx._id}>
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: index * 0.05 }}
//             >
//               <Card
//                 elevation={3}
//                 sx={{
//                   borderRadius: 3,
//                   "&:hover": { boxShadow: 6, transform: "translateY(-4px)" },
//                   transition: "0.3s ease",
//                 }}
//               >
//                 <CardContent>
//                   <Box display="flex" justifyContent="space-between" mb={1}>
//                     <Typography variant="h6" fontWeight="600">
//                       {tx.description}
//                     </Typography>
//                     <Chip
//                       label={tx.type.toUpperCase()}
//                       color={tx.type === "credit" ? "success" : "error"}
//                       size="small"
//                       variant="outlined"
//                     />
//                   </Box>

//                   <Typography variant="body1" color="text.primary">
//                     <strong>Amount:</strong> ₹{tx.amount?.toLocaleString()}
//                   </Typography>
//                   <Typography variant="body2" color="text.secondary" mt={1}>
//                     <strong>Date:</strong>{" "}
//                     {new Date(tx.createdAt).toLocaleDateString()}
//                   </Typography>
//                   <Typography variant="body2" color="text.secondary" mt={1}>
//                     <strong>Reference ID:</strong> {tx.referenceId}
//                   </Typography>

//                   <Box mt={2} pt={1} borderTop="1px solid #eee">
//                     <Typography variant="caption" color="text.secondary">
//                       Receiver: {tx.receiver?.name} ({tx.receiver?.email})
//                     </Typography>
//                   </Box>
//                 </CardContent>
//               </Card>
//             </motion.div>
//           </Grid>
//         ))}
//       </Grid>
//     </Box>
//   );
// }
import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom"; // ✅ added useNavigate
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../api/apiFetch";
import {
    Box,
    Card,
    CardContent,
    Typography,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    CircularProgress,
    Grid,
    Chip,
    Button, // ✅ added Button from MUI
} from "@mui/material";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function SalaryDetail() {
    const { id } = useParams(); // teacherId
    const navigate = useNavigate(); // ✅ initialize navigate hook
    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState(currentYear);

    // ✅ Dynamically generate last 6 years (current + previous 5)
    const yearOptions = useMemo(() => {
        return Array.from({ length: 6 }, (_, i) => currentYear - i);
    }, [currentYear]);

    // ✅ Fetch salary transactions using React Query
    const { data, isLoading, isFetching, error } = useQuery({
        queryKey: ["teacherTransactions", id, year],
        queryFn: () =>
            apiGet(
                `/admins/teachersalary/get-transction?teacherId=${id}&year=${year}`
            ),
        enabled: !!id,
    });

    const transactions = useMemo(() => data?.results?.docs || [], [data]);

    if (error) {
        toast.error("Failed to fetch transactions");
    }

    return (
        <Box sx={{ p: 4, minHeight: "100vh", bgcolor: "#f5f6fa" }}>
            <button
                onClick={() => navigate(-1)}
                className="mb-4 cursor-pointer px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
                ← Back
            </button>
            {/* Header with Back Button */}
            <Box
                display="md:flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
            >
                <Typography variant="h5" fontWeight="bold" color="text.primary">
                    Teacher Salary Details
                </Typography>

                {/* ✅ Back Button */}
                {/* <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => navigate(-1)} // Go back one step in history
                    sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                    }}
                >
                    ← Back
                </Button> */}
            </Box>

            {/* Year Filter */}
            <Box mb={4} display="flex" alignItems="center" gap={2}>
                <Typography variant="subtitle1" color="text.secondary">
                    Filter by Year:
                </Typography>
                <FormControl sx={{ minWidth: 120 }} size="small">
                    <InputLabel>Year</InputLabel>
                    <Select
                        value={year}
                        label="Year"
                        onChange={(e) => setYear(e.target.value)}
                    >
                        {yearOptions.map((y) => (
                            <MenuItem key={y} value={y}>
                                {y}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* Loader */}
            {(isLoading || isFetching) && (
                <div className="flex justify-center items-center min-h-[40vh] bg-opacity-70 z-50">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
                </div>
            )}

            {/* No data message */}
            {!isLoading && transactions.length === 0 && (
                <Typography
                    align="center"
                    color="text.secondary"
                    variant="body1"
                    mt={6}
                >
                    No transactions found for {year}.
                </Typography>
            )}

            {/* Transactions Grid */}
            <Grid container spacing={3}>
                {transactions.map((tx, index) => (
                    <Grid item xs={12} sm={6} md={4} key={tx._id}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card
                                elevation={3}
                                sx={{
                                    borderRadius: 3,
                                    "&:hover": { boxShadow: 6, transform: "translateY(-4px)" },
                                    transition: "0.3s ease",
                                }}
                            >
                                <CardContent>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography variant="h6" fontWeight="600">
                                            {tx.description}
                                        </Typography>
                                        <Chip
                                            label={tx.type.toUpperCase()}
                                            color={tx.type === "credit" ? "success" : "error"}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Box>

                                    <Typography variant="body1" color="text.primary">
                                        <strong>Amount:</strong> ₹{tx.amount?.toLocaleString()}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" mt={1}>
                                        <strong>Date:</strong>{" "}
                                        {new Date(tx.createdAt).toLocaleDateString()}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" mt={1}>
                                        <strong>Reference ID:</strong> {tx.referenceId}
                                    </Typography>

                                    <Box mt={2} pt={1} borderTop="1px solid #eee">
                                        <Typography variant="caption" color="text.secondary">
                                            Receiver: {tx.receiver?.name} ({tx.receiver?.email})
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
