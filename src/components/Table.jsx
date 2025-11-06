// import React from "react";
// import {
//   useReactTable,
//   getCoreRowModel,
//   getSortedRowModel,
//   getFilteredRowModel,
//   getPaginationRowModel,
//   flexRender,
// } from "@tanstack/react-table";

// export default function ReusableTable({
//   columns,
//   data,
//   paginationState,
//   setPaginationState,
//   sortingState,
//   setSortingState,
//   globalFilter,
//   setGlobalFilter,
//   columnFilters,
//   setColumnFilters,
//   totalCount
// }) {
//  const table = useReactTable({
//   data,
//   columns,
//   pageCount: Math.ceil(totalCount), // total pages
//   manualPagination: true, // backend controls pagination
//   state: {
//     pagination: paginationState,
//     sorting: sortingState,
//     columnFilters: columnFilters,
//     globalFilter: globalFilter,
//   },
//   onPaginationChange: setPaginationState,
//   onSortingChange: setSortingState,
//   onColumnFiltersChange: setColumnFilters,
//   onGlobalFilterChange: setGlobalFilter,
//   getCoreRowModel: getCoreRowModel(),
//   getSortedRowModel: getSortedRowModel(),
//   getFilteredRowModel: getFilteredRowModel(),
//   getPaginationRowModel: getPaginationRowModel(),
// });


//   return (
//     <div>
//       {/* Global Search */}
//       <input
//         value={globalFilter || ""}
//         onChange={(e) => setGlobalFilter(e.target.value)}
//         placeholder="Search..."
//         className="mb-4 p-2 border border-gray-300 rounded"
//       />

//       {/* Table */}
//       <table className="border-collapse border border-gray-300 w-full">
//         <thead>
//           {table.getHeaderGroups().map((headerGroup) => (
//             <tr key={headerGroup.id}>
//               {headerGroup.headers.map((header) => (
//                 <th
//                   key={header.id}
//                   onClick={header.column.getToggleSortingHandler()}
//                   className="border p-2 cursor-pointer"
//                 >
//                   {flexRender(header.column.columnDef.header, header.getContext())}
//                   {{
//                     asc: " 🔼",
//                     desc: " 🔽",
//                   }[header.column.getIsSorted()] ?? null}
//                 </th>
//               ))}
//             </tr>
//           ))}
//         </thead>
//         <tbody>
//           {table.getRowModel().rows.map((row) => (
//             <tr key={row.id} className="hover:bg-gray-100">
//               {row.getVisibleCells().map((cell) => (
//                 <td key={cell.id} className="border p-2">
//                   {flexRender(cell.column.columnDef.cell, cell.getContext())}
//                 </td>
//               ))}
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* Pagination */}
// {/* Pagination */}
// <div className="mt-4 flex justify-end items-center gap-2">
//   <button
//     className="border border-gray-500 p-2 rounded"
//     onClick={() =>
//       setPaginationState((old) => ({
//         ...old,
//         pageIndex: old.pageIndex - 1,
//       }))
//     }
//     disabled={!table.getCanPreviousPage()}
//   >
//     Previous
//   </button>

//   <span>
//     Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
//   </span>

//   <button
//     className="border border-gray-500 p-2 rounded"
//     onClick={() =>
//       setPaginationState((old) => ({
//         ...old,
//         pageIndex: old.pageIndex + 1,
//       }))
//     }
//     disabled={!table.getCanNextPage()}
//   >
//     Next
//   </button>

//   <select
//     value={table.getState().pagination.pageSize}
//     onChange={(e) => table.setPageSize(Number(e.target.value))}
//     className="p-2 border rounded ml-4"
//   >
//     {[5, 10, 20, 50].map((size) => (
//       <option key={size} value={size}>
//         Show {size}
//       </option>
//     ))}
//   </select>
// </div>

//     </div>
//   );
// }















// import React, { useState, useMemo } from "react";
// import ReusableTable from "./ReusableTable";

