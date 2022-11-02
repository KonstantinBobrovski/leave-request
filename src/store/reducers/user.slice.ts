import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type UserState = {
  isAuthed: boolean;
  name?: string;
  accessToken?: string;
};

//TODO: CHANGE THIS IN PRODUCTION
//just for esaier testing
const initialState = {
  isAuthed: true,
  name: "Some name",
  accessToken: "TOKEN_HERE",
} as UserState;

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<typeof initialState>) => {
      return action.payload;
    },
    logout: (state, action) => {
      return {
        isAuthed: false,
      };
    },
  },
});

export default userSlice.reducer;
