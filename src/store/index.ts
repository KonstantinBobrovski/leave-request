import { combineReducers, configureStore } from "@reduxjs/toolkit";
import userReducer from "./reducers/user.slice";
const rootReducer = combineReducers({
  user: userReducer,
});

const store = configureStore({
  reducer: rootReducer,
});

type StoreType = ReturnType<typeof store.getState>;

export default store;

export type { StoreType };
