import React from "react";
import { Route as ReactRoute, Redirect, useLocation } from "react-router-dom";
import { Layout } from "antd";

import BasicLayout from "./BasicLayout";
import "./layout.less";

const UnAuthLayout: React.FC<{}> = props => {
  const location = useLocation();

  // 开发模式：只在访问登录页面时显示登录界面，不强制重定向
  // if (location.pathname !== "/login") {
  //   return <Redirect to="/login" push={true} />;
  // }

  return (
    <ReactRoute>
      <Layout className="un-auth-layout">
        <BasicLayout />
      </Layout>
    </ReactRoute>
  );
};

export default UnAuthLayout;
