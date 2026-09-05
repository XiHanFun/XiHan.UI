---
"@xihan-ui/core": major
"@xihan-ui/headless": major
"@xihan-ui/position": major
"@xihan-ui/code-highlight": major
"@xihan-ui/animations": major
"@xihan-ui/backgrounds": major
"@xihan-ui/chat-stream": major
"@xihan-ui/sound": major
"@xihan-ui/vue": major
"@xihan-ui/web-components": major
---

**`@xihan-ui/kernel`、`@xihan-ui/machine`、`@xihan-ui/behavior` 三个包合并成 `@xihan-ui/core`。三个旧包名不再发布，也没有转发包。**

三者原本是一条严格的链（`machine` 依赖 `kernel`，`behavior` 依赖 `kernel` 与 `motion`），从不单独安装：装了任意一个适配器就三个一起来。分成三个包对使用者没有取舍空间，只多出两份包名、两份版本号与两份 README。合并之后公开包从 18 个减到 16 个。

**导出的名字一个都没有变。** 原先从三个包里导出的东西现在全部从 `@xihan-ui/core` 的主入口导出，签名与行为不变。两处例外：

- `Dict` 本来就是结构原语那一段的类型，状态机那一段只是转手再导出一遍，现在只剩一处定义。
- 锁步版本不一致那条诊断（`core.version-mismatch`）的 `detail` 字段由 `kernelVersion` 改名为 `coreVersion`，播报文案里的包名同步改口。读这条诊断做分流的要跟着改字段名。

## 包名怎么改

| 从前 | 现在 |
| --- | --- |
| `@xihan-ui/kernel` | `@xihan-ui/core` |
| `@xihan-ui/machine` | `@xihan-ui/core` |
| `@xihan-ui/behavior` | `@xihan-ui/core` |

同一个文件里如果原来从两个或三个旧包各引一行，合并之后是同一个模块说明符，按自己的 lint 规则并成一行即可。

## 子路径怎么改

子入口一条不少，名字原样平移：

| 从前 | 现在 |
| --- | --- |
| `@xihan-ui/kernel/metadata` | `@xihan-ui/core/metadata` |
| `@xihan-ui/kernel/skin-check` | `@xihan-ui/core/skin-check` |
| `@xihan-ui/kernel/vite` | `@xihan-ui/core/vite` |
| `@xihan-ui/machine/vanilla` | `@xihan-ui/core/vanilla` |
| `@xihan-ui/behavior/presence` | `@xihan-ui/core/presence` |

## 依赖怎么改

`package.json` 里把三个旧包名删掉，换成一条 `@xihan-ui/core`。装适配器的使用者不用动：`@xihan-ui/vue` 与 `@xihan-ui/web-components` 已经改成依赖 `@xihan-ui/core`，升级适配器就一并带过来。
