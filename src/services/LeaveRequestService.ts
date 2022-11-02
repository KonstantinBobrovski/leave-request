import { API_ROOT } from "../utils/consts";
import PaginatedResponse from "../types/PaginatedResponse";
import { Workgroup } from "../types/Workgroups";
import Event from "../types/Event";
import LeaveRequestStatus from "../types/LeaveRequestStatus";
import EventType from "../types/EventType";
import ReFetcher from "../utils/func/reFetcher";
import Employee from "../types/Employee";
import moment from "moment";

type GetEventsQuery = {
  from: Date;
  to: Date;
  pageNumber?: number;
  eventType?: string;
  workgroup?: string;
  status?: LeaveRequestStatus;
  onlyExplanationNotes?: boolean;
  includeEx?: boolean;
  employee?: string;
};

const serialize = function (obj: any) {
  var str = [];
  for (var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(p + "=" + obj[p]);
    }
  return str.join("&");
};

export default class LeaveRequestService {
  static GetWorkgroups(token: string): Promise<Workgroup[]> {
    return ReFetcher(API_ROOT + "public/v1/workgroups", {
      headers: {
        Authorization: "Bearer " + token,
      },
    }).then((res) => res.json());
  }
  static GetEventTypes(token: string): Promise<EventType[]> {
    return ReFetcher(API_ROOT + "public/v1/event_types", {
      headers: {
        Authorization: "Bearer " + token,
      },
    }).then((res) => res.json());
  }

  static GetEvents(
    token: string,
    query: GetEventsQuery
  ): Promise<PaginatedResponse<Event>> {
    //filter all null and undefined values
    const finalQuery: GetEventsQuery = (
      Object.keys(query) as (keyof GetEventsQuery)[]
    ).reduce((acc, key) => {
      if (query[key]?.toString().toLocaleLowerCase() === "all") return acc;
      if (key === "from")
        return { ...acc, from: moment(query.from).toISOString() };
      else if (key === "to")
        return { ...acc, to: moment(query.to).toISOString() };
      else if (query[key] === undefined || query[key] === null) return acc;
      else return { ...acc, [key]: query[key] };
    }, {} as any);

    return ReFetcher(API_ROOT + "public/v1/events?" + serialize(finalQuery), {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => res.json())
      .then((res) => {
        //TODO: DELETE THIS AFTER API RECEIVE NORMAL FILTERING
        const events = res as PaginatedResponse<Event>;
        const items = (events?.items || []).filter(
          (el) =>
            (!finalQuery.employee ||
              el.employee.uuid === finalQuery.employee) &&
            (!finalQuery.onlyExplanationNotes || el.explanationNote) &&
            (!finalQuery.includeEx || !el.employee.isEx)
        );

        return {
          ...events,
          items,
          itemsCount: items.length,
        };
      });
  }

  static GetEmployees(token: string): Promise<Employee[]> {
    //TODO: ADD API ENDPOINT FOR THIS TEMPORARY DUMMY WAY
    // now just get a big amount of time and retruns workers
    return ReFetcher(
      API_ROOT +
        "public/v1/events?" +
        serialize({
          from: "2010-01-01T00:00:00.000Z",
          to: "2033-01-01T00:00:00.000Z",
        }),
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    )
      .then((res) => res.json())
      .then((res) => {
        //TODO: DELETE THIS AFTER API RECEIVE NORMAL FILTERING
        const events = res as PaginatedResponse<Event>;
        return events.items
          .map((event) => event.employee)
          .reduce((acc, currEmp) => {
            if (acc.find((emp) => emp.uuid === currEmp.uuid)) return acc;
            return [...acc, currEmp];
          }, [] as Employee[]);
      });
  }
}
