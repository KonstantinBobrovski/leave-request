import { useCallback, useEffect, useMemo, useState } from "react";
import PaginatedResponse from "../../utils/types/PaginatedResponse";
import LeaveRequestTableControls, { ControlsValue } from "./controls";
import Event from "../../utils/types/Event";
import LeaveRequestService from "../../services/LeaveRequestService";
import { StoreType } from "../../store";
import { useAppSelector } from "../../hooks/useAppSelector";
import LeaveRequestStatus from "../../utils/types/LeaveRequestStatus";
import useAsync from "../../hooks/useAsync";
import styles from "./table.module.css";
import DateToString from "../../utils/func/dateToString";
const getAccessToken = (state: StoreType) => state.user.accessToken;

const LeaveRequestTable = () => {
  const access = useAppSelector(getAccessToken);

  const [fetchQuery, setFetchQuery] = useState<ControlsValue>({
    startDate: new Date(new Date().getFullYear(), 0, 1, 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date(new Date().getFullYear(), 11, 1, 1)
      .toISOString()
      .split("T")[0],
  } as any);

  const [page, setPage] = useState(1);

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
      }),
    [fetchQuery, access, page]
  );

  const filtredEvents = useMemo(() => {
    const items = (events?.items || []).filter(
      //if selectedEmployee is 'all' it will be true and every object passes otherwies it checks id for selected AND if there note checkbox checks it
      (el) =>
        (fetchQuery.selectedEmployee === "all" ||
          el.employee.uuid === fetchQuery.selectedEmployee) &&
        (!fetchQuery.includeNote || el.explanationNote) &&
        (!fetchQuery.includeEx || !el.employee.isEx)
    );
    return {
      ...events,
      items,
      itemsCount: items.length,
    };
  }, [events, fetchQuery]);

  const onQueryChange = useCallback((val: ControlsValue) => {
    setFetchQuery(val);
  }, []);

  return (
    <>
      <LeaveRequestTableControls
        onQueryChange={onQueryChange}
        employees={events?.items?.map((e) => e.employee) ?? []}
      />
      <table className={styles["results-table"]}>
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
            filtredEvents?.items?.map((el) => (
              <tr key={el.uuid}>
                <td>
                  <div>Edit</div>
                  <div>Cancel</div>
                </td>
                <td>{el.employee.name}</td>
                <td>
                  <div className={styles["event-type-name"]}>
                    {el.eventType.name}
                    <div className={styles["event-details"]}>{el.details}</div>
                  </div>

                  <div>{el.workPattern.name} </div>
                  {el.status == LeaveRequestStatus.Approved &&
                    el?.coverEmployee && (
                      <div>
                        Approved by: {el?.coverEmployee?.name} on
                        {DateToString(new Date(Date.parse(el.creationDate)))}
                      </div>
                    )}
                </td>
                <td>{DateToString(new Date(Date.parse(el.creationDate)))}</td>
                <td>{DateToString(new Date(Date.parse(el.startDate)))}</td>
                <td>{DateToString(new Date(Date.parse(el.endDate)))}</td>
                <td>
                  {el?.duration} day<small>(s)</small>
                </td>
                <td>{el.status}</td>
              </tr>
            ))}
        </tbody>
      </table>
      {isPending && <h1>Loading page {page}</h1>}
      {!isPending && filtredEvents?.itemsCount === 0 && (
        <h1>There are no such events</h1>
      )}
      <div className={styles["pagination-buttons-wrapper"]}>
        <button
          style={{ display: page > 1 ? "initial" : "none" }}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous page
        </button>
        <button
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
        </button>
        {page > 1 && events?.itemsCount == events?.pageSize && (
          <h2>There are no more pages</h2>
        )}
      </div>
    </>
  );
};

export default LeaveRequestTable;
