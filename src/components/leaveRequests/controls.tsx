import styles from "./controls.module.css";

import { FC, memo, useEffect, useState } from "react";
import { StoreType } from "../../store";
import { useAppSelector } from "../../hooks/useAppSelector";
import useAsync from "../../hooks/useAsync";
import LeaveRequestService from "../../services/LeaveRequestService";
import LeaveRequestStatus from "../../utils/types/LeaveRequestStatus";
import Employee from "../../utils/types/Employee";
function getFirstDayOfYear() {
  return new Date(new Date().getFullYear(), 0, 2).toISOString().split("T")[0];
}
function getLastDayOfYear() {
  return new Date(new Date().getFullYear(), 11, 32, 1)
    .toISOString()
    .split("T")[0];
}

//useSelector memomizes the func
const getAccessToken = (state: StoreType) => state.user.accessToken;

export type ControlsValue = {
  selectedStatus: string;
  selectedWorkGroup: string;
  selectedEventType: string;
  selectedEmployee: string;
  includeCancelled: boolean;
  includeEx: boolean;
  includeNote: boolean;
  startDate: string;
  endDate: string;
};

type LeaveRequestTableControlsProps = {
  onQueryChange: (val: ControlsValue) => void;
  employees: Employee[];
};

const LeaveRequestTableControls: FC<LeaveRequestTableControlsProps> = ({
  onQueryChange,
  employees,
}) => {
  const accessToken = useAppSelector(getAccessToken);

  const { result: workgroups, isPending: isLoadingWorkgroups } = useAsync(
    () => LeaveRequestService.GetWorkgroups(accessToken),
    [accessToken]
  );

  const { result: eventTypes, isPending: isLoadingEventTypes } = useAsync(
    () => LeaveRequestService.GetEventTypes(accessToken),
    [accessToken]
  );

  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedWorkGroup, setSelectedWorkGroup] = useState<string>("all");
  const [selectedEventType, setSelectedEventType] = useState<string>("all");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [includeCancelled, setIncludeCanceled] = useState(false);
  const [includeEx, setIncludeEx] = useState(false);
  const [includeNote, setIncludeNote] = useState(false);

  const [startDate, setStartDate] = useState(getFirstDayOfYear);
  const [endDate, setEndDate] = useState(getLastDayOfYear);

  useEffect(() => {
    onQueryChange({
      selectedStatus,
      selectedWorkGroup,
      selectedEventType,
      selectedEmployee,
      includeCancelled,
      includeEx,
      includeNote,
      startDate,
      endDate,
    });
  }, [
    selectedStatus,
    selectedWorkGroup,
    selectedEventType,
    selectedEmployee,
    includeCancelled,
    includeEx,
    includeNote,
    startDate,
    endDate,
  ]);

  return (
    <form className={styles["filter-controls-wrapper"]}>
      <div className={styles["controls-column"]}>
        <label className={styles["filter-control-label"]}>
          <span>Select status</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            {Object.keys(LeaveRequestStatus)
              .filter((el) => isNaN(+el))
              .map((el) => (
                <option key={el} value={el}>
                  {el}
                </option>
              ))}
          </select>
        </label>
        <label className={styles["filter-control-label"]}>
          <span>Workgroup</span>
          {!isLoadingWorkgroups && (
            <select
              id="workgroup-select"
              value={selectedWorkGroup}
              onChange={(e) => setSelectedWorkGroup(e.target.value)}
            >
              <option value={"all"}>All</option>
              {workgroups?.map((el) => (
                <option key={el.uuid} value={el.uuid}>
                  {el.name}
                </option>
              ))}
            </select>
          )}
        </label>
        <label className={styles["filter-control-label"]}>
          <span>Start date</span>

          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate}
            />
          </div>
        </label>
      </div>
      <div className={styles["controls-column"]}>
        <label className={styles["filter-control-label"]}>
          <span>Event type</span>

          {!isLoadingEventTypes && (
            <select
              value={selectedEventType}
              onChange={(e) => setSelectedEventType(e.target.value)}
            >
              <option value={"all"}>All</option>
              {eventTypes?.map((el) => (
                <option key={el.uuid} value={el.uuid}>
                  {el.name}
                </option>
              ))}
            </select>
          )}
        </label>
        <label className={styles["filter-control-label"]}>
          <span>Employee</span>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
          >
            <option value={"all"}>All</option>
            {employees
              .reduce((acc, currEmp) => {
                if (acc.find((emp) => emp.uuid === currEmp.uuid)) return acc;
                return [...acc, currEmp];
              }, [] as Employee[])
              .map((el) => (
                <option key={el.uuid} value={el.uuid}>
                  {el.name}
                </option>
              ))}
          </select>
        </label>

        <label className={styles["filter-control-label"]}>
          <span>End date</span>

          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
            />
          </div>
        </label>
      </div>
      <div className={styles["controls-column"]}>
        <label className={styles["filter-control-label"]}>
          <span>Include cancelled events</span>
          <input
            type="checkbox"
            value={includeCancelled.toString()}
            onChange={(e) => setIncludeCanceled(e.target.checked)}
          />
        </label>
        <label className={styles["filter-control-label"]}>
          <span>Include Ex-employees</span>
          <input
            type="checkbox"
            value={includeEx.toString()}
            onChange={(e) => setIncludeEx(e.target.checked)}
          />
        </label>
        <label className={styles["filter-control-label"]}>
          <span>Explanatory note required</span>
          <input
            type="checkbox"
            value={includeNote.toString()}
            onChange={(e) => setIncludeNote(e.target.checked)}
          />
        </label>
      </div>
    </form>
  );
};

export default memo(LeaveRequestTableControls);
