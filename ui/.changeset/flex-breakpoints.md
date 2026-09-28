---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

Flex 的 `orientation`、`align`、`justify`、`gap` 接受断点对象 `{ base, sm, md, lg, xl }`，与 Grid 同一套档位按视口逐档接管，逐档落 `data-orientation-<档>` / `data-align-<档>` / `data-justify-<档>` / `data-gap-<档>`；Web Components 在特性上写 JSON 对象，写坏了当没写。换档时交叉轴的缺省对齐跟着当档的方向走（竖排拉伸、横排居中），作者显式写的对齐不被换掉：皮肤改由两个私有槽承载对齐，计算结果与此前一致。Headless 新增 `FlexBreakpoint`、`FlexByBreakpoint`、`FlexResponsive`、`FlexTierName`、`FLEX_TIER_NAMES` 与 `normalizeFlexTier`。flex.css 的体积基线随逐档规则上调。
