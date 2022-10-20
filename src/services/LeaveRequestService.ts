import { API_ROOT } from "../utils/consts";
import PaginatedResponse from "../utils/types/PaginatedResponse";
import { Workgroup } from "../utils/types/Workgroups";
import Event from "../utils/types/Event";
import LeaveRequestStatus from "../utils/types/LeaveRequestStatus";
import EventType from "../utils/types/EventType";

type GetEventsQuery = {
  from: string;
  to: string;
  pageNumber?: number;
  eventType?: string;
  workgroup?: string;
  status?: LeaveRequestStatus;
  OnlyExplanationNotes?: boolean;
  IncludeEx?: boolean;
};

const serialize = function (obj: any) {
  var str = [];
  for (var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(p + "=" + obj[p]);
    }
  return str.join("&");
};

//API allows up to 3 req per second so we should try
//TODO: add max refetch attemps for production code
function ReFetcher(url: string, options?: RequestInit): Promise<Response> {
  return new Promise(async (res, rej) => {
    try {
      const response = await fetch(url, options);
      if (response.status > 299) throw new Error("Response status is not 2XX");
      res(response);
    } catch (err) {
      setTimeout(async () => {
        const response = await ReFetcher(url, options);
        res(response);
      }, Math.random() * 2000 + 500);
    }
  });
}

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
    console.log(query);

    //filter all null and undefined values
    const finalQuery: GetEventsQuery = (
      Object.keys(query) as (keyof GetEventsQuery)[]
    ).reduce((acc, key) => {
      if (query[key] === "all" || query[key] === "All") return acc;
      if (key === "from")
        return { ...acc, from: query.from + "T00:00:00.000Z" };
      else if (key === "to") return { ...acc, to: query.to + "T00:00:00.000Z" };
      else if (query[key] === undefined || query[key] === null) return acc;
      else return { ...acc, [key]: query[key] };
    }, {} as any);

    return ReFetcher(API_ROOT + "public/v1/events?" + serialize(finalQuery), {
      headers: {
        Authorization: "Bearer " + token,
      },
    }).then((res) => res.json());
  }
}
