# 受限表达式

`@xihan-ui/expression` 是一门受限的表达式语言：源码解析成可 JSON 序列化的语法树，静态检查后对数据求值。它服务于表单联动与公式、报表公式、打印格式化和流程条件这类「模板里写一小段计算」的场景。

```ts
import { compile, evaluate, toPlain } from "@xihan-ui/expression";

const compiled = compile("ROUND(SUM(items.price) * (1 - discount), 2)", {
  identifiers: ["items", "discount"],
});
if (!compiled.ok) throw new Error(compiled.issues[0].code);

const result = evaluate(compiled.ast, { items: [{ price: 19.9 }, { price: 0.1 }], discount: 0.15 });
if (result.ok) toPlain(result.value); // 17
```

## 设计约束

- **模板只是数据。** 不使用 `eval`、`new Function`，也不提供赋值、循环、方法调用或任何能执行宿主代码的语法；能调用的只有函数表里登记的函数。
- **结果确定。** 同样的语法树、同样的数据、同样的函数表与当前时间，永远得到同样的结果。语言本身不读时钟、不读随机数，`NOW()` 只返回宿主传入的时间。
- **类型规则写死。** 没有 JS 式的隐式转换：`'1' + 1` 是类型错误，不是 `'11'`；条件必须是布尔或 `null`，没有「真值」「假值」。
- **数值是十进制。** 数字按十进制精确运算，`0.1 + 0.2 == 0.3` 为真，金额计算不会出现二进制浮点的尾差。
- **可在其他语言复刻。** 数值、日期、字符串的每一条规则都不依赖 JS 引擎的实现细节，包内附带一份跨实现一致性用例（`tests/fixtures/conformance.json`），其他语言的实现逐条比对即可。
- **问题只给码与位置。** 解析、检查、求值的问题都是 `{ code, start, end, data? }`，不带文案；界面按问题码自行组织提示语。

## 是否安装

它不随适配器安装，需要时单独安装：

```bash
pnpm add @xihan-ui/expression
```

零运行时依赖，import 无副作用，不碰 DOM，浏览器与服务端都能运行。

## 三步管线

| 步骤 | 函数 | 结果 |
| --- | --- | --- |
| 解析 | `parse(source, options?)` | `{ ok: true, ast }` 或 `{ ok: false, issue }`，只报第一条问题 |
| 静态检查 | `check(ast, options?)` | 问题数组：未知标识符、未知函数、实参个数、禁止的成员名、语法树结构 |
| 求值 | `evaluate(ast, scope?, options?)` | `{ ok: true, value }` 或 `{ ok: false, issue }` |

`compile(source, options?)` 把前两步合为一步，失败时带全部问题。三个函数对表达式和数据的问题一律以结果返回，从不抛异常；只有选项本身写错（上限不是正整数、函数表不是 `createFunctionTable` 创建的）才抛 `TypeError`。

语法树可以存进模板、跨端传输后再求值。来自不可信来源的语法树先过 `check`；`evaluate` 自身也逐节点校验结构，伪造的节点报 `XH_EXPR_INVALID_AST`，不会越权执行。

## 注入引擎

打印、流程、表单、报表四款设计器不直接调用上面三步，而是接收一个形状统一的引擎，由宿主注入：

```ts
interface ExpressionEngine {
  compile(source: string, options?: { identifiers?: Iterable<string> | ((name: string) => boolean) }):
    | { ok: true, references: readonly string[], evaluate(scope: Readonly<Record<string, unknown>>): { ok: true, value: unknown } | { ok: false, issue: ExpressionIssue } }
    | { ok: false, issues: readonly ExpressionIssue[] }
}
```

`createExpressionEngine(options?)` 直接给出这个形状，宿主不必再写转接代码：

```ts
import { createExpressionEngine, ExprDate } from "@xihan-ui/expression";

const engine = createExpressionEngine({
  builtins: "all",          // 或 "none"，或 ["SUM", "ROUND"] 这样的名单
  functions: [],            // 宿主函数，见「宿主函数」一节
  now: () => ExprDate.fromParts(2026, 10, 16), // 固定日期，或每次求值时调用的函数
  limits: { maxSteps: 50000 },
});

const compiled = engine.compile("price * qty", { identifiers: ["price", "qty"] });
if (compiled.ok) {
  compiled.references;                    // ["price", "qty"]
  compiled.evaluate({ price: 1.5, qty: 2 }); // { ok: true, value: 3 }
}
```

