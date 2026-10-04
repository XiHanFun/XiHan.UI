---
'@xihan-ui/headless': minor
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

两处缺省取自实例数据的文案改为实例内容优先，全局配置里的 `translations`（包括内建语言包）不再盖掉它们：

- CartesianChart 数据表的列名先取轴标题：x 轴写了 `title` 时首列就叫这个名字，`translations.keyLabel` 只在轴没有标题时使用；含散点时的数值列同理，先取 y 轴标题，再用 `translations.valueLabel`。此前 `keyLabel` / `valueLabel` 一旦给出就压过轴标题，全局注入一份中文「类别」会把作者写的「月份」换掉。
- Heatmap 发散色阶的对照条两端恒写数值（中点减去 / 加上两侧最远距离），`translations.legendLow` / `legendHigh` 只换顺序色阶两端的词。此前两者给出时发散色阶两端也被换成「少 / 多」，读不出哪端是负。需要在发散色阶两端写别的字时，改写 `legend-label` 部件的内容。
