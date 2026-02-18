<Modal
  isOpen={updateModalOpen}
  title="Update Academic Year"
  onClose={() => setUpdateModalOpen(false)}
>
  <div className="space-y-4">
    <TextField
      select
      fullWidth
      label="Select Academic Year"
      value={targetAcademicYear}
      onChange={(e) => setTargetAcademicYear(e.target.value)}
    >
      {academicYearOptions.map((year) => (
        <MenuItem key={year} value={year}>
          {year}
        </MenuItem>
      ))}
    </TextField>

    <button
      onClick={handleUpdateAcademicYear}
      className="w-full py-2 rounded-lg bg-[image:var(--gradient-primary)]"
    >
      Confirm Update
    </button>
  </div>
</Modal>