- `references` 是引用的顶层变量名，按源码顺序去重，不含函数名，用于依赖分析。
- `evaluate` 的结果是 `toPlain` 之后的普通 JS 值：数字转成 JS 数字，日期转成规范文本。它从不抛异常，结果里有不可表示的值或环时同样以问题返回。
- 同一个引擎按源码缓存语法树（有条数上限），不同引擎互不影响。

## 文法

```text
expression   = conditional
conditional  = or [ "?" conditional ":" conditional ]          右结合
or           = and { "||" and }
and          = equality { "&&" equality }
equality     = relational [ ("==" | "!=") relational ]          不能连写
relational   = additive [ ("<" | "<=" | ">" | ">=") additive ]  不能连写
additive     = multiplicative { ("+" | "-") multiplicative }
multiplicative = unary { ("*" | "/" | "%") unary }
unary        = ("-" | "!") unary | postfix
postfix      = primary { "." name | "[" expression "]" }
primary      = number | string | "true" | "false" | "null"
             | identifier | call | "(" expression ")" | "[" [ expression { "," expression } ] "]"
call         = function-name "(" [ expression { "," expression } ] ")"
```

- **数字**：`12`、`1.5`、`1e3`、`2.5E-4`。必须以数字开头（`.5` 不合法），没有负数字面量，`-1` 是一元负号作用于 `1`。
- **字符串**：单引号或双引号，转义只有 `\\` `\'` `\"` `\n` `\r` `\t` `\uXXXX`，其余反斜杠组合报 `XH_EXPR_INVALID_ESCAPE`。
- **标识符**：ASCII 字母、`_`、`$` 开头，后接字母、数字、`_`、`$`；非 ASCII 字符（中文等）也可直接使用，但全角标点、全角空格、通用标点区不算标识符字符，误输入时报 `XH_EXPR_UNEXPECTED_CHARACTER`。名字含空格等字符时用反引号括起：`` `订单 金额` ``，反引号内只转义 `` \` `` 与 `\\`。
- **关键字**：只有小写的 `true`、`false`、`null`，`TRUE` 是普通标识符。
- **函数名**：ASCII 字母或 `_` 开头，后接字母、数字、`_`，查找不区分 ASCII 大小写，`sum(...)` 与 `SUM(...)` 相同。只能直接调用函数名，`a.b()`、`(f)()` 报 `XH_EXPR_INVALID_CALLEE`。
- **空白**：空格、制表、换行、回车、垂直制表、换页、不换行空格（U+00A0）、全角空格（U+3000）、BOM。
- **比较不能连写**：`a < b < c`、`a == b == c` 报 `XH_EXPR_CHAINED_COMPARISON`，要写成 `a < b && b < c`。
- 没有 `=`、`&`、`|` 单字符运算符，写错时在该字符处报 `XH_EXPR_UNEXPECTED_CHARACTER`。

位置是 UTF-16 码元偏移，左闭右开，与 JS 字符串下标一致。

## 值与类型

| 类型 | 说明 | 来自宿主数据 |
| --- | --- | --- |
| `null` | 缺失 | `null`、`undefined`、不存在的字段 |
| `boolean` | 布尔 | 布尔 |
| `number` | 十进制数，见下节 | 有限的 JS 数字（取最短往返十进制表示）、`bigint`、`ExprNumber` |
| `string` | 字符串 | 字符串 |
| `date` | 不带时区的日期时间，见下下节 | 只接受 `ExprDate`；文本日期在表达式里用 `TO_DATE` 转换 |
| `list` | 只读列表 | 数组 |
| `record` | 只读记录 | 原型是 `Object.prototype` 或 `null` 的普通对象 |

`NaN`、`Infinity`、`Date`、`Map`、函数、类实例等不可表示，读到时报 `XH_EXPR_UNSUPPORTED_VALUE`。宿主数据按需转换，只读自有、可枚举的数据属性：原型链上的成员、getter 都读不到，也不会被触发。

`__proto__`、`constructor`、`prototype` 三个名字一律禁止，作标识符、点号成员或下标（含运行时算出的下标）时报 `XH_EXPR_FORBIDDEN_MEMBER`。

## 运算规则

| 运算 | 规则 |
| --- | --- |
| `+` `-` `*` `/` `%` | 两侧都是数字；`+` 另允许两侧都是字符串（拼接）。任一侧为 `null` 时结果为 `null`。`%` 是截断取余，符号随被除数。除数为 0 报 `XH_EXPR_DIVISION_BY_ZERO` |
| 一元 `-` | 数字取反，`null` 得 `null` |
| `==` `!=` | 任意类型；类型不同即不等，`null == null` 为真；数字按数值、日期按时刻、列表逐项、记录按字段集合深比较 |
| `<` `<=` `>` `>=` | 两侧是同类的数字、字符串或日期；字符串按 UTF-16 码元比较；任一侧为 `null` 时结果为 `null` |
| `!` | 布尔取反，`null` 得 `null` |
| `&&` `\|\|` | 短路的三值逻辑：`false && x` 为 `false`、`true \|\| x` 为 `true`，都不求 `x`；`null && false` 为 `false`，`null \|\| true` 为 `true`，其余含 `null` 的组合为 `null` |
| `c ? a : b` | `c` 为 `true` 取 `a`，为 `false` 或 `null` 取 `b`，只求所选分支 |
| `a.b` | `a` 是记录时取字段，缺失得 `null`；`a` 为 `null` 时得 `null`；`a` 是列表时逐元素取字段（投影），嵌套列表逐层投影 |
| `a[i]` | 列表取整数下标，越界或负数得 `null`，非整数报 `XH_EXPR_INVALID_INDEX`；记录取字符串键 |

运算数的类型不符时报 `XH_EXPR_TYPE_MISMATCH`，位置指向出错的那个运算数，`data` 带 `operator` 与实际类型 `actual`。

投影让子表合计可以直接写：`SUM(items.amount)`。

## 数值

数值是十进制：值为「系数 × 10^指数」。

- 每个运算结果保留 34 位有效数字，超出部分按**四舍六入五成双**舍入；除法、平方根先求足够多位再舍入一次，结果是正确舍入的。
- 绝对值必须小于 10^65，否则报 `XH_EXPR_NUMBER_OVERFLOW`；最小非零绝对值是 10^-64，更小的部分按同一规则舍入，可能得到 0。
- 规范文本不用科学计数法、不带多余的 0：`1.50` 写作 `1.5`，`1e3` 写作 `1000`。
- `ROUND` 用**四舍五入**（远离零），`FLOOR` 向负无穷，`CEIL` 向正无穷，`TRUNC` 向零；位数可为负数，表示舍到十位、百位。
- 来自宿主的 JS 数字先取最短往返十进制表示：`0.1` 就是十进制的 0.1。

`ExprNumber` 可在宿主代码里使用：`ExprNumber.parse(text)`、`ExprNumber.fromJs(value)`、`toString()`、`toJs()`、`compare()`、`equals()`，以及只读的 `coefficient`（`bigint`）与 `exponent`。

## 日期

日期不带时区，精确到毫秒，范围 0001-01-01 至 9999-12-31，按前推格里历计算，不经过运行环境的时区。

- 规范文本：零点时是 `YYYY-MM-DD`，否则是 `YYYY-MM-DDTHH:mm:ss`，毫秒不为 0 时再带 `.SSS`。
- `TO_DATE` 接受 `YYYY-MM-DD`，可带 `T` 或空格分隔的 `HH:mm`、`HH:mm:ss`、`HH:mm:ss.fff`（小数 1 至 9 位，截到毫秒）；时间后可带 `Z` 或 `±HH:mm` 偏移，偏移被丢弃，保留墙钟时间。不合法得到 `null`。
- 按月、按年加减时，日号超过目标月的天数就取月末：1 月 31 日加一个月是 2 月 28 日或 29 日。
- `DATE_DIFF` 数完整单位，带符号，向零截断；按月计时，从起点加上该月数仍不超过终点才算一个完整的月。

宿主用 `ExprDate.fromParts(年, 月, 日, 时?, 分?, 秒?, 毫秒?)` 或 `ExprDate.parse(text)` 构造日期。当前时间由宿主经 `evaluate` 的 `now` 选项传入：取哪个时区的墙钟时间由宿主决定。

## 字符串

- `LEN`、`LEFT`、`RIGHT`、`MID` 按 Unicode 码点计数与截取，一个表情符号算一个字符；落单的代理项也算一个。
- `UPPER`、`LOWER` 只转换 ASCII 字母，其余字符原样保留。
- `TRIM` 去掉的空白与词法中的空白是同一集合。
- 字符串结果长度超过 `maxStringLength` 报 `XH_EXPR_STRING_TOO_LONG`；`REPLACE` 在分配之前就按结果长度判断。

## 函数

除特别说明，任一实参为 `null` 时结果为 `null`。实参类型不符报 `XH_EXPR_TYPE_MISMATCH`，取值不合法报 `XH_EXPR_INVALID_ARGUMENT`，位置都指向那个实参，`data` 带 `function` 与 `index`。

### 逻辑与空值

| 函数 | 说明 |
| --- | --- |
| `IF(条件, 是[, 否])` | 只求所选分支；条件为 `null` 取「否」，缺省的「否」是 `null` |
| `COALESCE(值, …)` | 第一个非 `null` 的值，全为 `null` 时为 `null` |
| `ISBLANK(值)` | `null`、空串、空列表为 `true` |

### 数学

| 函数 | 说明 |
| --- | --- |
| `ABS(x)` | 绝对值 |
| `ROUND(x[, 位数])` | 四舍五入，位数缺省 0，取 -64 至 64 的整数 |
| `FLOOR(x[, 位数])` / `CEIL(x[, 位数])` / `TRUNC(x[, 位数])` | 向下、向上、向零 |
| `SQRT(x)` | 平方根，负数报不合法实参 |
| `POWER(x, n)` | 整数次幂，`n` 取 -999 至 999 的整数 |

### 聚合

实参里的列表递归展开，`null` 跳过。

| 函数 | 说明 |
| --- | --- |
| `SUM(…)` | 数字之和，没有数时为 0 |
| `AVG(…)` | 平均值，没有数时为 `null` |
| `COUNT(…)` | 非 `null` 值的个数，任意类型 |
| `MIN(…)` / `MAX(…)` | 同类的数字、字符串或日期中的极值，没有值时为 `null` |

### 文本

| 函数 | 说明 |
| --- | --- |
| `CONCAT(值, …)` | 按规范文本拼接，`null` 是空串；列表与记录报类型不符 |
| `TEXT(值)` | 规范文本，`null` 是空串 |
| `LEN(s)` | 码点个数 |
| `LEFT(s, n)` / `RIGHT(s, n)` | 前 / 后 `n` 个码点 |
| `MID(s, 起点, 长度)` | 起点从 1 开始 |
| `UPPER(s)` / `LOWER(s)` / `TRIM(s)` | 只转 ASCII 大小写；去首尾空白 |
| `CONTAINS(s, 子串)` / `CONTAINS(列表, 值)` | 子串包含，或列表成员（按 `==` 比较）；列表时允许查 `null` |
| `STARTS_WITH(s, 前缀)` / `ENDS_WITH(s, 后缀)` | 前后缀判断 |
| `REPLACE(s, 查找, 替换)` | 全部替换，按字面文本匹配；查找串不能为空 |
| `SPLIT(s, 分隔符)` | 拆成字符串列表；分隔符不能为空 |
| `JOIN(列表[, 分隔符])` | 元素按规范文本拼接，`null` 是空串 |
| `FORMAT_NUMBER(x, 小数位[, 千分位])` | 四舍五入到 0 至 34 位小数并补齐 0；千分位用 `,`，小数点用 `.`，与语言环境无关 |
| `TO_NUMBER(值)` | 去首尾空白后按十进制文本解析，不合法得到 `null`；不接受千分位、十六进制、`Infinity` |

### 日期

| 函数 | 说明 |
| --- | --- |
| `NOW()` / `TODAY()` | 宿主传入的当前时间 / 当天零点；没有传入时报 `XH_EXPR_NOW_UNAVAILABLE` |
| `DATE(年, 月, 日[, 时, 分, 秒, 毫秒])` | 各部分必须是范围内的整数 |
| `TO_DATE(值)` | 文本转日期，不合法得到 `null` |
| `YEAR` `MONTH` `DAY` `HOUR` `MINUTE` `SECOND`（日期） | 取组成部分 |
| `WEEKDAY(日期)` | ISO 星期：周一为 1，周日为 7 |
| `DATE_ADD(日期, n, 单位)` | 单位是 `'year'` `'month'` `'week'` `'day'` `'hour'` `'minute'` `'second'`，`n` 是整数 |
| `DATE_DIFF(起, 止, 单位)` | 完整单位数，带符号 |
| `FORMAT_DATE(日期, 模式)` | 占位符 `yyyy yy MM M dd d HH H mm m ss s SSS`；单引号括起的内容原样输出，`''` 输出一个单引号 |

## 宿主函数

```ts
import { createFunctionTable } from "@xihan-ui/expression";

