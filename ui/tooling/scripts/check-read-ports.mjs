#!/usr/bin/env node
// 门禁：Vue 适配器的 Root 组件通过默认插槽交给作者的每一样东西，另外两个适配器也要取得到。
//
// 三个适配器接的是同一台机器、同一份 connect。Vue 侧把 connect 算出来的派生值与命令式方法
// 挑一部分塞进插槽作用域（`v-slot="{ pages, totalPages, setPage }"`），作者照着渲染；
// 自定义元素这边没有插槽作用域这条路，同样的东西得落成元素上的只读属性与公开方法
// （`el.pages`、`el.setPage(3)`）。少一样，作者就得把库里那段算法自己再写一遍——页码序列、
// 标签截断、分侧过滤都出现过整段抄写的示例，库里口径一改，外面静默走样。
//
// 三侧各自怎么取：
// - Vue 侧取 `Xh<组件>Root` 的 `slots.default?.({ … })` 那个对象的键。取的是「挑出来交出去的
//   那一份」而不是 XxxApi 全集——Vue 侧本来就是挑着交的，那份挑正是三边该对齐的口径。
// - 元素侧取类上的公开 get 与公开方法。作者写的 attribute / property（value、open、page 这些）
//   不算：它们是作者递进去的声明，非受控时元素上恒为 undefined，读不到机器此刻的值。
// - React 侧取函数式 children 的参数对象：`children({ … })`，或经库自带助手的 `renderSlot(children, { … })`。带载荷的
//   插槽在 React 上就落成函数式 children，普通 ReactNode 的 children 没有参数、什么都交不出去。
//   React 铺一个新组件时，Vue 那份插槽作用域交了什么，这里就得原样传进 children 的参数里。
//   React 侧没有存量清单：铺到哪个组件，那个组件当场就是硬判据。
//
// 对齐判在 api 成员上，不判名字：两侧读同一个 api 成员就算接上了。名字本来就会不一样——
// `page` 这个名字在元素上已经被作者写的属性占着，派生的当前页只能另起一个名字（currentPage）；
// Vue 侧的 `sourceItems: api.visibleItems('source')` 与元素侧带参数的 `visibleItems(side)`
// 也是同一个口，元素少开一个。名字撞上了同样算数，覆盖读不出 api 成员的那几项。
//
// PENDING 是元素侧的一张存量清单，不是豁免表：键是当前还没对齐的组件，值是当前差的那几样，逐字与
// 扫描结果核对——补上一个就得从表里删一个，删空了这道门禁自动变成硬判据。
// 带 --report 跑一次，打出来的就是 PENDING 的形状，可整段换进去。
// 带 --rank 跑一次，把缺口按「有多少份 Vue 示例真的解构过这个名字」排出来。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'
import ts from 'typescript'
import { ADAPTERS, reactCovered, reactProgress } from './lib/adapters.mjs'

const VUE = ADAPTERS.vue.components
const REACT = ADAPTERS.react.components
const WC = ADAPTERS.wc.components
const DEFINE = `${ADAPTERS.wc.root}/src/define.ts`
// --rank 用：数缺口在文档站示例里被解构了多少次
const DEMOS = '../docs/.vitepress/demos'

/** 元素基类与自定义元素规范自带的钩子：宿主调它们，不是作者拿来取数的口。 */
const LIFECYCLE = new Set([
  'connectedCallback',
  'disconnectedCallback',
  'attributeChangedCallback',
  'adoptedCallback',
  'formResetCallback',
  'addController',
  'removeController',
  'requestUpdate',
  'createRenderRoot',
  'updateComplete',
])

/**
 * 当前还没对齐的组件，值是这个组件当前差的那几样（写 Vue 插槽作用域里的键名）。
 * 空表即所有 Root 插槽作用域在元素上都有对应的取数口。
 */
