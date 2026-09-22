# @xihan-ui/code-highlight

## 2.0.0

### Major Changes

- 19570ad: **移除** 25 条从未打算公开的子路径导出。

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

- c8790c8: **`@xihan-ui/kernel`、`@xihan-ui/machine`、`@xihan-ui/behavior` 三个包合并成 `@xihan-ui/core`。三个旧包名不再发布，也没有转发包。**

  三者原本是一条严格的链（`machine` 依赖 `kernel`，`behavior` 依赖 `kernel` 与 `motion`），从不单独安装：装了任意一个适配器就三个一起来。分成三个包对使用者没有取舍空间，只多出两份包名、两份版本号与两份 README。合并之后公开包从 18 个减到 16 个。

  **导出的名字一个都没有变。** 原先从三个包里导出的东西现在全部从 `@xihan-ui/core` 的主入口导出，签名与行为不变。两处例外：

  - `Dict` 本来就是结构原语那一段的类型，状态机那一段只是转手再导出一遍，现在只剩一处定义。
  - 锁步版本不一致那条诊断（`core.version-mismatch`）的 `detail` 字段由 `kernelVersion` 改名为 `coreVersion`，播报文案里的包名同步改口。读这条诊断做分流的要跟着改字段名。

  ## 包名怎么改

  | 从前                 | 现在             |
  | -------------------- | ---------------- |
  | `@xihan-ui/kernel`   | `@xihan-ui/core` |
  | `@xihan-ui/machine`  | `@xihan-ui/core` |
  | `@xihan-ui/behavior` | `@xihan-ui/core` |

  同一个文件里如果原来从两个或三个旧包各引一行，合并之后是同一个模块说明符，按自己的 lint 规则并成一行即可。

  ## 子路径怎么改

  子入口一条不少，名字原样平移：

  | 从前                          | 现在                        |
  | ----------------------------- | --------------------------- |
  | `@xihan-ui/kernel/metadata`   | `@xihan-ui/core/metadata`   |
  | `@xihan-ui/kernel/skin-check` | `@xihan-ui/core/skin-check` |
  | `@xihan-ui/kernel/vite`       | `@xihan-ui/core/vite`       |
  | `@xihan-ui/machine/vanilla`   | `@xihan-ui/core/vanilla`    |
  | `@xihan-ui/behavior/presence` | `@xihan-ui/core/presence`   |

  ## 依赖怎么改

  `package.json` 里把三个旧包名删掉，换成一条 `@xihan-ui/core`。装适配器的使用者不用动：`@xihan-ui/vue` 与 `@xihan-ui/web-components` 已经改成依赖 `@xihan-ui/core`，升级适配器就一并带过来。

- c8790c8: **`@xihan-ui/code-highlight` 从适配器的硬依赖改成可选 peer，包也从 `engine` 组挪到 `features` 组。包名没变。**

  它只服务代码视图一个组件，装了适配器的人有九成用不上它。改成可选 peer 之后，要不要为着色付出这份体积由使用者定，不再由库替他决定。包所在的组跟着这条判据走：`engine` 是「使用者做不了取舍的」，`features` 是「你不点头它就不来」。

  ## 使用者要做什么

  **要着色**——单独装上它，其余不用动，代码视图照旧自动着色，`highlighter` prop 一个字都不用写：

  ```bash
  pnpm add @xihan-ui/code-highlight
  ```

  **不要着色**——什么都不用做。代码视图渲纯文本：行号、折叠、换行、高亮行照旧，只是不上色。**没装它不是错误**，控制台不会报错，也不会抛异常。

  **接的是别的着色器**（Shiki 之类）——什么都不用做，本来走的就是 `highlighter` prop。

  直接 `import { createHighlighter } from '@xihan-ui/code-highlight'` 的代码不受影响，导出的名字一个都没有变。

  ## 顺带

  适配器对它的引用改成了动态引入：可选 peer 却在主入口静态 import，等于把「可选」写成谎话——使用者不装它，模块解析就地报错。现在它是在组件首次用到时才去取，取不到就保持不着色。因此**着色比首帧晚一拍到达**：先渲纯文本，实现落位后重渲一次并上色。

### Patch Changes

