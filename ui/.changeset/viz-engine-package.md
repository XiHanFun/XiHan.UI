---
'@xihan-ui/viz': minor
---

新增 `@xihan-ui/viz`：图表引擎包，零运行时依赖、import 无副作用、不碰 DOM。比例尺、刻度、形状、坐标轴布局、拾取与降采样都以纯函数提供，工厂返回冻结对象。

- 非法输入立即抛 `VizError`，`code` 以 `XH_VIZ_` 开头，`detail` 带着出问题的原始输入；`isVizError` 在重复安装时也能认出同形错误。
- `@xihan-ui/headless` 与三个适配器把它列进 `dependencies`，安装适配器时一并装上，不需要单独安装。
