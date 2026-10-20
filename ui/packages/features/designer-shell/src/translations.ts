/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 零件的文案键：键是零件的标签名，四款共用的命令文案另占一桶 xh-designer-commands；类型补进 UI 的 XhTranslationOverrides。

import type { JsonTextErrorCode } from '@xihan-ui/core/json'
import type { DataFieldContent } from '@xihan-ui/designer-kit'
import type { FieldInferenceNoteCode } from '@xihan-ui/designer-kit/field-inference'
import type { FilterValueType } from '@xihan-ui/viz'

/** 属性面板的文案。 */
export interface DesignerPropertiesTranslations {
  /** 面板标题。 */
  readonly title: string
  /** 没有可编辑的属性时的提示。 */
  readonly empty: string
  /** 多个对象取值不同时的占位。 */
  readonly mixed: string
  /** JSON 编辑框里的文字不是合法 JSON。 */
  readonly invalidJson: string
  /** 数字要求整数却填了小数。 */
  readonly notInteger: string
  /** 数字小于下限 min（不含单位的数值与单位已拼好）。 */
  readonly belowMinimum: (min: string) => string
  /** 数字大于上限 max。 */
  readonly aboveMaximum: (max: string) => string
  /** 数字没有大于开区间下限 min。 */
  readonly notAboveMinimum: (min: string) => string
  /** 没有字段树时，绑定字段框里的文字不是字段路径。 */
  readonly invalidDataField: string
  /** 四边编辑器的开关文字。 */
  readonly sidesLinked: string
  /** 四边编辑器各数字框的名字：all 是四边相同时那一个。 */
  readonly sides: Readonly<{ all: string, top: string, right: string, bottom: string, left: string }>
  /** 四边分开填时有边空着。 */
  readonly sidesIncomplete: string
  /** 颜色预设旁边自定义颜色框的名字。 */
  readonly customColor: string
  /** 选项表三列的列名：值、文字与禁用。 */
  readonly optionColumns: Readonly<{ value: string, label: string, disabled: string }>
  /** 选项表一格里控件的名字：column 是这一列的列名，row 是第几项（从 1 数）。 */
  readonly optionCell: (column: string, row: number) => string
  /** 布尔选项值格里显示的文字。 */
  readonly optionBoolean: Readonly<{ true: string, false: string }>
  /** 选项树一格里控件的名字：column 是这一列的列名，outline 是这一项的大纲号（如 1.2）。 */
  readonly optionTreeCell: (column: string, outline: string) => string
  /** 选项树操作那一列的列名。 */
  readonly optionActions: string
  /** 选项树里给一项加子项那颗钮的名字。 */
  readonly optionAddChild: (outline: string) => string
  /** 选项树里删除一项那颗钮的名字。 */
  readonly optionRemove: (outline: string) => string
  /** 选项树下面在顶层末尾新增一项的钮。 */
  readonly optionAdd: string
}

/** 问题列表的文案。 */
export interface DesignerIssuesTranslations {
  /** 列表标题。 */
  readonly title: string
  /** 没有问题时的提示。 */
  readonly empty: string
  /** 错误过滤开关的文字，带条数。 */
  readonly errors: (count: number) => string
  /** 警告过滤开关的文字，带条数。 */
  readonly warnings: (count: number) => string
  /** 条目前的严重程度：错误。 */
  readonly severityError: string
  /** 条目前的严重程度：警告。 */
  readonly severityWarning: string
  /** 过滤开关组的无障碍名称。 */
  readonly filter: string
  /** 按对象分组时，没有对象的问题那一组的标题。 */
  readonly noTarget: string
}

/** 页面结构的文案。 */
export interface DesignerOutlineTranslations {
  /** 面板标题，也是树的名字。 */
  readonly title: string
  /** 面板头里的帮助：这块面板列的是什么、怎么用。 */
  readonly help: string
  /** 搜索框的名称与占位。 */
  readonly search: string
  /** 搜索没有结果时的提示。 */
  readonly noMatches: string
  /** 模板里还没有内容时的提示。 */
  readonly empty: string
  /** 一行的删除钮的名字，label 是这一行的名字。 */
  readonly remove: (label: string) => string
}

