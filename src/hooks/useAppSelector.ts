import { TypedUseSelectorHook, useSelector } from "react-redux";
import store, { StoreType } from "../store";

//typed selector for redux
export const useAppSelector: TypedUseSelectorHook<StoreType> = useSelector;
