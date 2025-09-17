import Login from "../views/login";
import VulManage from "../views/vul";
import VulRules from "../views/rules";
import Task from "../views/task";
import Result from "../views/result";
import {Product} from "../views/modules";
import TaskDispatch from "../views/ai-security/task-dispatch";
import ScanResults from "../views/ai-security/scan-results";
import TemplateManagement from "../views/template-management";

interface IRouteMeta {
  name: string;
  icon?: string;
  role?: string;
}
interface IRoute {
  path: string;
  key: string;
  // 路由组件
  component?: any;
  redirect?: string;
  hidden?: boolean;
  meta?: IRouteMeta;
  subMenu?: IRoute[];
}

export const routes: IRoute[] = [
  {
    path: "/login",
    key: "/login",
    component: Login,
    hidden: true
  },
  {
    path: "/vulnerability-testing",
    key: "/vulnerability-testing",
    meta: {
      name: "漏洞测试",
      icon: "icon-xinxi1"
    },
    subMenu: [
      {
        path: "/poc",
        key: "/poc",
        component: VulRules,
        meta: {
          name: "漏洞规则"
        }
      },
      {
        path: "/vul",
        key: "/vul",
        component: VulManage,
        meta: {
          name: "漏洞描述"
        }
      },
      {
        path: "/task",
        key: "/task",
        component: Task,
        meta: {
          name: "任务列表"
        }
      },
      {
        path: "/result",
        key: "/result",
        component: Result,
        meta: {
          name: "扫描结果"
        }
      },
      {
        path: "/product",
        key: "/product",
        component: Product,
        meta: {
          name: "影响组件"
        }
      }
    ]
  },
  {
    path: "/ai-security",
    key: "/ai-security",
    meta: {
      name: "AI安全评估",
      icon: "icon-ai226"
    },
    subMenu: [
      {
        path: "/ai-security/template-management",
        key: "/ai-security/template-management",
        component: TemplateManagement,
        meta: {
          name: "模板管理"
        }
      },
      {
        path: "/ai-security/task-dispatch",
        key: "/ai-security/task-dispatch",
        component: TaskDispatch,
        meta: {
          name: "任务下发"
        }
      },
      {
        path: "/ai-security/scan-results",
        key: "/ai-security/scan-results",
        component: ScanResults,
        meta: {
          name: "扫描结果"
        }
      }
    ]
  },
];

function flattenRoute(routes: IRoute[]): IRoute[] {
  const result = [];
  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    result.push({
      ...route
    });
    if (route?.subMenu) {
      result.push(...flattenRoute(route.subMenu));
    }
  }
  return result;
}
export const layoutRoutes = flattenRoute(routes);