/** 历史记录的文案。 */
export interface DesignerHistoryTranslations {
  /** 面板标题，也是列表的名字。 */
  readonly title: string
  /** 面板头里的帮助。 */
  readonly help: string
  /** 起点那一行：打开、重新载入或清空之后的状态。 */
  readonly origin: string
  /** 起点那一行：起点之前有被步数上限丢掉的步骤。 */
  readonly originTruncated: string
  /** 没有说明的一步。 */
  readonly untitled: string
  /** 已撤销的一步的副文本。 */
  readonly undone: string
  /** 保存点那一行的副文本。 */
  readonly saved: string
  /** 还没有任何一步时的提示。 */
  readonly empty: string
  /** 零件头部清空钮的文字。 */
  readonly clear: string
  /** 清空前确认框的标题。 */
  readonly clearConfirmTitle: string
  /** 清空前确认框的正文。 */
  readonly clearConfirmContent: string
  /** 清空前确认框的确定钮。 */
  readonly clearConfirmOk: string
  /** 撤销一步之后的播报，label 是撤销掉的那一步的说明。 */
  readonly announceUndo: (label: string) => string
  /** 重做一步之后的播报，label 是重做的那一步的说明。 */
  readonly announceRedo: (label: string) => string
  /** 从历史记录跳到某一步之后的播报，label 是到达的那一行，steps 是走了几步。 */
  readonly announceJump: (label: string, steps: number) => string
  /** 清空之后的播报。 */
  readonly announceCleared: string
}

/** 物料面板的文案。 */
export interface DesignerPaletteTranslations {
  /** 面板标题。 */
  readonly title: string
  /** 搜索框的名称与占位。 */
  readonly search: string
  /** 搜索没有结果时的提示。 */
  readonly noMatches: string
  /** 没有物料时的提示。 */
  readonly empty: string
}

/** 标尺框的文案。 */
export interface DesignerRulerTranslations {
  /** 横向参考线的无障碍名称，入参是格式化后的数值。 */
  readonly horizontalGuide: (value: string) => string
  /** 竖向参考线的无障碍名称，入参是格式化后的数值。 */
  readonly verticalGuide: (value: string) => string
}

