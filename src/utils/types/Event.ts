import Employee from "./Employee";
import EventType from "./EventType";
import LeaveRequestStatus from "./LeaveRequestStatus";

type Event = {
  uuid: string;
  title: string;
  creationDate: string;
  startDate: string;
  endDate: string;
  duration: number;
  isInHours: boolean;
  details: string;
  status: LeaveRequestStatus;
  employee: Employee;
  eventType: EventType;
  workPattern: {
    uuid: string;
    name: string;
  };
  coverEmployee?: Employee;

  //API doest return this
  explanationNote: unknown;
};

export default Event;
