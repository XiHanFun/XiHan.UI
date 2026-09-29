import { readFile } from "node:fs/promises";

// 自定义元素版示例（demos/**/*.html）的 <script type="module"> 交给 Vite 编译。
//
// 示例经 innerHTML 注入，页面里没有 import map，内联模块里的裸说明符（"@xihan-ui/web-components"）
// 浏览器解析不了。应用的 index.html 里写同样一段内联模块，Vite 会把它抽出来当模块编译，
// 裸说明符按依赖解析——这里对示例做的是同一件事。展示与复制的仍是 .html 原文，一个字不改。
//
// 编出的模块把 import 声明提到顶层，其余语句原样包进默认导出的异步函数：挂一次示例调一次，
// 与内联脚本每次插入都重新求值一致；顶层 await 照写。函数体与 .html 原文逐行对齐，
// 报错栈里的行号直接回原文件找。
//
// 取用：import.meta.glob("…/*.html", { query: "?xh-demo-script", import: "default" })。
// 文档站的 XhDemo 与 web-components 包的示例验证台读同一个插件，两边跑的是同一份编译结果。

/** 取编译结果时写在 .html 路径后面的查询参数。 */
const DEMO_SCRIPT_QUERY = "xh-demo-script";

interface ParsedNode {
  type: string;
  start: number;
  end: number;
}

type Parse = (code: string) => { body: ParsedNode[] };

/**
 * 插件只用到 Vite 插件接口里的这几项。文档站（VitePress 带的 Vite）与 ui/ 的验证台（vitest 带的 Vite）
 * 大版本不同，两边的 Plugin 类型各是各的；这里不从任一方取类型，两边按结构各自接收。
 * 放在 docs/ 下，ui/ 的类型检查从这里也解析不到 docs 的依赖。
 */
interface DemoScriptPlugin {
  name: string;
  enforce: "pre";
  load: (this: { parse: (code: string) => unknown }, id: string) => Promise<string | null>;
}

const SCRIPT = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;

/**
 * 把一份示例 .html 里的模块脚本编成「顶层 import + 默认导出的异步函数」。
 * 没有脚本时导出空函数；写法越出下面几条约定就抛错，不猜作者的意思。
 */
export function compileDemoScript(html: string, file: string, parse: Parse): string {
  const scripts = [...html.matchAll(SCRIPT)];
  const script = scripts[0];
  if (!script)
    return "export default async function () {}\n";
  // 两段模块脚本各有各的作用域，提上来的 import 会在同一个模块里撞名
  if (scripts.length > 1)
    throw new Error(`${file}：一份示例只写一段 <script type="module">，这里有 ${scripts.length} 段`);

  // 两个捕获组都不带量词，匹配上就一定有值
  const attrs = script[1]!;
  const body = script[2]!;
  if (!/^\s*type\s*=\s*["']module["']\s*$/i.test(attrs))
    throw new Error(`${file}：示例脚本的开标签只写 type="module"，这里是 <script${attrs}>`);

  const bodyStart = script.index + "<script".length + attrs.length + ">".length;
  const bodyLine = html.slice(0, bodyStart).split("\n").length - 1;

  const imports: string[] = [];
  let rest = body;
  for (const node of parse(body).body) {
    if (node.type.startsWith("Export"))
      throw new Error(`${file}：示例脚本是页面上的一段脚本，不导出任何东西`);
    if (node.type !== "ImportDeclaration")
      continue;
    const text = body.slice(node.start, node.end);
    // 解析器给的偏移要是字符下标；对不上就停下，别把半条语句挪走
    if (!text.startsWith("import"))
      throw new Error(`${file}：import 声明的位置解析得不对（${JSON.stringify(text.slice(0, 20))}）`);
    imports.push(text);
    // 原位换成等长空白、换行留着，后面的语句行号不动
    rest = rest.slice(0, node.start) + text.replace(/[^\n]/g, " ") + rest.slice(node.end);
  }

  const head = imports.length > 0 ? `${imports.join("\n")}\n` : "";
  const headLines = head.split("\n").length - 1;
  const pad = "\n".repeat(Math.max(0, bodyLine - headLines));
  return `${head}export default async function () {${pad}${rest}\n}\n`;
}

/** 响应 `<示例>.html?xh-demo-script`，其余请求一概不管。 */
export function demoScriptPlugin(): DemoScriptPlugin {
  return {
    name: "xihan-demo-script",
    enforce: "pre",
    async load(id) {
      const queryStart = id.indexOf("?");
      if (queryStart < 0)
        return null;
      const file = id.slice(0, queryStart);
      if (!file.endsWith(".html") || !new URLSearchParams(id.slice(queryStart + 1)).has(DEMO_SCRIPT_QUERY))
        return null;
      const html = await readFile(file, "utf8");
      return compileDemoScript(html, file, code => this.parse(code) as { body: ParsedNode[] });
    },
  };
}
