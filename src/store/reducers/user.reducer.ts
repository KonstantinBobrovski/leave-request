const initState = {
  name: "Some name",
  accessToken: "SOME_TOKEN_HERE",
};
//mock of user reducer
export default function UserReducer(
  state = initState,
  action: { type: string; payload: unknown }
) {
  switch (action.type) {
    default:
      return state;
  }
}