const functions = createFunctionTable({
  functions: [
    {
      name: "MASK_PHONE",
      minArgs: 1,
      maxArgs: 1,
      call: ([phone], context) => {
        if (phone === null) return null;
        if (typeof phone !== "string") return context.typeMismatch(0);
        return phone.length === 11 ? `${phone.slice(0, 3)}****${phone.slice(7)}` : phone;
      },
    },
  ],
});
```

- 名字是大写 ASCII 字母开头的 `A-Z`、`0-9`、`_`，不能与已启用的内置函数重名；`builtins` 选项可只启用部分内置函数（`['SUM', 'IF']`）或全部不启用（`'none'`）。
- `call` 收到的是表达式值，返回值可以是表达式值，也可以是能转换的 JS 值（数字、字符串、数组、普通对象）。
- `context.invalidArgument(i)`、`context.typeMismatch(i)` 返回失败标记，直接 `return` 即可；抛出的异常记为 `XH_EXPR_FUNCTION_FAILED`。
- `call` 必须是纯函数：只依赖实参与 `context.now`，不读时钟、随机数或外部状态，否则「结果确定」的承诺不成立。

`check` 与 `evaluate` 都接受同一个 `functions` 选项。`table.names` 列出全部函数名，`table.lookup(name)` 返回签名，可用来做编辑器里的自动补全与参数提示。

## 格式化

`formatValue(value, spec, { locale?, timeZone? })` 把值转成展示用的文本，四款设计器的数字、日期与金额展示共用它。数字类一律按十进制精确舍入：`1.005` 保留两位得到 `1.01`，`2.675` 得到 `2.68`。`null` 与 `undefined` 得到空串。

| spec | 说明 | 例 |
| --- | --- | --- |
| `{ kind: "number", decimals?, minDecimals?, maxDecimals?, grouping?, rounding? }` | `decimals` 固定小数位并补 0；或 `maxDecimals` 舍入后去掉末尾的 0、至少保留 `minDecimals` 位；都不给时不舍入 | `1234567.891` 按 `{ decimals: 2, grouping: true }` 得 `1,234,567.89` |
| `{ kind: "percent", …同上 }` | 乘 100 后按数字输出并接 `%` | `0.1234` 按 `{ decimals: 1 }` 得 `12.3%` |
| `{ kind: "date", pattern }` | 占位符同 `FORMAT_DATE` | `yyyy年M月d日` |
| `{ kind: "rmb-upper", rounding? }` | 人民币大写，舍入到分，用「元」不用「圆」 | `1001.5` 得 `壹仟零壹元伍角`，`100000` 得 `壹拾万元整` |

- **舍入方式** `rounding`：`half-up`（四舍五入，缺省）、`half-even`、`floor`、`ceil`、`down`。
- **数字输入**：`ExprNumber`、有限的 JS 数字（取最短往返十进制表示）、`bigint`、十进制文本。
- **日期输入**：`ExprDate`、日期文本、毫秒时间戳、`Date`。不带偏移的文本按墙钟时间原样输出；带偏移的文本在给了 `timeZone` 时换算到该时区，没给时保留它自己的墙钟时间；时间戳与 `Date` 换算到 `timeZone`，缺省 UTC。
- **`timeZone`**：取 `UTC`、`±HH:mm` 或 IANA 名称（如 `Asia/Shanghai`）。IANA 名称经运行环境的时区数据换算，不同环境的时区数据版本可能不同。
- **`locale`**：只决定小数点与千分位符号，数字始终是 ASCII 数字、每三位一组；不给时用 `.` 与 `,`。
- **人民币大写**：
  - 零的写法：段内连续的 0 只写一个「零」，整段为 0 时只在后面还有非零段时补「零」，如 `100010001` 得 `壹亿零壹万零壹元整`。
  - 角分：有角无分时不写「整」；无角有分时写「零×分」；整数部分为 0 时省去「元」，如 `0.5` 得 `伍角`。
  - 范围：负数前加「负」，金额绝对值须小于一亿亿。
- **出错**：格式说明不合法时抛 `TypeError("XH_EXPR_FORMAT_INVALID_SPEC")`，值不合法时抛 `TypeError("XH_EXPR_FORMAT_INVALID_VALUE")`，大写金额超出范围时抛 `TypeError("XH_EXPR_FORMAT_OUT_OF_RANGE")`。

## 上限

| 选项 | 缺省 | 作用于 |
| --- | --- | --- |
| `maxLength` | 10000 | 源码长度 |
| `maxDepth` | 100 | 语法树深度；求值时也约束嵌套数据的层数 |
| `maxSteps` | 100000 | 求值步数：每个节点一步，遍历列表时每个元素再一步 |
| `maxStringLength` | 100000 | 字符串结果长度 |

这些上限让任何输入都在有界的时间与内存内结束：深层括号、超长源码、巨大的数字字面量、带环的数据、十万行的列表、层层嵌套的 `REPLACE` 都会以问题码返回，不会耗尽调用栈或内存。

## 辅助函数

| 函数 | 说明 |
| --- | --- |
| `print(ast)` | 打印成规范源码；结果再解析得到同一棵树 |
| `collectReferences(ast)` | 按源码顺序列出字段引用的最长静态路径，用于依赖分析与改名 |
| `toPlain(value)` | 转成 JSON 能表示的值：数字转 JS 数字，日期转规范文本 |
| `toExpressionValue(raw)` | 把宿主值转成表达式值，不可表示时抛 `TypeError` |
| `typeOf(value)` | 值的类型名 |
| `isPlainName(text)` | 能否不加反引号写成标识符 |
| `createExpressionEngine(options?)` | 四款设计器统一注入的引擎，见「注入引擎」 |
| `formatValue(value, spec, options?)` | 数字、百分比、日期、人民币大写的格式化，见「格式化」 |

## 问题码

| 阶段 | 问题码 |
| --- | --- |
| 解析 | `XH_EXPR_EMPTY` `XH_EXPR_TOO_LONG` `XH_EXPR_TOO_DEEP` `XH_EXPR_UNEXPECTED_CHARACTER` `XH_EXPR_UNEXPECTED_TOKEN` `XH_EXPR_UNEXPECTED_END` `XH_EXPR_UNTERMINATED_STRING` `XH_EXPR_INVALID_ESCAPE` `XH_EXPR_INVALID_NUMBER` `XH_EXPR_INVALID_IDENTIFIER` `XH_EXPR_CHAINED_COMPARISON` `XH_EXPR_INVALID_CALLEE` `XH_EXPR_NUMBER_OVERFLOW` |
| 检查 | `XH_EXPR_UNKNOWN_IDENTIFIER` `XH_EXPR_UNKNOWN_FUNCTION` `XH_EXPR_ARGUMENT_COUNT` `XH_EXPR_FORBIDDEN_MEMBER` `XH_EXPR_INVALID_AST` `XH_EXPR_TOO_DEEP` `XH_EXPR_NUMBER_OVERFLOW` |
| 求值 | `XH_EXPR_TYPE_MISMATCH` `XH_EXPR_INVALID_ARGUMENT` `XH_EXPR_INVALID_INDEX` `XH_EXPR_DIVISION_BY_ZERO` `XH_EXPR_NUMBER_OVERFLOW` `XH_EXPR_DATE_OUT_OF_RANGE` `XH_EXPR_STRING_TOO_LONG` `XH_EXPR_STEP_LIMIT` `XH_EXPR_DEPTH_LIMIT` `XH_EXPR_UNSUPPORTED_VALUE` `XH_EXPR_NOW_UNAVAILABLE` `XH_EXPR_FUNCTION_FAILED`，以及运行时遇到的 `XH_EXPR_UNKNOWN_FUNCTION` `XH_EXPR_ARGUMENT_COUNT` `XH_EXPR_FORBIDDEN_MEMBER` `XH_EXPR_INVALID_AST` |

`data` 里的键：`name`（标识符、函数或成员名）、`function`（出错的函数）、`index`（第几个实参，从 0 起）、`operator`、`actual`（实际类型）、`min` / `max` / `actual`（实参个数）、`max`（上限）、`char`（不认识的字符）、`kind` / `token`（意外的记号）。

## 状态

这个包属于实验级：破坏性变更可能出现在 minor 中。语言的文法与语义一经发布，修改会同步更新一致性用例，并在更新日志中逐条列出。
