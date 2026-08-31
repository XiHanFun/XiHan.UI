# packages/ 的四个角色组

目录名回答的不是「这段代码属于哪一层」，而是**「这个包跟使用者是什么关系」**。

```
packages/
  adapters/   vue  web-components                                   ← 你选一个
  design/     tokens  styles  icons                                 ← 你的外观
  features/   markdown  chat-stream  backgrounds  sound  animations ← 按需自选
  engine/     kernel  machine  motion  pointer  behavior  position  code-highlight  headless   ← 你不用管
```

## 入组判据

判据落在**「这个包怎么到达使用者手里」**上，不落在依赖图的形状上。这一条能机检，
`tooling/scripts/check-package-roles.mjs` 每次 `pnpm gate` 都会验一遍。

| 组 | 判据 | 使用者视角 |
| --- | --- | --- |
| `adapters/` | 有框架 peer 依赖（`vue`）或注册自定义元素 | 渲染目标，选一个 |
| `engine/` | **每个适配器的硬依赖** | 装了适配器就自动拿到，做不了取舍 |
| `features/` | **没有任何适配器硬依赖它**（可选 peer 或谁都不依赖） | 你不点头它就不来 |
| `design/` | 纯视觉资产，谁都不硬依赖 | 显式安装的外观层 |

`engine` 与 `features` 的界线就是这一条：**强制来的 vs 你选的**。

这条界线是刻意选的，因为它和组名的字面意思一致。反过来，如果按「只有 `headless`
依赖的才算 engine」来分，`position` 会被推进 `features`——而 `features` 的意思是
「按需自选」，可 `position` 是每个适配器的硬依赖，使用者躲不掉。把一个强制传递依赖
放进「按需自选」是主动误导，所以那条判据不采用。

## 新增一个包时

1. 先问「使用者是被动拿到它，还是主动装它」——这决定 `engine` 还是 `features`
2. 落进四组之一。`pnpm-workspace.yaml` 的 glob 是 `packages/*/*`，散在 `packages/` 根下的包不会被工作区收录
3. 补 `tooling/eslint-config/src/layers.json`。这张表与 `packages/` 必须逐个对上，
   多一个少一个都会被 `pnpm boundaries` 抛错（不是报绿，见该文件里的说明）
4. 跑 `pnpm gate`，`check-package-roles` 会验它的到达方式与所在组是否自洽

## 几条容易踩的

**归属跟着设计决定走，不跟着口味走。** `code-highlight` 今天在 `engine`，因为它是两个
适配器的硬依赖。哪天把它改成可选 peer（只有 `code-block` 一个组件用它，摇树角度有理由
这么做），它就自动该去 `features`——规则决定，不必重新讨论一次。

**`engine` 不是「底层的东西」。** 它是「使用者做不了取舍的东西」。`headless` 的 124 个
组件在 `engine` 里，不是因为它底层，是因为装了适配器就一定有它。

**`design/styles` 里的 CSS 在 `css/` 子目录下。** 对使用者不可见——`exports` 映射把
`./button.css` 指到 `./css/button.css`，内层目录名随时可改。

**不按组件拆包。** 反向教训明确：Chakra v3 把约 70 个细粒度包收敛成一个，
Radix 2025-01 补发单包消化细拆后遗症。124 个组件共享同一套机器，拆了每个适配器都得
复制一份逻辑。同理，`behavior` 里的 `focus-scope` / `collection`、`kernel` 里的 `a11y`
都不单独成包——它们各自两三百行，独立成包换来的只是一套 package.json 的维护成本。
