import Navbar from "../navbar";
import { Provider } from "react-redux";
import store from "../../store";
import LeaveRequestTable from "../leaveRequests";

export default function App() {
  return (
    <Provider store={store}>
      <Navbar />
      <LeaveRequestTable />
    </Provider>
  );
}
