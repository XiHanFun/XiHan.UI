# 富文本模型

`@xihan-ui/core/rich-text` 是结构化的富文本：段落、标题、列表、分隔线与带样式的文字，整份是 JSON，不含 HTML。外来的 HTML 按白名单换成模型，模型再写回 HTML 或纯文字；按模型生成 DOM 在 `@xihan-ui/core/rich-text-dom`。打印设计器的富文本元素、表单的只读展示与报表的文字都用这一份模型。

```ts
import { checkRichTextDocument, parseRichTextHtml, serializeRichTextHtml } from "@xihan-ui/core/rich-text";
import { renderRichText } from "@xihan-ui/core/rich-text-dom";

const { document, dropped } = parseRichTextHtml("<p>你好，<strong>世界</strong></p><script>x()</script>");
// dropped: [{ kind: "content", name: "script", count: 1 }]

checkRichTextDocument(document); // []
container.replaceChildren(renderRichText(window.document, document));
serializeRichTextHtml(document); // "<p>你好，<strong>世界</strong></p>"
```

## 设计约束

- **模型里不存 HTML**：存进模板、数据库或接口的只有这份 JSON。HTML 只在进出两头出现，进来时按白名单解析，出去时逐个转义。
- **不碰 innerHTML**：`renderRichText` 只用 `createElement`、文字节点与 `setAttribute`，文字永远是文字节点；样式只写判定合法的值，链接只写 `toSafeLinkHref` 放行的地址。
- **不依赖 DOM**：模型、解析、检查与写出在 `./rich-text`，浏览器与 Node.js 里都能用；只有渲染在 `./rich-text-dom`。
- **不认识的报出来**：`checkRichTextDocument` 遇到不认识的块、行内类型、样式键与多余的键都报成问题，不抛异常，也不静默丢掉；解析时丢掉的东西都记在 `dropped` 里。

## 模型

```ts
interface RichTextDocument { blocks: RichBlock[] }

type RichBlock
  = | { type: "paragraph"; runs: RichInline[]; align?: RichTextAlign } // runs 为空是一个空行
    | { type: "heading"; level: 1 | 2 | 3; runs: RichInline[]; align?: RichTextAlign }
    | { type: "list"; ordered: boolean; start?: number; items: { blocks: RichBlock[] }[] } // 最多嵌套三层
    | { type: "divider" };

type RichInline
  = | { type: "text"; text: string; marks?: RichMarks }
    | { type: "field"; field: string; format?: JsonObject; marks?: RichMarks } // 行内字段，format 由使用方解释
    | { type: "break" };

interface RichMarks {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  lineThrough?: boolean;
  color?: string; // #RGB、#RGBA、#RRGGBB、#RRGGBBAA
  background?: string;
  fontSize?: number; // pt，1 至 500
  fontFamily?: string;
  superscript?: boolean; // 与 subscript 不同时打开
  subscript?: boolean;
  link?: string; // 只认 toSafeLinkHref 放行的地址
}
```

- `RichTextAlign` 取 `left`、`center`、`right`、`justify`。
- 行内字段只记字段路径，显示什么值由使用方决定：打印按数据取值并按 `format` 格式化，渲染与写纯文字时由回调给出文字。
- 段落间距、行高、缺省字体与字号不在模型里，由使用方的基准样式决定。

## 解析 HTML

`parseRichTextHtml(html)` 不依赖 DOM：先切分、按浏览器的宽松规则搭出元素树（没闭合的 `p`、新的 `li` 收尾上一项、标签不分大小写），再逐个元素换成块与行内。

