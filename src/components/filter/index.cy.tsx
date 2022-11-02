import Controls, { ControlsValue } from ".";
import funcFake from "../../cypress";

import LeaveRequestStatus from "../../types/LeaveRequestStatus";
import LeaveRequestService from "../../services/LeaveRequestService";
import moment from "moment";
import { addStyle } from "react-bootstrap/lib/utils/bootstrapUtils";

//Typescript or webpack removes unused packages
funcFake();

const defaultStub = () => {
  cy.stub(LeaveRequestService, "GetEventTypes").callsFake(
    (access): ReturnType<typeof LeaveRequestService.GetEventTypes> => {
      return new Promise((res) => {
        res([
          {
            name: "Holiday",
            uuid: "HolidayId",
          },
          {
            name: "Sick",
            uuid: "SickId",
          },
          {
            name: "SomeEventType",
            uuid: "SomeEventTypeId",
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
            uuid: "HRId",
          },
          {
            name: "Salesmans",
            uuid: "SalesmansId",
          },
          {
            name: "CoffeePeople",
            uuid: "CoffeePeopleId",
          },
          {
            name: "Workgroups 2",
            uuid: "Workgroups 2Id",
          },
        ]);
      });
    }
  );

  cy.stub(LeaveRequestService, "GetEmployees").callsFake(() => {
    return new Promise((res) => {
      res([
        { name: "Sandra", uuid: "SandraId" },
        { name: "Alex", uuid: "AlexId" },
        {
          name: "Georgi",
          uuid: "GeorgiId",
        },
      ]);
    });
  });
};

describe("<Controls>", () => {
  describe("Changes of query upon interact", () => {
    it("changes of select inputs", () => {
      defaultStub();

      let queryStates: ControlsValue[] = [];
      const callback = (vals: ControlsValue) => {
        queryStates.push(vals);
      };

      cy.mount(<Controls onQueryChange={callback} />);

      //correct workgroups
      cy.wait(10);
      cy.get(".cypress-select-workgroup input")
        .type("{downArrow}{enter}", {
          force: true,
        })
        .then(() => {
          cy.wrap(queryStates[1]).its("selectedWorkGroup").should("eq", "HRId");
        });

      //correct LeaveRequestStatus
      cy.get(".cypress-select-status input")

        .type("{downArrow}{downArrow}{downArrow}{enter}", {
          force: true,
        })
        .then(() => {
          //it should remember prev values
          cy.wrap(queryStates[2]).its("selectedWorkGroup").should("eq", "HRId");

          cy.wrap(queryStates[2].selectedStatus.toLowerCase()).should(
            "eq",
            LeaveRequestStatus.NotApproved
          );
        });

      //Event type
      cy.get(".cypress-select-event-type input")
        .type("SomeEventType{enter}", {
          force: true,
        })
        .then(() => {
          //it should remember prev values
          cy.wrap(queryStates[3])
            .its("selectedEventType")
            .should("eq", "SomeEventTypeId");
        });

      //Employee type
      cy.get(".cypress-select-employee input")
        .type("Sandra{enter}", {
          force: true,
        })
        .then(() => {
          cy.wrap(queryStates[4])
            .its("selectedEmployee")
            .should("eq", "SandraId");
        });
    });

    it("date changes", () => {
      defaultStub();

      let queryStates: ControlsValue[] = [];
      const callback = (vals: ControlsValue) => {
        queryStates.push(vals);
      };

      cy.mount(<Controls onQueryChange={callback} />);
      cy.wait(10);

      //Change of just start date
      cy.get(".cypress-picker-start-date")
        .type("{selectAll}{backspace}")
        .type("11/01/2022")
        .type("{enter}")
        .then(() => {
          cy.wrap(queryStates[1]?.startDate?.toISOString()).should(
            "eq",
            moment("11/01/2022", "MM/DD/YYYY")
              .startOf("day")
              .toDate()
              .toISOString()
          );
        });

      //END DATE
      cy.get(".cypress-picker-end-date")
        .type("{selectAll}{backspace}")
        .type("11/10/2022")
        .type("{enter}", { force: true })
        .then(() => {
          //The date picker has strange behaviour with changing upon user input with temp dates  so from here we receive 6 rerenders
          console.log(queryStates);
          cy.wait(100);
          cy.wrap(
            moment(queryStates[6].endDate).endOf("day").toDate().toISOString()
          ).should(
            "eq",
            moment("11/10/2022", "MM/DD/YYYY")
              .endOf("day")
              .toDate()
              .toISOString()
          );
        });

      //Correct change of both start and end date by year filter
      cy.get(".cypress-select-year input")
        //One year back
        .type("{downArrow}{enter}", {
          force: true,
        })
        .then(() => {
          console.log(queryStates);

          cy.wrap(
            moment(queryStates[queryStates.length - 1].startDate).format()
          ).should("eq", moment().startOf("year").subtract(1, "year").format());

          //default is 1 januar and 31 dec
          cy.wrap(queryStates[0]?.startDate?.toISOString()).should(
            "eq",
            moment().startOf("year").toDate().toISOString()
          );
          cy.wrap(queryStates[0]?.endDate?.toISOString()).should(
            "eq",
            moment().add(1, "year").startOf("year").toDate().toISOString()
          );
        });
    });

    it("change of checkboxes", () => {
      defaultStub();
      let queryStates: ControlsValue[] = [];
      const callback = (vals: ControlsValue) => {
        queryStates.push(vals);
      };

      cy.mount(<Controls onQueryChange={callback} />);

      cy.get(".cypress-checkbox-ex")
        .check()
        .then(() => {
          cy.wrap(queryStates[1]).its("includeEx").should("eq", true);
        });

      cy.get(".cypress-checkbox-cancelled")
        .uncheck()
        .then(() => {
          cy.wrap(queryStates[1]).its("includeCancelled").should("eq", false);
        });

      cy.get(".cypress-checkbox-note")
        .check()
        .then(() => {
          cy.wrap(queryStates[2]).its("includeNote").should("eq", true);
        });
    });
  });
});
