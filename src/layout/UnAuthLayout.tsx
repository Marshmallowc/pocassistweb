import React from "react";
import { Route as ReactRoute, Redirect, useLocation } from "react-router-dom";
import { Layout } from "antd";

import BasicLayout from "./BasicLayout";
import "./layout.less";

const UnAuthLayout: React.FC<{}> = props => {
  const location = useLocation();

  // 如果不是访问登录页面，重定向到登录页面
  if (location.pathname !== "/login") {
    return <Redirect to="/login" push={true} />;
  }

  return (
    <ReactRoute>
      <Layout className="un-auth-layout">
        <BasicLayout />
      </Layout>
    </ReactRoute>
  );
};

export default UnAuthLayout;
