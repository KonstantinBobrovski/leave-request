import { createStore } from "redux";
import rootReducer from "./reducers";
const store = createStore(rootReducer);

type StoreType = ReturnType<typeof store.getState>;

export default store;

export type { StoreType };
