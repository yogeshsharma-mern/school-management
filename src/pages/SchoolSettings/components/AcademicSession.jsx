import React from 'react'

export default function AcademicSession({schoolData}) {
    return (
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    🎓 Academic Session
                </Typography>
                <Grid container spacing={2}>
                    <Select
                        options={academicYearOptions}
                        styles={customSelectStyles}
                        placeholder="Select Academic Year"
                        menuPortalTarget={document.body}     // ✅ CRITICAL FIX
                        menuPosition="fixed"                 // ✅ prevents clipping
                        value={academicYearOptions?.find(opt => {


                            return opt?.value?.academicSession === schoolData?.academicSession?.currentSession
                        })}
                        onChange={(selected) => {
                            const session = selected.value;


                            const formattedStart = formatDateForInput(session.startDate);
                            const formattedEnd = formatDateForInput(session.endDate);

                            setSchoolData(prev => ({
                                ...prev,
                                academicSession: {
                                    startDate: formattedStart,
                                    endDate: formattedEnd,
                                    currentSession: `${session?.academicSession}`, // ✅ FIXED
                                }
                            }));
                        }}
                    />


                </Grid>
            </CardContent>
        </Card>
    )
}