const PENDING = {
  'affix': ['affixed'],
  'approval': ['status', 'settled', 'loading', 'grantedScopes', 'note', 'canApprove', 'announcement', 'approve', 'deny', 'setGrantedScopes', 'setNote'],
  'back-top': ['visible'],
  'calendar': ['value', 'focusedValue', 'visibleMonth', 'panels', 'canGoPrev', 'canGoNext', 'isSelected', 'isUnavailable', 'setValue', 'select', 'focus', 'goToPrevMonth', 'goToNextMonth'],
  'carousel': ['page', 'totalPages', 'slideCount', 'slideRange', 'pageSnapPoints', 'canScrollPrev', 'canScrollNext', 'autoplaying', 'paused', 'autoplayStopped', 'dragging', 'isInView', 'setPage', 'goToPrev', 'goToNext', 'play', 'pause', 'resume'],
  'cascader': ['open', 'levels', 'columns', 'value', 'valuePath', 'activePath', 'focusedPath', 'displayText', 'canClear', 'isSelected', 'isIndeterminate', 'isActive', 'isVisible', 'setOpen', 'setValue', 'setActivePath', 'select', 'clear'],
  'checkbox-group': ['value', 'checkedState', 'isChecked', 'setValue', 'toggleValue'],
  'clipboard': ['status', 'copied', 'value', 'copy'],
  'code-view': ['lang', 'lineCount', 'lines', 'foldable', 'clamped', 'setClamped'],
  'color-picker': ['open', 'value', 'rgba', 'hsva', 'swatches', 'picking', 'eyeDropperSupported', 'setOpen'],
  'combobox': ['open', 'value', 'inputValue', 'highlightedValue', 'empty', 'isSelected', 'setOpen', 'setValue', 'setInputValue', 'clear'],
  'context-menu': ['open', 'point', 'setOpen', 'openAt'],
  'date-field': ['value', 'valueAsDate', 'segments', 'complete', 'empty', 'outOfRange', 'focusedSegment', 'setValue', 'clear', 'canClear'],
  'date-picker': ['open', 'value', 'valueAsString', 'focusedValue', 'visibleMonth', 'canGoPrev', 'canGoNext', 'canClear', 'setOpen', 'setValue', 'clear'],
  'dialog': ['open', 'setOpen'],
  'diff-view': ['view', 'rows', 'expandedValue', 'stats', 'truncated', 'truncatedLines', 'isEmpty', 'toggleGap', 'setExpandedValue'],
  'drawer': ['open', 'side', 'setOpen'],
  'field-array': ['items', 'value', 'count', 'empty', 'atMin', 'atMax', 'canAdd', 'setValue', 'add', 'remove', 'move', 'moveUp', 'moveDown'],
  'editable': ['value', 'displayValue', 'editing', 'empty', 'setValue', 'edit', 'submit', 'cancel'],
  'file-upload': ['remoteFiles', 'allFiles', 'uploadOf', 'startUpload', 'dragging', 'empty', 'disabled', 'maxFiles', 'getFileSizeText'],
  'float-button': ['open', 'setOpen'],
  'floating-panel': ['open', 'windowState', 'position', 'dimensions', 'dragging', 'resizing', 'canDrag', 'canResize', 'setOpen', 'setPosition', 'setDimensions', 'setWindowState'],
  'form': ['values', 'errors', 'validating'],
  'heatmap': ['variant', 'focusedCell', 'focusedDate', 'anchorCell', 'anchorDate', 'activeCell', 'detailOpen', 'cellAt', 'setFocusedCell', 'setFocusedDate'],
  'hover-card': ['open', 'setOpen'],
  'image': ['status', 'loaded', 'showFallback', 'showPlaceholder'],
  'image-cropper': ['value', 'zoom', 'rotation', 'natural', 'dragging', 'resizing', 'disabled', 'readOnly', 'getCropRect', 'setValue', 'setZoom', 'setRotation'],
  'image-viewer': ['open', 'index', 'count', 'currentItem', 'transform', 'imageStatus', 'canPrev', 'canNext', 'setOpen', 'setIndex', 'next', 'prev', 'zoomIn', 'zoomOut', 'setScale', 'rotateLeft', 'rotateRight', 'flipHorizontal', 'flipVertical', 'reset'],
  'infinite-scroll': ['phase', 'loading', 'disabled'],
  'listbox': ['value', 'selectionMode', 'focusedValue', 'isSelected', 'setValue', 'select', 'toggle'],
  'loading-bar': ['phase', 'value', 'visible', 'indeterminate'],
  'log': ['rows', 'loading', 'atBottom', 'sticking', 'showScrollToEndTrigger'],
  'markdown-stream': ['blocks', 'streaming', 'announcement'],
  'mention': ['open', 'value', 'query', 'activePrefix', 'highlightedValue', 'setValue', 'close'],
  'menu': ['open', 'setOpen'],
  'menubar': ['value', 'open', 'setValue'],
  'message-feed': ['status', 'atBottom', 'sticking', 'focusedId', 'showScrollToEndTrigger', 'scrollToItem', 'focusItem'],
  'number-field': ['value', 'valueAsNumber', 'empty', 'canIncrement', 'canDecrement', 'setValue', 'increment', 'decrement'],
  'pagination': ['pageSizeOptions', 'count', 'openEllipsis', 'previousPage', 'nextPage', 'goToPrevPage', 'goToNextPage'],
  'password-input': ['value', 'empty', 'visible', 'capsLock', 'inputType', 'setValue', 'setVisible', 'toggleVisibility'],
  'pin-input': ['value', 'valueAsString', 'complete', 'length', 'focusedIndex', 'setValue', 'clear'],
  'popconfirm': ['open', 'pending', 'setOpen', 'confirm', 'cancel'],
  'popover': ['open', 'setOpen'],
  'prompt-input': ['value', 'isComposing', 'canSubmit', 'loading', 'disabled', 'setValue', 'submit', 'stop'],
  'question-flow': ['status', 'submitted', 'index', 'count', 'current', 'isFirst', 'isLast', 'canAdvance', 'allowSkip', 'counter', 'announcement', 'answers', 'notes', 'goTo', 'next', 'prev', 'skip', 'submit', 'toggleOption', 'setNote'],
  'rating': ['value', 'hoveredValue', 'highlightedValue', 'count', 'empty', 'items', 'getItemState', 'setValue'],
  'reasoning': ['open', 'streaming', 'disabled', 'setOpen'],
  'resizable': ['dimensions', 'offset', 'resizing', 'activeEdge'],
  'scroll-area': ['vertical', 'horizontal', 'draggingAxis', 'cornerVisible'],
  'scrollbar': ['visible', 'native', 'overflow', 'dragging', 'scrolling', 'thumbSize', 'thumbOffset', 'scroll', 'max', 'scrollTo', 'scrollBy'],
  'select': ['open', 'value', 'displayText', 'setOpen', 'setValue', 'clear', 'deselect'],
  'side-nav': ['value', 'expandedValue', 'collapsed', 'popoutValue', 'isSelected', 'isExpanded', 'isActiveBranch', 'select', 'setValue', 'setExpandedValue', 'expand', 'collapse', 'openPopout', 'closePopout'],
  'signature-pad': ['paths', 'drawing', 'disabled', 'readOnly', 'statusText'],
  'slider': ['value', 'thumbs', 'range', 'dragging', 'setValue', 'setThumbValue'],
  'sortable': ['items', 'dragging', 'activeId', 'from', 'to', 'mode'],
  'splitter': ['size', 'panels', 'dragging', 'setSizes', 'setPanelSize', 'collapsePanel', 'expandPanel', 'togglePanel'],
  'steps': ['value', 'count', 'complete', 'setValue', 'goToNextStep', 'goToPrevStep'],
  'table': ['columns', 'columnPreference', 'setColumnHidden', 'moveColumn', 'setColumnWidth', 'setColumnPreference', 'rowNumber', 'visibleRows', 'sort', 'selection', 'selectionState', 'expandedValue', 'focusedRow', 'empty', 'loading', 'isSelected', 'isExpanded', 'sortDirection', 'sortPriority', 'toggleSort', 'selectRow', 'toggleSelectAll', 'toggleExpandRow', 'rowReorderDisabledReason'],
  'tags-input': ['value', 'count', 'inputValue', 'empty', 'atMax', 'overflow', 'highlightedValue', 'editedValue', 'canClear', 'setValue', 'addValue', 'deleteValue', 'clear', 'setInputValue', 'highlight', 'edit'],
  'text-field': ['value', 'empty', 'atLimit'],
  'time-field': ['value', 'empty', 'outOfRange', 'canClear', 'segments', 'focusedSegment', 'hourCycle', 'granularity', 'setValue', 'clear'],
  'time-picker': ['open', 'value', 'empty', 'outOfRange', 'segments', 'canClear', 'setOpen', 'setValue', 'clear'],
  'timer': ['phase', 'value', 'text', 'controlled', 'elapsed', 'running', 'paused', 'completed', 'countdown', 'segments', 'segmentText', 'controlAction', 'controlLabel'],
  'toast': ['id', 'status', 'type', 'paused', 'remaining', 'dismiss', 'pause', 'resume'],
  'tool-call': ['open', 'phase', 'running', 'disabled', 'statusText', 'durationMs', 'setOpen'],
  'toolbar': ['focusedValue', 'orientation', 'disabled'],
  'tooltip': ['open', 'setOpen'],
  'tour': ['open', 'value', 'count', 'currentStep', 'firstStep', 'lastStep', 'progressText', 'setOpen', 'setValue', 'goToNextStep', 'goToPrevStep', 'skip'],
  'transfer': ['value', 'selection', 'canMove', 'checkState', 'isChecked', 'setValue', 'setSelection', 'toggle', 'toggleAll', 'move'],
  'tree': ['visibleNodes', 'expandedValue', 'selection', 'focusedValue', 'isExpanded', 'isSelected', 'isIndeterminate', 'expand', 'collapse', 'select'],
  'tree-select': ['open', 'value', 'expandedValue', 'visibleNodes', 'focusedValue', 'displayText', 'canClear', 'isSelected', 'isIndeterminate', 'isExpanded', 'setOpen', 'setValue', 'setExpandedValue', 'expand', 'collapse', 'select', 'clear'],
  'virtualizer': ['startIndex', 'endIndex', 'scrolling', 'lanes'],
}

