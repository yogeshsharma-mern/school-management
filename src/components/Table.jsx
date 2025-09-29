import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";

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
  totalCount
}) {
 const table = useReactTable({
  data,
  columns,
  pageCount: Math.ceil(totalCount), // total pages
  manualPagination: true, // backend controls pagination
  state: {
    pagination: paginationState,
    sorting: sortingState,
    columnFilters: columnFilters,
    globalFilter: globalFilter,
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


  return (
    <div>
      {/* Global Search */}
      <input
        value={globalFilter || ""}
        onChange={(e) => setGlobalFilter(e.target.value)}
        placeholder="Search..."
        className="mb-4 p-2 border border-gray-300 rounded"
      />

      {/* Table */}
      <table className="border-collapse border border-gray-300 w-full">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className="border p-2 cursor-pointer"
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
            <tr key={row.id} className="hover:bg-gray-100">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="border p-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="mt-4 flex items-center gap-2">
      <button className="border border-gray-500 p-2 rounded"
  onClick={() => setPaginationState((old) => ({ ...old, pageIndex: old.pageIndex - 1 }))}
  disabled={!table.getCanPreviousPage()}
>Previous</button>
        <span>
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
       <button className="border border-gray-500 p-2 rounded"
  onClick={() => setPaginationState((old) => ({ ...old, pageIndex: old.pageIndex + 1 }))}
  disabled={!table.getCanNextPage()}
>Next</button>
        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => table.setPageSize(Number(e.target.value))}
          className="p-2 border rounded ml-4"
        >
          {[5, 10, 20, 50].map((size) => (
            <option key={size} value={size}>
              Show {size}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}















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
