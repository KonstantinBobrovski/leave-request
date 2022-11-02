import Navbar from "../navbar";
import { Provider } from "react-redux";
import store from "../../store";
import LeaveRequestTable from "../leaveRequests";
import "react-datepicker/dist/react-datepicker.css";

export default function App() {
  return (
    <Provider store={store}>
      <Navbar />
      <LeaveRequestTable />
    </Provider>
  );
}