function parse(text, name) {
  // .tsx 必须按 TSX 解析：按 TS 解析时 JSX 会被当成类型断言，整棵语法树跟着散架，
  // 遍历一个节点都找不到——判据于是恒绿，这种漏检比判错更难发现
  const kind = name.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  return ts.createSourceFile(name, text, ts.ScriptTarget.Latest, true, kind)
}

/** 剥掉 `!` 与括号，露出里面那个表达式。 */
function unwrap(node) {
  let cur = node
  while (ts.isNonNullExpression(cur) || ts.isParenthesizedExpression(cur))
    cur = cur.expression
  return cur
}

/**
 * 从一个「拿到了 api」的表达式往外爬，拼出它读的成员链：
 * `connectX(…).calendar.weeks` → `calendar.weeks`，`this.api()?.setPage(n)` → `setPage`。
 * 一路读到调用为止——调用之后接的是返回值上的东西，不再是 api 的成员。
 */
function chainFrom(root) {
  const parts = []
  let cur = root
  for (;;) {
    let parent = cur.parent
    while (parent && (ts.isNonNullExpression(parent) || ts.isParenthesizedExpression(parent))) {
      cur = parent
      parent = cur.parent
    }
    if (!parent || !ts.isPropertyAccessExpression(parent) || parent.expression !== cur)
      break
    parts.push(parent.name.text)
    cur = parent
    if (cur.parent && ts.isCallExpression(cur.parent) && cur.parent.expression === cur)
      break
  }
  return parts.length > 0 ? parts.join('.') : null
}

