/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 四款共用的历史命令：撤销、重做与清空历史。文案取 xh-designer-commands 与 xh-designer-history 两桶，图标由各款传入；
// 撤销、重做的全名带上下一步的说明，清空先弹确认框；做完经 announce 礼貌级地读一句。

import type { IconRecord } from '@xihan-ui/core'
import type { DesignerCommand, History } from '@xihan-ui/designer-kit'
import type { DesignerCommandsTranslations, DesignerHistoryTranslations } from '../translations'

/** 历史命令的 id。 */
export const DESIGNER_HISTORY_COMMANDS = {
  undo: 'undo',
  redo: 'redo',
  clearHistory: 'clear-history',
} as const

/** 历史命令要读写的那几项：designer-kit 的 History 直接就合用。 */
export type DesignerHistoryCommandTarget = Pick<
  History<unknown, unknown>,
  'canUndo' | 'canRedo' | 'undoLabel' | 'redoLabel' | 'inTransaction' | 'entries' | 'undo' | 'redo' | 'clear'
>

/** 清空前确认框的内容，形状与 DialogService.confirm 的选项一致。 */
export interface DesignerHistoryConfirm {
  readonly title: string
  readonly content: string
  readonly okText: string
  readonly tone: 'danger'
}

/** designerHistoryCommands 的选项。 */
export interface DesignerHistoryCommandsOptions<Ctx> {
  /** 当前的历史；返回 undefined 时三条命令都不可用。 */
  readonly history: (context: Ctx) => DesignerHistoryCommandTarget | undefined
  /** 只读、预览这类此刻不许改文档的状态返回 true，三条命令都不可用。历史在事务中（如拖动）时也不可用。 */
  readonly disabled?: (context: Ctx) => boolean
  /** 命令文案（xh-designer-commands 那一桶），每次刷新现取，随语言变。 */
  readonly translations: (context: Ctx) => DesignerCommandsTranslations
  /** 历史记录的文案（xh-designer-history 那一桶）：确认框与播报用。 */
  readonly historyTranslations: (context: Ctx) => DesignerHistoryTranslations
  /** 清空前弹确认框，确定时兑现为 true；通常交给各款的 DialogService.confirm。 */
  readonly confirm: (context: Ctx, options: DesignerHistoryConfirm) => Promise<boolean>
  /** 读屏播报：撤销、重做、清空之后礼貌级地读一句；不给就不播。 */
  readonly announce?: (context: Ctx, message: string) => void
  /** 各命令的图标，键是 DESIGNER_HISTORY_COMMANDS 的键。 */
  readonly icons?: Readonly<Partial<Record<keyof typeof DESIGNER_HISTORY_COMMANDS, IconRecord>>>
}

/**
 * 建撤销、重做与清空历史三条命令。撤销 Mod+Z、重做 Mod+Shift+Z（另认 Ctrl+Y），两条缺省放在工具栏上，
 * 全名写「撤销：<说明>」，按钮上看得见的短文字仍是「撤销」；清空历史不上工具栏，由面板头或 commandLayout 放置。
 */
export function designerHistoryCommands<Ctx>(options: DesignerHistoryCommandsOptions<Ctx>): DesignerCommand<Ctx>[] {
  const { history, icons } = options
  /** 此刻能动历史：有历史、不在事务中、没被禁用。 */
  const editable = (context: Ctx): DesignerHistoryCommandTarget | undefined => {
    const target = history(context)
    return target === undefined || target.inTransaction || (options.disabled?.(context) ?? false) ? undefined : target
  }
  const untitled = (context: Ctx, label: string | undefined): string => label ?? options.historyTranslations(context).untitled
  return [
    {
      id: DESIGNER_HISTORY_COMMANDS.undo,
      label: (context) => {
        const label = history(context)?.undoLabel
        const t = options.translations(context)
        return label === undefined ? t.undo : t.undoWith(label)
      },
      shortLabel: context => options.translations(context).undo,
      ...(icons?.undo ? { icon: icons.undo } : {}),
      placement: ['toolbar'],
      shortcut: ['Mod', 'Z'],
      enabled: context => editable(context)?.canUndo ?? false,
      run: (context) => {
        const target = editable(context)
        const label = untitled(context, target?.undoLabel)
        if (target?.undo())
          options.announce?.(context, options.historyTranslations(context).announceUndo(label))
      },
    },
    {
      id: DESIGNER_HISTORY_COMMANDS.redo,
      label: (context) => {
        const label = history(context)?.redoLabel
        const t = options.translations(context)
        return label === undefined ? t.redo : t.redoWith(label)
      },
      shortLabel: context => options.translations(context).redo,
      ...(icons?.redo ? { icon: icons.redo } : {}),
      placement: ['toolbar'],
      shortcut: ['Mod', 'Shift', 'Z'],
      alternateShortcuts: [['Ctrl', 'Y']],
      enabled: context => editable(context)?.canRedo ?? false,
      run: (context) => {
        const target = editable(context)
        const label = untitled(context, target?.redoLabel)
        if (target?.redo())
          options.announce?.(context, options.historyTranslations(context).announceRedo(label))
      },
    },
    {
      id: DESIGNER_HISTORY_COMMANDS.clearHistory,
      label: context => options.translations(context).clearHistory,
      ...(icons?.clearHistory ? { icon: icons.clearHistory } : {}),
      tone: 'danger',
      enabled: context => (editable(context)?.entries.length ?? 0) > 0,
      run: (context) => {
        const t = options.historyTranslations(context)
        void options.confirm(context, { title: t.clearConfirmTitle, content: t.clearConfirmContent, okText: t.clearConfirmOk, tone: 'danger' }).then((ok) => {
          // 确认框开着的这段时间里状态可能变了：按确定那一刻重新判一次
          const target = editable(context)
          if (!ok || target === undefined || target.entries.length === 0)
            return
          target.clear()
          options.announce?.(context, options.historyTranslations(context).announceCleared)
        })
      },
    },
  ]
}
