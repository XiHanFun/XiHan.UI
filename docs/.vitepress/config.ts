import type { Plugin } from "vite";
import type { DefaultTheme, HeadConfig } from "vitepress";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitepress";
// @ts-expect-error 纯 JS 生成器，没有类型声明
import { renderPageMarkdown, writeLlmsAssets } from "./gen-llms.mjs";

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
  "@xihan-ui/tokens",
];
const localXihanOptimizeExclusions = [
  ...new Set([...linkedXihanPackages, ...transitiveXihanPackages]),
].sort();

function devMarkdownPlugin(): Plugin {
  return {
    name: "xihan-doc-page-markdown",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
        const prefix = "/__markdown/";
        if (!pathname.startsWith(prefix)) {
          next();
          return;
        }

        const markdown = await renderPageMarkdown(decodeURIComponent(pathname.slice(prefix.length)));
        if (markdown === null) {
          response.statusCode = 404;
          response.end("Not Found");
          return;
        }

        response.statusCode = 200;
        response.setHeader("Content-Type", "text/markdown; charset=utf-8");
        response.end(markdown);
      });
    },
  };
}

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
const componentManifest: {
  categories: {
    id: string;
    label: string;
    components: { id: string; name: string; status?: "new" | "updated" }[];
  }[];
} = require("../../ui/scripts/component-docs.manifest.json");

const title: string = "XiHan.UI";
const description: string = "框架无关的设计系统运行时与组件库";
const keywords: string
  = "曦寒,曦寒懿,视图组件,组件库,设计系统,Vue,Web Components,官方文档,开源,XiHanFun,XiHan.UI";
const logo: string = "/images/logo.png";
const head: HeadConfig[] = [
  ["meta", { name: "author", content: "XiHanFun" }],
  [
    "meta",
    {
      name: "keywords",
      content: keywords,
    },
  ],
  ["link", { rel: "icon", href: "/favicon.ico" }],
];

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

const guideSidebar: DefaultTheme.SidebarItem[] = [
  {
    text: "核心概念",
    collapsed: false,
    items: guideChapters.map(([text, name], i) => ({
      text: `${i + 1}. ${text}`,
      link: `/guide/${name}`,
    })),
  },
  // 这一页的路径落在 /guide/ 前缀下，点进去用的就是这一份侧栏；
  // 它不属于编号章节，另起一组，读者才在侧栏里找得到自己在哪
  {
    text: "参考",
    collapsed: false,
    items: [{ text: "版本与兼容性政策", link: "/guide/versioning" }],
  },
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
      // 英文名与代码导出一致，中文名作次级识别；两者同排，保持 HeroUI 中文站的扫描方式。
      text: `${enName(component.id)} <span class="xh-sidebar-cn">${component.name}</span>${component.status === "new" ? ' <span class="xh-sidebar-status">new</span>' : ""}`,
      link: `/components/${component.id}`,
    })),
  })),
];

// 每个顶部导航板块各自一份侧栏，由路径前缀决定用哪一份；
// 首页是 layout: home，不落任何一份。
const sidebar: DefaultTheme.Sidebar = {
  "/guide/": guideSidebar,
  "/adapters/": adaptersSidebar,
  "/components/": componentsSidebar,
  "/examples/": examplesSidebar,
  "/runtime/": runtimeSidebar,
  "/": startSidebar,
};

const nav: DefaultTheme.NavItem[] = [
  {
    text: "开始",
    link: "/introduction",
    activeMatch:
      "^/(introduction|overview|installation|quickstart|npm-package-dependency|faq)$",
  },
  { text: "组件", link: "/components/", activeMatch: "/components/" },
  {
    text: "指南",
    link: "/guide/anatomy",
    activeMatch: "^/(guide|adapters|runtime)/",
  },
  { text: "示例", link: "/examples/", activeMatch: "/examples/" },
  {
    text: `v${version}`,
    items: [
      {
        text: "版本",
        items: [{ text: "更新日志", link: "/changelog" }],
      },
      {
        text: "项目",
        items: [
          { text: "适配器", link: "/adapters/vue" },
          { text: "服务与运行时", link: "/runtime/" },
        ],
      },
      {
        text: "社区",
        items: [
          { text: "官方网站", link: "https://www.xihanfun.com" },
          {
            text: "贡献指南",
            link: "https://docs.xihanfun.com/cosmos/contributing",
          },
        ],
      },
    ],
  },
];