- Updated dependencies [bdf4028]
- Updated dependencies [c7966d3]
- Updated dependencies [9658294]
- Updated dependencies [f070bb8]
- Updated dependencies [249819e]
- Updated dependencies [589d192]
- Updated dependencies [7e512dc]
- Updated dependencies [09a1a45]
- Updated dependencies [2dd6293]
- Updated dependencies [d822ffd]
- Updated dependencies [3116bd3]
- Updated dependencies [b23b40a]
- Updated dependencies [19570ad]
- Updated dependencies [f0a2e34]
- Updated dependencies [19570ad]
- Updated dependencies [ce5d75a]
- Updated dependencies [d5576cb]
- Updated dependencies [9bf22c1]
- Updated dependencies [147daa4]
- Updated dependencies [ffe0797]
- Updated dependencies [add5b79]
- Updated dependencies [1540cc1]
- Updated dependencies [8b4d452]
- Updated dependencies [5982974]
- Updated dependencies [3577e4c]
- Updated dependencies [ab984e8]
- Updated dependencies [7640d5c]
- Updated dependencies [8e8d953]
- Updated dependencies [21b006a]
- Updated dependencies [bd67168]
- Updated dependencies [48d6b88]
- Updated dependencies [0d35f1a]
- Updated dependencies [ed347e1]
- Updated dependencies [db52f9b]
- Updated dependencies [1042c06]
- Updated dependencies [c8790c8]
- Updated dependencies [3f9c145]
- Updated dependencies [1f472ba]
- Updated dependencies [fc0ecaf]
- Updated dependencies [963fe2c]
- Updated dependencies [eabcc37]
- Updated dependencies [07e29f9]
- Updated dependencies [c544218]
- Updated dependencies [b991bb5]
- Updated dependencies [ff3593c]
- Updated dependencies [95ebc66]
- Updated dependencies [4babe65]
- Updated dependencies [80e6fdf]
- Updated dependencies [f45e0f7]
- Updated dependencies [5397ae3]
- Updated dependencies [82b5de5]
- Updated dependencies [842da07]
- Updated dependencies [a15f0f3]
- Updated dependencies [7f77bdd]
- Updated dependencies [00bca80]
- Updated dependencies [30a811b]
- Updated dependencies [d366e45]
- Updated dependencies [9c32ad7]
- Updated dependencies [33c6805]
  - @xihan-ui/core@2.0.0

## 1.1.0

### Patch Changes

- Updated dependencies [03fb633]
  - @xihan-ui/kernel@1.1.0

## 1.0.0

### Major Changes

- bc65cb7: 首个公开版本：框架无关的 UI 基座。

  自研薄 FSM 内核 + headless（anatomy / machine / connect）+ 设计令牌与主题运行时 + 样式层，
  102 个组件在 Vue 与 Web Components 两套适配器上共用同一份内核，跨适配器一致性套件与
  真实 Chromium 里的无障碍扫描、浮层定位契约全绿。

  浮层定位、虚拟滚动、Web Components 响应式基类、代码着色、流式 Markdown 均为自研，
  运行时不带第三方依赖。

### Minor Changes

- 4b949c2: 摇树第一次真的生效：只用一个组件不再拖来整个库。

  此前七个库包都是单入口打包，500+ 模块被摊平进一份 `dist/index.js`，`sideEffects: false` 随之失效——
  使用者只 `import { XhBadge }`，打出来的东西和全量 barrel 一样大。

  产物改为保留模块结构（每个源文件一份产物），实测（esbuild 打真实 dist，gzip）：

  | 用例                | 改前      | 改后         |
  | ------------------- | --------- | ------------ |
  | 只用 `XhBadge`      | 168,947 B | **538 B**    |
  | 只用 `XhButton`     | 168,947 B | **1,029 B**  |
  | 只用 `XhDialogRoot` | 168,947 B | **11,374 B** |
  | 全量 barrel         | 173,005 B | 178,768 B    |

  单组件占全量从 **97.7% 降到 0.3%**。全量 barrel 略涨 3%，是模块边界不再被合并的代价，值得。

  **判据补上了此前没有的分辨力。** `.size-limit.json` 原有 18 条全是整包 barrel，改回单入口不会让任何
  一条变红。新增三条带 `import` 字段的按组件预算（badge / button / dialog），退回打包形态时它们会
  立刻超标一个数量级。

  顺带修掉两处被这次改动照出来的既有缺陷：

  - **公开面基线虚高 81 个名字。** `build-public-surface.mjs` 抽类型名的正则里 `export` 是可选的，
    于是把打包版 d.ts 里那些**没有导出**的内部类型别名（`AccordionProps` 这类局部别名共 72 个）也算
    成了受 semver 约束的公开名。实测确认它们从来就 import 不到（`TS2305: has no exported member`）。
    正则补上 `export`，基线随之收敛。
  - **文档生成器只认 `declare`。** 拆包后 barrel 里不再有 `declare`，导致 102 页组件文档的
    「Vue 组件」整列凭空消失。改成 import 与 export 两种形态都收。

  新增一个公开类型 `TweenEasing`：`NumberAnimationEasing` 本就是它的别名，拆包后别名要能被命名，
  这一支就必须公开。

