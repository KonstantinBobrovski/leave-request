export type Workgroup = {
  uuid: string;
  name: string;
  isActive?: boolean;
  leadEmployee?: {
    uuid: string;
    name: string;
  };
  location?: {
    uuid: string;
    name: string;
  };
  workPattern?: {
    uuid: string;
    name: string;
  };
  maxStaffOnLeave?: number;
};
