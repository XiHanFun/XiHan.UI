---
'@xihan-ui/web-components': minor
---

`@xihan-ui/web-components/define` 补齐全部元素类的导出（此前缺 `XhAffixElement`、`XhAvatarGroupElement`、`XhBackTopElement`、`XhButtonGroupElement`、`XhCardElement`、`XhDescriptionsElement`、`XhFieldArrayElement`、`XhFlexElement`、`XhFloatButtonElement`、`XhGridElement`、`XhHighlightElement`、`XhInfiniteScrollElement`、`XhLayoutElement`、`XhListElement`、`XhLogElement`、`XhMarqueeElement`、`XhMatrixCodeElement`、`XhMentionElement`、`XhNumberAnimationElement`、`XhPageHeaderElement`、`XhPopconfirmElement`、`XhStatisticElement`、`XhTimelineElement`、`XhTimestampElement`、`XhTruncateElement`、`XhTypographyElement`、`XhWatermarkElement`），并新增按需注册：

```ts
import { defineXhElement, XhStatisticElement } from '@xihan-ui/web-components/define'

defineXhElement('xh-statistic', XhStatisticElement)
```

`defineXhElement` 与 `defineXhElements` 走同一张注册表，幂等与冲突规则相同；标签与元素类由新导出的类型 `XhElementTagMap` 约束。
