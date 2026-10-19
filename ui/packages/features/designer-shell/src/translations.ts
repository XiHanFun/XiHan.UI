/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 零件的文案键：键是零件的标签名，四款共用的命令文案另占一桶 xh-designer-commands；类型补进 UI 的 XhTranslationOverrides。

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
  /** 分隔条的无障碍名称，入参是它调整的那个区的名称。 */
  readonly resize: (label: string) => string
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
  /** 内置命令：打开设置。 */
  readonly settings: string
  /** 内置命令：打开帮助。 */
  readonly help: string
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
    'xh-designer-transform'?: Partial<DesignerTransformTranslations>
  }
}
