
import { useState } from "react";
import { Country, State, City } from "country-state-city";
import apiPath from "../../../api/apiPath";
import { apiGet } from "../../../api/apiFetch";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

const initialSchoolData = {
    schoolName: "",
    status: "inactive",
    tollFree: "",
    address: {
        street: "",
        city: "",
        state: "",
        zip: "",
        country: "",
    },
    contact: {
        phone: "",
        email: "",
        website: "",
    },
    schoolTiming: {
        startTime: "09:00",
        endTime: "15:00",
    },
    periods: {
        totalPeriods: "",
        periodDuration: "",
        breakDuration: "",
        lunchBreak: {
            isEnabled: false,
            time: "",
            duration: "",
        },
    },
    academicSession: {
        startDate: "",
        endDate: "",
        currentSession: "",
    },
    faqs: [],
    banner: [],
    gallery: [],
    socialLinks: [
        {
            platform: "",
            url: "",
            logo: null,
        },
    ],
    schoolLogo: null,
    marks: [
        {
            className: "",
            halfYearlyMarks: "",
            finalYearMarks: "",
        },
    ],
};
export const useSchoolSettings = () => {
    const [schoolData, setSchoolData] = useState(initialSchoolData);
    const classesQuery = useQuery({
        queryKey: ["classes"],
        queryFn: () => apiGet(apiPath.classesByNames || "/api/admins/classes"),
    });
    const formatDateForInput = (isoDate) => {
        if (!isoDate) return "";
        return isoDate.split("T")[0]; // "2025-10-13"
    };
    const handleChange = (path, value) => {
        setSchoolData((prev) => {

            const keys = path.split(".");
            const newData = structuredClone(prev); // ✅ deep copy

            let temp = newData;

            for (let i = 0; i < keys.length - 1; i++) {
                temp = temp[keys[i]];
            }

            // validation
            if (keys[0] === "schoolTiming") {
                const [h] = value.split(":").map(Number);
                if (h < 7 || h > 16) return prev;
            }

            if (path === "periods.lunchBreak.duration" && Number(value) > 60)
                return prev;

            if (
                ["periods.totalPeriods", "periods.periodDuration", "periods.breakDuration"].includes(path) &&
                Number(value) < 0
            )
                return prev;

            temp[keys[keys.length - 1]] = value;

            return newData;
        });
    };
    // const countryOptions = Country.getAllCountries().map(country => ({
    //     value: country.isoCode,
    //     label: country.name,
    // }));

    const countryOptions = useMemo(
        () => Country.getAllCountries().map(country => ({
            value: country.isoCode,
            label: country.name,
        })),
        []
    )
    const stateOptions = schoolData.address.country
        ? State.getStatesOfCountry(schoolData.address.country).map(state => ({
            value: state.isoCode,
            label: state.name,
        }))
        : [];

    const cityOptions =
        schoolData.address.country && schoolData.address.state
            ? City.getCitiesOfState(
                schoolData.address.country,
                schoolData.address.state
            ).map(city => ({
                value: city.name,
                label: city.name,
            }))
            : [];

    // const handleMarksChange = (index, field, value) => {
    //     setSchoolData(prev => ({
    //         ...prev,
    //         marks: prev.marks.map((m, i) =>
    //             i === index ? { ...m, [field]: value } : m
    //         )
    //     }));
    // };

    const handleMarksChange = (index, field, value) => {
        setSchoolData(prev => {
            const newData = structuredClone(prev);
            newData.marks[index][field] = value;
            return newData;
        });
    };
    const handleSocialChange = (index, field, value) => {
        const trimmedValue = field === "url" ? value.trim() : value;

        // 🔹 Update socialLinks safely
        setSchoolData(prev => {
            // console.log("prev",prev);
            const updated = [...prev.socialLinks];
            updated[index] = {
                ...updated[index],
                [field]: trimmedValue,
            };
            return { ...prev, socialLinks: updated };
        });

        // 🔹 URL validation (onChange)
        if (field === "url") {
            const urlPattern =
                /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[^\s]*)?$/;

            setUrlErrors(prev => {
                const errors = [...prev];
                errors[index] =
                    trimmedValue && !urlPattern.test(trimmedValue)
                        ? "Please enter a valid URL"
                        : "";
                return errors;
            });
        }
    };

    const classOptions = Object.values(classesQuery?.data?.results || []).map((cls) => ({
        label: cls,
        value: cls,
    }));
    return {
        schoolData,
        setSchoolData,
        handleChange,
        formatDateForInput,
        countryOptions,
        stateOptions,
        cityOptions,
        handleMarksChange,
        classOptions,
        handleSocialChange
    };
};