/** 外框的文案。 */
export interface DesignerFrameTranslations {
  /** 分隔条所在布局的无障碍名称。 */
  readonly layout: string
  /** 一栏里两块面板之间那条分隔条的无障碍名称，入参是它上面那个区的名称。 */
  readonly resize: (label: string) => string
  /** 左栏与画布之间那条分隔条的无障碍名称（按看到的左右，从右往左书写时是开头那一栏）。 */
  readonly resizeLeft: string
  /** 右栏与画布之间那条分隔条的无障碍名称。 */
  readonly resizeRight: string
  /** 下栏与画布之间那条分隔条的无障碍名称。 */
  readonly resizeBottom: string
  /** 面板头关闭钮的名字，入参是面板标题。 */
  readonly closePanel: (label: string) => string
  /** 面板头帮助钮的名字，入参是面板标题。 */
  readonly panelHelp: (label: string) => string
  /** 面板头收起钮（收成标题条）的名字，入参是面板标题。 */
  readonly minimizePanel: (label: string) => string
  /** 收成标题条以后展开钮的名字，入参是面板标题。 */
  readonly expandPanel: (label: string) => string
  /** 面板头「更多」钮的名字与菜单的无障碍名称，入参是面板标题。 */
  readonly panelMenu: (label: string) => string
  /** 浮出小窗标题栏上停靠钮的名字，入参是面板标题。 */
  readonly dockPanel: (label: string) => string
  /** 「更多」菜单：移到左栏。 */
  readonly moveLeft: string
  /** 「更多」菜单：移到右栏。 */
  readonly moveRight: string
  /** 「更多」菜单：移到下栏。 */
  readonly moveBottom: string
  /** 「更多」菜单：在这一栏里上移。 */
  readonly moveUp: string
  /** 「更多」菜单：在这一栏里下移。 */
  readonly moveDown: string
  /** 「更多」菜单：浮出成小窗。 */
  readonly float: string
  /** 「更多」菜单：吸回原来的栏。 */
  readonly dock: string
  /** 「更多」菜单：收成标题条。 */
  readonly minimize: string
  /** 「更多」菜单：展开。 */
  readonly expand: string
  /** 「更多」菜单：隐藏这块面板。 */
  readonly hide: string
  /** 播报里左栏的叫法。 */
  readonly dockLeft: string
  /** 播报里右栏的叫法。 */
  readonly dockRight: string
  /** 播报里下栏的叫法。 */
  readonly dockBottom: string
  /** 播报：面板挪到了某一栏的第几位。 */
  readonly announceMoved: (label: string, dock: string, position: number) => string
  /** 播报：面板浮出了。 */
  readonly announceFloated: (label: string) => string
  /** 播报：面板停靠到某一栏。 */
  readonly announceDocked: (label: string, dock: string) => string
  /** 播报：面板收成了标题条。 */
  readonly announceMinimized: (label: string) => string
  /** 播报：面板展开了。 */
  readonly announceExpanded: (label: string) => string
  /** 播报：面板隐藏了。 */
  readonly announceHidden: (label: string) => string
}

