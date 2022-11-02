import { useCallback, useEffect, useMemo, useState } from "react";
import LeaveRequestTableControls, { ControlsValue } from "../filter";
import LeaveRequestService from "../../services/LeaveRequestService";
import { StoreType } from "../../store";
import { useAppSelector } from "../../hooks/useAppSelector";
import LeaveRequestStatus from "../../types/LeaveRequestStatus";
import useAsync from "../../hooks/useAsync";
import styles from "./table.module.css";
import moment from "moment";
import { Table, Button } from "react-bootstrap";

const getAccessToken = (state: StoreType) => state.user.accessToken;

const LeaveRequestTable = () => {
  const access = useAppSelector(getAccessToken) as string;

  const [fetchQuery, setFetchQuery] = useState<ControlsValue>({
    startDate: moment().startOf("year").format("YYYY-MM-DD"),
    endDate: moment().endOf("year").format("YYYY-MM-DD"),
  } as any);

  const [page, setPage] = useState(1);
  //
  //TOOLKIT MOMENT BOOTSTRAP3
  const {
    isPending,
    result: events,
    error,
  } = useAsync(
    () =>
      LeaveRequestService.GetEvents(access, {
        eventType: fetchQuery?.selectedEventType,
        status: ((fetchQuery?.selectedStatus ?? "") +
          (fetchQuery.includeCancelled &&
          fetchQuery?.selectedStatus &&
          fetchQuery?.selectedStatus?.toLowerCase() !== "all"
            ? `|${LeaveRequestStatus.Cancelled}`
            : "")) as any as LeaveRequestStatus,
        workgroup: fetchQuery?.selectedWorkGroup,
        from: fetchQuery?.startDate,
        to: fetchQuery?.endDate,
        pageNumber: page,
        employee: fetchQuery?.selectedEmployee,
        includeEx: fetchQuery.includeEx,
        onlyExplanationNotes: fetchQuery.includeNote,
      }),
    [fetchQuery, access, page]
  );

  const onQueryChange = useCallback((val: ControlsValue) => {
    setFetchQuery(val);
  }, []);

  return (
    <>
      <LeaveRequestTableControls onQueryChange={onQueryChange} />

      <Table striped bordered>
        <thead>
          <tr>
            <td></td>
            <td>Name</td>
            <td>Details</td>
            <td>Request date</td>
            <td>Start date</td>
            <td>End date</td>
            <td>Duration</td>
            <td>Status</td>
          </tr>
        </thead>
        <tbody>
          {!isPending &&
            events?.items?.map((el) => (
              <tr key={el.uuid}>
                <td>
                  <div>Edit</div>
                  <div>Cancel</div>
                </td>
                <td className={styles["employee-name"]}>{el.employee.name}</td>
                <td>
                  <div className={styles["event-type"]}>
                    <div className={styles["event-type-title"]}>
                      {el.eventType.name}
                    </div>
                    <div className={styles["event-type-details"]}>
                      {el.details}
                    </div>
                  </div>

                  <div className={styles["work-pattern"]}>
                    Using work pattern "{el.workPattern.name}"
                  </div>
                  {el.status == LeaveRequestStatus.Approved &&
                    el?.coverEmployee && (
                      <div>
                        Approved by: {el?.coverEmployee?.name}
                        {
                          // TODO: In the task there is date of approving but the api do not returns it so after migrating to normal api add this field
                        }
                      </div>
                    )}
                </td>
                <td>
                  {moment.utc(el.creationDate).format("dddd DD/MM/YYYY HH:mm")}
                </td>
                <td>{moment.utc(el.startDate).format("dddd DD/MM/YYYY")}</td>
                <td>{moment.utc(el.endDate).format("dddd DD/MM/YYYY")}</td>
                <td>
                  {el?.duration} {el.isInHours ? "hour" : "day"}
                  <small>(s)</small>
                </td>
                <td>{el.status}</td>
              </tr>
            ))}
        </tbody>
      </Table>

      {isPending && <h1>Loading page {page}</h1>}

      {
        //TODO: IN production check the reason of the error
        !isPending && error && (
          <h2 role="alert">An error occurred please try again later</h2>
        )
      }
      {!isPending && events?.itemsCount === 0 && (
        <h2 role="alert">There are no such events</h2>
      )}
      <div className={styles["pagination-buttons-wrapper"]}>
        <Button
          style={{ display: page > 1 ? "initial" : "none" }}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous page
        </Button>
        <Button
          style={{
            display:
              !isPending &&
              events?.itemsCount &&
              events?.itemsCount == events?.pageSize
                ? "initial"
                : "none",
          }}
          onClick={() => setPage((p) => p + 1)}
        >
          Next page
        </Button>
        {page > 1 && events?.itemsCount == events?.pageSize && (
          <h2>There are no more pages</h2>
        )}
      </div>
    </>
  );
};

export default LeaveRequestTable;
