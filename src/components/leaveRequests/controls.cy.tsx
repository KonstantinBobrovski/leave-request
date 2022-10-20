import Controls, { ControlsValue } from "./controls";
import funcFake from "../../cypress";

import LeaveRequestStatus from "../../utils/types/LeaveRequestStatus";
import LeaveRequestService from "../../services/LeaveRequestService";

funcFake();
describe("<Controls>", () => {
  it("mounts with correct data", async () => {
    const callback = () => {};

    cy.stub(LeaveRequestService, "GetEventTypes").callsFake(
      (access): ReturnType<typeof LeaveRequestService.GetEventTypes> => {
        return new Promise((res) => {
          res([
            {
              name: "Holiday",
              uuid: "1231423123",
            },
            {
              name: "Sick",
              uuid: "123113231121223",
            },
            {
              name: "SomeEventType",
              uuid: "1212312312331523123",
            },
          ]);
        });
      }
    );

    cy.stub(LeaveRequestService, "GetWorkgroups").callsFake(
      (access): ReturnType<typeof LeaveRequestService.GetWorkgroups> => {
        return new Promise((res) => {
          res([
            {
              name: "HR",
              uuid: "1231235123",
            },
            {
              name: "Salesmans",
              uuid: "12312315121223",
            },
            {
              name: "CoffeePeople",
              uuid: "5122112312311233123123",
            },
            {
              name: "Workgroups 2",
              uuid: "51212312311233123123",
            },
          ]);
        });
      }
    );
    const workgroups = await LeaveRequestService.GetWorkgroups("asdas");
    const evTypes = await LeaveRequestService.GetEventTypes("");
    const employess = [
      { name: "Sandra", uuid: "123123" },
      { name: "Alex", uuid: "13123123" },
      {
        name: "Georgi",
        uuid: "a123123",
      },
    ];
    cy.mount(<Controls onQueryChange={callback} employees={employess} />);

    //correct workgroups
    cy.get("form > div:first-child > label:nth-child(2) > select")
      .children()
      .should("have.length", workgroups.length + 1);
    cy.get(
      "form > div:first-child > label:nth-child(2) > select > option:nth:child(2)"
    ).should("have.text", "HR");

    //correct LeaveRequestStatus
    cy.get("form > div:first-child > label:nth-child(1) > select")
      .children()
      .should("have.length", Object.keys(LeaveRequestStatus).length);

    //Event types
    cy.get("form > div:nth-child(2) > label:nth-child(1) > select")
      .children()
      .should("have.length", evTypes.length + 1);

    //People
    cy.get("form > div:nth-child(2) > label:nth-child(2) > select")
      .children()
      .should("have.length", employess.length + 1);
  });

  it("changes query upon interact", () => {
    cy.stub(LeaveRequestService, "GetEventTypes").callsFake(
      (access): ReturnType<typeof LeaveRequestService.GetEventTypes> => {
        return new Promise((res) => {
          res([
            {
              name: "Holiday",
              uuid: "1231423123",
            },
            {
              name: "Sick",
              uuid: "123113231121223",
            },
            {
              name: "SomeEventType",
              uuid: "1212312312331523123",
            },
          ]);
        });
      }
    );

    cy.stub(LeaveRequestService, "GetWorkgroups").callsFake(
      (access): ReturnType<typeof LeaveRequestService.GetWorkgroups> => {
        return new Promise((res) => {
          res([
            {
              name: "HR",
              uuid: "1231235123",
            },
            {
              name: "Salesmans",
              uuid: "12312315121223",
            },
            {
              name: "CoffeePeople",
              uuid: "5122112312311233123123",
            },
            {
              name: "Workgroups 2",
              uuid: "51212312311233123123",
            },
          ]);
        });
      }
    );
    const employess = [
      { name: "Sandra", uuid: "123123" },
      { name: "Alex", uuid: "13123123" },
      {
        name: "Georgi",
        uuid: "a123123",
      },
    ];
    let queryStates: ControlsValue[] = [];
    const callback = (vals: ControlsValue) => {
      queryStates.push(vals);
    };

    cy.mount(<Controls onQueryChange={callback} employees={employess} />);

    //correct workgroups
    cy.wait(10);
    cy.get("form > div:first-child > label:nth-child(2) > select")
      .select(1, {
        force: true,
      })
      .then(() => {
        cy.wrap(queryStates[1])
          .its("selectedWorkGroup")
          .should("eq", "1231235123");
      });

    //correct LeaveRequestStatus
    cy.get("form > div:first-child > label:nth-child(1) > select")
      .select(3, { force: true })
      .then(() => {
        //it should remember prev values
        cy.wrap(queryStates[2])
          .its("selectedWorkGroup")
          .should("eq", "1231235123");
        console.log(queryStates[2]);

        cy.wrap(queryStates[2].selectedStatus.toLowerCase()).should(
          "eq",
          LeaveRequestStatus.NotApproved
        );
      });
  });
});
