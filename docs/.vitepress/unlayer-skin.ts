import type { AtRule, Plugin } from "postcss";

/**
 * 把组件皮肤与令牌的 @layer 外壳拆掉，只在文档站生效。
 *
 * 皮肤全部写在 `@layer xihan.*` 里，而 VitePress 自带的 `button { padding: 0;
 * background-color: transparent }` 是无层的。CSS 级联里无层声明胜过任何有层声明，
 * 与特异性无关，于是皮肤被整体压掉、示例渲染成纯文本。
 *
 * 拆掉外壳后规则改按特异性竞争：皮肤选择器至少是 `[data-scope=x][data-part=y]`
 * （0,2,0），稳压 `button`（0,0,1）。这样做的前提是皮肤里每条规则都锚定在
 * `[data-scope]` / `[data-part]` / `xh-*` / `.xh-*` 上，不会命中宿主页面——库本身
 * 就是这么写的，因此拆层不会波及文档站的其它部分。
 *
 * 层内先后由 index.css 的 @import 顺序保证：reset 在 components 之前。
 *
 * 写成 PostCSS 插件而不是 Vite 插件：皮肤各文件是被 index.css 的 @import 引进来的，
 * 内联由 Vite 内部的 postcss-import 完成，那些文件不会经过 Vite 的 transform 钩子。
 */
export function unlayerSkin(): Plugin {
  return {
    postcssPlugin: "xh-unlayer-skin",
    AtRule: {
      layer(atRule: AtRule) {
        // `@layer a, b;` 只声明层序，没有块体，留着无害
        if (!atRule.nodes) return;
        const file = (atRule.source?.input?.file ?? "").replace(/\\/g, "/");
        if (!/\/packages\/(styled|system)\//.test(file)) return;
        atRule.replaceWith(atRule.nodes);
      },
    },
  };
}
unlayerSkin.postcss = true;