/**
 * 扫一棵子树里读到的全部 api 成员链。
 * `isRoot` 判某个节点是不是「手里已经握着 api」的那一头，两个适配器各给各的。
 */
function apiChains(node, isRoot) {
  const chains = new Set()
  const walk = (n) => {
    if (isRoot(n)) {
      const chain = chainFrom(n)
      if (chain)
        chains.add(chain)
    }
    ts.forEachChild(n, walk)
  }
  walk(node)
  return chains
}

/** `const api = …` 这类把 api 存进局部变量的写法：把变量名也算成「握着 api」的一头。 */
function aliasesOf(scopeNode, isRoot) {
  const names = new Set()
  const walk = (n) => {
    if (ts.isVariableDeclaration(n) && n.initializer && ts.isIdentifier(n.name) && isRoot(unwrap(n.initializer)))
      names.add(n.name.text)
    ts.forEachChild(n, walk)
  }
  walk(scopeNode)
  return names
}

// ── 元素侧 ──

/** 标签 → 元素类名、类名 → 元素文件名，两份都从注册表 define.ts 里读。 */
async function readRegistry() {
  const src = await readFile(DEFINE, 'utf8')
  const tagToClass = new Map()
  for (const m of src.matchAll(/defineElement\('([\w-]+)',\s*(\w+)/g))
    tagToClass.set(m[1], m[2])
  const classToFile = new Map()
  for (const m of src.matchAll(/import \{([^}]+)\} from '\.\/elements\/([\w-]+)'/g)) {
    for (const name of m[1].split(','))
      classToFile.set(name.trim(), m[2])
  }
  return { tagToClass, classToFile }
}

