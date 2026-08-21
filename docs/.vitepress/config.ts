import { createRequire } from "node:module";
import { DefaultTheme, HeadConfig, defineConfig } from "vitepress";

const require = createRequire(import.meta.url);

// 导航末项显示的版本号取自本站 package.json，发版时只改那一处
const { version } = require("../package.json");

// 组件页由 ui/scripts/gen-component-docs.mjs 生成，侧栏读同一份清单，增删组件不用改这里
const componentManifest: {
  categories: {
    id: string;
    label: string;
    components: { id: string; name: string }[];
  }[];
} = require("../../ui/scripts/component-docs.manifest.json");

const title: string = "曦寒视图组件文档";
const description: string = "框架无关的设计系统运行时与组件库";
const keywords: string =
  "曦寒,曦寒懿,视图组件,组件库,设计系统,Vue,Web Components,官方文档,开源,XiHanFun,XiHan.UI";
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
];

const adaptersSidebar: DefaultTheme.SidebarItem[] = [
  {
    text: "适配器",
    collapsed: false,
    items: [
      { text: "Vue 适配器", link: "/adapters/vue" },
      { text: "Web Components 适配器", link: "/adapters/web-components" },
    ],
  },
];

// 组件标识本身就是规范英文名（kebab-case），转成词首大写即可，
// 不必在 manifest 里另存一份，也就不会与中文名各自漂移。
function enName(id: string): string {
  return id
    .split("-")
    .map((word) => word[0].toUpperCase() + word.slice(1))
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

const componentsSidebar: DefaultTheme.SidebarItem[] = [
  { text: "组件总览", link: "/components/" },
  ...componentManifest.categories.map((category) => ({
    text: `${category.label}（${category.components.length}）`,
    collapsed: false,
    items: category.components.map((component) => ({
      // 中英并列：中文认得快，英文对得上代码里的标识与导出名。
      // 侧栏文本走 v-html，英文压成次要样式，中文仍是主视觉
      text: `${component.name} <span class="xh-sidebar-en">${enName(component.id)}</span>`,
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
  { text: "核心概念", link: "/guide/anatomy", activeMatch: "/guide/" },
  { text: "适配器", link: "/adapters/vue", activeMatch: "/adapters/" },
  { text: "组件参考", link: "/components/", activeMatch: "/components/" },
  { text: "服务与运行时", link: "/runtime/", activeMatch: "/runtime/" },
  {
    text: "探索未知",
    items: [
      {
        text: "关于我们",
        items: [
          {
            text: "官方网站",
            link: "https://www.xihanfun.com",
          },
          {
            text: "组织文档",
            link: "https://docs.xihanfun.com",
          },
        ],
      },
      {
        text: "生态文档",
        items: [
          {
            text: "后端 | 开发框架",
            link: "https://framework.docs.xihanfun.com",
          },
          {
            text: "用例 | 基础应用",
            link: "https://basicapp.docs.xihanfun.com",
          },
        ],
      },
      {
        text: "引用下载",
        items: [
          {
            text: "后端 | nuget",
            link: "https://www.nuget.org/profiles/XiHanFun",
          },
          {
            text: "前端 | npm",
            link: "https://www.npmjs.com/org/xihan-ui",
          },
        ],
      },
      {
        text: "在线体验",
        items: [
          {
            text: "后端 | 开发框架",
            link: "https://framework.xihanfun.com",
          },
          {
            text: "前端 | 视图组件",
            link: "https://ui.xihanfun.com",
          },
          {
            text: "用例 | 基础应用",
            link: "https://basicapp.xihanfun.com",
          },
        ],
      },
    ],
  },
  {
    text: "代码仓库",
    items: [
      {
        text: "Github主库(国际)",
        link: "https://github.com/XiHanFun/XiHan.UI",
      },
      {
        text: "Gitee同步备库(国内)",
        link: "https://gitee.com/XiHanFun/XiHan.UI",
      },
      {
        text: "GitCode同步备库(国内)",
        link: "https://gitcode.com/XiHanFun/XiHan.UI",
      },
    ],
  },
  {
    text: "参与贡献",
    items: [
      {
        text: "公约",
        link: "https://docs.xihanfun.com/cosmos/code-of-conduct",
      },
      {
        text: "指南",
        link: "https://docs.xihanfun.com/cosmos/contributing",
      },
      {
        text: "贡献者",
        link: "https://docs.xihanfun.com/cosmos/contributors",
      },
      {
        text: "支持&赞助",
        link: "https://docs.xihanfun.com/cosmos/sponsor",
      },
    ],
  },
  {
    text: `v${version}`,
    items: [{ text: "更新日志", link: "/changelog" }],
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
  title: title,
  description: description,
  head: head,
  lastUpdated: true,
  cleanUrls: true,
  vite: {
    // 组件库是 link: 进来的，Vite 的依赖预打包缓存只认 package.json 与锁文件，
    // 改了库的源码它不会失效——本地构建会拿着旧产物继续渲染而且什么都不说。
    // 排除掉，示例渲染的永远是当前代码；传递依赖也要列全，漏一个它就带着旧代码进缓存
    optimizeDeps: {
      exclude: [
        "@xihan-ui/vue",
        "@xihan-ui/web-components",
        "@xihan-ui/web-components/define",
        "@xihan-ui/styles",
        "@xihan-ui/headless",
        "@xihan-ui/behavior",
        "@xihan-ui/kernel",
        "@xihan-ui/machine",
        "@xihan-ui/position",
        "@xihan-ui/code-highlight",
        "@xihan-ui/sound",
        "@xihan-ui/vue/sound",
        "@xihan-ui/motion",
        "@xihan-ui/animations",
        "@xihan-ui/icons",
      ],
    },
  },
  themeConfig: {
    logo: logo,
    socialLinks: [
      { icon: "github", link: "https://github.com/XiHanFun/XiHan.UI" },
      { icon: "gitee", link: "https://gitee.com/XiHanFun/XiHan.UI" },
      { icon: "gitcode", link: "https://gitcode.com/XiHanFun/XiHan.UI" },
    ],
    search: {
      provider: "local",
      options: searchOptions(),
    },
    nav: nav,
    sidebar: sidebar,
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
