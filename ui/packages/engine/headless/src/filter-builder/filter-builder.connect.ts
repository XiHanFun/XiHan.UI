/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 filter builder 相关实现。

import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { FilterCondition, FilterField, FilterGroup, FilterOperator, FilterParameter } from '@xihan-ui/viz'
import type { FilterPath } from './filter-builder.model'
import type {
  FilterBuilderApi,
  FilterBuilderConditionView,
  FilterBuilderGroupView,
  FilterBuilderSchema,
  FilterBuilderTranslations,
  FilterOperandControl,
  FilterOperandSource,
} from './filter-builder.types'
import { dataAttr } from '@xihan-ui/core'
import { VISUALLY_HIDDEN_STYLE } from '../shared/visually-hidden'
import { filterBuilderAnatomy } from './filter-builder.anatomy'
import {
  FILTER_BUILDER_MAX_DEPTH,
  filterAddTriggerDomId,
  filterBuilderTranslations,
  filterConditionDomId,
  filterNodeKey,
  numberFilterConditions,
} from './filter-builder.machine'
import {
  canAddFilterGroup,
  compatibleFilterParameters,
  emptyFilter,
  filterConditionIssue,
  filterOperandShape,
  filterOperatorsFor,
  isCaseOperator,
  isFilterGroup,
  isParameterRef,
} from './filter-builder.model'

const parts = filterBuilderAnatomy.build()

/** 操作数原来是参数引用（区间时任一端是）就算来自参数。 */
function sourceOf(condition: FilterCondition): FilterOperandSource {
  const value = condition.value
  return isParameterRef(value) || (Array.isArray(value) && value.some(isParameterRef)) ? 'parameter' : 'value'
}

/** 整棵树的视图。 */
export function filterBuilderView(
  tree: FilterGroup,
  options: {
    readonly fields: readonly FilterField[]
    readonly parameters: readonly FilterParameter[]
    readonly sources: Readonly<Record<string, FilterOperandSource>>
    readonly maxDepth: number
    readonly ignoreCase: boolean
  },
): { tree: FilterBuilderGroupView, conditions: FilterBuilderConditionView[] } {
  const numbers = numberFilterConditions(tree)
  const conditions: FilterBuilderConditionView[] = []
  const group = (node: FilterGroup, path: FilterPath): FilterBuilderGroupView => ({
    kind: 'group',
    path,
    key: filterNodeKey(node, path),
    depth: path.length,
    group: node,
    canAddGroup: canAddFilterGroup(tree, path, options.maxDepth),
    items: node.conditions.map((child, index) => {
      const at = [...path, index]
      if (isFilterGroup(child))
        return group(child, at)
      const key = filterNodeKey(child, at)
      const field = options.fields.find(item => item.name === child.field)
      const id = (child as { id?: unknown }).id
      const view: FilterBuilderConditionView = {
        kind: 'condition',
        path: at,
        key,
        number: numbers.get(key) ?? 0,
        id: typeof id === 'string' ? id : undefined,
        condition: child,
        field,
        operators: field ? filterOperatorsFor(field) : [],
        shape: filterOperandShape(child.operator),
        source: options.sources[key] ?? sourceOf(child),
        caseToggle: options.ignoreCase && isCaseOperator(field, child.operator),
        issue: filterConditionIssue(child, options.fields, options.parameters),
      }
      conditions.push(view)
      return view
    }),
  })
  return { tree: group(tree, []), conditions }
}

/** 视图里路径上的节点。 */
function viewAt(root: FilterBuilderGroupView, path: FilterPath): FilterBuilderGroupView | FilterBuilderConditionView | undefined {
  let node: FilterBuilderGroupView | FilterBuilderConditionView = root
  for (const index of path) {
    if (node.kind !== 'group')
      return undefined
    const child: FilterBuilderGroupView | FilterBuilderConditionView | undefined = node.items[index]
    if (!child)
      return undefined
    node = child
  }
  return node
}

/** 候选值写成下拉的选项值：按下标，选回来时换回原值。 */
function optionKey(index: number): string {
  return `o${index}`
}

