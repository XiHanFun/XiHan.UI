/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// @xihan-ui/designer-kit —— 设计器扩展：按实例传入的扩展对象的公共骨架、合并与查重、装上与卸下、
// 规则执行、命令的快捷键，以及模板里各扩展自己的数据。

import type { DIAGNOSTIC_CODES, IconRecord, Tone } from '@xihan-ui/core'
import type { HotkeyEvent, KbdPlatform } from '@xihan-ui/core/hotkey'
import type { JsonObject, JsonPath, JsonValue } from '@xihan-ui/core/json'
import type { PathOperation } from './path-operation'
import type { ControlKind, PropertyEditor, PropertyEditorLayer, PropertyEditorTable } from './properties'
import type { SchemaIssue } from './schema'
import { formatHotkey, formatHotkeyLabel, matchesHotkey } from '@xihan-ui/core/hotkey'
import { isPlainObject } from '@xihan-ui/core/json'
import { BUILTIN_CONTROL_KINDS, mergePropertyEditorTables } from './properties'

/** 校验规则：给出文档的问题。问题码必须以扩展 id 的末段加点开头，如 xihan-workflow.decision-no-default。 */
export type SchemaRule<Doc = unknown, RuleCtx = unknown> = (document: Doc, context: RuleCtx) => readonly SchemaIssue[]

/**
 * 命令出现的位置：工具栏；顶栏中段（插入快捷钮，图标在上、短文字在下）；或某种主体的右键菜单
 * （主体由各款定，如 node、edge、element、card、blank）。
 */
export type DesignerCommandPlacement = 'toolbar' | 'header' | `menu:${string}`

/**
 * 弹层命令点开的面板：element 放进锚在命令按钮上的弹层；弹层开着时设计器状态变了调 update，弹层关掉后调 destroy。
 * 每次打开都重新建一份。
 */
export interface DesignerCommandPanel<Ctx = unknown> {
  /** 面板的根元素，放进弹层。 */
  readonly element: HTMLElement
  /** 弹层开着时设计器状态变了调用，面板按新状态刷新。 */
  readonly update?: (context: Ctx) => void
  /** 弹层关掉后调用。 */
  readonly destroy?: () => void
}

/** 菜单命令的一个条目。 */
export interface DesignerCommandMenuItem {
  /** 条目身份，选中时交给命令的 select。 */
  readonly value: string
  /** 条目文字。 */
  readonly label: string
  /** 文字前的图标。 */
  readonly icon?: IconRecord
  /**
   * 给了就是可勾选的条目，true 时打勾：没写 group 是复选（menuitemcheckbox），选中后菜单不收起；
   * 写了 group 是同组单选（menuitemradio），选中后菜单收起。
   */
  readonly checked?: boolean
  /** 单选组的名字：同组的条目至多一个 checked。 */
  readonly group?: string
  readonly disabled?: boolean
  /** 语气：破坏性的条目写 danger。 */
  readonly tone?: Tone
}

/**
 * 菜单命令的一项：条目；另一条命令的 id，按那条命令的文字、图标、可用与语气铺，选中即执行它；
 * 或者 'separator'，一条分隔线。
 */
export type DesignerCommandMenuEntry = DesignerCommandMenuItem | string

/**
 * 一条命令：工具栏按钮、右键菜单项与快捷键共用。
 * 给了 panel 是弹层命令，给了 menu 是菜单命令，在工具栏上点它分别打开锚在按钮上的弹层与菜单，两者只能给一个；
 * 两者都没给的普通命令必须有 run。登记时（mergeExtensions）不合这两条就抛 TypeError。
 */
