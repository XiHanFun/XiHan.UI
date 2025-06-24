import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/components",
  },
  {
    path: "/components",
    name: "Components",
    component: () => import("../views/Components.vue"),
    meta: {
      title: "组件演示",
    },
    children: [
      {
        path: "button",
        name: "Button",
        component: () => import("../components/Button.vue"),
        meta: {
          title: "按钮 Button",
          component: "Button",
        },
      },
      {
        path: "button-group",
        name: "ButtonGroup",
        component: () => import("../components/ButtonGroup.vue"),
        meta: {
          title: "按钮组 ButtonGroup",
          component: "ButtonGroup",
        },
      },
      {
        path: "icon",
        name: "Icon",
        component: () => import("../components/Icons.vue"),
        meta: {
          title: "图标 Icon",
          component: "Icon",
        },
      },
    ],
  },
  // 404 路由
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由前置守卫 - 设置页面标题
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title || "XiHan UI"} - XiHan UI`;
  next();
});

export default router;
