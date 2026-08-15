---
"@xihan-ui/kernel": patch
"@xihan-ui/styles": patch
---

漏引皮肤不再静默：新增 `startSkinCheck()` 开发期探测与 `styles.missing-skin` 诊断码。

按需引皮肤时漏掉一行原本是这个库最难查的失效：那个组件的 `data-scope` / `data-part` 照常都在、
别的皮肤也确实加载了，只有它渲染成没有内边距、没有底色的裸元素，看起来像组件坏了而不是少引了一行。
这一条正是「按组件挑」在真实项目里立不住的根本原因。

每份组件皮肤现在在自己的 `[data-scope='X']` 上落一个 `--xh-X-skin` 标记（104 份）。
`startSkinCheck()` 扫页面上出现过的每个 scope，取不到标记就报诊断：

```ts
if (import.meta.env.DEV) {
  const { startSkinCheck } = await import('@xihan-ui/kernel/skin-check')
  startSkinCheck()
}
```

```
[xh][button] [styles] button 的皮肤没引：import '@xihan-ui/styles/button.css'，或改引全量的 '@xihan-ui/styles'
```

两处刻意的取舍：

- **每个 scope 只探一次。** 探测要读计算样式，逐实例探是真实的强制样式重算；一个 scope 的皮肤
  在不在场与实例数无关，探一次就够。
- **标记落在 `[data-scope='X']` 而不是 root 部件上。** 浮层族的 `content` 被 portal 到 body，
  不在 root 的子树里，只在 root 上声明的话自定义属性继承不过去，这些部件会误报。

探测器走 `@xihan-ui/kernel/skin-check` 子路径而不是主入口：它是开发期工具，不该躺在每个消费方都会打包的那条入口里（放主入口会让 kernel 的体积棘轮超 118 B，那条棘轮量的正是整包）。

新增 `check-skin-markers` 门禁守住 104 份皮肤的标记齐全——漏一份，那个组件就退回静默失效，
而且探测器还一声不吭。`pnpm gate` 十九项 → 二十项。