export interface DesignerCommand<Ctx = unknown> {
  /** 全局唯一；扩展的命令用扩展 id 加点加名字，如 @xihan-flow-pro/simulation.run。 */
  readonly id: string
  /** 按钮与菜单项上的文字；给函数时每次刷新现取，随语言变。 */
  readonly label: string | ((context: Ctx) => string)
  /** 顶栏按钮图标下的短文字；不给用 label。名字（读屏与提示）仍取 label。 */
  readonly shortLabel?: string | ((context: Ctx) => string)
  /** 按钮与菜单项上的图标，图标集见 @xihan-ui/icons；工具栏按图标显示时，没有图标的命令退回显示文字。 */
  readonly icon?: IconRecord
  /** 缺省排列里出现在哪些位置；不给即只经快捷键或 commandLayout 出现。 */
  readonly placement?: readonly DesignerCommandPlacement[]
  /** 快捷键，写法同 xh-kbd 的 keys：['Mod', 'Shift', 'P']，Mod 在 macOS 上是 ⌘，其余平台是 Ctrl。 */
  readonly shortcut?: readonly string[]
  /** 不给即总是可用。 */
  readonly enabled?: (context: Ctx) => boolean
  /** 给了就是开关式命令，按钮与菜单项显示选中状态。 */
  readonly checked?: (context: Ctx) => boolean
  /** 语气：按钮与菜单项按这族色显示，破坏性命令写 danger。不给即不带语气。 */
  readonly tone?: Tone
  /**
   * 执行命令；按钮、菜单项与快捷键都只在命令此刻可用时调用它。弹层命令与菜单命令可以不给：
   * 工具栏上点它们是打开弹层或菜单，不调 run；给了 run，快捷键按下时调它（通常调工具栏的 open 打开同一份）。
   */
  readonly run?: (context: Ctx) => void
  /** 弹层命令：每次打开时建出放进弹层的面板。 */
  readonly panel?: (context: Ctx) => DesignerCommandPanel<Ctx>
  /** 菜单命令：每次刷新时现算菜单的各项。 */
  readonly menu?: (context: Ctx) => readonly DesignerCommandMenuEntry[]
  /** 菜单命令的条目被选中时调用，value 是条目的 value；写成命令 id 的项选中时执行那条命令，不调它。 */
  readonly select?: (value: string, context: Ctx) => void
}

/** 菜单命令的一项是不是分隔线。 */
export function isCommandMenuSeparator(entry: DesignerCommandMenuEntry): entry is 'separator' {
  return entry === 'separator'
}

/** 查一条命令的形状：panel 与 menu 只能给一个，两者都没给就必须有 run。不合时抛 TypeError。 */
export function assertCommandShape(command: Pick<DesignerCommand<never>, 'id' | 'run' | 'panel' | 'menu'>): void {
  if (command.panel !== undefined && command.menu !== undefined)
    throw new TypeError(`[xh] 命令 ${command.id} 同时给了 panel 与 menu，一条命令只能是弹层命令或菜单命令之一`)
  if (command.panel === undefined && command.menu === undefined && command.run === undefined)
    throw new TypeError(`[xh] 命令 ${command.id} 没有 run：普通命令必须给 run，弹层命令给 panel，菜单命令给 menu`)
}

/** 导入的来源：粘贴、拖放与打开文件三处共用。 */
export interface DesignerImportSource {
  /** 从哪里来：clipboard 粘贴，drop 拖放，file 打开文件。 */
  readonly kind: 'clipboard' | 'drop' | 'file'
  /** 内容的类型：文件取文件自己的类型，文本是 text/uri-list、text/html 或 text/plain。 */
  readonly mime?: string
  /** 文件名；只有文件有。 */
  readonly name?: string
  /** 文本内容；只有文本有，文件的内容要从 file 里读。 */
  readonly text?: string
  /** 文件；只有文件有。 */
  readonly file?: Blob
}

