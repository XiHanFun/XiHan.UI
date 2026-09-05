# 代码着色

`@xihan-ui/code-highlight` 是 `HighlighterPort` 的自研实现：**粗粒度**词法着色，零第三方依赖。

```ts
import { createHighlighter } from '@xihan-ui/code-highlight'

const highlighter = createHighlighter()
```

把它交给[代码视图](../components/code-view)组件的 `highlighter` prop 即可。组件本身不认任何具体的着色器——它只认这个端口。

## 装不装它

它是两个适配器的**可选 peer**，不随适配器一起来：

```bash
pnpm add @xihan-ui/code-highlight
```

装了它，[代码视图](../components/code-view)自动着色，`highlighter` prop 一个字都不用写；不装，代码视图渲纯文本，不报错。要换成别的实现（典型是接 Shiki），照旧走 `highlighter` prop。

## 它分得出什么，分不出什么

只分五类：**注释、字符串、数字、关键字、标点**。

类型名、函数名、属性名这些要靠语法树才分得出的东西**一概不分**——那是 TextMate 语法那一档的活，本实现不追它。所以同一段代码在这里和在编辑器里看不会完全一样，这是预期内的。

认不出的语言、超长代码一律返回 `null`，由调用方原样渲染纯文本。**没有着色不等于坏了**，这是设计上的降级路径。

## 想要更高精度就换一个

`highlighter` 是一个端口，不是一个实现。把 Shiki、Prism 或别的着色器包成同一个形状接上去，组件侧一个字都不用改：

```ts
interface HighlighterPort {
  highlight: (code: string, lang: string) => readonly CodeToken[] | null
}
```

这条端口存在的理由就是这个：**库不替你决定要不要为语法高亮付那几百 kB**。默认给一个够用又不要钱的，想升级随时换。

## 为什么不直接内置 Shiki

Shiki 要带 TextMate 语法与主题数据，体积在几百 kB 量级，且需要异步加载。对一个"文档里偶尔出现一段代码"的场景，这个代价不成比例。而对真的在做代码编辑器的人来说，粗粒度着色又肯定不够——两边都不该被库替他们决定。端口是唯一能同时满足两边的形态。

## 支持哪些语言

`langSpecOf(lang)` 认得的语言就是支持的。传进去认不出的标注返回 `null`，代码原样渲染。

流式场景要配合 `complete` 用：未闭合的代码随时会变，着色是纯计算但不是免费的，等闭合了再上一次更划算。[代码视图](../components/code-view)组件的 `highlightWhileStreaming` 就是这个开关。

## 长度上限

超过 `HIGHLIGHT_MAX_LENGTH` 的代码直接返回 `null`。着色是同步的，超长输入会阻塞主线程，与其卡住不如不着色。这个常量是导出的，可以读但改不了——要处理超长代码，那本来就该是 worker 里的活。
