import { apiGet } from "./apiFetch";
import { apiPost } from "./apiFetch";
import apiPath from "./apiPath";

export const fetchStudents =async()=>
{
    try {
        const res=await apiGet(apiPath.students);
        return res;
    } catch (error) {
        
    }
}


// export const loginAdmin=async()=>
// {
//     try {
//         const res = await apiPost(apiPath.loginadmin);
//         return res;
//     } catch (error) {
        
//     }
// }