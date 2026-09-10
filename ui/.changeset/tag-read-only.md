---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/react": minor
"@xihan-ui/web-components": minor
---

**`tag` 新增 `readOnly`：只锁关闭钮，标签本身不置灰；新导出 `tagVariantForControl`。**

从前 `tag` 表达「摘不掉」只有两条路：`closable=false` 把关闭钮连同位置一起收起（标签宽度跳变），`disabled` 把整枚标签置灰。宿主整体只读时要的是第三种——叉留在原地但按不动、标签本身照常——`tag` 表达不了，套 `tag` 的宿主只能各自再画一颗钮。

- **`readOnly`**（Vue / React 同名 prop，Web Components 写 `read-only` 属性）：关闭钮留在原位、带原生 `disabled` 与 `data-disabled`，不打 `hidden`；`root` 不新发任何属性，`data-disabled` 仍只由 `disabled` 决定，皮肤里禁用那一档的置灰不会误伤只读标签。`readOnly` 与 `disabled` 同时在时按禁用那一副画。直接派 click 不收标签、不发 `open-change`，机器路与不建机器的快路同一条规矩。皮肤不改：关闭钮的 `:disabled` 已画成置灰色，光标由公共层给 `not-allowed`。
- **`tagVariantForControl(variant)`**：控件面到标签形态的映射，`subtle` 的面上摆描边标签、`outline` / `ghost` / 缺省的面上摆淡底标签。此前是 `select` 连接层里的私有函数，套 `tag` 的控件类宿主都要这一份，改从 `tag` 导出。

判据：headless `tag.spec` 加 5 条（只读的机器路与快路、撤销只读当场解禁、形态映射四个入参）；三侧一致性套件加「readOnly：关闭钮留在原位但禁用，root 不打 data-disabled，直接派 click 也不收标签」；Vue 快路 `tag-static-path.spec` 加 1 条；浏览器态新增 `tag-read-only-skin.spec`（三档形态 × 只读 / 禁用：宽高不跳、只读的底与字与常态逐字相同、禁用退成置灰、只读的叉悬停不换底）。文档站示例新增「只读」一份。