function searchOptions(): Partial<DefaultTheme.AlgoliaSearchOptions> {
  return {
    placeholder: "搜索文档",
    translations: {
      button: {
        buttonText: "搜索文档",
        buttonAriaLabel: "搜索文档",
      },
      modal: {
        searchBox: {
          resetButtonTitle: "清除查询条件",
          resetButtonAriaLabel: "清除查询条件",
          cancelButtonText: "取消",
          cancelButtonAriaLabel: "取消",
        },
        startScreen: {
          recentSearchesTitle: "搜索历史",
          noRecentSearchesText: "没有搜索历史",
          saveRecentSearchButtonTitle: "保存至搜索历史",
          removeRecentSearchButtonTitle: "从搜索历史中移除",
          favoriteSearchesTitle: "收藏",
          removeFavoriteSearchButtonTitle: "从收藏中移除",
        },
        errorScreen: {
          titleText: "无法获取结果",
          helpText: "你可能需要检查你的网络连接",
        },
        footer: {
          selectText: "选择",
          navigateText: "切换",
          closeText: "关闭",
          searchByText: "搜索提供者",
        },
        noResultsScreen: {
          noResultsText: "无法找到相关结果",
          suggestedQueryText: "你可以尝试查询",
          reportMissingResultsText: "你认为该查询应该有结果？",
          reportMissingResultsLinkText: "点击反馈",
        },
      },
    },
  };
}

export default defineConfig({
  lang: "zh-CN",
  title,
  description,
  head,
  lastUpdated: true,
  cleanUrls: true,
  async buildEnd(siteConfig) {
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
    // 机读资产排在抛异常之后：构建没通过就不产出
    await writeLlmsAssets(siteConfig.outDir);
  },
  vite: {
    plugins: [devMarkdownPlugin()],
    esbuild: {
      jsx: "automatic",
      jsxImportSource: "react",
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
    logo,
    socialLinks: [
      { icon: "github", link: "https://github.com/XiHanFun/XiHan.UI" },
      { icon: "gitee", link: "https://gitee.com/XiHanFun/XiHan.UI" },
      { icon: "gitcode", link: "https://gitcode.com/XiHanFun/XiHan.UI" },
    ],
    search: {
      provider: "local",
      options: searchOptions(),
    },
    nav,
    sidebar,
    docFooter: {
      prev: "上一页",
      next: "下一页",
    },
    outline: {
      label: "目录",
      level: "deep",
    },
    langMenuLabel: "多语言",
    returnToTopLabel: "回到顶部",
    sidebarMenuLabel: "菜单",
    darkModeSwitchLabel: "主题",
    lightModeSwitchTitle: "切换到浅色模式",
    darkModeSwitchTitle: "切换到深色模式",
    skipToContentLabel: "跳转到内容",
    notFound: {
      title: "页面未找到",
      quote:
        "但如果你不改变方向，并且继续寻找，你可能最终会到达你所前往的地方。",
      linkLabel: "前往首页",
      linkText: "带我回首页",
    },
    editLink: {
      text: "在 GitHub 上编辑此页",
      pattern: "https://github.com/XiHanFun/XiHan.UI/tree/main/docs/:path",
    },
    lastUpdated: {
      text: "最后更新于",
    },
    footer: {
      message:
        "Released under The <a href='https://opensource.org/license/MIT' target='_blank'>MIT</a> License",
      copyright:
        "Copyright ©2021-Present <a href='https://www.xihanfun.com' target='_blank'>XiHanFun</a> and contributors.",
    },
  },
});