### Patch Changes

- Updated dependencies [e73b671]
- Updated dependencies [d0202b2]
- Updated dependencies [7da1272]
- Updated dependencies [bc65cb7]
- Updated dependencies [ed01a81]
- Updated dependencies [84b1aa3]
- Updated dependencies [a321a50]
- Updated dependencies
- Updated dependencies [8d35702]
- Updated dependencies [239eb5d]
- Updated dependencies [89d8c54]
- Updated dependencies [516bd46]
- Updated dependencies [24721f4]
- Updated dependencies [9548330]
- Updated dependencies [7a5d898]
- Updated dependencies [4b949c2]
  - @xihan-ui/kernel@1.0.0

## 1.0.0-preview.0

### Patch Changes

- Updated dependencies [e73b671]
  - @xihan-ui/kernel@1.0.0-preview.0

## 1.0.0-alpha.3

### Patch Changes

- Updated dependencies [d0202b2]
- Updated dependencies [7da1272]
- Updated dependencies [ed01a81]
- Updated dependencies [a321a50]
- Updated dependencies [8d35702]
- Updated dependencies [516bd46]
- Updated dependencies [9548330]
  - @xihan-ui/kernel@1.0.0-alpha.3

## 1.0.0-alpha.2

### Patch Changes

- Updated dependencies [7a5d898]
  - @xihan-ui/kernel@1.0.0-alpha.2

## 1.0.0-alpha.1

### Minor Changes

- 4b949c2: 摇树第一次真的生效：只用一个组件不再拖来整个库。

  此前七个库包都是单入口打包，500+ 模块被摊平进一份 `dist/index.js`，`sideEffects: false` 随之失效——
  使用者只 `import { XhBadge }`，打出来的东西和全量 barrel 一样大。

  产物改为保留模块结构（每个源文件一份产物），实测（esbuild 打真实 dist，gzip）：

  | 用例                | 改前      | 改后         |
  | ------------------- | --------- | ------------ |
  | 只用 `XhBadge`      | 168,947 B | **538 B**    |
  | 只用 `XhButton`     | 168,947 B | **1,029 B**  |
  | 只用 `XhDialogRoot` | 168,947 B | **11,374 B** |
  | 全量 barrel         | 173,005 B | 178,768 B    |

  单组件占全量从 **97.7% 降到 0.3%**。全量 barrel 略涨 3%，是模块边界不再被合并的代价，值得。

  **判据补上了此前没有的分辨力。** `.size-limit.json` 原有 18 条全是整包 barrel，改回单入口不会让任何
  一条变红。新增三条带 `import` 字段的按组件预算（badge / button / dialog），退回打包形态时它们会
  立刻超标一个数量级。

  顺带修掉两处被这次改动照出来的既有缺陷：

  - **公开面基线虚高 81 个名字。** `build-public-surface.mjs` 抽类型名的正则里 `export` 是可选的，
    于是把打包版 d.ts 里那些**没有导出**的内部类型别名（`AccordionProps` 这类局部别名共 72 个）也算
    成了受 semver 约束的公开名。实测确认它们从来就 import 不到（`TS2305: has no exported member`）。
    正则补上 `export`，基线随之收敛。
  - **文档生成器只认 `declare`。** 拆包后 barrel 里不再有 `declare`，导致 102 页组件文档的
    「Vue 组件」整列凭空消失。改成 import 与 export 两种形态都收。

  新增一个公开类型 `TweenEasing`：`NumberAnimationEasing` 本就是它的别名，拆包后别名要能被命名，
  这一支就必须公开。

### Patch Changes

- Updated dependencies [239eb5d]
- Updated dependencies [89d8c54]
- Updated dependencies [24721f4]
- Updated dependencies [4b949c2]
  - @xihan-ui/kernel@1.0.0-alpha.1

## 1.0.0-alpha.0

### Major Changes

- bc65cb7: 首个公开版本：框架无关的 UI 基座。

  自研薄 FSM 内核 + headless（anatomy / machine / connect）+ 设计令牌与主题运行时 + 样式层，
  102 个组件在 Vue 与 Web Components 两套适配器上共用同一份内核，跨适配器一致性套件与
  真实 Chromium 里的无障碍扫描、浮层定位契约全绿。

  浮层定位、虚拟滚动、Web Components 响应式基类、代码着色、流式 Markdown 均为自研，
  运行时不带第三方依赖。

### Patch Changes

- Updated dependencies [bc65cb7]
- Updated dependencies [84b1aa3]
  - @xihan-ui/kernel@1.0.0-alpha.0
