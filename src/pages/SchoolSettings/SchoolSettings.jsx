import BasicInfo from "./components/BasicInfo";
import ContactInfo from "./components/ContactInfo";
import AddressSection from "./components/AddressSection";
import SchoolTiming from "./components/SchoolTiming";
import PeriodsSection from "./components/PeriodsSection";
import MarksSection from "./components/MarksSection";
import AcademicSession from "./components/AcademicSession";
import SchoolLogo from "./components/SchoolLogo";
import TollFree from "./components/TollFree";
import FAQSection from "./components/FAQSection";
import BannerSection from "./components/BannerSection";
import SocialLinks from "./components/SocialLinks";
import { useSchoolSettings } from "./hooks/useSchoolSettings";


export default function SchoolSettings() {
  const {
    schoolData,
    setSchoolData,
    handleChange,
    formatDateForInput,
    countryOptions,
    cityOptions,
    stateOptions,
    handleMarksChange,
    handleSocialChange
  } = useSchoolSettings();
  return (
    <Box className="p-6">

      <form onSubmit={handleSubmit}>

        <BasicInfo
          schoolData={schoolData}
          handleChange={handleChange}
        />

        <ContactInfo
          schoolData={schoolData}
          handleChange={handleChange}
        />

        <AddressSection
          schoolData={schoolData}
          handleChange={handleChange}
          countryOptions={countryOptions}
          stateOptions={stateOptions}
          cityOptions={cityOptions}
        />

        <SchoolTiming
          schoolData={schoolData}
          handleChange={handleChange}
        />

        <PeriodsSection
          schoolData={schoolData}
          handleChange={handleChange}
        />

        <MarksSection
          schoolData={schoolData}
          setSchoolData={setSchoolData}
          classOptions={classOptions}
          handleMarksChange={handleMarksChange}
        />

        <AcademicSession
          schoolData={schoolData}
          setSchoolData={setSchoolData}
          academicYearOptions={academicYearOptions}
        />

        <SchoolLogo
          schoolData={schoolData}
          handleChange={handleChange}
        />

        <TollFree
          schoolData={schoolData}
          handleChange={handleChange}
        />

        <FAQSection
          schoolData={schoolData}
          handleChange={handleChange}
        />

        <BannerSection
          schoolData={schoolData}
          handleChange={handleChange}
        />

        <SocialLinks
          schoolData={schoolData}
          setSchoolData={setSchoolData}
          handleSocialChange={handleSocialChange}
        />

      </form>

    </Box>
  );
}