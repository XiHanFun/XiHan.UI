---
"@xihan-ui/styles": patch
---

**修容器根在 flex 项里塌成零宽。**

上一批给 `descriptions` / `diff-view` / `transfer` / `timeline` 四个根写了 `container-type: inline-size`，代价是它们不再由内容撑宽。当时量过「库内的三种正常外层（块级父、`flex: 1`、grid `1fr`）都无变化」，就此放行——**漏了一种，而且是库自己天天在用的那一种**：文档站的示例台是 `display: flex; flex-wrap: wrap`，每个示例根都是没写 `flex-basis` 的 flex 项。

结果是这四个组件在自家文档站上全塌了：`descriptions` 根宽 12px、`timeline` 0px、`transfer` 24px。页面上看是每个字占一行、时间轴整条不见、穿梭框两块面板按自然宽挂在根外面且一律竖排。

四个根补上行内轴填充（`inline-size` 依次给 `-moz-available` / `-webkit-fill-available` / `stretch`，各引擎取自己认的那条）。实测：示例台那种 flex 项从 12px 回到 860px，**普通块流下 860 → 860 一像素没动**，不换行 flex 行里两个并列从 12/12 回到 424/424。

还剩一档填不住：外层自己就是收缩包裹的（`inline-block`、浮动、表格单元格）时，填满它等于填满零。这是容器查询的固有代价，指南里写清了避开写法。

原先那条「塌宽确实会发生」的用例正是为这一天写的——它写着「谁要是给根补兜底把塌宽盖掉，这条就判红」，这次就是它判的红。现在改成钉住两档：flex 项铺满、`inline-block` 仍塌。
