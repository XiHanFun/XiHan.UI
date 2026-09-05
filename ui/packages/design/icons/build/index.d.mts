// @xihan-ui/icons/codegen —— 把任意 SVG 目录转成 IconRecord 的构建期管线。
// 手写而非生成：管线是 .mjs，没有对应的 TS 源可发射声明。

// 图标记录的形状在这里自带一份，不引 core 也不引 dist：
// core 只在 devDependencies 里，消费方装的只有本包；而 dist 是构建产物，
// 源码树里还不存在，静态分析会判定这条 import 解析不掉。
// 与随包发布的 dist/types.d.mts 逐字段一致，由 tests/codegen-surface.spec.ts 盯着不许漂。
export interface IconNode {
  readonly tag: string
  readonly attrs?: Readonly<Record<string, string>>
  readonly children?: readonly IconNode[]
}

export interface IconRecord {
  readonly name: string
  readonly viewBox: string
  readonly attrs?: Readonly<Record<string, string>>
  readonly nodes: readonly IconNode[]
}

export interface IngestedIcon {
  /** 归一后的图标名，小写连字符分段。 */
  name: string
  /** 派生的导出标识符，如 `arrow-down` → `ArrowDownIcon`。 */
  exportName: string
  record: IconRecord
  /** 转换过程中丢掉了什么，逐条可读。 */
  notes: string[]
}

export interface SkippedIcon {
  file: string
  reason: string
}

export interface IngestOptions {
  /** 文件名（不含扩展名）→ 图标名；返回 null 即跳过这一枚。默认走 toIconName。 */
  rename?: (fileBase: string) => string | null
}

/** 文件名归一成图标名：小写、连字符分段、字母打头；数字打头的前缀一个 n。 */
export declare function toIconName(input: string): string | null

/** 扫一个目录里的 *.svg。单枚转不了不掀桌，收进 skipped 继续。 */
export declare function ingestIconDir(dir: string, options?: IngestOptions): Promise<{
  icons: IngestedIcon[]
  skipped: SkippedIcon[]
}>

/** 严格模式的单枚转换；外部图标集请传 { lenient: true } 或直接用 ingestIconDir。 */
export declare function svgToIconRecord(source: string, name: string, file?: string, options?: {
  lenient?: boolean
}): { record: IconRecord, notes: string[] }

/** 渲染成运行期模块源码（每枚一个顶层 export const）。 */
export declare function renderModule(icons: readonly IngestedIcon[]): string

/** 渲染成 .d.mts 声明源码。 */
export declare function renderDeclaration(icons: readonly IngestedIcon[]): string

/** 单枚记录渲染成字面量源码。自建发射器时用。 */
export declare function recordLiteral(record: IconRecord): string

/** 由 core 的图标类型源渲染出随包发布的类型声明。 */
export declare function renderTypes(coreSource: string): string

/** 渲染类型声明对应的运行期空模块。 */
export declare function renderTypesRuntime(): string

/** 生成物首行的「勿手改」标记。 */
export declare const GENERATED_HEADER: string

/** 类型生成物首行的「勿手改」标记。 */
export declare const TYPES_HEADER: string

/** 严格模式扫目录，本仓自己的首方集走这条。 */
export declare function buildIconSet(dir: string): Promise<IngestedIcon[]>

/** 图标名派生导出标识符：`arrow-down` → `ArrowDownIcon`。 */
export declare function exportNameOf(name: string): string

export declare class IconPipelineError extends Error {}
