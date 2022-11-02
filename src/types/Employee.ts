import { Workgroup } from "./Workgroups";

type Employee = {
  name: string;
  uuid: string;
  //At the moment api doest have this  three
  workgroup?: Workgroup;

  isEx?: boolean;
};

export default Employee;