// export default function App() {
//   const data = useMemo(
//     () => [
//       { id: 1, name: "John", age: 28, role: "Admin" },
//       { id: 2, name: "Jane", age: 32, role: "Teacher" },
//       { id: 3, name: "Bob", age: 24, role: "Student" },
//       { id: 4, name: "Alice", age: 29, role: "Teacher" },
//     ],
//     []
//   );

//   const columns = useMemo(
//     () => [
//       { accessorKey: "id", header: "ID" },
//       { accessorKey: "name", header: "Name" },
//       { accessorKey: "age", header: "Age" },
//       { accessorKey: "role", header: "Role" },
//     ],
//     []
//   );

//   // Controlled states
//   const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
//   const [sorting, setSorting] = useState([]);
//   const [globalFilter, setGlobalFilter] = useState("");
//   const [columnFilters, setColumnFilters] = useState([]);

//   return (
//     <div className="p-4">
//       <ReusableTable
//         columns={columns}
//         data={data}
//         paginationState={pagination}
//         setPaginationState={setPagination}
//         sortingState={sorting}
//         setSortingState={setSorting}
//         globalFilter={globalFilter}
//         setGlobalFilter={setGlobalFilter}
//         columnFilters={columnFilters}
//         setColumnFilters={setColumnFilters}
//       />
//     </div>
//   );
// }

import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import Loader from "./Loading";
import {
  Box,
  CircularProgress,
} from "@mui/material";

export default function ReusableTable({
  columns,
  data,
  paginationState,
  setPaginationState,
  sortingState,
  setSortingState,
  globalFilter,
  setGlobalFilter,
  columnFilters,
  setColumnFilters,
  totalCount,
  tablePlaceholder,
  error,
  isError,
  fetching,
  loading
}) {
  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(totalCount),
    manualPagination: true,
    state: {
      pagination: paginationState,
      sorting: sortingState,
      columnFilters,
      globalFilter,
    },
    onPaginationChange: setPaginationState,
    onSortingChange: setSortingState,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  console.log("error", isError);
  console.log("isfetching,loading", fetching, loading);
  // if (loading)
  //   return (
  //     <Box display="flex" justifyContent="center" mt={8}>
  //       <CircularProgress />
  //     </Box>
  //   );
  return (
    <div className="bg-[var(--color-neutral)] shadow w-full rounded-lg p-4 overflow-x-auto">

      {/* Header with search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
        <input
          value={globalFilter || ""}
          onChange={(e) => {
            const sanitizedValue = e.target.value.replace(/[^A-Za-z0-9\s]/g, "");
            setGlobalFilter(sanitizedValue);
          }}
          placeholder={tablePlaceholder}
          className="p-2 border border-gray-300 rounded w-full md:w-1/3"
        />
      </div>
      <div className="relative">
        {/* Loader Overlay */}
        {(loading || fetching) && (
          <div className="absolute top-18 inset-0 flex items-center justify-center bg-white bg-opacity-70 z-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
          </div>
        )}
      </div>
      {/* Scrollable table */}
      {isError && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-2">
          {error?.message || "Something went wrong while fetching data."}
        </div>
      )}

      <div className="overflow-x-auto">

        <table className="min-w-full border border-gray-200 table-auto">

          <thead className="bg-gray-100 text-gray-700 text-left  top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="px-4 py-2 cursor-pointer text-sm font-semibold border-b border-gray-200 whitespace-nowrap"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: " 🔼",
                      desc: " 🔽",
                    }[header.column.getIsSorted()] ?? null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>


          <tbody>

            {table.getRowModel().rows.map((row) => (

              <tr
                key={row.id}
                className="hover:bg-gray-50 transition duration-200 text-sm"
              >

                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-2 border-b border-gray-200 whitespace-nowrap"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}

          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex flex-col md:flex-row justify-between items-start md:items-center text-sm gap-2">
        <span>
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() =>
              setPaginationState((old) => ({ ...old, pageIndex: old.pageIndex - 1 }))
            }
            disabled={!table.getCanPreviousPage()}
          >
            Prev
          </button>
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() =>
              setPaginationState((old) => ({ ...old, pageIndex: old.pageIndex + 1 }))
            }
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="p-1 border rounded"
          >
            {[10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
