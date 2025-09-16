import React, { Context, Dispatch } from "react";
import { ActionProps, GlobalStateProps } from "./reducer";

export interface ContextProps<T = any, S = any> {
  state: T;
  dispatch: S;
}

export const defaultVale: GlobalStateProps = {
  collapsed: false,
  mockEnabled: JSON.parse(localStorage.getItem("mockEnabled") || "true") // 默认开启mock
};

const GlobalContext: Context<ContextProps<
  GlobalStateProps,
  Dispatch<ActionProps>
>> = React.createContext<ContextProps>({
  state: defaultVale,
  dispatch: () => {}
});

export default GlobalContext;