/** 设置对话框的文案。 */
export interface DesignerSettingsTranslations {
  /** 对话框标题。 */
  readonly title: string
  /** 左边分区导航的无障碍名称。 */
  readonly sections: string
  /** 宿主锁定的条目下方的说明。 */
  readonly locked: string
  /** 内建「基础」分区的名字。 */
  readonly general: string
  /** 主题条目的标签。 */
  readonly theme: string
  /** 主题条目的说明。 */
  readonly themeHint: string
  /** 主题：跟随所在页面。 */
  readonly themeFollow: string
  /** 主题：跟随系统。 */
  readonly themeSystem: string
  /** 主题：亮色。 */
  readonly themeLight: string
  /** 主题：暗色。 */
  readonly themeDark: string
  /** 主题色条目的标签。 */
  readonly brand: string
  /** 主题色条目的说明。 */
  readonly brandHint: string
  /** 主题色：跟随所在页面（不写主题色）。 */
  readonly brandFollow: string
  /** 主题色预设的名字：蓝、青、蓝绿、绿、橙、红、粉、紫，读屏念的就是它。 */
  readonly brandBlue: string
  readonly brandCyan: string
  readonly brandTeal: string
  readonly brandGreen: string
  readonly brandOrange: string
  readonly brandRed: string
  readonly brandPink: string
  readonly brandPurple: string
  /** 工具栏显示方式条目的标签。 */
  readonly toolbarDisplay: string
  /** 工具栏显示方式条目的说明。 */
  readonly toolbarDisplayHint: string
  /** 工具栏显示方式：只显示图标。 */
  readonly toolbarDisplayIcon: string
  /** 工具栏显示方式：只显示文字。 */
  readonly toolbarDisplayText: string
  /** 工具栏显示方式：图标加文字。 */
  readonly toolbarDisplayBoth: string
  /** 状态栏条目的标签。 */
  readonly statusBar: string
  /** 状态栏条目的说明。 */
  readonly statusBarHint: string
  /** 语言条目的标签。 */
  readonly language: string
  /** 语言条目的说明。 */
  readonly languageHint: string
  /** 内建「布局」分区的名字。 */
  readonly layout: string
  /** 「布局」分区里面板表的标签。 */
  readonly layoutPanels: string
  /** 面板表的说明。 */
  readonly layoutPanelsHint: string
  /** 面板表的列名。 */
  readonly layoutColumns: { readonly panel: string, readonly visible: string, readonly dock: string, readonly order: string, readonly minimized: string }
  /** 面板的位置：左、右两栏（从右往左写时按看到的左右）、下栏、浮动，以及画布浮动件的「画布上」。 */
  readonly layoutDocks: { readonly left: string, readonly right: string, readonly bottom: string, readonly floating: string, readonly overlay: string }
  /** 面板表里显示开关的名字。 */
  readonly layoutVisible: (label: string) => string
  /** 面板表里位置下拉的名字。 */
  readonly layoutDock: (label: string) => string
  /** 面板表里上移钮的名字。 */
  readonly layoutMoveUp: (label: string) => string
  /** 面板表里下移钮的名字。 */
  readonly layoutMoveDown: (label: string) => string
  /** 面板表里收起开关的名字。 */
  readonly layoutMinimized: (label: string) => string
  /** 面板表下面的「恢复默认布局」。 */
  readonly layoutReset: string
  /** 内建「工具栏」分区的名字。 */
  readonly toolbar: string
  /** 显示工具栏条目的标签。 */
  readonly toolbarVisible: string
  /** 显示工具栏条目的说明。 */
  readonly toolbarVisibleHint: string
  /** 「工具栏」分区里按钮表的标签。 */
  readonly toolbarLayout: string
  /** 按钮表的说明。 */
  readonly toolbarLayoutHint: string
  /** 按钮表里分组列表的名字。 */
  readonly toolbarGroups: string
  /** 一组的名字，index 从 1 起。 */
  readonly toolbarGroup: (index: number) => string
  /** 组头勾选框的名字。 */
  readonly toolbarGroupToggle: (index: number) => string
  /** 一组里命令列表的名字。 */
  readonly toolbarCommands: (index: number) => string
  /** 命令勾选框的名字。 */
  readonly toolbarCommandToggle: (label: string) => string
  /** 分组与命令拖动把手的名字，label 是那一组或那条命令的名字。 */
  readonly toolbarMove: (label: string) => string
  /** 按钮表下面的「恢复默认」。 */
  readonly toolbarLayoutReset: string
  /** 内建「帮助」分区的名字。 */
  readonly help: string
  /** 帮助页里操作说明的标签。 */
  readonly helpGuide: string
  /** 内建「快捷键」分区的名字。 */
  readonly shortcuts: string
  /** 快捷键表里「通用」一组的名字。 */
  readonly shortcutsCommon: string
  /** 快捷键表里「编辑」一组的名字。 */
  readonly shortcutsEdit: string
  /** 快捷键表里「本设计器」一组的名字。 */
  readonly shortcutsDesigner: string
  /** 快捷键表里「扩展」一组的名字。 */
  readonly shortcutsExtensions: string
  /** 方向键：微移选中的对象。 */
  readonly keyNudge: string
  /** Shift 加方向键：大步微移。 */
  readonly keyNudgeLarge: string
  /** 按住空格拖动画布。 */
  readonly keyPan: string
  /** F10：焦点移到菜单栏，再按一次回来。 */
  readonly keyMenubar: string
  /** Alt+F10：焦点移到选中工具条。 */
  readonly keySelectionToolbar: string
  /** Esc：取消当前操作。 */
  readonly keyCancel: string
  /** 内建「关于」分区的名字。 */
  readonly about: string
  /** 关于页「产品」一行的名字。 */
  readonly aboutProduct: string
  /** 关于页「版本」一行的名字。 */
  readonly aboutVersion: string
  /** 关于页界面库（XiHan.UI）一行的名字。 */
  readonly aboutUi: string
  /** 关于页「许可证」一行的名字。 */
  readonly aboutLicense: string
}

