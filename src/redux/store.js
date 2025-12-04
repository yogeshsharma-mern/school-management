import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../redux/features/auth/authslice";
import uiReducer from "../redux/features/ui/uislic";


export const store = configureStore({
  reducer: {
    auth: authReducer, // add slices here
     ui: uiReducer,
  },
});
