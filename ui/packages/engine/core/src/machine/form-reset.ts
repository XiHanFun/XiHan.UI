import type { MachineConfig, MachineSchema, Params, Slice } from './types'

/** 表单重置事件名。适配器把宿主 form 的 reset 翻成这条事件送进机器。 */
export const FORM_RESET_EVENT = 'FORM.RESET'

/**
 * 这台机器认不认表单重置。
 * 只认根级 on：状态级 on 只在那个状态下生效，而重置从任何状态发出都要认。
 */
export function declaresFormReset<T extends MachineSchema>(machine: MachineConfig<T>): boolean {
  return Object.hasOwn(machine.on ?? {}, FORM_RESET_EVENT)
}

/**
 * 把一个值 cell 变回它此刻挂载会得到的值，返回这次有没有真的动手。
 *
 * 宿主没声明默认值、又把值攥在自己手里时一动不动：cell 里那句 `?? 兜底` 写的是组件的空值
 * （radio-group 是 null、rating 是 0、tags-input 是空数组），不是宿主说过的默认值。
 * 照着落下去，受控分支会把这个空值当成意图发给宿主，重置就成了「把宿主的数据抹掉」。
 */
export function resetDeclaredValue<T extends MachineSchema>(
  params: Pick<Params<T>, 'prop' | 'context'>,
  key: keyof Slice<T, 'context'>,
  valueProp: keyof Slice<T, 'props'> & string,
  defaultProp: keyof Slice<T, 'props'> & string,
): boolean {
  const { prop, context } = params
  if (prop(defaultProp) === undefined && prop(valueProp) !== undefined)
    return false
  context.reset(key)
  return true
}
