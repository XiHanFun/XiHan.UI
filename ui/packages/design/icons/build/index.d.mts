// @xihan-ui/icons/codegen —— 把任意 SVG 目录转成 IconRecord 的构建期管线。
// 手写而非生成：管线是 .mjs，没有对应的 TS 源可发射声明。

// 这里必须引发布产物而不是 kernel：kernel 只在 devDependencies 里，
// 消费方装的只有本包，声明引到 kernel 就会解析不到。
// eslint-disable-next-line antfu/no-import-dist
import type { IconRecord } from '../dist/types.mjs'

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

/** 由 kernel 的图标类型源渲染出随包发布的类型声明。 */
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
