# @xihan-ui/highlight

`HighlighterPort` 的默认实现：**粗粒度**词法着色，零第三方运行时依赖。

```ts
import { createHighlighter } from '@xihan-ui/highlight'

createHighlighter().highlight('const x = 1', 'ts')
// [{ text: 'const', kind: 'keyword' }, { text: ' x = ', kind: 'plain' }, ...]
```

## 它做什么，不做什么

只分五类：注释、字符串、数字、关键字、标点。类型名、函数名、属性名这些**要靠语法树才分得出**
的东西一概不分——那是 TextMate 语法那一档的活，本实现不追它。

想要那个精度，把 Shiki 之类接到同一个端口上即可，组件侧一行不用改：

```vue
<XhCodeBlock :highlighter="myShikiAdapter" />
```

端口是同步的：连接层在渲染期求值，等不了 Promise。实现若要异步加载资产（Shiki 的 WASM
与语法文件就是），在就绪前返回 `null`、就绪后触发一次重渲即可——**不着色是合法结果，不是错误**。

## 边界

| 情况 | 结果 |
| --- | --- |
| 语言标注认不出来 | `null`，调用方渲纯文本 |
| 代码超过 10 万字符 | `null`，粗粒度着色的收益抵不过白扫一趟 |
| 字符串 / 注释没闭合 | 一路吃到结尾并保持自己的种类——半截代码不该因为引号还没配上就整段变色 |

## 保证

- **无损**：所有记号的 `text` 拼回去与原文逐字相等。这是最硬的一条，随机串与逐字符喂入都有用例守着。
- **线性**：单趟扫描、全程不回溯，耗时对长度线性。`"""...`、`/*/*/*...` 这类退化输入有专门的用例。

支持的语言见 `src/languages.ts`，按「AI 聊天里真会吐出来的语言」取，不求全。