/** 新手引导 <xh-designer-tour> 的文案：几颗钮与 designer-shell 通用步骤的标题与说明。 */
export interface DesignerTourTranslations {
  /** 上一步钮的文字。 */
  readonly prev: string
  /** 下一步钮的文字。 */
  readonly next: string
  /** 最后一步时下一步钮的文字（完成）。 */
  readonly finish: string
  /** 跳过钮的文字。 */
  readonly skip: string
  /** 关闭钮的名字。 */
  readonly close: string
  /** 「第几步，共几步」，step 从 1 起。 */
  readonly progress: (step: number, count: number) => string
  /** 通用步骤「欢迎」的标题。 */
  readonly welcomeTitle: string
  /** 通用步骤「欢迎」的说明。 */
  readonly welcomeDescription: string
  /** 通用步骤「菜单栏」的标题。 */
  readonly menubarTitle: string
  /** 通用步骤「菜单栏」的说明。 */
  readonly menubarDescription: string
  /** 通用步骤「工具栏」的标题。 */
  readonly toolbarTitle: string
  /** 通用步骤「工具栏」的说明。 */
  readonly toolbarDescription: string
  /** 通用步骤「物料」的标题。 */
  readonly paletteTitle: string
  /** 通用步骤「物料」的说明。 */
  readonly paletteDescription: string
  /** 通用步骤「画布」的标题。 */
  readonly canvasTitle: string
  /** 通用步骤「画布」的说明。 */
  readonly canvasDescription: string
  /** 通用步骤「属性」的标题。 */
  readonly propertiesTitle: string
  /** 通用步骤「属性」的说明。 */
  readonly propertiesDescription: string
  /** 通用步骤「问题」的标题。 */
  readonly issuesTitle: string
  /** 通用步骤「问题」的说明。 */
  readonly issuesDescription: string
  /** 通用步骤「状态栏」的标题。 */
  readonly statusTitle: string
  /** 通用步骤「状态栏」的说明。 */
  readonly statusDescription: string
  /** 通用步骤「设置」的标题。 */
  readonly settingsTitle: string
  /** 通用步骤「设置」的说明：设置在「文件」菜单里。 */
  readonly settingsDescription: string
}

