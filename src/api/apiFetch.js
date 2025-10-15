// // /* global localStorage */
// // import axios from "axios";

// // function getHeaders() {
// //   return { "Content-Type": "application/json" };
// // }
// // const instance = axios.create({
// // baseURL: import.meta.env.VITE_API_BASE_URL,
// //   // timeout: 1000,
// //   headers: getHeaders(),
// // });

// // instance.interceptors.request.use((config) => {
// //   const token = localStorage.getItem("token");

// //   if (!token) {
// //     return config;
// //   }
// //     // document.getElementById("loader").classList.remove("hidden");

// //   config = {
// //     ...config,
// //     headers: { ...config.headers, Authorization: `Bearer ${token}` },
// //   };
// //   return config;
// // });

// // // instance.interceptors.response.use(
// // //   function (response) {
// // //     // Do something with response data
// // //     document.getElementById("loader").classList.add("hidden");
// // //     return response;
// // //   },
// // //   function (error) {
// // //     const { status } = error.response;
// // //     if (status === 401 || status === 403 || status === 409) {
// // //       localStorage.removeItem("token");
// // //       localStorage.removeItem("refresh_token");
// // //       localStorage.removeItem("uniqueId");
// // //       window.location = "/login";
// // //     }
// // //     return Promise.reject(error);
// // //   }
// // // );

// // function apiGet(url, params = {}) {
// //   return instance.get(url, { params });
// // }

// // function apiPost(url, body) {
// //   return instance.post(url, body);
// // }

// // function apiPut(url, body) {
// //   return instance.put(url, body);
// // }

// // function apiDelete(url) {
// //   return instance.delete(url);
// // }

// // export { getHeaders, apiGet, apiPost, apiPut, apiDelete };
// /* global localStorage */
// import axios from "axios";
// import { ClockFading } from "lucide-react";

// function getHeaders() {
//   return { "Content-Type": "application/json" };
// }

// const instance = axios.create({
//   baseURL: import.meta.env.VITE_API_BASE_URL,
//   headers: getHeaders(),
// });

// instance.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");

//   if (!token) {
//     return config;
//   }

//   config = {
//     ...config,
//     headers: { ...config.headers, Authorization: `Bearer ${token}` },
//   };
//   return config;
// });

// // Optional response interceptor
// // instance.interceptors.response.use(
// //   function (response) {
// //     return response;
// //   },
// //   function (error) {
// //     const { status } = error.response;
// //     if (status === 401 || status === 403 || status === 409) {
// //       localStorage.removeItem("token");
// //       localStorage.removeItem("refresh_token");
// //       localStorage.removeItem("uniqueId");
// //       window.location = "/login";
// //     }
// //     return Promise.reject(error);
// //   }
// // );

// function apiGet(url, params = {}) {
//   return instance.get(url, { params }).then((res) => res.data);
// }

// function apiPost(url, body) {
//   const isFormData = body instanceof FormData;
//   console.log("isformdata",isFormData);
//   return instance.post(url, body, {
//     headers: isFormData ? {} : { "Content-Type": "application/json" },
//   }).then((res) => res.data);
// }


// function apiPut(url, body) {
//   return instance.put(url, body).then((res) => res.data);
// }

// function apiDelete(url) {
//   return instance.delete(url).then((res) => res.data);
// }

// export { getHeaders, apiGet, apiPost, apiPut, apiDelete };
/* global localStorage */
import axios from "axios";

function getHeaders() {
  return { "Content-Type": "application/json" };
}

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: getHeaders(),
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (!token) return config;

  return {
    ...config,
    headers: { ...config.headers, Authorization: `Bearer ${token}` },
  };
});

function apiPost(url, body) {
  let headers = {};

  // 👇 Detect if body is FormData
  if (body instanceof FormData) {
    headers["Content-Type"] = "multipart/form-data";
  } else {
    headers["Content-Type"] = "application/json";
  }

  return instance
    .post(url, body, { headers })
    .then((res) => res.data)
    .catch((err) => {
      console.error("API POST error:", err);
      throw err;
    });
}



function apiGet(url, params = {}) {
  return instance.get(url, { params }).then(res => res.data);
}

// function apiPut(url, body) {
//   const isFormData = body instanceof FormData;
//   return instance.put(url, body, {
//     headers:  { "Content-Type": "multipart/form-data" },
//   }).then(res => res.data);
// }
//
function apiPut(url, body) {
  let headers = {};

  // 👇 Detect if body is FormData
  if (body instanceof FormData) {
    headers["Content-Type"] = "multipart/form-data";
  } else {
    headers["Content-Type"] = "application/json";
  }

  return instance
    .put(url, body, { headers })
    .then((res) => res.data)
    .catch((err) => {
      console.error("API PUT error:", err);
      throw err;
    });
}
function apiPatch(url, body) {
  let headers = {};

  // 👇 Detect if body is FormData
  if (body instanceof FormData) {
    headers["Content-Type"] = "multipart/form-data";
  } else {
    headers["Content-Type"] = "application/json";
  }

  return instance
    .patch(url, body, { headers })
    .then((res) => res.data)
    .catch((err) => {
      console.error("API PUT error:", err);
      throw err;
    });
}
//
function apiDelete(url) {
  return instance.delete(url).then(res => res.data);
}

export { getHeaders, apiGet, apiPost, apiPut, apiDelete,apiPatch };
