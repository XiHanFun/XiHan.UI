---
'@xihan-ui/styles': minor
---

主入口 `.`（与 `./index.css`）改为一份生成的扁平有层文件：Action Control / Field Chrome / Collection Item / Swatch 四份家族配方与共享关键帧在 focus / label / description / pointer 四份公共层之后只内联一次、排在一切组件皮肤之前，各皮肤随后按源序内联并剥掉自带的 `@import '../family/*.css'`；`@layer` 结构原样保留，除令牌那一条外不再有 `@import`。引入顺序的真源改为不发布的 `index.source.css`，`index.unlayered.css` 由同一源序生成，内容不变。

此前每份皮肤文件头各自 `@import` 家族、主入口再逐个 `@import` 皮肤，不去重 `@import` 的打包器（如 `@tailwindcss/vite` 自带的内联器）会把 Action Control 复制 65 份、Collection Item 69 份，产物翻倍，且有副本排在皮肤之后、反超皮肤对家族的覆盖。现在引用图里家族只有一份，与打包器无关：不去重展开的主入口从 4.9 MB 降到 2.0 MB。

消费方注意：

- 只 `import '@xihan-ui/styles'` 的项目无需改动，产物形态变化只在体积与家族出现次数上可见。
- 单皮肤子路径（`./button.css` 等）仍可独立使用，文件头仍自带家族 `@import`；混用多份单皮肤时每份各带一份家族，不去重 `@import` 的打包器会复制多份，引入的皮肤超过几份时改用主入口。
- 按需过滤顺序时，以 `index.css` 里 `/* styles/xxx.css */` 段标记的顺序为准。
