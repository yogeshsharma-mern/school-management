import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiPost,apiGet } from '../api/apiFetch';
import apiPath from '../api/apiPath';

export default function ExamSchedule() {
      const { data: classesData, isLoading, isFetching, error, isError } = useQuery({
    queryKey: ["GetClasses"],
    queryFn: () =>
      apiGet(apiPath.classes),
  });
const classes = classesData?.results?.docs || [];
console.log("classes",classes);
  return (
    <div>ExamSchedule</div>
  )
}