| HTML | 换成 |
| --- | --- |
| `p`、`div` 等容器 | 段落；只有 `br` 的段落是一个空行，段末的单个 `br` 不多算一行 |
| `h1`–`h3` | 标题；`h4`–`h6` 降成三级标题 |
| `ul`、`ol`（`start`） | 列表；`li` 里的 `p` 成为该项的段落，超过三层的展平到上一层 |
| `hr`、`br` | 分隔线、行内换行 |
| `strong`/`b`、`em`/`i`、`u`/`ins`、`s`/`del`、`sup`、`sub` | 对应的行内样式 |
| `mark` | 底色，取 `data-color` 或 `style`，缺省黄色 |
| `code`、`kbd` | 等宽字体 |
| `a` | 链接，地址过了 `toSafeLinkHref` 才留 |
| `font` | `color` 与 `face` |
| `span data-field="路径"` | 行内字段，`data-format` 是格式说明的 JSON |
| `style` 属性 | color、background-color、font-weight、font-style、text-decoration、vertical-align、font-size（px、pt）、font-family，块上的 text-align；颜色认十六进制、`rgb()`/`rgba()` 与基本色名 |

- 空白按 HTML 的规则合并，段落首尾与换行两侧的空格去掉；`pre` 里保留空格与换行。
- 字符引用（`&amp;`、`&#x4E2D;` 等常用的具名与数字引用）解码；注释、doctype 与文档头部不留下任何东西。

### 丢弃清单

丢掉的东西逐项记在 `dropped` 里，同类同名合成一条并计数，按第一次出现的先后排：

```ts
interface RichTextDrop {
  kind: "element" | "content" | "style" | "link";
  name: string; // 标签名、style 属性名，或链接的协议名
  count: number;
}
```

| kind | 含义 | 例 |
| --- | --- | --- |
| `element` | 标签去掉或降级，文字保留 | `table`、`blockquote`、`pre`、`h5`、超过三层的 `ul` |
| `content` | 连同内容去掉 | `script`、`style`、`iframe`、`img`、`video`、表单控件 |
| `style` | `style` 里不认识或取值不合法的属性 | `position`、相对单位的 `font-size` |
| `link` | 没过判定的链接地址，文字保留 | `javascript` |

迁移旧模板时，这份清单就是迁移报告里「这段 HTML 丢了什么」的来源：`content` 与 `element` 里的表格、图片要人工补，`style` 与 `link` 通常可以忽略。

## 检查

`checkRichTextDocument(value)` 检查一个值是不是合规的文档，返回全部问题 `{ code, path }[]`，`path` 从文档根算起。保存前、从数据里读到模型 JSON 时都应先检查。

| 问题码 | 含义 |
| --- | --- |
| `invalid-document` | 不是 `{ blocks: [...] }` 形状的对象 |
| `unknown-block` / `unknown-inline` / `unknown-mark` | 不认识的块类型、行内类型或样式键 |
| `unknown-key` | 认识的对象上多出来的键 |
| `missing` | 缺少必填的字段 |
| `invalid-value` | 字段的类型或取值不对（标题级别、对齐、颜色、字号范围、空的字段路径等） |
| `unsafe-link` | 链接地址没过 `toSafeLinkHref` |
| `conflicting-marks` | 上标与下标同时打开 |
| `list-too-deep` | 列表嵌套超过三层 |

## 写出与渲染

- `serializeRichTextHtml(document)`：写成 HTML 串，文字与属性值都转义，只用解析器认得的标签；写出的 HTML 再解析回来得到同一份模型。行内字段写成 `<span data-field="路径">路径</span>`。
- `richTextPlainText(document, { field? })`：纯文字，块之间换行，列表项前加「• 」或序号，嵌套一层缩进两格。
- `renderRichText(doc, document, { field? })`（`@xihan-ui/core/rich-text-dom`）：返回 `DocumentFragment`。段落 `p`、标题 `h1`–`h3`、列表 `ul`/`ol` 与 `li`、分隔线 `hr`；粗体、斜体、下划线、删除线、上下标用语义标签，颜色、底色、字号（pt）与字体写在 `span` 的 style 上，链接写成带 `href` 的 `a`；空段落放一个 `br` 占住一行。

`field` 回调给出行内字段的文字，缺省写成 `{路径}`：

```ts
renderRichText(window.document, model, { field: run => String(data[run.field] ?? "") });
```

不认识的块与行内类型在写出与渲染时跳过，先用 `checkRichTextDocument` 把关。
