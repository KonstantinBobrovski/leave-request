import styles from "./index.module.css";

import {
  ChangeEventHandler,
  FC,
  memo,
  useEffect,
  useMemo,
  useState,
} from "react";
import { StoreType } from "../../store";
import { useAppSelector } from "../../hooks/useAppSelector";

import LeaveRequestService from "../../services/LeaveRequestService";
import LeaveRequestStatus from "../../types/LeaveRequestStatus";
import Employee from "../../types/Employee";
import moment from "moment";
import AsyncSelect from "react-select/async";
import Select, { SingleValue } from "react-select";
import DatePicker from "react-datepicker";
import { Col } from "react-bootstrap";

//useSelector memomizes the func
//In prodcution there should be an parent component that checks if the user is authed so there is access token every time
const getAccessToken = (state: StoreType) => state.user.accessToken;

export type ControlsValue = {
  selectedStatus: string;
  selectedWorkGroup: string;
  selectedEventType: string;
  selectedEmployee: string;
  includeCancelled: boolean;
  includeEx: boolean;
  includeNote: boolean;
  startDate: Date;
  endDate: Date;
};

type FilterProps = {
  onQueryChange: (val: ControlsValue) => void;
};

const filterByName =
  (array: { name: string; uuid: string }[]) => (inputValue: string) => {
    //HERE IS ADDED ALL OPTION
    //Not the best practise but at least there are comment
    return addAllOption(array)
      .filter((obj) =>
        obj.name.toLowerCase().includes(inputValue.toLowerCase())
      )
      .map((obj) => ({
        label: obj.name,
        value: obj.uuid,
      }));
  };

const defaultSelectOnchangeHandler =
  (setter: (str: string) => void) => (e: SingleValue<{ value: string }>) => {
    if (!e?.value) {
      console.error("THE VALUE IS NULL-LIKE" + e?.value);
    } else {
      setter(e.value);
    }
  };

const addAllOption = (array: { name: string; uuid: string }[]) => [
  { name: "All", uuid: "all" },
  ...array,
];

const Filter: FC<FilterProps> = ({ onQueryChange }) => {
  const accessToken = useAppSelector(getAccessToken) as string;

  const workgroupsPromise = useMemo(
    () => LeaveRequestService.GetWorkgroups(accessToken),
    [accessToken]
  );

  const eventTypesPromise = useMemo(
    () => LeaveRequestService.GetEventTypes(accessToken),
    [accessToken]
  );

  const employeesPromise = useMemo(
    () => LeaveRequestService.GetEmployees(accessToken),
    [accessToken]
  );

  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedWorkGroup, setSelectedWorkGroup] = useState<string>("all");
  const [selectedEventType, setSelectedEventType] = useState<string>("all");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [includeCancelled, setIncludeCanceled] = useState(false);
  const [includeEx, setIncludeEx] = useState(false);
  const [includeNote, setIncludeNote] = useState(false);

  const [startDate, setStartDate] = useState(moment().startOf("year").toDate());

  const [endDate, setEndDate] = useState(
    moment().add(1, "year").startOf("year").toDate()
  );

  const onYearSelectChange: (year: number) => void = (year) => {
    setStartDate(moment(year, "YYYY").toDate());
    setEndDate(moment(+year + 1, "YYYY").toDate());
  };

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
      <Col xs={12} md={4}>
        <label className={styles["filter-control-label"]}>
          <span>Select status</span>
          <Select
            className="cypress-select-status"
            onChange={defaultSelectOnchangeHandler(setSelectedStatus)}
            options={Object.keys(LeaveRequestStatus)
              .filter((el) => isNaN(+el))
              .map((el) => ({ label: el, value: el }))}
          />
        </label>
        <label className={styles["filter-control-label"]}>
          <span>Workgroup</span>
          <AsyncSelect
            cacheOptions
            defaultOptions
            className="cypress-select-workgroup"
            onChange={defaultSelectOnchangeHandler(setSelectedWorkGroup)}
            loadOptions={(input) =>
              workgroupsPromise.then((res) => filterByName(res)(input))
            }
          ></AsyncSelect>
        </label>
        <label className={styles["filter-control-label"]}>
          <span>Start date</span>

          <DatePicker
            className="cypress-picker-start-date"
            calendarClassName={styles["date-picker-calendar"]}
            selected={startDate}
            onChange={(date) => {
              if (date) setStartDate(date);
            }}
            startDate={startDate}
            maxDate={endDate}
          />
        </label>
      </Col>
      <Col xs={12} md={4}>
        <label className={styles["filter-control-label"]}>
          <span>Event type</span>

          <AsyncSelect
            className="cypress-select-event-type"
            cacheOptions
            defaultOptions
            onChange={defaultSelectOnchangeHandler(setSelectedEventType)}
            loadOptions={(input) =>
              eventTypesPromise.then((res) => filterByName(res)(input))
            }
          ></AsyncSelect>
        </label>
        <label className={styles["filter-control-label"]}>
          <span>Employee</span>
          <AsyncSelect
            className="cypress-select-employee"
            cacheOptions
            defaultOptions
            onChange={defaultSelectOnchangeHandler(setSelectedEmployee)}
            loadOptions={(input) =>
              employeesPromise.then((res) => filterByName(res)(input))
            }
          ></AsyncSelect>
        </label>

        <label className={styles["filter-control-label"]}>
          <span>End date</span>
          <DatePicker
            className="cypress-picker-end-date"
            calendarClassName={styles["date-picker-calendar"]}
            selected={endDate}
            onChange={(date) => {
              if (date) setEndDate(date);
            }}
            startDate={endDate}
            minDate={startDate}
          />
        </label>
      </Col>
      <Col xs={12} md={4}>
        <label className={styles["filter-control-label"]}>
          <span>Include cancelled events</span>
          <input
            className="cypress-checkbox-cancelled"
            type="checkbox"
            value={includeCancelled.toString()}
            onChange={(e) => setIncludeCanceled(e.target.checked)}
          />
        </label>
        <label className={styles["filter-control-label"]}>
          <span>Include Ex-employees</span>
          <input
            className="cypress-checkbox-ex"
            type="checkbox"
            value={includeEx.toString()}
            onChange={(e) => setIncludeEx(e.target.checked)}
          />
        </label>
        <label className={styles["filter-control-label"]}>
          <span>Explanatory note required</span>
          <input
            className="cypress-checkbox-note"
            type="checkbox"
            value={includeNote.toString()}
            onChange={(e) => setIncludeNote(e.target.checked)}
          />
        </label>
        <label className={styles["filter-control-label"]}>
          <span>Year</span>
          <Select
            className="cypress-select-year"
            onChange={(val) => onYearSelectChange(val?.value as number)}
            options={[
              moment().year(),
              moment().year() - 1,
              moment().year() - 2,
              moment().year() + 1,
              moment().year() + 2,
            ].map((year) => ({
              label: `${year}-${+year + 1}`,
              value: year,
            }))}
          />
        </label>
      </Col>
    </form>
  );
};

export default memo(Filter);
