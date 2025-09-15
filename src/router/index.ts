import Login from "../views/login";
import VulManage from "../views/vul";
import VulRules from "../views/rules";
import Task from "../views/task";
import Result from "../views/result";
import {Product} from "../views/modules";
import TaskDispatch from "../views/ai-security/task-dispatch";
import ScanResults from "../views/ai-security/scan-results";
import VulnerabilityTest from "../views/vulnerability-test";

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
    path: "/poc",
    key: "/poc",
    component: VulRules,
    meta: {
      name: "漏洞规则",
      icon: "icon--_xitongrizhi"
    }
  },
  {
    path: "/vul",
    key: "/vul",
    component: VulManage,
    meta: {
      name: "漏洞描述",
      icon: "icon-chakan-copy"
    }
  },
  {
    path: "/task",
    key: "/task",
    component: Task,
    meta: {
      name: "任务列表",
      icon: "icon-ai226"
    }
  },
  {
    path: "/result",
    key: "/result",
    component: Result,
    meta: {
      name: "扫描结果",
      icon: "icon-xinxi1"
    }
  },
  {
    path: "/product",
    key: "/product",
    component: Product,
    meta: {
      name: "影响组件",
      icon: "icon-qita"
    }
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
  {
    path: "/vulnerability-test",
    key: "/vulnerability-test",
    component: VulnerabilityTest,
    meta: {
      name: "漏洞测试",
      icon: "icon-chakan-copy"
    }
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
