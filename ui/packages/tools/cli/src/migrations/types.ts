/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 迁移规则的形状。每个 major 一套：手写的改名表（取自更新日志的「升级须知」，逐条可机改的才写进来）
// 加上由 build/gen-migrations.mjs 从各版公开面基线算出来的一份差异：展开后的成批改名与删除清单。
// 生成脚本逐条核对手写规则：旧名在上一版里有、新名在新版里有，对不上就不生成。

/** 一组名字从一个模块搬到另一个模块，可以顺带改名。 */
export interface MovedImports {
  readonly from: string
  readonly to: string
  /** 搬走的名字 → 新名；同名写 true。 */
  readonly names: Readonly<Record<string, string | true>>
}

/** 一个组件（或几个组件）上的属性、事件或部件改名。 */
export interface ScopedRename {
  /** 组件标识（data-scope），如 heatmap、context-menu。 */
  readonly components: readonly string[]
  /** 属性写驼峰（scrollElement），事件与部件写短横线（cell-press、item-group）。 */
  readonly from: string
  readonly to: string
}

export interface PropRename extends ScopedRename {
  /** 原属性是布尔开关、新属性取一个值：写成真的那几种写法换成这个值，写成假的去掉，写了表达式的报出来人工改。 */
  readonly booleanTo?: string | number
  /** 只改 Web Components 元素上的 attribute（<xh-dialog role>），框架组件上的同名属性另有含义。 */
  readonly only?: 'web-components'
}

export interface EventRename extends ScopedRename {
  /**
   * 事件名够独特，Web Components 的 addEventListener('旧名') 可以直接改；
   * select、cancel 这类与原生事件同名的不改，只在用到这些组件的文件里报出来。
   */
  readonly distinctive?: boolean
}

/** 组件改名；并入另一个组件的某个形态时，改名同时在标签上补一个属性（preset="toast"）。 */
export interface ComponentRename {
  readonly to: string
  readonly attrs?: string
}

/** Web Components 元素改名，作者写在里面的部件随之改名。 */
export interface ElementRename {
  readonly from: string
  readonly to: string
  readonly attrs?: string
  /** 元素里 data-xh-part 的旧值 → 新值。 */
  readonly parts?: Readonly<Record<string, string>>
}

/** 改不了的写法：命中就报出位置与改法。 */
export interface ManualCheck {
  readonly pattern: RegExp
  readonly message: string
}

export interface MigrationRules {
  /** 迁到哪个 major：5 表示 4.x → 5.0。 */
  readonly major: number
  /** 包或子入口改名，按导入路径整段替换（长的先配）。 */
  readonly modules?: Readonly<Record<string, string>>
  readonly imports?: readonly MovedImports[]
  /** 导出名改名：组件、hook、类型、函数，按整词替换。Xh 开头的组件连同 Vue 模板里的短横线写法一起改。 */
  readonly identifiers?: Readonly<Record<string, string | ComponentRename>>
  /**
   * 整个组件改名，写 PascalCase 的名字片段（Ellipsis → Truncate）。生成脚本据此把本 major 删掉的导出名、
   * 元素名与覆盖槽逐个换成新名，新版里有的才收进对照表。
   */
  readonly components?: Readonly<Record<string, string>>
  readonly props?: readonly PropRename[]
  readonly events?: readonly EventRename[]
  /** 部件改名：改自写皮肤的选择器、Web Components 的 data-xh-part；对应的部件组件由生成脚本补进对照表。 */
  readonly parts?: readonly ScopedRename[]
  readonly elements?: readonly ElementRename[]
  /** CSS 自定义属性（令牌与组件覆盖槽）改名。 */
  readonly cssVariables?: Readonly<Record<string, string>>
  readonly keyframes?: Readonly<Record<string, string>>
  /** data-* 属性改名（自写皮肤与测试里的选择器）。 */
  readonly dataAttributes?: Readonly<Record<string, string>>
  readonly manual?: readonly ManualCheck[]
  /** 升级须知里改不了代码的那些（缺省值、行为、外观），每次迁移都列出来。 */
  readonly notes: readonly string[]
}

/** 一个 major 的公开面差异，由 build/gen-migrations.mjs 从两版基线生成。 */
export interface SurfaceDiff {
  readonly major: number
  /** 比对的两版：上一个 major 的最后一版与本 major 的首版。 */
  readonly from: string
  readonly to: string
  /** 上一版的全部组件标识，用来把标签归到组件。 */
  readonly scopes: readonly string[]
  /** 上一版的全部 Web Components 元素名。 */
  readonly tags: readonly string[]
  /** components 与 parts 展开后的逐条对照，新名都在新版里有。 */
  readonly renamed: {
    readonly identifiers: Readonly<Record<string, string>>
    readonly elements: Readonly<Record<string, string>>
    readonly cssVariables: Readonly<Record<string, string>>
  }
  /** 本 major 删掉的名字（改了名的也在其中，迁移改过之后就不会再命中）。 */
  readonly removed: {
    /** 包名 → 导出名。 */
    readonly exports: Readonly<Record<string, readonly string[]>>
    /** 子入口，如 @xihan-ui/styles/toast.css。 */
    readonly subpaths: readonly string[]
    /** 组件 → 属性（含 on 开头的事件属性）。 */
    readonly props: Readonly<Record<string, readonly string[]>>
    /** 组件 → 部件。 */
    readonly parts: Readonly<Record<string, readonly string[]>>
    readonly cssVariables: readonly string[]
    readonly keyframes: readonly string[]
    readonly elements: readonly string[]
    /** 元素 → attribute。 */
    readonly elementAttributes: Readonly<Record<string, readonly string[]>>
    readonly dataAttributes: readonly string[]
  }
}
