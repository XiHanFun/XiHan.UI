import type { DefaultTheme } from "vitepress";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { defineXiHanConfig } from "@xihanfun/vitepress-theme/config";
import { demoScriptPlugin } from "./demo-script.ts";
// @ts-expect-error 纯 JS 生成器，没有类型声明
import { transformPage, writeUiAssets } from "./gen-llms.mjs";

const require = createRequire(import.meta.url);
const repositoryRoot = fileURLToPath(new URL("../..", import.meta.url));

interface DocsPackageManifest {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

// 文档站直接 link: 的本地包以 package.json 为真源；新增示例依赖时无需再手抄一份排除表。
const docsPackage = require("../package.json") as DocsPackageManifest;

const linkedXihanPackages = Object.entries({
  ...docsPackage.dependencies,
  ...docsPackage.devDependencies,
})
  .filter(
    ([name, source]) =>
      name.startsWith("@xihan-ui/") && source.startsWith("link:"),
  )
  .map(([name]) => name);

// 这些包由上面的本地入口传递引用，自己不在 docs/package.json 里；同样不能进入预打包缓存。
const transitiveXihanPackages = [
  "@xihan-ui/backgrounds",
  "@xihan-ui/pointer",
  "@xihan-ui/position",
  "@xihan-ui/viz",
];
const localXihanOptimizeExclusions = [
  ...new Set([...linkedXihanPackages, ...transitiveXihanPackages]),
].sort();

// 渲染页面阶段组件抛的异常被 Vue 接住后只打进 console.error，构建仍退出 0：
// 出错的示例在静态页里整块缺失，而流水线什么都看不见。这里把这一路的异常收下来，
// buildEnd 时一并抛出，让构建真的失败。
const renderErrors: Error[] = [];
const passThroughError = console.error.bind(console);
console.error = (...args: unknown[]): void => {
  for (const arg of args) {
    if (arg instanceof Error)
      renderErrors.push(arg);
  }
  passThroughError(...args);
};

// 栈里第一处指向示例编译产物的帧，用它的文件名指认是哪一份示例
function demoOfStack(error: Error): string {
  const frame = /\.temp[\\/]([^.\\/]+)\.[\w-]+\.js/.exec(error.stack ?? "");
  return frame ? frame[1] : "未定位到示例";
}

// 导航末项显示的版本号直接取自库包，changesets 一改就跟着走
const { version } = require("../../ui/packages/adapters/vue/package.json");

// 组件页由 ui/scripts/gen-component-docs.mjs 生成，侧栏读同一份清单，增删组件不用改这里
type ComponentStatus = "alpha" | "new" | "updated";
const componentManifest: {
  categories: {
    id: string;
    label: string;
    components: { id: string; name: string; status?: ComponentStatus }[];
  }[];
} = require("../../ui/scripts/component-docs.manifest.json");

// 组件缺省即正式、不挂标；alpha / new / updated 逐条写在清单条目的 status 上
function sidebarStatus(component: { status?: ComponentStatus }): string {
  const status = component.status;
  if (!status)
    return "";
  const label = status === "updated" ? "更新" : status;
  return ` <span class="xh-sidebar-status xh-sidebar-status--${status}">${label}</span>`;
}

const title: string = "曦寒视图组件文档";
const description: string = "框架无关的设计系统运行时与组件库";
const keywords: string
  = "曦寒,曦寒懿,视图组件,组件库,设计系统,Vue,Web Components,官方文档,开源,XiHanFun,XiHan.UI";

// 核心概念：按序编号；组件参考另成一册
const guideChapters: [text: string, name: string][] = [
  ["解剖与部件契约", "anatomy"],
  ["状态机运行时", "machine"],
  ["connect 与属性产出", "connect"],
  ["行为原语", "behavior"],
  ["浮层定位", "position"],
  ["指针原语", "pointer"],
  ["设计令牌与主题", "theme"],
  ["皮肤与样式分层", "styling"],
  ["图标集", "icons"],
  ["国际化", "i18n"],
  ["日期与时间", "date"],
  ["表单参与与重置", "forms"],
  ["无障碍与键盘规格", "a11y"],
  ["诊断通道", "diagnostics"],
  ["框架元数据", "metadata"],
  ["AI 对话内核", "ai"],
  ["背景层", "backgrounds"],
  ["声音层", "sound"],
  ["动效原语", "motion"],
  ["动画层", "animations"],
  ["测试与质量门禁", "testing"],
];

// 设计一册：规则本身与它们的取舍，按"全局样式"分页，与指南（怎么用）互相链接
const designSidebar: DefaultTheme.SidebarItem[] = [
  {
    text: "设计",
    collapsed: false,
    items: [
      { text: "设计体系", link: "/design/" },
      { text: "设计原则", link: "/design/principles" },
      { text: "组件家族与模式", link: "/design/patterns" },
    ],
  },
  {
    text: "全局样式",
    collapsed: false,
    items: [
      { text: "色彩", link: "/design/colors" },
      { text: "布局", link: "/design/layout" },
      { text: "字体", link: "/design/typography" },
      { text: "图标", link: "/design/icons" },
      { text: "形状与边界", link: "/design/shape" },
      { text: "阴影与材质", link: "/design/shadow" },
      { text: "暗黑模式", link: "/design/dark" },
      { text: "动效", link: "/design/motion" },
      { text: "停留时长", link: "/design/dwell" },
    ],
  },
];

const startSidebar: DefaultTheme.SidebarItem[] = [
  {
    text: "开始",
    collapsed: false,
    items: [
      { text: "组件库简介", link: "/introduction" },
      { text: "架构总览", link: "/overview" },
      { text: "安装与接入", link: "/installation" },
      { text: "快速上手", link: "/quickstart" },
    ],
  },
  {
    text: "参考",
    collapsed: false,
    items: [
      { text: "包与依赖关系", link: "/npm-package-dependency" },
      { text: "版本与兼容性政策", link: "/guide/versioning" },
      { text: "常见问题", link: "/faq" },
    ],
  },
  { text: "更新日志", link: "/changelog" },
];

const adaptersSidebar: DefaultTheme.SidebarItem[] = [
  {
    text: "适配器",
    collapsed: false,
    items: [
      { text: "Vue 适配器", link: "/adapters/vue" },
      { text: "React 适配器", link: "/adapters/react" },
      { text: "Web Components 适配器", link: "/adapters/web-components" },
    ],
  },
];

// 组件标识本身就是规范英文名（kebab-case），转成词首大写即可，
// 不必在 manifest 里另存一份，也就不会与中文名各自漂移。
function enName(id: string): string {
  return id
    .split("-")
    .map(word => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

const runtimeSidebar: DefaultTheme.SidebarItem[] = [
  {
    text: "服务与运行时",
    collapsed: false,
    items: [
      { text: "这一册收什么", link: "/runtime/" },
      { text: "全局配置", link: "/runtime/config" },
      { text: "命令式服务", link: "/runtime/services" },
      { text: "流式 Markdown", link: "/runtime/markdown" },
      { text: "代码着色", link: "/runtime/code-highlight" },
    ],
  },
];

// 指南一册：核心概念按序编号，适配器与服务运行时两组接在后面——三条路径前缀共用这一份侧栏，
// 读者在 /guide/、/adapters/、/runtime/ 之间跳转时左侧不换册
const guideSidebar: DefaultTheme.SidebarItem[] = [
  {
    text: "核心概念",
    collapsed: false,
    items: guideChapters.map(([text, name], i) => ({
      text: `${i + 1}. ${text}`,
      link: `/guide/${name}`,
    })),
  },
  ...adaptersSidebar,
  ...runtimeSidebar,
  // 这一页的路径落在 /guide/ 前缀下，点进去用的就是这一份侧栏；
  // 它不属于编号章节，另起一组，读者才在侧栏里找得到自己在哪
  {
    text: "参考",
    collapsed: false,
    items: [{ text: "版本与兼容性政策", link: "/guide/versioning" }],
  },
];

// 场景册：一页一整屏界面，收的是跨组件的同框效果，不按组件排
const examplesSidebar: DefaultTheme.SidebarItem[] = [
  {
    text: "场景",
    collapsed: false,
    items: [
      { text: "这一册收什么", link: "/examples/" },
      { text: "后台壳", link: "/examples/admin-shell" },
      { text: "表单页", link: "/examples/form-page" },
      { text: "数据页", link: "/examples/data-page" },
      { text: "对话页", link: "/examples/chat-page" },
    ],
  },
];

const componentsSidebar: DefaultTheme.SidebarItem[] = [
  {
    text: "概述",
    collapsed: false,
    items: [{ text: "组件总览", link: "/components/" }],
  },
  ...componentManifest.categories.map(category => ({
    text: `${category.label}（${category.components.length}）`,
    collapsed: false,
    items: category.components.map(component => ({
      // 英文名与代码导出一致，中文名作次级识别；状态由同一份组件清单派生。
      text: `${enName(component.id)} <span class="xh-sidebar-cn">${component.name}</span>${sidebarStatus(component)}`,
      link: `/components/${component.id}`,
    })),
  })),
];

// 每个顶部导航板块各自一份侧栏，由路径前缀决定用哪一份；
// 首页是 layout: home，不落任何一份。
const sidebar: DefaultTheme.Sidebar = {
  "/design/": designSidebar,
  "/guide/": guideSidebar,
  "/adapters/": guideSidebar,
  "/components/": componentsSidebar,
  "/examples/": examplesSidebar,
  "/runtime/": guideSidebar,
  "/": startSidebar,
};

const nav: DefaultTheme.NavItem[] = [
  {
    text: "指南",
    activeMatch:
      "^/(introduction|overview|installation|quickstart|npm-package-dependency|faq|(guide|adapters|runtime|examples)/.*)$",
    items: [
      {
        text: "快速开始",
        items: [
          { text: "介绍", link: "/introduction" },
          { text: "快速上手", link: "/quickstart" },
          { text: "常见问题", link: "/faq" },
        ],
      },
      {
        text: "深入",
        items: [
          { text: "核心概念", link: "/guide/anatomy" },
          { text: "适配器", link: "/adapters/vue" },
          { text: "服务与运行时", link: "/runtime/" },
          { text: "场景示例", link: "/examples/" },
        ],
      },
    ],
  },
  { text: "设计", link: "/design/", activeMatch: "/design/" },
  { text: "组件", link: "/components/", activeMatch: "/components/" },
  {
    text: "生态",
    items: [
      {
        text: "官方生态",
        items: [
          { text: "开发框架", link: "https://framework.docs.xihanfun.com" },
          { text: "视图组件", link: "/" },
          { text: "基础应用", link: "https://basicapp.docs.xihanfun.com" },
        ],
      },
    ],
  },
  {
    text: "支持",
    items: [
      { text: "公约", link: "https://docs.xihanfun.com/cosmos/code-of-conduct" },
      { text: "参与", link: "https://docs.xihanfun.com/cosmos/contributing" },
      { text: "赞助", link: "https://docs.xihanfun.com/cosmos/sponsor" },
    ],
  },
  {
    text: `v${version}`,
    items: [{ text: "更新日志", link: "/changelog" }],
  },
];

export default defineXiHanConfig({
  title,
  description,
  keywords,
  repo: "XiHan.UI",
  llms: {
    title: "曦寒视图组件",
    summary: "框架无关的设计系统运行时：无头内核提供行为与无障碍，Vue、React 与 Web Components 三个适配器只负责把属性铺到宿主元素上，纯 CSS 皮肤认 `data-scope` / `data-part` 而不是类名。",
    sections: [
      { dir: ".", label: "开始" },
      { dir: "design", label: "设计" },
      { dir: "guide", label: "核心概念" },
      { dir: "adapters", label: "适配器" },
      { dir: "runtime", label: "服务与运行时" },
      { dir: "examples", label: "场景" },
      { dir: "components", label: "组件" },
    ],
    bundles: [
      {
        name: "components",
        label: "组件参考",
        dirs: ["components"],
        description: "每页含解剖部件、Props、事件、状态、键盘、数据属性、CSS 变量与两个适配器的示例源码。",
      },
      {
        name: "guide",
        label: "核心概念、适配器与运行时",
        dirs: ["guide", "adapters", "runtime"],
        description: "核心概念、两个适配器的接法、以及命令式服务与运行时。",
      },
    ],
    fullDescription: "示例已按适配器内联为代码块",
    transform: transformPage,
    assets: writeUiAssets,
  },
  buildEnd() {
    if (renderErrors.length > 0) {
      const list = renderErrors
        .map(
          (error, i) =>
            `  ${i + 1}. ${demoOfStack(error)} —— ${error.name}: ${error.message}`,
        )
        .join("\n");
      throw new Error(
        `渲染页面阶段抛了 ${renderErrors.length} 个异常，出错的示例在静态页里整块缺失（完整栈见上方日志）：\n${list}`,
      );
    }
  },
  vite: {
    plugins: [demoScriptPlugin()],
    oxc: {
      jsx: {
        runtime: "automatic",
        importSource: "react",
      },
    },
    // 适配器是 link: 进来的，dist 里的 import "react" 会按真实路径解析到 ui/ 工作区自己装的那一份，
    // 与文档站挂示例用的 react-dom 不是同一份：hooks 调度器只挂在渲染器那一份上，React 示例全部读 null 崩掉。
    // vue 由主题配置统一去重，不用列
    resolve: {
      dedupe: ["react", "react-dom"],
    },
    // 组件库是 link: 进来的，Vite 的依赖预打包缓存只认 package.json 与锁文件，
    // 改了库的源码它不会失效——本地构建会拿着旧产物继续渲染而且什么都不说。
    // 排除掉，示例渲染的永远是当前代码；传递依赖也要列全，漏一个它就带着旧代码进缓存
    optimizeDeps: {
      // Vite 对包名做前缀匹配：排除 @xihan-ui/react 会连同 react/sound 等公开子路径一起排除。
      exclude: localXihanOptimizeExclusions,
    },
    server: {
      fs: {
        allow: [repositoryRoot],
      },
    },
  },
  themeConfig: {
    nav,
    sidebar,
  },
});
