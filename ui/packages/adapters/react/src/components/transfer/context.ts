import type { TransferGroupProps, TransferItemProps, TransferPanelProps } from '@xihan-ui/headless'
import type { TransferContext } from './use-transfer'
import { createContext, useContext } from 'react'

const Ctx = createContext<TransferContext | undefined>(undefined)
const PanelCtx = createContext<TransferPanelProps | undefined>(undefined)
const GroupCtx = createContext<TransferGroupProps | undefined>(undefined)
const ItemCtx = createContext<TransferItemProps | undefined>(undefined)

export const TransferProvider = Ctx
export const TransferPanelProvider = PanelCtx
export const TransferGroupProvider = GroupCtx
export const TransferItemProvider = ItemCtx

export function useTransferContext(): TransferContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhTransfer 的部件要放在 XhTransferRoot 里')
  return ctx
}

/** 面板自报的身份，供面板内两侧共用的角色节点区分自己归哪一侧。 */
export function useTransferPanelContext(): TransferPanelProps {
  const panel = useContext(PanelCtx)
  if (!panel)
    throw new Error('面板的子部件要放在 XhTransferSourcePanel 或 XhTransferTargetPanel 里')
  return panel
}

/** 分组自报的值与所属面板，供分组标题取到同一份身份（标题的 id 由它派生）。 */
export function useTransferGroupContext(): TransferGroupProps {
  const group = useContext(GroupCtx)
  if (!group)
    throw new Error('分组标题要放在 XhTransferGroup 里')
  return group
}

/** 条目自报的值与所属面板，供 item-text / item-checkbox 复用同一份声明。 */
export function useTransferItemContext(): TransferItemProps {
  const item = useContext(ItemCtx)
  if (!item)
    throw new Error('条目的子部件要放在 XhTransferItem 里')
  return item
}