/** 导入：把外部内容换成片段或文档，结果的形状由各款定。 */
export interface DesignerImporter<Ctx = unknown, Result = unknown> {
  /** 全局唯一，写法同命令 id；不能与内置或别的扩展的导入器重名。 */
  readonly id: string
  /** 接不接这个来源：只看类型、文件名或文本，不读文件内容，当场返回。 */
  readonly accepts: (source: DesignerImportSource) => boolean
  /** 把接下的来源换成结果，可以是异步的；结果的形状与抛错后怎么报由各款定。 */
  readonly import: (source: DesignerImportSource, context: Ctx) => Result | Promise<Result>
}

/** 导出：把当前文档或渲染结果换成文件。 */
export interface DesignerExporter<Ctx = unknown> {
  /** 全局唯一，写法同命令 id；不能与内置或别的扩展的导出器重名。 */
  readonly id: string
  /** 导出项的名称，列导出入口时显示；给函数时现取，随语言变。 */
  readonly label: string | ((context: Ctx) => string)
  /** 能导出的格式，如 svg、png、xlsx。 */
  readonly formats: readonly string[]
  /** 按格式导出，format 是 formats 里的一个；得到文件内容（Blob）或文本。 */
  readonly export: (format: string, context: Ctx) => Promise<Blob | string>
}

/** 扩展里只含纯数据与纯函数的部分：校验、计算这类 core 函数读它。 */
export interface DesignerExtensionCore<Doc = unknown, RuleCtx = unknown> {
  /** 全局唯一，用包名加功能名：@xihan-flow-pro/simulation。也是模板里扩展数据的键。 */
  readonly id: string
  /** 新的编辑方式，键是 control.kind，不能与内建的重名。 */
  readonly controls?: Readonly<Record<string, ControlKind>>
  /** 校验规则，问题与内置校验的一起进问题列表；问题码以 id 的末段加点开头。 */
  readonly rules?: readonly SchemaRule<Doc, RuleCtx>[]
}

/** 设计器层的扩展：在 core 部分之上加属性编辑器、命令、导入导出与装上时的回调。各款在此之上加自己的种类、渲染与面板。 */
export interface DesignerExtensionBase<Ctx = unknown, Editor = PropertyEditor, Doc = unknown, RuleCtx = unknown> extends DesignerExtensionCore<Doc, RuleCtx> {
  /** 属性编辑器，按扩展顺序压在设计器内建的之上。 */
  readonly editors?: PropertyEditorLayer<Editor>
  /** 命令：工具栏按钮、右键菜单项与快捷键共用；命令 id 与快捷键不能与内置或别的扩展的重名。 */
  readonly commands?: readonly DesignerCommand<Ctx>[]
  /** 导入器：粘贴、拖放与打开文件共用，按扩展顺序问 accepts，第一个接下的导入。 */
  readonly importers?: readonly DesignerImporter<Ctx>[]
  /** 导出器：把当前文档换成文件，交给登记了所要格式的第一个。 */
  readonly exporters?: readonly DesignerExporter<Ctx>[]
  /** 装上时调用，返回卸下时的清理。 */
  readonly setup?: (context: Ctx) => (() => void) | void
}

/** 扩展冲突：同一个名字在两处登记。 */
export class DesignerExtensionError extends Error {
  /** 诊断码，恒为 designer.extension-conflict。 */
  readonly code: typeof DIAGNOSTIC_CODES.designerExtensionConflict = 'designer.extension-conflict'
  /** 冲突的名字空间：extension、command、shortcut、control、importer、exporter，或各款传入的。 */
  readonly space: string
  /** 重名的那个名字。 */
  readonly key: string
  /** 先后登记这个名字的两个扩展的 id。 */
  readonly extensions: readonly [string, string]

  constructor(space: string, key: string, extensions: readonly [string, string]) {
    super(`[xh] 设计器扩展冲突：${space} ${key} 在 ${extensions[0]} 与 ${extensions[1]} 里都登记了`)
    this.name = 'DesignerExtensionError'
    this.space = space
    this.key = key
    this.extensions = extensions
  }
}

