# 服务与运行时

组件册收录有解剖、有部件、可放置在页面上的组件。另有一类能力不是组件，却同样由本库对外提供：应用级配置、一次调用即弹出的对话框、把流式文本转换为节点的内核、模板里写公式与条件用的表达式语言、画布式设计器共用的编辑内核、把表格写成 Excel 文件的写出器。它们没有 `data-part`，因此不进入组件册，本册收录这些能力。

| 本册 | 内容 | 对应的包 |
| --- | --- | --- |
| [全局配置](./config) | 应用级注入一次，语言与内建文案的默认值 | `@xihan-ui/vue` |
| [命令式服务](./services) | `confirm()` / `notify.success()` 这类一次调用即出结果的入口 | `@xihan-ui/vue` |
| [流式 Markdown](./markdown) | 传入截至当前的全文，返回一组带稳定 key 的已渲染块 | `@xihan-ui/markdown` |
| [代码着色](./code-highlight) | 零依赖的粗粒度词法着色，也是一个可替换的端口 | `@xihan-ui/code-highlight` |
| [受限表达式](./expression) | 公式与条件解析成可序列化的语法树，静态检查后按十进制确定性求值 | `@xihan-ui/expression` |
| [设计器内核](./designer-kit) | 撤销重做历史栈、按路径的编辑操作、视口平移缩放、对齐吸附与参考线、对齐分布与框选、文档内唯一 id | `@xihan-ui/designer-kit` |
| [表格导出](./xlsx) | 带类型的单元格、数字与日期格式、合并单元格与冻结窗格，零依赖写成 xlsx | `@xihan-ui/xlsx` |

## 不在组件册中的原因

组件册每一页固定给出解剖、部件、状态机、connect API 与键盘规格，因为组件的契约即这几项。本册各项均不适用：全局配置是一个 provide 函数，命令式服务返回一个对象，Markdown 渲染器、表达式求值、设计器内核与 xlsx 写出产出数据而不是 DOM。放入组件册只会使该册的页内结构失去意义。

但能力清单应当完整。按其他组件库的习惯查找对应能力时（Element Plus 的 `ElMessageBox`、Ant Design 的 `App.useApp()`、Naive UI 的 `useDialog`、Semi Design 的 Markdown 渲染器），它们在本册，不在组件册。
