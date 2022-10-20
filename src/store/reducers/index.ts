import User from "../../utils/types/user";
import UserReducer from "./user.reducer";

const initState: { user?: User } = {
  user: undefined,
};

export default function rootReducer(
  state = initState,
  action: { type: string; payload: any }
) {
  return {
    user: UserReducer(state.user, action),
  };
}