/** 元素上作者取得到的东西：公开 get 与公开方法，各自记下名字与读到的 api 成员链。 */
function elementPorts(source, fileName, className) {
  const sf = parse(source, fileName)
  const ports = { names: new Set(), chains: new Set() }
  const collect = (klass) => {
    // 先认出「把 connect 的结果原样交出来」的自家方法，调它等同于握着 api
    const relays = new Set()
    for (const member of klass.members) {
      if ((ts.isMethodDeclaration(member) || ts.isGetAccessor(member))
        && ts.isIdentifier(member.name)
        && /return[\s\S]+\bconnect[A-Z]\w*\(/.test(member.getText())) {
        relays.add(member.name.text)
      }
    }
    const isRoot = (n) => {
      if (!ts.isCallExpression(n))
        return false
      const callee = unwrap(n.expression)
      if (ts.isIdentifier(callee))
        return /^connect[A-Z]/.test(callee.text)
      return ts.isPropertyAccessExpression(callee)
        && callee.expression.kind === ts.SyntaxKind.ThisKeyword
        && relays.has(callee.name.text)
    }
    for (const member of klass.members) {
      if (!ts.isGetAccessor(member) && !ts.isMethodDeclaration(member))
        continue
      const flags = ts.getCombinedModifierFlags(member)
      if (flags & (ts.ModifierFlags.Private | ts.ModifierFlags.Protected | ts.ModifierFlags.Static))
        continue
      if (!ts.isIdentifier(member.name) || LIFECYCLE.has(member.name.text))
        continue
      ports.names.add(member.name.text)
      if (!member.body)
        continue
      const alias = aliasesOf(member.body, isRoot)
      const rooted = n => isRoot(n) || (ts.isIdentifier(n) && alias.has(n.text))
      for (const chain of apiChains(member.body, rooted))
        ports.chains.add(chain)
    }
  }
  const walk = (node) => {
    if (ts.isClassDeclaration(node) && node.name?.text === className)
      collect(node)
    ts.forEachChild(node, walk)
  }
  walk(sf)
  return ports
}

// ── Vue 侧 ──

/** api 在 Vue 侧长这样：`ctx.api.value` / `api.value`。 */
function isVueApiRoot(node) {
  return ts.isPropertyAccessExpression(node)
    && node.name.text === 'value'
    && /(?:^|\.)api$/.test(node.expression.getText().replaceAll(/\s/g, ''))
}

/**
 * 组件目录下 use-*.ts 在返回对象上摊平的那几个命令：名字 → 它读的 api 成员链。
 * Root 有时交的是 composable 上这一层（`create: ctx.create`），得再往里跟一跳才看得见读的是谁。
 */
function composableChains(source, fileName) {
  const sf = parse(source, fileName)
  const alias = aliasesOf(sf, isVueApiRoot)
  const rooted = n => isVueApiRoot(n) || (ts.isIdentifier(n) && alias.has(n.text))
  const map = new Map()
  const walk = (n) => {
    if (ts.isPropertyAssignment(n) && ts.isIdentifier(n.name)) {
      const chains = apiChains(n.initializer, rooted)
      if (chains.size > 0)
        map.set(n.name.text, new Set([...(map.get(n.name.text) ?? []), ...chains]))
    }
    ts.forEachChild(n, walk)
  }
  walk(sf)
  return map
}

/** Root 组件默认插槽的作用域：键 → 这一项读到的 api 成员链。 */
function rootSlotScope(source, fileName, viaComposable) {
  const sf = parse(source, fileName)
  let scope = null
  const walk = (node) => {
    if (ts.isCallExpression(node)
      && node.expression.getText().endsWith('defineComponent')
      && node.arguments[0]
      && ts.isObjectLiteralExpression(node.arguments[0])) {
      const options = node.arguments[0]
      const named = options.properties.find(p => ts.isPropertyAssignment(p) && p.name.getText() === 'name')
      const componentName = named ? named.initializer.getText().replaceAll('\'', '') : ''
      if (/^Xh\w*Root$/.test(componentName))
        scope = collectSlotScope(options, viaComposable)
    }
    ts.forEachChild(node, walk)
  }
  walk(sf)
  return scope
}

/** 摘出 `slots.default?.({ … })` 的键，以及每个键读到的 api 成员链。 */
function collectSlotScope(options, viaComposable) {
  const alias = aliasesOf(options, isVueApiRoot)
  const rooted = n => isVueApiRoot(n) || (ts.isIdentifier(n) && alias.has(n.text))
  const scope = new Map()
  const walk = (n) => {
    if (ts.isCallExpression(n) && /(?:^|\W)slots\.default[?!]?$/.test(n.expression.getText().replaceAll(/\s/g, ''))) {
      const arg = n.arguments[0]
      if (arg && ts.isObjectLiteralExpression(arg)) {
        for (const prop of arg.properties) {
          if (ts.isPropertyAssignment(prop)) {
            const chains = apiChains(prop.initializer, rooted)
            scope.set(
              prop.name.getText().replaceAll('\'', ''),
              chains.size > 0 ? chains : throughComposable(prop.initializer, viaComposable),
            )
          }
          else if (ts.isShorthandPropertyAssignment(prop)) {
            scope.set(prop.name.getText(), viaComposable.get(prop.name.getText()) ?? new Set())
          }
        }
      }
    }
    ts.forEachChild(n, walk)
  }
  walk(options)
  return scope
}

/** 交出去的是 composable 上摊平的那一层（`ctx.create`）时，跟进去看它读的是哪个 api 成员。 */
function throughComposable(initializer, viaComposable) {
  const chains = new Set()
  const walk = (n) => {
    if (ts.isPropertyAccessExpression(n)) {
      for (const chain of viaComposable.get(n.name.text) ?? [])
        chains.add(chain)
    }
    ts.forEachChild(n, walk)
  }
  walk(initializer)
  return chains
}

// ── React 侧 ──

/** api 在 React 侧长这样：从 use-<组件> 里解构出来的 `api`，不像 Vue 那样裹一层 ref。 */
function isReactApiRoot(node) {
  return ts.isIdentifier(node) && node.text === 'api'
}

/**
 * React 组件交给作者的东西：函数式 children 的参数对象。
 * 记下键名，以及每个键读到的 api 成员链——与元素侧一样，名字撞上了也算数。
 */
function childrenPayload(source, fileName) {
  const sf = parse(source, fileName)
  const alias = aliasesOf(sf, isReactApiRoot)
  const rooted = n => isReactApiRoot(n) || (ts.isIdentifier(n) && alias.has(n.text))
  const ports = { names: new Set(), chains: new Set() }
  const walk = (n) => {
    if (ts.isCallExpression(n)) {
      const callee = n.expression.getText().replaceAll(/\s/g, '')
      // 两种写法：直接调函数式 children，或经库自带的 renderSlot 助手转一道。
      // 后者的载荷是第二个实参，第一个是 children 本身
      const direct = /(?:^|\.)children$/.test(callee)
      const viaHelper = /(?:^|\.)renderSlot$/.test(callee)
      const arg = direct ? n.arguments[0] : viaHelper ? n.arguments[1] : undefined
      if (arg && ts.isObjectLiteralExpression(arg)) {
        for (const prop of arg.properties) {
          if (ts.isPropertyAssignment(prop)) {
            ports.names.add(prop.name.getText().replaceAll('\'', ''))
            for (const chain of apiChains(prop.initializer, rooted))
              ports.chains.add(chain)
          }
          else if (ts.isShorthandPropertyAssignment(prop)) {
            ports.names.add(prop.name.getText())
          }
        }
      }
    }
    ts.forEachChild(n, walk)
  }
  walk(sf)
  return ports
}

/** 一个 React 组件目录里所有 .ts / .tsx 合起来的取数口。 */
async function reactPorts(comp) {
  const ports = { names: new Set(), chains: new Set() }

  // 没有机器的那几个与 Vue 侧一样是单文件平铺，不在同名目录里
  for (const ext of ['tsx', 'ts']) {
    try {
      const file = `${comp}.${ext}`
      const found = childrenPayload(await readFile(join(REACT, file), 'utf8'), file)
      for (const name of found.names)
        ports.names.add(name)
      for (const chain of found.chains)
        ports.chains.add(chain)
      return ports
    }
    catch {
      // 换下一种扩展名，都没有就按目录读
    }
  }

  let entries
  try {
    entries = await readdir(join(REACT, comp), { withFileTypes: true })
  }
  catch {
    return ports
  }
  for (const entry of entries) {
    if (!entry.isFile() || !/\.tsx?$/.test(entry.name))
      continue
    const found = childrenPayload(await readFile(join(REACT, comp, entry.name), 'utf8'), entry.name)
    for (const name of found.names)
      ports.names.add(name)
    for (const chain of found.chains)
      ports.chains.add(chain)
  }
  return ports
}

// ── 比对 ──

const { tagToClass, classToFile } = await readRegistry()
if (tagToClass.size === 0) {
  console.error('[check-read-ports] ✗ 从 define.ts 一个自定义元素都没读到，注册写法变了')
  process.exit(1)
}

/** 组件名 → 元素上的取数口。标签写作 xh-<组件>，与 Vue 那边的组件目录同名。 */
const ports = new Map()
for (const [tag, className] of tagToClass) {
  const file = classToFile.get(className)
  if (!file) {
    console.error(`[check-read-ports] ✗ ${tag} 注册的 ${className} 在 define.ts 里找不到出处，扫不到它的取数口`)
    process.exit(1)
  }
  ports.set(tag.replace(/^xh-/, ''), elementPorts(await readFile(join(WC, `${file}.ts`), 'utf8'), file, className))
}

/** React 侧已经铺到的组件，没铺到的不核 React 这一侧。 */
const covered = await reactCovered()
const vueEntries = await readdir(VUE, { withFileTypes: true })
/** 库里的组件数：vue 组件目录下既有 <名>/ 目录也有平铺的 <名>.ts。给 React 的铺开进度当分母。 */
const componentTotal = new Set(
  vueEntries.filter(e => e.isDirectory() || e.name.endsWith('.ts')).map(e => e.name.replace(/\.ts$/, '')),
).size

const gaps = new Map()
/** React 侧对不上的：键是组件，值是插槽作用域交了、函数式 children 却没交出去的那几样。 */
const reactGaps = new Map()
let compared = 0
let handed = 0
let reactCompared = 0
for (const dir of vueEntries) {
  if (!dir.isDirectory())
    continue
  const comp = dir.name
  const files = (await readdir(join(VUE, comp))).filter(f => f.endsWith('.ts')).sort()
  const viaComposable = new Map()
  for (const file of files.filter(f => f.startsWith('use-'))) {
    for (const [name, chains] of composableChains(await readFile(join(VUE, comp, file), 'utf8'), file))
      viaComposable.set(name, new Set([...(viaComposable.get(name) ?? []), ...chains]))
  }
  let scope = null
  for (const file of files)
    scope = rootSlotScope(await readFile(join(VUE, comp, file), 'utf8'), file, viaComposable) ?? scope
  if (!scope || scope.size === 0)
    continue
  compared++
  handed += scope.size
  const available = ports.get(comp) ?? { names: new Set(), chains: new Set() }
  const missing = [...scope]
    .filter(([key, chains]) => !available.names.has(key) && ![...chains].some(c => available.chains.has(c)))
    .map(([key]) => key)
  if (missing.length > 0)
    gaps.set(comp, missing)

  if (!covered.has(comp))
    continue
  reactCompared++
  const payload = await reactPorts(comp)
  const reactMissing = [...scope]
    .filter(([key, chains]) => !payload.names.has(key) && ![...chains].some(c => payload.chains.has(c)))
    .map(([key]) => key)
  if (reactMissing.length > 0)
    reactGaps.set(comp, reactMissing)
}

if (process.argv.includes('--report')) {
  // 照 PENDING 的形状打出来，方便把当前存量整段换进去
  for (const [comp, missing] of [...gaps].sort())
    console.log(`  '${comp}': [${missing.map(n => `'${n}'`).join(', ')}],`)
  const total = [...gaps.values()].reduce((n, list) => n + list.length, 0)
  console.log(`\n// 有插槽作用域的组件 ${compared} 份，交出去 ${handed} 样；还没对齐 ${gaps.size} 份 · ${total} 样`)
  process.exit(0)
}

if (process.argv.includes('--rank')) {
  // 按「有多少份 Vue 示例真的解构过这个名字」排缺口：解构得越多，作者自己重算的压力越大
  const rows = []
  for (const [comp, missing] of gaps) {
    let files = []
    try {
      files = (await readdir(join(DEMOS, comp))).filter(f => f.endsWith('.vue'))
    }
    catch {
      files = []
    }
    const counts = new Map()
    for (const file of files) {
      const text = await readFile(join(DEMOS, comp, file), 'utf8')
      // 只认插槽作用域的解构头，正文里同名的局部变量不算
      const bound = new Set(
        [...text.matchAll(/(?:v-slot(?::\w+)?|#\w+)="\{([^}]*)\}"/g)]
          .flatMap(m => m[1].split(',').map(piece => piece.trim().split(':')[0].trim())),
      )
      for (const name of missing) {
        if (bound.has(name))
          counts.set(name, (counts.get(name) ?? 0) + 1)
      }
    }
    rows.push({ comp, demos: files.length, missing, counts, used: [...counts.values()].reduce((a, b) => a + b, 0) })
  }
  rows.sort((a, b) => b.used - a.used || b.missing.length - a.missing.length || a.comp.localeCompare(b.comp))
  console.log('组件\t示例\t缺口\t被示例解构\t按次数排的名字')
  for (const r of rows) {
    const named = [...r.counts].sort((a, b) => b[1] - a[1]).map(([n, c]) => `${n}×${c}`).join(' ')
    console.log(`${r.comp}\t${r.demos}\t${r.missing.length}\t${r.used}\t${named}`)
  }
  const used = rows.reduce((n, r) => n + r.used, 0)
  const total = rows.reduce((n, r) => n + r.missing.length, 0)
  console.log(`\n合计：${rows.length} 份组件 · ${total} 个缺口名字，在 Vue 示例里共被解构 ${used} 次`)
  process.exit(0)
}

const errors = []
for (const [comp, missing] of [...gaps].sort()) {
  const listed = PENDING[comp]
  if (!listed) {
    errors.push(`${comp} 没登记，元素上取不到：${missing.join(' ')}`)
    continue
  }
  const extra = missing.filter(n => !listed.includes(n))
  if (extra.length > 0)
    errors.push(`${comp} 登记表里少了：${extra.join(' ')}`)
}
for (const [comp, listed] of Object.entries(PENDING).sort()) {
  const missing = gaps.get(comp)
  if (!missing) {
    errors.push(`${comp} 已经对齐了还留在登记表里——整条删掉`)
    continue
  }
  const stale = listed.filter(n => !missing.includes(n))
  if (stale.length > 0)
    errors.push(`${comp} 这几样已经取得到了，从登记表里删掉：${stale.join(' ')}`)
}

/** React 侧没有存量清单，铺到的组件差一样就判红。 */
const reactErrors = []
for (const [comp, missing] of [...reactGaps].sort())
  reactErrors.push(`${comp} 的函数式 children 没把这几样交出去：${missing.join(' ')}`)

if (errors.length > 0 || reactErrors.length > 0) {
  console.error('[check-read-ports] ✗ 插槽作用域与另外两侧的取数口对不上：')
  for (const e of errors)
    console.error(`  ${ADAPTERS.wc.label}：${e}`)
  for (const e of reactErrors)
    console.error(`  ${ADAPTERS.react.label}：${e}`)
  if (errors.length > 0) {
    console.error('\n元素上补一个 get（机器没建起时给安全空值）或公开方法，读的 api 成员与插槽作用域那一项一致；')
    console.error('补完把 PENDING 里对应的那几样删掉。当前存量用 --report 打出来。')
  }
  if (reactErrors.length > 0)
    console.error('\nReact 上把这几样加进 children 的参数对象里，读的 api 成员与插槽作用域那一项一致。')
  process.exit(1)
}

const pendingCount = Object.values(PENDING).reduce((n, list) => n + list.length, 0)
console.log(`[check-read-ports] 通过：${compared} 份 Root 插槽作用域共 ${handed} 样，${ADAPTERS.wc.label} 侧逐样对齐（存量清单还剩 ${gaps.size} 份 · ${pendingCount} 样）；${reactProgress(covered, componentTotal)}，其中有插槽作用域可比对的 ${reactCompared} 份，函数式 children 逐样对齐`)
