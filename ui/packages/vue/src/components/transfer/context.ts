import type { TransferItemProps, TransferPanelProps } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import type { TransferContext } from './use-transfer'
import { inject, provide } from 'vue'

/** 面板自报的身份，供面板内两侧共用的角色节点区分自己归哪一侧。 */
export interface TransferPanelContext {
  panel: ComputedRef<TransferPanelProps>
}

/** 条目自报的值与所属面板，供 item-text / item-checkbox 复用同一份声明。 */
export interface TransferItemContext {
  item: ComputedRef<TransferItemProps>
}

const KEY: InjectionKey<TransferContext> = Symbol('xh-transfer')
const PANEL_KEY: InjectionKey<TransferPanelContext> = Symbol('xh-transfer-panel')
const ITEM_KEY: InjectionKey<TransferItemContext> = Symbol('xh-transfer-item')

export function provideTransfer(ctx: TransferContext): void {
  provide(KEY, ctx)
}

export function useTransferContext(): TransferContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Transfer 部件必须用在 XhTransferRoot 内')
  return ctx
}

export function provideTransferPanel(ctx: TransferPanelContext): void {
  provide(PANEL_KEY, ctx)
}

export function useTransferPanelContext(): TransferPanelContext {
  const ctx = inject(PANEL_KEY, null)
  if (!ctx)
    throw new Error('[xh] Transfer 面板子部件必须用在 XhTransferSourcePanel / XhTransferTargetPanel 内')
  return ctx
}

export function provideTransferItem(ctx: TransferItemContext): void {
  provide(ITEM_KEY, ctx)
}

export function useTransferItemContext(): TransferItemContext {
  const ctx = inject(ITEM_KEY, null)
  if (!ctx)
    throw new Error('[xh] Transfer 条目子部件必须用在 XhTransferItem 内')
  return ctx
}
