import { Reducer } from "react";

export interface GlobalStateProps {
  collapsed: boolean;
  mockEnabled: boolean;
}

export interface ActionProps<T = any> {
  type: string;
  payload?: T;
}
const globalReducer: Reducer<GlobalStateProps, ActionProps> = (
  state: GlobalStateProps,
  action: ActionProps
) => {
  switch (action.type) {
    case "TOGGLE_COLLAPSED":
      return { ...state, collapsed: !state.collapsed };
    case "TOGGLE_MOCK":
      const newMockState = !state.mockEnabled;
      localStorage.setItem("mockEnabled", JSON.stringify(newMockState));
      return { ...state, mockEnabled: newMockState };
    case "SET_MOCK":
      localStorage.setItem("mockEnabled", JSON.stringify(action.payload));
      return { ...state, mockEnabled: action.payload };
    default:
      throw new Error("action type error");
  }
};

export default globalReducer;
