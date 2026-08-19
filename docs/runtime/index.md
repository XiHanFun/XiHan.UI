# 服务与运行时

组件册收的是**有解剖、有部件、能摆在页面上**的东西。还有一类东西不是组件，却同样是这个库对外提供的能力：应用级的一份配置、一次调用就弹出来的对话框、一套把流式文本变成节点的内核。它们没有 `data-part`，所以进不了组件册，但你确实会用到——本册就是收这些的。

| 这一册 | 是什么 | 对应的包 |
| --- | --- | --- |
| [全局配置](./config) | 应用级注入一次，语言与内建文案的默认值 | `@xihan-ui/vue` |
| [命令式服务](./services) | `confirm()` / `toast.success()` 这种一次调用就出结果的入口 | `@xihan-ui/vue` |
| [流式 Markdown](./markdown) | 喂截至当前的全文，拿回一组带稳定 key 的已渲染块 | `@xihan-ui/markdown` |
| [代码着色](./code-highlight) | 零依赖的粗粒度词法着色，也是一个可替换的端口 | `@xihan-ui/code-highlight` |

## 为什么它们不在组件册里

组件册每一页固定给出解剖、部件、状态机、connect API 与键盘规格，因为组件的契约就是这几样。这四样东西一样都套不上：全局配置是一个 provide 函数，命令式服务返回的是一个对象，Markdown 渲染器产出的是数据而不是 DOM。硬塞进组件册只会让那册的页内结构失去意义。

但**能力清单**该是完整的。如果你是照着别的组件库的心智来找东西的——Element Plus 的 `ElMessageBox`、Ant Design 的 `App.useApp()`、Naive UI 的 `useDialog`、Semi Design 的 Markdown 渲染器——它们在这里，不在组件册。
