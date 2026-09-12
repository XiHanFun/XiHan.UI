import Theme from "vitepress/theme";
import { h } from "vue";
import XhDemo from "./XhDemo.vue";
import XhDocsScrollbars from "./XhDocsScrollbars.vue";
import XhFrameworkSwitch from "./XhFrameworkSwitch.vue";
import XhPageMarkdown from "./XhPageMarkdown.vue";
// 示例舞台隔离必须排在皮肤之前：两者选择器同权，同权时后来者胜，皮肤在后才盖得住隔离。
import "./demo-isolation.css";
// 组件默认皮肤：用无层版本。VitePress 自带无层的 button 重置，CSS 级联里无层
// 声明胜过任何有层声明，皮肤若带 @layer 外壳会被整体压掉（见「安装与接入」）。
import "@xihan-ui/styles/index.unlayered.css";
import "./vars.css";
import "./overrides.css";

export default {
  ...Theme,
  Layout: () => {
    // 框架切换器排在站点标题之后，全站一份、所有示例跟着它走
    return h(Theme.Layout, null, {
      "nav-bar-content-before": () => h(XhFrameworkSwitch),
      "sidebar-nav-before": () => h(
        "div",
        { class: "xh-framework-mobile" },
        h(XhFrameworkSwitch),
      ),
      // 每页正文上方一条取 Markdown 的直链，指向构建期落在同路径的 .md
      "doc-before": () => h(XhPageMarkdown),
      "layout-bottom": () => h(XhDocsScrollbars),
    });
  },
  enhanceApp(ctx) {
    // 先执行默认主题的 enhanceApp，注册 Badge 等全局组件（否则 <Badge> 渲染为空）
    Theme.enhanceApp?.(ctx);

    // 组件页由生成器产出，示例统一写成 <XhDemo src="..." />，这里全局注册
    ctx.app.component("XhDemo", XhDemo);
  },
};

// 深浅模式桥接：VitePress 切主题是给 html 加 .dark 类，而组件令牌认的是
// [data-theme]，两者不通的话暗色页面里的组件还在用浅色令牌（白底深字）。
if (typeof window !== "undefined") {
  const root = document.documentElement;
  const syncTheme = (): void => {
    root.dataset.theme = root.classList.contains("dark") ? "dark" : "light";
  };
  syncTheme();
  new MutationObserver(syncTheme).observe(root, {
    attributes: true,
    attributeFilter: ["class"],
  });
}
