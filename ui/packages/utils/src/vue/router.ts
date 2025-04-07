/**
 * Vue Router 辅助函数
 * 提供路由管理、导航守卫和路由状态处理
 */

import { useRouter, useRoute } from "vue-router";
import type { RouteLocationRaw, RouteRecordRaw, Router } from "vue-router";
import { ref, computed, onMounted, onUnmounted } from "vue";
import type { Ref } from "vue";

/**
 * 返回上一页
 * @param fallbackPath 如果没有历史记录则跳转到该路径
 */
export function goBack(fallbackPath: RouteLocationRaw = "/") {
  const router = useRouter();

  if (window.history.length > 1) {
    router.back();
  } else {
    router.push(fallbackPath);
  }
}

/**
 * 路由冗余导航错误处理
 * @param router Vue Router 实例
 */
export function handleNavigationDuplicates(router: Router) {
  // 捕获路由导航重复错误，避免在控制台显示错误
  const originalPush = router.push;
  router.push = function push(location) {
    return originalPush.call(this, location).catch(err => {
      if (err.name !== "NavigationDuplicated") {
        return Promise.reject(err);
      }
      return Promise.resolve();
    });
  };
}

/**
 * 路由历史跟踪钩子
 * @returns 路由历史记录
 */
export function useRouteHistory() {
  const routeHistory: Ref<RouteLocationRaw[]> = ref([]);
  const router = useRouter();
  const currentRoute = useRoute();

  const addRouteToHistory = (to: RouteLocationRaw) => {
    routeHistory.value.push(to);
    if (routeHistory.value.length > 20) {
      routeHistory.value.shift();
    }
  };

  onMounted(() => {
    // 初始化当前路由
    routeHistory.value.push(currentRoute);

    // 监听路由变化
    const unwatch = router.afterEach(to => {
      addRouteToHistory(to);
    });

    onUnmounted(() => {
      unwatch();
    });
  });

  return {
    routeHistory,
    currentIndex: computed(() => routeHistory.value.length - 1),
    goBack: () => {
      if (routeHistory.value.length > 1) {
        routeHistory.value.pop(); // 移除当前路由
        const prevRoute = routeHistory.value[routeHistory.value.length - 1];
        router.push(prevRoute);
      } else {
        router.push("/");
      }
    },
  };
}

/**
 * 路由参数钩子
 * @param paramName 参数名称
 * @param defaultValue 默认值
 * @returns 响应式路由参数值
 */
export function useRouteParam<T = string>(paramName: string, defaultValue?: T) {
  const route = useRoute();

  return computed(() => {
    const value = route.params[paramName] || route.query[paramName] || defaultValue;
    return value as unknown as T;
  });
}

/**
 * 嵌套路由生成器
 * @param routes 基础路由
 * @param prefix 路由前缀
 * @returns 处理后的路由配置
 */
export function generateNestedRoutes(routes: RouteRecordRaw[], prefix: string = ""): RouteRecordRaw[] {
  return routes.map(route => {
    const path = prefix ? `${prefix}/${route.path}` : route.path;

    const newRoute = { ...route, path };

    if (route.children?.length) {
      newRoute.children = generateNestedRoutes(route.children, route.path);
    }

    return newRoute;
  });
}

/**
 * 权限路由过滤钩子
 * @param routes 路由配置
 * @param hasPermission 权限检查函数
 * @returns 过滤后的路由
 */
export function usePermissionRoutes(routes: RouteRecordRaw[], hasPermission: (route: RouteRecordRaw) => boolean) {
  return computed(() => {
    const filterRoutes = (routes: RouteRecordRaw[]): RouteRecordRaw[] => {
      return routes.filter(route => {
        const permitted = hasPermission(route);

        if (!permitted) {
          return false;
        }

        if (route.children?.length) {
          route.children = filterRoutes(route.children);
        }

        return true;
      });
    };

    return filterRoutes(routes);
  });
}

/**
 * 检测路由是否处于活动状态
 * @param path 路由路径
 * @param exact 是否精确匹配
 * @returns 路由是否处于活动状态
 */
export function useRouteActive(path: string, exact: boolean = false) {
  const route = useRoute();

  return computed(() => {
    if (exact) {
      return route.path === path;
    }

    return route.path.startsWith(path);
  });
}

export default {
  goBack,
  handleNavigationDuplicates,
  useRouteHistory,
  useRouteParam,
  generateNestedRoutes,
  usePermissionRoutes,
  useRouteActive,
};