export function connectFilterBuilder<T extends PropTypes>(
  service: Service<FilterBuilderSchema>,
  normalize: NormalizeProps<T>,
): FilterBuilderApi<T> {
  const { context, prop, send, scope } = service
  const t: FilterBuilderTranslations = filterBuilderTranslations(prop)
  const value = context.get('value') ?? emptyFilter()
  const fields = prop('fields') ?? []
  const parameters = prop('parameters') ?? []
  const disabled = !!prop('disabled')
  const readOnly = !!prop('readOnly')
  const size = prop('size')
  const inputs = context.get('inputs')
  const { tree, conditions } = filterBuilderView(value, {
    fields,
    parameters,
    sources: context.get('sources'),
    maxDepth: prop('maxDepth') ?? FILTER_BUILDER_MAX_DEPTH,
    ignoreCase: prop('ignoreCase') ?? true,
  })
  const hasIssues = conditions.some(condition => condition.issue !== undefined)
  const paths = new Map<string, FilterPath>()
  const index = (node: FilterBuilderGroupView | FilterBuilderConditionView): void => {
    paths.set(node.key, node.path)
    if (node.kind === 'group')
      node.items.forEach(index)
  }
  index(tree)
  const ids = scope.ids('filter-builder', 'label', 'live-region')
  const shared = { disabled, readOnly, size }
  // 加条件、加条件组是带文案的离散动作钮：text 档、描边（虚线由皮肤给），随根的尺寸
  const addAction = {
    'data-xh-action-control': '',
    'data-xh-action-profile': 'text',
    'data-xh-action-variant': 'outline',
    'data-xh-action-display': 'always',
    'data-xh-action-size': size ?? 'md',
  }
  // 删除钮是只有字形的离散动作钮：icon 档 xs 的正方盒，ghost 静息透明
  const deleteAction = {
    'data-xh-action-control': '',
    'data-xh-action-profile': 'icon',
    'data-xh-action-variant': 'ghost',
    'data-xh-action-display': 'always',
    'data-xh-action-size': 'xs',
  }
  const toggleShared = { disabled: disabled || readOnly, size }

  const groupAt = (path: FilterPath): FilterBuilderGroupView | undefined => {
    const node = viewAt(tree, path)
    return node?.kind === 'group' ? node : undefined
  }
  const conditionAt = (path: FilterPath): FilterBuilderConditionView | undefined => {
    const node = viewAt(tree, path)
    return node?.kind === 'condition' ? node : undefined
  }
  const errorId = (view: FilterBuilderConditionView): string => `${filterConditionDomId(service, view.key)}:error`

  const setOperand = (path: FilterPath, operand: unknown): void => send({ type: 'OPERAND.SET', path, value: operand })

  /** 区间一端改了：另一端照旧，两端都空时清掉操作数。 */
  const setBound = (view: FilterBuilderConditionView, index: number, bound: unknown): void => {
    const bounds = Array.isArray(view.condition.value) ? view.condition.value.slice(0, 2) : []
    bounds[index] = bound === undefined ? null : bound
    const range = [bounds[0] ?? null, bounds[1] ?? null]
    setOperand(view.path, range.every(item => item === null) ? undefined : range)
  }

  /** 操作数控件的可及名：单值与一组值是「条件 n 的值」，区间两端各自命名。 */
  const operandName = (view: FilterBuilderConditionView, index: number): string =>
    view.shape === 'range' ? t.operand(view.number, index === 0 ? 'from' : 'to') : t.operand(view.number)

  /** 单值位置上的字面值控件；index 是区间里的第几端，单值为 0。 */
  const literalControl = (view: FilterBuilderConditionView, current: unknown, index: number, apply: (next: unknown) => void): FilterOperandControl => {
    const field = view.field
    const named = { ...shared, ariaLabel: operandName(view, index) }
    if (field?.options && view.shape === 'single') {
      const options = field.options
      const selected = options.findIndex(option => option.value === current)
      return {
        instance: 'select',
        props: {
          ...named,
          collection: options.map((option, at) => ({ value: optionKey(at), label: option.label ?? String(option.value) })),
          value: selected < 0 ? [] : [optionKey(selected)],
          onValueChange: (details) => {
            const at = details.value[0] === undefined ? -1 : Number(details.value[0].slice(1))
            apply(at < 0 ? undefined : options[at]!.value)
          },
        },
      }
    }
    switch (field?.type) {
      case 'boolean':
        return {
          instance: 'select',
          props: {
            ...named,
            collection: [{ value: 'true', label: t.booleanOption(true) }, { value: 'false', label: t.booleanOption(false) }],
            value: current === true ? ['true'] : current === false ? ['false'] : [],
            onValueChange: details => apply(details.value[0] === undefined ? undefined : details.value[0] === 'true'),
          },
        }
      case 'number':
        return {
          instance: 'number-field',
          props: {
            ...named,
            value: inputs[`${view.key}#${index}`] ?? (typeof current === 'number' ? String(current) : ''),
            onValueChange: details => send({ type: 'NUMBER.INPUT', path: view.path, index, text: details.value }),
          },
        }
      case 'date':
      case 'datetime':
        return {
          instance: 'date-field',
          props: {
            ...named,
            value: typeof current === 'string' ? current : null,
            granularity: field.type === 'date' ? 'day' : 'second',
            onValueChange: details => apply(details.value ?? undefined),
          },
        }
      default:
        return {
          instance: 'text-field',
          props: {
            ...named,
            value: typeof current === 'string' ? current : current === undefined || current === null ? '' : String(current),
            onValueChange: details => apply(details.value === '' ? undefined : details.value),
          },
        }
    }
  }

  /** 参数引用的下拉；index 是区间里的第几端，单值为 0。 */
  const parameterControl = (view: FilterBuilderConditionView, current: unknown, operator: FilterOperator, index: number, apply: (next: unknown) => void): FilterOperandControl => {
    const candidates = compatibleFilterParameters(parameters, view.field, operator === 'between' ? 'eq' : operator)
    return {
      instance: 'select',
      props: {
        ...shared,
        ariaLabel: operandName(view, index),
        collection: candidates.map(parameter => ({ value: parameter.name, label: parameter.label ?? parameter.name })),
        value: isParameterRef(current) ? [current.parameter] : [],
        onValueChange: (details) => {
          const name = details.value[0]
          apply(name === undefined ? undefined : { parameter: name })
        },
      },
    }
  }

  const operandControls = (view: FilterBuilderConditionView): FilterOperandControl[] => {
    const operand = view.condition.value
    if (view.shape === 'none')
      return []
    if (view.shape === 'range') {
      const bounds = Array.isArray(operand) ? operand : []
      return [0, 1].map(index => (view.source === 'parameter'
        ? parameterControl(view, bounds[index], view.condition.operator, index, next => setBound(view, index, next))
        : literalControl(view, bounds[index], index, next => setBound(view, index, next))))
    }
    if (view.source === 'parameter')
      return [parameterControl(view, operand, view.condition.operator, 0, next => setOperand(view.path, next))]
    if (view.shape === 'single')
      return [literalControl(view, operand, 0, next => setOperand(view.path, next))]
    // 一组值：有候选值时多选下拉，没有时标签输入
    const items = Array.isArray(operand) ? operand : []
    const field = view.field
    if (field?.options) {
      const options = field.options
      return [{
        instance: 'select',
        props: {
          ...shared,
          ariaLabel: t.operand(view.number),
          multiple: true,
          collection: options.map((option, at) => ({ value: optionKey(at), label: option.label ?? String(option.value) })),
          value: items.flatMap((item) => {
            const at = options.findIndex(option => option.value === item)
            return at < 0 ? [] : [optionKey(at)]
          }),
          onValueChange: (details) => {
            const picked = details.value.map(key => options[Number(key.slice(1))]!.value)
            setOperand(view.path, picked.length > 0 ? picked : undefined)
          },
        },
      }]
    }
    return [{
      instance: 'tags-input',
      props: {
        ...shared,
        ariaLabel: t.operand(view.number),
        value: items.map(item => String(item)),
        onValueChange: (details) => {
          const values = field?.type === 'number' ? details.value.map(Number).filter(number => !Number.isNaN(number)) : details.value
          setOperand(view.path, values.length > 0 ? values : undefined)
        },
      },
    }]
  }

  return {
    value,
    tree,
    conditions,
    hasIssues,
    hasParameters: parameters.length > 0,
    announcement: context.get('announcement'),
    nodePath: key => paths.get(key),
    setLogic: (path, logic) => send({ type: 'LOGIC.SET', path, logic }),
    addCondition: path => send({ type: 'CONDITION.ADD', path }),
    addGroup: path => send({ type: 'GROUP.ADD', path }),
    remove: path => send({ type: 'NODE.REMOVE', path }),
    move: (path, delta) => send({ type: 'NODE.MOVE', path, delta }),
    setField: (path, field) => send({ type: 'FIELD.SET', path, field }),
    setOperator: (path, operator) => send({ type: 'OPERATOR.SET', path, operator }),
    setOperand,
    setSource: (path, source) => send({ type: 'SOURCE.SET', path, source }),
    setIgnoreCase: (path, next) => send({ type: 'IGNORE_CASE.SET', path, value: next }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'role': 'group',
      'aria-labelledby': prop('labelled') ? ids.label : undefined,
      'aria-label': prop('ariaLabel'),
      'aria-invalid': prop('invalid') || hasIssues ? 'true' : undefined,
      'data-size': size,
      'data-variant': prop('variant'),
      'data-empty': dataAttr(conditions.length === 0),
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(!!prop('invalid') || hasIssues),
    }),
    getLabelProps: () => normalize.element({ ...parts.label.attrs, id: ids.label }),
    getGroupProps: (path) => {
      const group = groupAt(path)
      return normalize.element({
        ...parts.group.attrs,
        'role': 'group',
        'aria-label': group ? t.group(group.group.logic) : undefined,
        'data-depth': group?.depth,
        'data-logic': group?.group.logic,
      })
    },
    getGroupHeaderProps: () => normalize.element({ ...parts['group-header'].attrs }),
    getLogicProps: () => normalize.element({ ...parts.logic.attrs }),
    getGroupDeleteTriggerProps: path => normalize.button({
      ...parts['group-delete-trigger'].attrs,
      ...deleteAction,
      'type': 'button',
      'aria-label': t.removeGroup,
      'hidden': path.length === 0 || undefined,
      'disabled': disabled || readOnly || undefined,
      'data-disabled': dataAttr(disabled || readOnly),
      'onClick': () => send({ type: 'NODE.REMOVE', path }),
    }),
    getGroupItemsProps: () => normalize.element({ ...parts['group-items'].attrs }),
    getGroupFooterProps: () => normalize.element({ ...parts['group-footer'].attrs }),
    getAddConditionTriggerProps: (path) => {
      const group = groupAt(path)
      return normalize.button({
        ...parts['add-condition-trigger'].attrs,
        ...addAction,
        'id': group ? filterAddTriggerDomId(service, group.key) : undefined,
        'type': 'button',
        'disabled': disabled || readOnly || undefined,
        'data-disabled': dataAttr(disabled || readOnly),
        'onClick': () => send({ type: 'CONDITION.ADD', path }),
      })
    },
    getAddGroupTriggerProps: path => normalize.button({
      ...parts['add-group-trigger'].attrs,
      ...addAction,
      'type': 'button',
      'hidden': !groupAt(path)?.canAddGroup || undefined,
      'disabled': disabled || readOnly || undefined,
      'data-disabled': dataAttr(disabled || readOnly),
      'onClick': () => send({ type: 'GROUP.ADD', path }),
    }),
    getConditionProps: (path) => {
      const view = conditionAt(path)
      return normalize.element({
        ...parts.condition.attrs,
        'id': view ? filterConditionDomId(service, view.key) : undefined,
        'role': 'group',
        'aria-label': view ? t.condition(view.number) : undefined,
        'aria-invalid': view?.issue ? 'true' : undefined,
        'aria-describedby': view?.issue ? errorId(view) : undefined,
        'data-invalid': dataAttr(view?.issue !== undefined),
        // 行里按 Alt+Shift+↑ / ↓ 在同组内挪这一行，Ctrl+Delete 删除这一行；其余按键交给行里的控件
        'onKeyDown': (event: KeyboardEvent) => {
          if (disabled || readOnly)
            return
          if (event.altKey && event.shiftKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
            event.preventDefault()
            send({ type: 'NODE.MOVE', path, delta: event.key === 'ArrowUp' ? -1 : 1 })
          }
          else if (event.ctrlKey && event.key === 'Delete') {
            event.preventDefault()
            send({ type: 'NODE.REMOVE', path })
          }
        },
      })
    },
    getConditionFieldProps: () => normalize.element({ ...parts['condition-field'].attrs }),
    getConditionOperatorProps: () => normalize.element({ ...parts['condition-operator'].attrs }),
    getConditionSourceProps: path => normalize.element({
      ...parts['condition-source'].attrs,
      hidden: parameters.length === 0 || conditionAt(path)?.shape === 'none' || undefined,
    }),
    getConditionOperandProps: (path) => {
      const shape = conditionAt(path)?.shape
      // 操作数的形状：single 一个控件，list 一组值，range 两个控件夹着分隔文字
      return normalize.element({ ...parts['condition-operand'].attrs, 'data-shape': shape, 'hidden': shape === 'none' || undefined })
    },
    getRangeSeparatorProps: () => normalize.element({ ...parts['range-separator'].attrs, 'aria-hidden': true }),
    getConditionIgnoreCaseProps: path => normalize.element({ ...parts['condition-ignore-case'].attrs, hidden: !conditionAt(path)?.caseToggle || undefined }),
    getConditionExtraProps: () => normalize.element({ ...parts['condition-extra'].attrs }),
    getConditionDeleteTriggerProps: (path) => {
      const view = conditionAt(path)
      return normalize.button({
        ...parts['condition-delete-trigger'].attrs,
        ...deleteAction,
        'type': 'button',
        'aria-label': view ? t.removeCondition(view.number) : undefined,
        'disabled': disabled || readOnly || undefined,
        'data-disabled': dataAttr(disabled || readOnly),
        'onClick': () => send({ type: 'NODE.REMOVE', path }),
      })
    },
    getConditionErrorProps: (path) => {
      const view = conditionAt(path)
      return normalize.element({ ...parts['condition-error'].attrs, id: view ? errorId(view) : undefined, hidden: !view?.issue || undefined })
    },
    getEmptyProps: () => normalize.element({ ...parts.empty.attrs, hidden: conditions.length > 0 || undefined }),
    getLiveRegionProps: () => normalize.element({
      ...parts['live-region'].attrs,
      'id': ids['live-region'],
      'role': 'status',
      'aria-live': 'polite',
      'style': VISUALLY_HIDDEN_STYLE,
    }),

    getLogicControlProps: (path) => {
      const group = groupAt(path)
      return {
        ...toggleShared,
        ariaLabel: t.match,
        collection: (['and', 'or'] as const).map(logic => ({ value: logic, label: t.logic(logic) })),
        value: group?.group.logic ?? 'and',
        disallowEmpty: true,
        onValueChange: (details) => {
          const logic = Array.isArray(details.value) ? details.value[0] : details.value
          if (logic === 'and' || logic === 'or')
            send({ type: 'LOGIC.SET', path, logic })
        },
      }
    },
    getFieldControlProps: (path) => {
      const view = conditionAt(path)
      return {
        ...shared,
        ariaLabel: view ? t.field(view.number) : undefined,
        invalid: view?.issue === 'field-missing',
        collection: fields.map(field => ({ value: field.name, label: field.label ?? field.name })),
        value: view && fields.some(field => field.name === view.condition.field) ? [view.condition.field] : [],
        onValueChange: (details) => {
          const field = details.value[0]
          if (field !== undefined)
            send({ type: 'FIELD.SET', path, field })
        },
      }
    },
    getOperatorControlProps: (path) => {
      const view = conditionAt(path)
      const operators = view?.operators ?? []
      return {
        ...shared,
        ariaLabel: view ? t.operator(view.number) : undefined,
        invalid: view?.issue === 'operator-invalid',
        collection: operators.map(operator => ({ value: operator, label: t.operatorOption(operator) })),
        value: view && operators.includes(view.condition.operator) ? [view.condition.operator] : [],
        onValueChange: (details) => {
          const operator = details.value[0] as FilterOperator | undefined
          if (operator !== undefined && operators.includes(operator))
            send({ type: 'OPERATOR.SET', path, operator })
        },
      }
    },
    getSourceControlProps: (path) => {
      const view = conditionAt(path)
      return {
        ...toggleShared,
        ariaLabel: view ? t.source(view.number) : undefined,
        collection: (['value', 'parameter'] as const).map(source => ({ value: source, label: t.sourceOption(source) })),
        value: view?.source ?? 'value',
        disallowEmpty: true,
        onValueChange: (details) => {
          const source = Array.isArray(details.value) ? details.value[0] : details.value
          if (source === 'value' || source === 'parameter')
            send({ type: 'SOURCE.SET', path, source })
        },
      }
    },
    getOperandControls: (path) => {
      const view = conditionAt(path)
      return view ? operandControls(view) : []
    },
    getIgnoreCaseControlProps: (path) => {
      const view = conditionAt(path)
      return {
        ...shared,
        ariaLabel: t.ignoreCase,
        checked: view?.condition.ignoreCase === true,
        onCheckedChange: details => send({ type: 'IGNORE_CASE.SET', path, value: details.checked }),
      }
    },
  }
}