/** 各款自己的名字空间：空间名 → 从扩展里取出它登记的名字（如节点类型 id）。 */
export type ExtensionKeySpaces<E> = Readonly<Record<string, (extension: E) => Iterable<string>>>

type AnyExtension = { readonly id: string } & Partial<DesignerExtensionBase<never, unknown, unknown, unknown>>

/** 内建的名字空间：命令、快捷键、编辑方式、导入、导出。 */
const BASE_SPACES: ExtensionKeySpaces<AnyExtension> = {
  command: extension => (extension.commands ?? []).map(command => command.id),
  shortcut: extension => (extension.commands ?? []).flatMap(command => (command.shortcut === undefined ? [] : [shortcutKey(command.shortcut)])),
  control: extension => Object.keys(extension.controls ?? {}),
  importer: extension => (extension.importers ?? []).map(importer => importer.id),
  exporter: extension => (extension.exporters ?? []).map(exporter => exporter.id),
}

/**
 * 合并内置扩展与传入的扩展：内置在前、传入的按数组顺序在后。扩展 id、命令 id、快捷键、编辑方式（含内建的那几种）、
 * 导入导出 id，以及 spaces 里各款的名字，有一个重名就抛 DesignerExtensionError，报出名字与两个扩展的 id。
 * 命令的形状不合（见 assertCommandShape）抛 TypeError。
 */
export function mergeExtensions<E extends { readonly id: string }>(
  builtins: readonly E[],
  extensions: readonly E[],
  spaces: ExtensionKeySpaces<E> = {},
): readonly E[] {
  const list = [...builtins, ...extensions]
  const claim = (owners: Map<string, string>, space: string, key: string, id: string): void => {
    const previous = owners.get(key)
    if (previous !== undefined)
      throw new DesignerExtensionError(space, key, [previous, id])
    owners.set(key, id)
  }
  const ids = new Map<string, string>()
  for (const extension of list) {
    claim(ids, 'extension', extension.id, extension.id)
    for (const command of (extension as AnyExtension).commands ?? [])
      assertCommandShape(command)
  }
  const all: ExtensionKeySpaces<E> = { ...BASE_SPACES as ExtensionKeySpaces<E>, ...spaces }
  for (const [space, keysOf] of Object.entries(all)) {
    const owners = new Map<string, string>(space === 'control' ? BUILTIN_CONTROL_KINDS.map(kind => [kind, 'builtin']) : [])
    for (const extension of list) {
      for (const key of keysOf(extension))
        claim(owners, space, key, extension.id)
    }
  }
  return list
}

/** 扩展的属性编辑器按顺序压在 base 之上，后面的压前面的。 */
export function extensionEditors<Editor>(
  base: PropertyEditorLayer<Editor> | undefined,
  extensions: readonly Pick<DesignerExtensionBase<never, Editor>, 'editors'>[],
): PropertyEditorTable<Editor> {
  return mergePropertyEditorTables([base, ...extensions.map(extension => extension.editors)])
}

/** 各扩展登记的编辑方式合成一张表，交给 checkProperties 的 controls。 */
export function extensionControls(extensions: readonly Pick<DesignerExtensionCore, 'controls'>[]): Readonly<Record<string, ControlKind>> {
  return Object.assign({}, ...extensions.map(extension => extension.controls ?? {})) as Record<string, ControlKind>
}

/** 各扩展的命令按登记顺序排成一张表，键是命令 id。 */
export function extensionCommands<Ctx>(extensions: readonly Pick<DesignerExtensionBase<Ctx>, 'commands'>[]): ReadonlyMap<string, DesignerCommand<Ctx>> {
  return new Map(extensions.flatMap(extension => (extension.commands ?? []).map(command => [command.id, command] as const)))
}

/**
 * 挑出接下导入的导入器：来源按先后，每个来源按导入器的先后问 accepts，第一个接下的连同那个来源一起返回；
 * 都不接时返回 undefined。导入器按扩展顺序排好再传进来，粘贴、拖放与打开文件共用。
 */