/** 四款设计器共用的命令文案：通用编辑、对齐与分布、层级、缩放与视图切换，以及命令工具栏的名字。 */
export interface DesignerCommandsTranslations {
  /** 命令工具栏的无障碍名称。 */
  readonly toolbar: string
  /** 撤销。 */
  readonly undo: string
  /** 重做。 */
  readonly redo: string
  /** 撤销钮带上下一步说明的全名，如「撤销：添加卡片」；要包含 undo 的文字。 */
  readonly undoWith: (label: string) => string
  /** 重做钮带上下一步说明的全名；要包含 redo 的文字。 */
  readonly redoWith: (label: string) => string
  /** 清空历史。 */
  readonly clearHistory: string
  /** 剪切。 */
  readonly cut: string
  /** 复制。 */
  readonly copy: string
  /** 粘贴。 */
  readonly paste: string
  /** 创建副本。 */
  readonly duplicate: string
  /** 删除。 */
  readonly delete: string
  /** 全选。 */
  readonly selectAll: string
  /** 左对齐。 */
  readonly alignLeft: string
  /** 水平居中。 */
  readonly alignCenter: string
  /** 右对齐。 */
  readonly alignRight: string
  /** 顶端对齐。 */
  readonly alignTop: string
  /** 垂直居中。 */
  readonly alignMiddle: string
  /** 底端对齐。 */
  readonly alignBottom: string
  /** 水平等距分布。 */
  readonly distributeHorizontal: string
  /** 垂直等距分布。 */
  readonly distributeVertical: string
  /** 置于顶层。 */
  readonly bringToFront: string
  /** 上移一层。 */
  readonly bringForward: string
  /** 下移一层。 */
  readonly sendBackward: string
  /** 置于底层。 */
  readonly sendToBack: string
  /** 放大。 */
  readonly zoomIn: string
  /** 缩小。 */
  readonly zoomOut: string
  /** 缩放到适合窗口。 */
  readonly zoomToFit: string
  /** 缩放到实际大小。 */
  readonly zoomToActual: string
  /** 切到设计视图。 */
  readonly design: string
  /** 切到预览视图。 */
  readonly preview: string
  /** 内置命令：面板（勾选显示哪些区）。 */
  readonly panels: string
  /** 内置命令：显示或隐藏所有面板。 */
  readonly panelsToggleAll: string
  /** 内置命令：各面板的显隐回到缺省。 */
  readonly panelsRestore: string
  /** 内置命令：整份布局回到缺省。 */
  readonly layoutReset: string
  /** 内置命令：开始新手引导。 */
  readonly startTour: string
  /** 内置命令：拖动工具，开着时在画布上按住拖动平移画布。 */
  readonly panTool: string
  /** 内置命令：打开设置。 */
  readonly settings: string
  /** 内置命令：打开帮助。 */
  readonly help: string
  /** 内置命令：打开导入字段对话框。 */
  readonly importFields: string
  /** 内置命令：打开 JSON 编辑框。 */
  readonly editJson: string
  /** 内置命令：保存。 */
  readonly save: string
  /** 内置命令：打开设置的快捷键页。 */
  readonly shortcuts: string
  /** 内置命令：打开设置的关于页。 */
  readonly about: string
  /** 内置命令：显示或隐藏工具栏（开关式）。 */
  readonly showToolbar: string
  /** 内置命令：显示或隐藏状态栏（开关式）。 */
  readonly showStatusBar: string
  /** 内置命令：视图菜单里收着三条显示开关的「外观」子菜单。 */
  readonly appearance: string
  /** 菜单栏的无障碍名称。 */
  readonly menubar: string
  /** 窄屏时菜单栏收成的那颗钮上的字。 */
  readonly menu: string
  /** 菜单栏的「文件」菜单。 */
  readonly menuFile: string
  /** 菜单栏的「编辑」菜单。 */
  readonly menuEdit: string
  /** 菜单栏的「视图」菜单。 */
  readonly menuView: string
  /** 菜单栏的「帮助」菜单。 */
  readonly menuHelp: string
}

/** 导入字段对话框的文案。 */
export interface DesignerFieldImportTranslations {
  /** 对话框标题。 */
  readonly title: string
  /** 来源页签条的名字。 */
  readonly sources: string
  /** 内置「JSON 样例」页的页签。 */
  readonly sample: string
  /** 内置「JSON Schema」页的页签。 */
  readonly schema: string
  /** JSON 样例输入框的名字。 */
  readonly sampleInput: string
  /** JSON Schema 输入框的名字。 */
  readonly schemaInput: string
  /** 读文件的投放区上的文字。 */
  readonly readFile: string
  /** 文件读不出来。 */
  readonly readFileFailed: string
  /** 解析失败的说明：line、column 从 1 数起，reason 是 parseErrors 里的一句。 */
  readonly parseError: (line: number, column: number, reason: string) => string
  /** 解析失败的几种原因，键是 core/json 的 parseJsonText 给的码。 */
  readonly parseErrors: Readonly<Record<JsonTextErrorCode, string>>
  /** 预览表的名字。 */
  readonly preview: string
  /** 还没有内容时预览处的提示。 */
  readonly empty: string
  /** 预览表的列名：字段名、显示名、类型、内容。 */
  readonly columns: { readonly name: string, readonly label: string, readonly type: string, readonly content: string }
  /** 对象、列表两种字段在「类型」列里的写法。 */
  readonly kinds: { readonly object: string, readonly list: string }
  /** 值字段的数据类型。 */
  readonly types: Readonly<Record<FilterValueType, string>>
  /** 值字段的内容种类。 */
  readonly contents: Readonly<Record<DataFieldContent, string>>
  /** 一行勾选框的名字，path 是用点连起来的字段路径。 */
  readonly include: (path: string) => string
  /** 一行显示名输入框的名字。 */
  readonly labelOf: (path: string) => string
  /** 一行类型下拉的名字。 */
  readonly typeOf: (path: string) => string
  /** 一行内容下拉的名字。 */
  readonly contentOf: (path: string) => string
  /** 推断说明，键是 designer-kit 的说明码；sample-limit 带上每个数组看了几项。 */
  readonly notes: Readonly<Record<Exclude<FieldInferenceNoteCode, 'sample-limit'>, string>> & { readonly 'sample-limit': (limit: number) => string }
  /** 一条说明前面写上字段路径。 */
  readonly noteAt: (path: string, text: string) => string
  /** 合并时同名字段的种类不同：保留现有的。 */
  readonly conflict: (path: string) => string
  /** 合并 / 替换这一组的名字。 */
  readonly mode: string
  /** 并进现有字段。 */
  readonly merge: string
  /** 换掉现有字段。 */
  readonly replace: string
  /** 同时把样例作为示例数据。 */
  readonly useSample: string
  /** 取消钮。 */
  readonly cancel: string
  /** 导入钮。 */
  readonly import: string
}

