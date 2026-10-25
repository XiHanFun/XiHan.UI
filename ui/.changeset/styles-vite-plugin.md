---
'@xihan-ui/styles': minor
---

**新增** `@xihan-ui/styles/vite`：按用到的组件自动注入皮肤的 Vite 插件。`plugins: [XiHanUIStyles()]` 之后在应用入口写 `import 'virtual:xihan-ui/styles'`，插件扫描源码里写到的组件（`XhButton`、`XhSelectRoot` 这类导出名与 `<xh-button>` 这类标签都认），注入层序、令牌、reset、公共层（focus / label / description / pointer）、家族配方与这些组件的皮肤；组件内部借来的组件（分页里的每页条数下拉、日期选择器里的日历）一并补上。先后取自全量入口里各文件真正落下的顺序，注入的就是 `index.css` 的子集，渲染与全量引入一致。扫描范围默认 `index.html` 与 `src/`，`scan`、`include`、`exclude` 可调；开发态默认挂漏引探测（`skinCheck`），页面上出现了没注入皮肤的组件就在控制台给出补法。插件不依赖 vite 的类型包；令牌整份内联，应用不必能解析到样式包的传递依赖。另导出 `composeStyles`、`scopesIn` 与 `readStyleManifest`，包里新增随构建生成的 `dist/manifest.json`。

手工按组件引入时，安装文档的示例补上了 reset 与四份公共层：只引组件皮肤时库的聚焦环不在场，键盘聚焦时只剩浏览器缺省的那圈。
