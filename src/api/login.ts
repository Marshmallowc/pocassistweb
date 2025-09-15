import request from "../utils/request";

/**
 * 用户登录
 * @param data
 */
export const login = (data: { username: string; password: string }) => {
  return request({
    url: "/user/login",
    method: "post",
    data
  });
};

/**
 * 退出登录
 */
export const logout = () => {
  return request({
    url: "/user/logout",
    method: "get"
  });
};

/**
 * 修改密码
 * @param data
 */
export const resetPassword = (data: {
  password: string;
  newpassword: string;
}) => {
  return request({
    url: "/user/self/resetpwd/",
    method: "post",
    data
  });
};

/**
 * 获取用户信息
 */
export const getUserInfos = () => {
  return request({
    url: "/user/info",
    method: "get"
  });
};