/** JSON 编辑框的文案。 */
export interface DesignerJsonEditorTranslations {
  /** 对话框标题。 */
  readonly title: string
  /** 编辑框的名字。 */
  readonly input: string
  /** 解析失败的说明：line、column 从 1 数起，reason 是 parseErrors 里的一句。 */
  readonly parseError: (line: number, column: number, reason: string) => string
  /** 解析失败的几种原因，键是 core/json 的 parseJsonText 给的码。 */
  readonly parseErrors: Readonly<Record<JsonTextErrorCode, string>>
  /** 把光标移到解析出错处的钮。 */
  readonly goToError: string
  /** 问题列表的名字。 */
  readonly issues: string
  /** 格式化钮。 */
  readonly format: string
  /** 复制钮。 */
  readonly copy: string
  /** 复制成功后钮旁的一句。 */
  readonly copied: string
  /** 复制失败（没有剪贴板权限、不在安全上下文）时钮旁的一句。 */
  readonly copyFailed: string
  /** 应用钮。 */
  readonly apply: string
  /** 取消钮。 */
  readonly cancel: string
}

/** 变换覆盖层的文案。 */
export interface DesignerTransformTranslations {
  /** 尺寸徽标（宽高两个数字框）这一组的名字。 */
  readonly measure: string
  /** 宽度数字框的名字。 */
  readonly width: string
  /** 高度数字框的名字。 */
  readonly height: string
  /** 只显示不编辑时的整句：宽、高已按精度写好，unit 是单位文字，没有单位时为空串。 */
  readonly measureText: (width: string, height: string, unit: string) => string
}

declare module '@xihan-ui/web-components' {
  interface XhTranslationOverrides {
    'xh-designer-properties'?: Partial<DesignerPropertiesTranslations>
    'xh-designer-issues'?: Partial<DesignerIssuesTranslations>
    'xh-designer-palette'?: Partial<DesignerPaletteTranslations>
    'xh-designer-outline'?: Partial<DesignerOutlineTranslations>
    'xh-designer-history'?: Partial<DesignerHistoryTranslations>
    'xh-designer-ruler'?: Partial<DesignerRulerTranslations>
    'xh-designer-frame'?: Partial<DesignerFrameTranslations>
    'xh-designer-commands'?: Partial<DesignerCommandsTranslations>
    'xh-designer-settings'?: Partial<DesignerSettingsTranslations>
    'xh-designer-field-import'?: Partial<DesignerFieldImportTranslations>
    'xh-designer-json-editor'?: Partial<DesignerJsonEditorTranslations>
    'xh-designer-tour'?: Partial<DesignerTourTranslations>
    'xh-designer-transform'?: Partial<DesignerTransformTranslations>
  }
}
