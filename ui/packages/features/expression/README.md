# @xihan-ui/expression

受限表达式语言：源码解析成可 JSON 序列化的语法树，静态检查未知标识符、未知函数与实参个数，再对数据确定性地求值。数值按十进制精确运算（34 位有效数字），日期不带时区，没有隐式类型转换，不使用 `eval` 或 `new Function`。自研实现，零运行时依赖，import 无副作用，不碰 DOM。

**谁会装它**：需要在模板里写一小段计算的地方——表单联动与公式、报表公式、打印格式化、流程条件。

## 用法

```ts
import { compile, evaluate, toPlain } from '@xihan-ui/expression'

const compiled = compile('ROUND(SUM(items.price) * (1 - discount), 2)', {
  identifiers: ['items', 'discount'],
})
if (!compiled.ok)
  throw new Error(compiled.issues[0]!.code)

const result = evaluate(compiled.ast, { items: [{ price: 19.9 }, { price: 0.1 }], discount: 0.15 })
if (result.ok)
  toPlain(result.value) // 17
```

## 约定

- 解析、检查与求值的问题都是 `{ code, start, end, data? }`：问题码以 `XH_EXPR_` 开头，区间是 UTF-16 码元偏移，`data` 只放名字、序号与数量，不放文案。
- 表达式或数据有问题时以结果返回，从不抛异常；只有选项写错才抛 `TypeError`。
- 只读宿主数据的自有数据属性；`__proto__`、`constructor`、`prototype` 一律禁止，getter 不会被触发。
- 步数、深度、源码长度与字符串长度都有上限，任何输入都在有界的时间与内存内结束。
- `NOW()` / `TODAY()` 只读宿主经 `now` 选项传入的时间。
- `createExpressionEngine` 给出四款设计器统一注入的引擎形状：`compile(source, { identifiers })` 返回引用的顶层变量名与求值函数，求值结果是普通 JS 值。
- `formatValue(value, spec, { locale, timeZone })` 格式化数字、百分比、日期、人民币大写与数字字形（罗马数字、中文数字），数字按十进制精确舍入；`checkFormatSpec` 在保存模板时校验格式说明。
- `evaluateSource` 与 `conditionOf` 是宿主求值处的两步：按源码编译后求值、把结果解释成条件；`planExpressions` 把一组「名字 = 表达式」按依赖排序并查环。
- 子入口 `@xihan-ui/expression/template`：`{{path}}` 文本模板，占位只写数据路径，不写表达式。
- `tests/fixtures/conformance.json` 是跨实现一致性用例，其他语言的实现逐条比对。

## 装

```bash
pnpm add @xihan-ui/expression
```

文法、类型规则与全部函数见 [https://ui.docs.xihanfun.com/runtime/expression](https://ui.docs.xihanfun.com/runtime/expression)。这个包属于 `features/` 组，组的含义见仓库里的 `ui/packages/README.md`。

许可：MIT
