import React, { useContext, useState } from "react";
import {
  Avatar,
  Dropdown,
  Form,
  Input,
  Layout,
  Menu,
  message,
  Modal,
  Switch,
  Tooltip
} from "antd";
import avatar from "@/assets/images/avatar.png";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";
import { useHistory } from "react-router-dom";
import GlobalContext from "../store/global/store";
import { logout, resetPassword } from "../api/login";
import { getUserInfo, removeToken } from "../utils/auth";

const { Header } = Layout;

const PrimaryHeader: React.FC = props => {
  const history = useHistory();
  const [form] = Form.useForm();
  const { state, dispatch } = useContext(GlobalContext);
  const [show, setShow] = useState<boolean>(false);

  const handleClickBtn = () => {
    dispatch({ type: "TOGGLE_COLLAPSED" });
  };

  const handleLogout = () => {
    logout().then(res => {
      removeToken();
      history.push("/login");
    });
  };

  const handleRestPassword = (value: any) => {
    resetPassword({
      password: value.password,
      newpassword: value.newpassword
    }).then(res => {
      message.success("修改密码成功");
      setShow(false);
    });
  };

  const handleMockToggle = (checked: boolean) => {
    dispatch({ type: "SET_MOCK", payload: checked });
    message.success(`已${checked ? '开启' : '关闭'}Mock模式`);
  };

  const menu = (
    <Menu>
      <Menu.Item onClick={() => setShow(true)}>修改密码</Menu.Item>
      <Menu.Item onClick={handleLogout}>退出登录</Menu.Item>
    </Menu>
  );

  return (
    <Header>
      <div className="header-left-wrap">
        <div className="header-left" onClick={handleClickBtn}>
          {state.collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </div>
      </div>
      <div className="header-right">
        <div style={{ marginRight: 16, display: 'flex', alignItems: 'center' }}>
          <Tooltip title={state.mockEnabled ? "当前使用模拟数据，关闭后将发送真实网络请求" : "当前发送真实网络请求，开启后将使用模拟数据"}>
            <div style={{ display: 'flex', alignItems: 'center', color: '#fff' }}>
              <span style={{ marginRight: 8, fontSize: 14 }}>Mock模式</span>
              <Switch
                checked={state.mockEnabled}
                onChange={handleMockToggle}
                size="small"
              />
            </div>
          </Tooltip>
        </div>
        <Avatar size={32} src={avatar} />
        <Dropdown
          overlayStyle={{ width: "180px", zIndex: 2000 }}
          overlay={menu}
        >
          <div className="ant-dropdown-link">
            <div>
              欢迎，{getUserInfo()?.name}
              {/*<DownOutlined*/}
              {/*  style={{ fontSize: 12, marginLeft: 10, lineHeight: "20px" }}*/}
              {/*/>*/}
            </div>
          </div>
        </Dropdown>
      </div>
      <Modal
        visible={show}
        onCancel={() => setShow(false)}
        onOk={form.submit}
        title="修改密码"
        forceRender
      >
        <Form form={form} onFinish={handleRestPassword} labelCol={{ span: 6 }}>
          <Form.Item
            name="password"
            label="原密码"
            rules={[{ required: true }]}
          >
            <Input type="password" placeholder="请输入原密码" />
          </Form.Item>
          <Form.Item
            name="newpassword"
            label="新密码"
            rules={[{ required: true }]}
          >
            <Input type="password" placeholder="请输入新密码" />
          </Form.Item>
          <Form.Item
            name="new_password_confirm"
            label="再次输入密码"
            dependencies={["newpassword"]}
            rules={[
              {
                required: true,
                message: "请再次输入密码"
              },
              ({ getFieldValue }) => ({
                validator(rule, value) {
                  if (!value || getFieldValue("newpassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject("两次输入新密码不一致");
                }
              })
            ]}
          >
            <Input type="password" placeholder="请再次输入新密码" />
          </Form.Item>
        </Form>
      </Modal>
    </Header>
  );
};

export default PrimaryHeader;
