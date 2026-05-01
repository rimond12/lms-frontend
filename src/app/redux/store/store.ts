
import { configureStore } from "@reduxjs/toolkit";
import baseApi from "../api/baseApi";
// import uploadApi from "../api/uploadApi";


export const makeStore = () => {
  return configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      // [uploadApi.reducerPath]: uploadApi.reducer, 
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware, ), 
  });
};


export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];