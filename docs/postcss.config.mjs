import { postcssIsolateStyles } from "vitepress";

// 示例舞台不吃主题的正文排版与基础重置。
//
// VitePress 缺省主题有两份按标签写的样式：vp-doc.css 给 Markdown 正文排版（.vp-doc p / img / a / table……），
// base.css 是全站的基础重置（button、input、img、ul 一类）。示例舞台嵌在正文里，两份都会落进去，
// 组件就不再是「放进一张什么都没有的页面」的样子：图片被加上下外边距、裁切器的视口比图片高一截，
// 库自己没收干净的浏览器缺省也被这层重置盖住、在文档里看不出来。
//
// 这是 VitePress 给的隔离办法：把这两份样式里每条选择器都接上 :not(:where(.vp-raw, .vp-raw *))，
// 带 vp-raw 类的容器（XhDemo.vue 的舞台）及其后代就一条都命不中。站点主题包自己的 base.css 同样处理。
// 路径分隔符两种都认：打包器在不同系统上给的不一样。
export default {
  plugins: [
    postcssIsolateStyles({
      includeFiles: [
        /theme-default[\\/]styles[\\/]base\.css/,
        /theme-default[\\/]styles[\\/]components[\\/]vp-doc\.css/,
        /vitepress-theme[\\/]src[\\/]styles[\\/]base\.css/,
      ],
    }),
  ],
};
