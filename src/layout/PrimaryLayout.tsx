import React, { useReducer } from "react";
import { useLocation } from "react-router-dom";
import PrimaryHeader from "./PrimaryHeader";
import "./layout.less";
import { Layout } from "antd";
import PrimarySider from "./ParimarySider";
import BasicLayout from "./BasicLayout";
import GlobalContext, { defaultVale } from "../store/global/store";
import globalReducer from "../store/global/reducer";
import { getToken } from "../utils/auth";
import UnAuthLayout from "./UnAuthLayout";

const {Footer} = Layout

const PrimaryLayout: React.FC = props => {
  const [state, dispatch] = useReducer(globalReducer, defaultVale);
  const token = getToken();
  const location = useLocation();

  // DEBUG: 跳过登录验证，直接显示主布局
  // 如果访问登录页面，显示未认证布局
  if (location.pathname === "/login") {
    return <UnAuthLayout />;
  }

  return (
    <GlobalContext.Provider value={{ state, dispatch }}>
      <Layout>
        <PrimarySider />
        <Layout className="main-wrap">
          <PrimaryHeader />
          <div className="main-content">
            <BasicLayout />
          </div>
          <Footer style={{ textAlign: 'center' }}>
            POCASSIST ©2021 Created by <a href="https://github.com/jweny">jweny</a>
          </Footer>
        </Layout>
      </Layout>
    </GlobalContext.Provider>
  );
};

export default PrimaryLayout;