export function findImporter<I extends Pick<DesignerImporter<never, unknown>, 'accepts'>>(
  importers: readonly I[],
  sources: readonly DesignerImportSource[],
): { readonly importer: I, readonly source: DesignerImportSource } | undefined {
  for (const source of sources) {
    const importer = importers.find(item => item.accepts(source))
    if (importer !== undefined)
      return { importer, source }
  }
  return undefined
}

/** 扩展问题码的前缀：扩展 id 的末段，@xihan-flow-pro/simulation 是 simulation。 */
export function extensionIssuePrefix(id: string): string {
  return id.slice(id.lastIndexOf('/') + 1)
}

/**
 * 按扩展顺序逐条跑规则，问题合成一个数组。问题码不以「扩展 id 末段.」开头时抛 TypeError：
 * 前缀是问题码在各扩展之间不撞车的保证，写错是扩展自己的缺陷。
 */
export function runExtensionRules<Doc, RuleCtx>(
  extensions: readonly Pick<DesignerExtensionCore<Doc, RuleCtx>, 'id' | 'rules'>[],
  document: Doc,
  context: RuleCtx,
): SchemaIssue[] {
  const issues: SchemaIssue[] = []
  for (const extension of extensions) {
    const prefix = `${extensionIssuePrefix(extension.id)}.`
    for (const rule of extension.rules ?? []) {
      for (const issue of rule(document, context)) {
        if (!issue.code.startsWith(prefix))
          throw new TypeError(`[xh] 扩展 ${extension.id} 的规则给出的问题码 ${issue.code} 要以 ${prefix} 开头`)
        issues.push(issue)
      }
    }
  }
  return issues
}

/** 按实例管理一组扩展：合并查重、按 id 比对装上与卸下。 */
export interface ExtensionHost<E> {
  /** 当前生效的扩展，内置在前。 */
  readonly list: readonly E[]
  /**
   * 换成新的一组扩展：先合并查重，冲突时抛错、什么都不变；再按 id 比对，去掉的调清理，新加的调 setup，
   * 留下来但换了引用的当作卸下再装上。返回新的列表。
   */
  assign: (extensions: readonly E[]) => readonly E[]
  /** 卸下全部（内置的也卸），之后可以再 assign 重新装上。 */
  dispose: () => void
}

/** createExtensionHost 的参数。 */
export interface ExtensionHostOptions<E, Ctx> {
  /** 设计器自带的扩展，排在传入的之前；dispose 时一并卸下。 */
  readonly builtins?: readonly E[]
  /** 各款自己的名字空间，与内建的那几个一起查重。 */
  readonly spaces?: ExtensionKeySpaces<E>
  /** 交给 setup 的上下文；给函数时每次装上现取。 */
  readonly context: Ctx | (() => Ctx)
}

export function createExtensionHost<E extends { readonly id: string, readonly setup?: (context: Ctx) => (() => void) | void }, Ctx>(
  options: ExtensionHostOptions<E, Ctx>,
): ExtensionHost<E> {
  const builtins = options.builtins ?? []
  const contextOf = (): Ctx => (typeof options.context === 'function' ? (options.context as () => Ctx)() : options.context)
  let list: readonly E[] = []
  const cleanups = new Map<E, (() => void) | undefined>()
  const teardown = (extension: E): void => {
    const cleanup = cleanups.get(extension)
    cleanups.delete(extension)
    cleanup?.()
  }
  return {
    get list() {
      return list
    },
    assign(extensions) {
      const next = mergeExtensions(builtins, extensions, options.spaces)
      const kept = new Set(next)
      for (const extension of list) {
        if (!kept.has(extension))
          teardown(extension)
      }
      for (const extension of next) {
        if (!cleanups.has(extension))
          cleanups.set(extension, extension.setup?.(contextOf()) ?? undefined)
      }
      list = next
      return list
    },
    dispose() {
      for (const extension of [...list].reverse())
        teardown(extension)
      list = []
    },
  }
}

