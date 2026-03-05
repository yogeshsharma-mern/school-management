import React from 'react'

export default function MarksSection({schoolData,handleMarksChange,classOptions,setSchoolData}) {
  return (
   <Card sx={{ mb: 4, borderRadius: 4, boxShadow: 4 }}>
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={3}
                >
                  <Typography variant="h6" fontWeight={600}>
                    📊 Class-wise Marks
                  </Typography>

                  <Box display="flex" gap={2}>
                    {/* Always show Add Class */}
                    <Button
                      variant="outlined"
                      onClick={() => setIsModalOpen(true)}
                      sx={{
                        borderRadius: 3,
                        textTransform: "none",
                        fontWeight: 600,
                      }}
                    >
                      + Add Class
                    </Button>

                    {/* Add Class Marks only if classes exist */}
                    {classOptions.length > 0 && (
                      <Button
                        variant="contained"
                        onClick={addMarksRow}
                        sx={{
                          borderRadius: 3,
                          textTransform: "none",
                          backgroundImage: "var(--gradient-primary)",
                          color: "#000",
                          fontWeight: 600,
                        }}
                      >
                        + Add Class Marks
                      </Button>
                    )}
                  </Box>
                </Box>

                {/* ❌ NO CLASS FOUND MESSAGE */}
                {classOptions.length === 0 && (
                  <Typography color="error" mb={2}>
                    No class found. You have to add the class first.
                  </Typography>
                )}

                {/* MARKS LIST */}
                {schoolData.marks.map((item, index) => (
                  <Card key={index} sx={{ mb: 2, p: 2, borderRadius: 3 }}>
                    <Box display="flex" gap={2} flexWrap="wrap">

                      {/* Class Select */}
                      <Box sx={{ minWidth: 180 }}>
                        <Select
                          options={availableOptions}
                          value={classOptions.find(
                            (opt) => opt.value === item.className
                          )}
                          onChange={(option) =>
                            handleMarksChange(index, "className", option?.value || "")
                          }
                          placeholder="Select Class"
                          menuPortalTarget={document.body}
                          styles={{
                            ...customSelectStyles,
                            menuPortal: (base) => ({
                              ...base,
                              zIndex: 99999,   // 🔥 increase this
                            }),
                            menu: (base) => ({
                              ...base,
                              zIndex: 99999,   // 🔥 increase this
                            }),
                          }}
                        />
                      </Box>

                      {/* Half Yearly */}
                      <TextField
                        label="Half Yearly"
                        type="number"
                        value={item.halfYearlyMarks}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, "");
                          if (Number(value) > 100) return;
                          handleMarksChange(index, "halfYearlyMarks", Number(value));
                        }}
                        sx={{ width: 150 }}
                      />

                      {/* Final Year */}
                      <TextField
                        label="Final Year"
                        type="number"
                        value={item.finalYearMarks}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, "");
                          if (Number(value) > 100) return;
                          handleMarksChange(index, "finalYearMarks", Number(value));
                        }}
                        sx={{ width: 150 }}
                      />

                      <Button
                        color="error"
                        variant="outlined"
                        onClick={() =>
                          setSchoolData(prev => ({
                            ...prev,
                            marks: prev.marks.filter((_, i) => i !== index)
                          }))
                        }
                      >
                        ✕
                      </Button>
                    </Box>
                  </Card>
                ))}
              </CardContent>
            </Card>
  )
}
