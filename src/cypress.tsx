import { mount } from "cypress/react18";
import { Provider } from "react-redux";
import LeaveRequestService from "./services/LeaveRequestService";
import store from "./store";

declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
    }
  }
}

Cypress.Commands.add("mount", (component, options = {}) => {
  // Use the default store if one is not provided
  const { reduxStore = store, ...mountOptions } = options;

  const wrapped = <Provider store={reduxStore}>{component}</Provider>;

  return mount(wrapped, mountOptions);
});

export default () => {
  //Ts do not work if there is no exproet
  console.log("Imported");
};