/**
 * 快捷键的比较用写法：修饰键按 Alt、Control、Meta、Shift 排在前，主键小写在后，用 + 连起来。
 * Mod 按非 macOS 平台落成 Control，所以 Mod+S 与 Ctrl+S 算同一个：它们在 Windows 与 Linux 上本来就撞。
 */
export function shortcutKey(keys: readonly string[]): string {
  const segments = formatHotkey(keys, 'other')
  const modifiers = segments.filter(segment => segment.modifier).map(segment => segment.key).sort()
  const mains = segments.filter(segment => !segment.modifier).map(segment => segment.key.toLowerCase())
  return [...new Set(modifiers), ...mains].join('+')
}

/** 快捷键的显示文字：macOS 上键帽字连写（⌘⇧P），其余平台用 + 连（Ctrl+Shift+P）。 */
export function formatShortcut(keys: readonly string[], platform: KbdPlatform): string {
  return formatHotkeyLabel(keys, platform)
}

/**
 * 找出这次按键命中的命令：快捷键恰好命中、此刻可用、并且有 run 的那一条；没有时为 undefined。platform 由调用方测出（detectKbdPlatform）。
 * 没给 run 的弹层命令与菜单命令不由快捷键触发。
 */
export function commandForShortcut<Ctx>(
  commands: Iterable<DesignerCommand<Ctx>>,
  event: HotkeyEvent,
  context: Ctx,
  platform: KbdPlatform,
): (DesignerCommand<Ctx> & { readonly run: (context: Ctx) => void }) | undefined {
  for (const command of commands) {
    if (command.run !== undefined && command.shortcut !== undefined && matchesHotkey(event, command.shortcut, platform) && (command.enabled?.(context) ?? true))
      return command as DesignerCommand<Ctx> & { readonly run: (context: Ctx) => void }
  }
  return undefined
}

/** 模板对象里放扩展数据的键。 */
export const EXTENSION_DATA_KEY = 'extensions'

/** 读对象上某个扩展的数据；没有或不是对象时为 undefined。 */
export function getExtensionData(object: JsonValue | undefined, id: string): JsonObject | undefined {
  if (!isPlainObject(object))
    return undefined
  const all = object[EXTENSION_DATA_KEY]
  if (!isPlainObject(all))
    return undefined
  const data = Object.hasOwn(all, id) ? all[id] : undefined
  return isPlainObject(data) ? data : undefined
}

/** 某个扩展的数据在文档里的路径：base 是对象自己的路径。 */
export function extensionDataPath(id: string, base: JsonPath = []): JsonPath {
  return [...base, EXTENSION_DATA_KEY, id]
}

/** 写入（或去掉）某个扩展的数据的编辑操作；data 为 undefined 时去掉，路径不在时编辑会失败。 */
export function setExtensionData(id: string, data: JsonObject | undefined, base: JsonPath = []): PathOperation {
  const path = extensionDataPath(id, base)
  return data === undefined ? { type: 'remove', path } : { type: 'set', path, value: data, createMissing: true }
}

/** 检查对象上的扩展数据：有就必须是对象，每个扩展的数据也必须是对象，里面不看。path 是对象自己的路径。 */
export function checkExtensionData(object: JsonValue | undefined, path: JsonPath = []): SchemaIssue[] {
  if (!isPlainObject(object) || !Object.hasOwn(object, EXTENSION_DATA_KEY))
    return []
  const all = object[EXTENSION_DATA_KEY]
  if (!isPlainObject(all))
    return [{ code: 'invalid-type', path: [...path, EXTENSION_DATA_KEY] }]
  return Object.entries(all)
    .filter(([, data]) => !isPlainObject(data))
    .map(([id]) => ({ code: 'invalid-type', path: [...path, EXTENSION_DATA_KEY, id] }))
}
