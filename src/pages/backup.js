    {
          activeStep === 3 && (
            <div className="space-y-8">
              {/* === Academic Information === */}
              <div className="bg-gray-50 p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Academic Information
                </h2>

                <div className="grid md:grid-cols-2 gap-6 bg-white p-5 rounded-xl border border-gray-200">
          
                  <TextField
                    select
                    fullWidth
                    name="classId"
                    label="Select Class"
                    value={student.classId}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      setErrors((prev) => ({ ...prev, classId: "" }));

                      const selectedClassObj = classes?.results?.docs?.find(
                        (cls) => cls._id === selectedId
                      );
                      // console.log("selectedclassobj", selectedClassObj);

                      setStudent({ ...student, classId: selectedId });
                      setSelectedClass(selectedClassObj?.name || "");
                    }}
                    error={!!errors.classId}
                    helperText={errors.classId}
                  >
                    <MenuItem value="">Select Class</MenuItem>
                    {classes?.results?.docs?.map((cls) => (
                      <MenuItem key={cls._id} value={cls._id}>
                        {cls.name} {cls.section}
                      </MenuItem>
                    ))}
                  </TextField>

        
                  <TextField
                    select
                    fullWidth
                    name="academicYear"
                    label="Academic Year"
                    value={student.academicYear}
                    onChange={(e) => {
                      setStudent({ ...student, academicYear: e.target.value });
                      setErrors((prev) => ({ ...prev, academicYear: "" }));
                    }}
                    error={!!errors.academicYear}
                    helperText={errors.academicYear}
                  >
                    {Array.from({ length: 1 }).map((_, i) => {
                      const startYear = new Date().getFullYear() + i;
                      const endYear = startYear + 1;
                      const yearString = `${startYear}-${endYear}`;
                      return (
                        <MenuItem key={yearString} value={yearString}>
                          {yearString}
                        </MenuItem>
                      );
                    })}
                  </TextField>
                </div>
              </div>

              {/* === Form Section === */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const tuition = formData.feeHeads.find(
                    (f) => f.type === "Tuition Fee"
                  );
                  const exam = formData.feeHeads.find((f) => f.type === "Exam Fee");

                  if (!tuition?.amount || !exam?.amount) {
                    toast.error("Tuition Fee and Exam Fee are required!");
                    return;
                  }

                  handleSubmit(e);
                }}
                className="space-y-4"
              >
                {selectedClass && (
                  <div className="p-4 bg-white rounded-xl shadow-lg border border-gray-100">
                    <label className="block text-lg font-semibold text-gray-700 mb-4">
                      Fee Heads
                    </label>

                    {/* 🌀 Loader */}
                    {feesLoading ? (
                      <div className="flex items-center gap-2 text-gray-600 text-sm bg-gray-50 p-3 rounded-md border border-gray-200">
                        <svg
                          className="animate-spin h-4 w-4 text-yellow-500"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z"
                          ></path>
                        </svg>
                        Fetching fee structure...
                      </div>
                    ) : !feesData?.success || !feesData?.results?.feeHeads?.length ? (
                      // ❌ Not found
                      <div className="text-red-600 text-sm font-medium bg-red-50 p-3 rounded-md border border-red-200 flex items-center gap-2">
                        ❗ No fee structure found for this class. Please add one first.
                      </div>
                    ) : (
                      // ✅ Show fee heads if found
                      <>
                        {formData.feeHeads.map((head, index) => {
                          const feeTypeOptions = [
                            { value: "Tuition Fee", label: "Tuition Fee" },
                            { value: "Exam Fee", label: "Exam Fee" },
                            { value: "Transport Fee", label: "Transport Fee" },
                            { value: "Miscellaneous", label: "Miscellaneous" },
                          ];

                          const selectedTypes = formData.feeHeads.map((f) => f.type);
                          const availableOptions = feeTypeOptions.map((opt) => ({
                            ...opt,
                            isDisabled:
                              selectedTypes.includes(opt.value) &&
                              opt.value !== head.type,
                          }));

                          const isMandatory =
                            head.type === "Tuition Fee" || head.type === "Exam Fee";

                          return (
                            <div
                              key={index}
                              className="flex flex-wrap items-center gap-4 border border-gray-200 p-4 rounded-lg mb-3  shadow-sm hover:shadow-md transition-shadow transform hover:-translate-y-1"
                            >
                              <div className="w-full sm:w-[260px]">
                                <Select
                                  options={availableOptions}
                                  value={
                                    head.type
                                      ? { value: head.type, label: head.type }
                                      : null
                                  }
                                  placeholder="Select Fee Type"
                                  onChange={(opt) =>
                                    handleFeeHeadChange(index, "type", opt?.value || "")
                                  }
                                  isDisabled={isMandatory}
                                />
                              </div>

                              <input
                                type="number"
                                placeholder="Amount"
                                value={head.amount}
                                onChange={(e) =>
                                  handleFeeHeadChange(
                                    index,
                                    "amount",
                                    Number(e.target.value)
                                  )
                                }
                                className="w-full sm:w-[140px] border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
                              />

                              <label className="flex items-center gap-2 text-sm w-auto">
                                <input
                                  type="checkbox"
                                  checked={head.isOptional}
                                  onChange={(e) =>
                                    handleFeeHeadChange(
                                      index,
                                      "isOptional",
                                      e.target.checked
                                    )
                                  }
                                  disabled={isMandatory}
                                  className="h-4 w-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-300"
                                />
                                Optional
                              </label>

                              {!isMandatory && (
                                <button
                                  type="button"
                                  onClick={() => removeFeeHead(index)}
                                  className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          );
                        })}

                        {formData.feeHeads.length < 4 && (
                          <Button
                            variant="contained"
                            startIcon={<FaPlusCircle />}
                            onClick={addFeeHead}
                            sx={{
                              backgroundColor: "#FACC15", // Tailwind's yellow-400
                              color: "black",
                              fontWeight: 600,
                              borderRadius: "0.5rem",
                              mt: 1.5,
                              boxShadow: 3,
                              "&:hover": {
                                backgroundColor: "#FBBF24", // yellow-500
                              },
                            }}
                            className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded-lg mt-3 shadow-md"
                          >
                            Add Optional Fee
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </form>
            </div>
          )
        }