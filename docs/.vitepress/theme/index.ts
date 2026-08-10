import { h, watch } from "vue";
import Theme from "vitepress/theme";
import XhDemo from "./XhDemo.vue";
// 示例舞台隔离必须排在皮肤之前：两者选择器同权，同权时后来者胜，皮肤在后才盖得住隔离。
import "./demo-isolation.css";
// 组件默认皮肤：用无层版本。VitePress 自带无层的 button 重置，CSS 级联里无层
// 声明胜过任何有层声明，皮肤若带 @layer 外壳会被整体压掉（见「安装与接入」）。
import "@xihan-ui/styles/index.unlayered.css";
import "./rainbow.css";
import "./vars.css";
import "./overrides.css";

let homePageStyle: HTMLStyleElement | undefined;

export default {
  ...Theme,
  Layout: () => {
    return h(Theme.Layout, null, {});
  },
  enhanceApp(ctx) {
    // 先执行默认主题的 enhanceApp，注册 Badge 等全局组件（否则 <Badge> 渲染为空）
    Theme.enhanceApp?.(ctx);

    // 组件页由生成器产出，示例统一写成 <XhDemo src="..." />，这里全局注册
    ctx.app.component("XhDemo", XhDemo);

    if (typeof window === "undefined") return;

    watch(
      () => ctx.router.route.data.relativePath,
      () => updateHomePageStyle(location.pathname === "/"),
      { immediate: true }
    );
  },
};

// 深浅模式桥接：VitePress 切主题是给 html 加 .dark 类，而组件令牌认的是
// [data-theme]，两者不通的话暗色页面里的组件还在用浅色令牌（白底深字）。
if (typeof window !== "undefined") {
  const root = document.documentElement;
  const syncTheme = () => {
    root.dataset.theme = root.classList.contains("dark") ? "dark" : "light";
  };
  syncTheme();
  new MutationObserver(syncTheme).observe(root, {
    attributes: true,
    attributeFilter: ["class"],
  });
}

// 检测浏览器，添加到类中进行条件样式设置
if (typeof window !== "undefined") {
  const browser = navigator.userAgent.toLowerCase();
  if (browser.includes("chrome"))
    document.documentElement.classList.add("browser-chrome");
  else if (browser.includes("firefox"))
    document.documentElement.classList.add("browser-firefox");
  else if (browser.includes("safari"))
    document.documentElement.classList.add("browser-safari");
}

// 加快主页上的彩虹动画
function updateHomePageStyle(value: boolean) {
  if (value) {
    if (homePageStyle) return;

    homePageStyle = document.createElement("style");
    homePageStyle.innerHTML = `
    :root {
      animation: rainbow 12s linear infinite;
    }`;
    document.body.appendChild(homePageStyle);
  } else {
    if (!homePageStyle) return;

    homePageStyle.remove();
    homePageStyle = undefined;
  }
}
