---
"@xihan-ui/core": major
"@xihan-ui/position": major
"@xihan-ui/code-highlight": major
---

**移除** 25 条从未打算公开的子路径导出。

这五个包用 `unbundle` 构建，产物按源文件逐个切块；exports 是构建后按 `dist/` 里的产物回写的，于是内部块被一并写成了公开子入口——它们不在任何一个包的 tsdown 入口表里，漏出与否只取决于源文件在不在 `src/` 根目录。被删的是：

- `@xihan-ui/kernel`：`./anatomy` `./attrs` `./compose` `./constants` `./guards` `./id-generator` `./locale` `./merge-props` `./normalize-props` `./runtime-config` `./scope` `./types`
- `@xihan-ui/machine`：`./create-machine` `./delay` `./errors` `./form-reset` `./guards` `./service` `./setup` `./state` `./transitions`
- `@xihan-ui/behavior`：`./dispatch`
- `@xihan-ui/position`：`./compute`
- `@xihan-ui/code-highlight`：`./languages` `./tokenize`

留下的是各包 tsdown 显式声明的入口：kernel 的 `.` `./metadata` `./skin-check` `./vite`、machine 的 `.` `./vanilla`、behavior 的 `.` `./presence`，position 与 code-highlight 只剩 `.`。

**迁移**：这些子路径暴露的名字主入口全都有，把 `import { x } from '@xihan-ui/kernel/anatomy'` 改成 `import { x } from '@xihan-ui/core'` 即可，按需引入靠 tree-shaking。

**新增** `@xihan-ui/machine` 主入口再导出类型 `Setup`。它是公开函数 `setup()` 的返回类型，此前只能从 `@xihan-ui/machine/setup` 拿到；随该子路径一起消失的话，`setup()` 的结果就写不出类型标注了。

生成 exports 的脚本同时改了判据：只有 tsdown 入口表里声明的名字才写进 exports，不再按 `dist/` 里「有 .js 也有 .d.ts」推导——内部块开着类型生成时同样两样都有，旧判据挡不住。
