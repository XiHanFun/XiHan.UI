来源：https://ui.docs.xihanfun.com/runtime/code-highlight

# 代码着色

`@xihan-ui/code-highlight` 是 `HighlighterPort` 的自研实现：粗粒度词法着色，零第三方依赖。

```ts
import { createHighlighter } from "@xihan-ui/code-highlight";

const highlighter = createHighlighter();
```

把它交给[代码视图](../components/code-view)组件的 `highlighter` prop 即可。组件本身不识别任何具体的着色器，只识别这个端口。

## 是否安装

它是各适配器的可选 peer，不随适配器一起安装：

```bash
pnpm add @xihan-ui/code-highlight
```

安装后，[代码视图](../components/code-view)自动着色，不需要写 `highlighter` prop；不安装时代码视图渲染纯文本，不报错。换成其他实现（典型是接入 Shiki）同样通过 `highlighter` prop。

## 区分范围

只区分五类：注释、字符串、数字、关键字、标点。

类型名、函数名、属性名这类需要语法树才能区分的内容一概不分：那属于 TextMate 语法一档的工作，本实现不追求。因此同一段代码在这里与在编辑器中的显示不会完全相同，这是预期内的。

无法识别的语言、超长代码一律返回 `null`，由调用方原样渲染纯文本。没有着色不等于故障，这是设计上的降级路径。

## 更高精度时更换实现

`highlighter` 是一个端口，不是一个实现。把 Shiki、Prism 或其他着色器包装成同一个形状接入，组件侧不需修改：

```ts
interface HighlighterPort {
  highlight: (code: string, lang: string) => readonly CodeToken[] | null;
}
```

这条端口存在的理由：库不替使用方决定是否为语法高亮付出几百 kB 的体积。默认提供一个够用且无额外代价的实现，需要升级时随时更换。

## 不直接内置 Shiki 的原因

Shiki 需要携带 TextMate 语法与主题数据，体积在几百 kB 量级，且需要异步加载。对文档中偶尔出现一段代码的场景，这个代价不成比例。而对实际构建代码编辑器的使用方，粗粒度着色又不足够：两侧都不应由库代为决定。端口是唯一能同时满足两侧的形态。

## 支持的语言

`langSpecOf(lang)` 可识别的语言即受支持的语言。传入无法识别的标注返回 `null`，代码原样渲染。

流式场景需配合 `complete` 使用：未闭合的代码随时会变，着色是纯计算但有开销，等闭合后再执行一次更合理。[代码视图](../components/code-view)组件的 `highlightWhileStreaming` 即为该开关。

## 长度上限

超过 `HIGHLIGHT_MAX_LENGTH` 的代码直接返回 `null`。着色是同步的，超长输入会阻塞主线程，与其卡顿不如不着色。这个常量是导出的，可读但不可修改：处理超长代码本应在 worker 中进行。
