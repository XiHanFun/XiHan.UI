---
"@xihan-ui/tokens": minor
"@xihan-ui/styles": minor
"@xihan-ui/vue": minor
---

统一性收口的头两批：先立门禁让跑偏能红，再补语义令牌把皮肤里的原语引用与互异的字面量收成一处。

**海拔改按角色走。** `--xh-elevation-0…4` 五档删掉，换成三个角色：`raised`（静态抬起面：卡片的 elevated 变体、分段控制器的滑块、滑杆拇指）、`floating`（锚定浮层：下拉、菜单、popover、hover-card、tooltip）、`sheet`（遮罩式与通知：dialog / drawer / toast / tour / floating-panel / float-button / back-top）。深色主题的三档更重、外加一圈 1px 浅描边，暗底上浮层才分得出层。34 份皮肤全部迁过去，`check-elevation-role` 校验每处阴影都走角色、且 27 个浮层/遮罩面的角色与部件对得上。这是公开面的删减，基线已推。

**字号不再下探原语。** 新增 `--xh-control-font-sm/md/lg`（控件主文字，与 `--xh-control-h-*` 同构按档走）、`--xh-control-caption-sm/md/lg`（控件里的次级文字：提示、计数、快捷键、清空钮，比同档主文字低一级）、`--xh-text-heading-1/2-*`、`--xh-text-caption-size`、`--xh-text-secondary-size`。皮肤里两百三十处 `--xh-font-size-*` 引用全部换成语义档；typography 的六级标题与 rating 的星标是字号阶梯本身，登记为例外。`check-text-scale` 守住。

**默认宽度、内衬、轨道、折叠面的共享字面量收成令牌。** `--xh-control-min-w`（12rem）统一了 select / combobox / tree-select / cascader / color-picker / date-picker 六个触发器此前的六个值，time-picker / text-field / date-field / time-field / password-input 五家此前没有任何宽度声明，现在同样接上；`--xh-surface-py/px-sm/md` 统一了 dialog / drawer / tour / floating-panel / toast 的内衬；`--xh-track-thickness` / `--xh-track-thumb-size` 给滑杆与进度条；`--xh-nav-link-max-w`、`--xh-viewport-max-h`、`--xh-motion-scale-drag`（减弱动效归 1）、`--xh-glyph-size-text`（跟文字走的字形尺寸）、`--xh-control-box-sm/md/lg`（pin-input 的方格，随 compact 收）、`--xh-switch-track-h-*`、`--xh-syntax-string/number/keyword`（code-block 与 json-viewer 的语法色，随主题明暗切换，皮肤里不再有 hex 字面量）。`check-shared-slots` 新增「同后缀跨组件字面量互异也报」。

**聚焦态描边统一成一派。** 此前三派：描边不变只画环、描边跟着环色走（语气轴在这一派整个失效）、只画环不管描边。现在 21 份输入类皮肤都写 `border-color: var(--xh-<c>-<part>-border-focus, var(--xh-_tone, var(--xh-border-control-focus)))`，新令牌 `--xh-border-control-focus` 缺省等于 `--xh-border-control`；time-field 聚焦补上了此前缺的环。`check-focus-ring` 加校验。

**图标尺寸接线。** 38 份画兜底字形的皮肤在 root（浮层族在 content）上声明 `--xh-icon-size: var(--xh-<c>-icon-size, var(--xh-glyph-size-text))`，兜底字形的盒同样按它量——作者往指示符槽塞 `<XhIcon>` 时不再从 1em 跳到 20px。`check-icon-size` 守住。

**几何修正。** pin-input 的方格此前缺省引的是 lg 档高度、sm 档引 md；segmented 横排外盒此前 38px（item 32 + 轨道内衬 + 描边），现在外盒本身即一档控件高、段撑满轨道内侧；checkbox 的方框锚在 `--xh-control-indicator-size` 上随 compact 收；checkbox-group 的指示符不再是 16px 字面量。radio-group / checkbox-group / composer 的禁用态去掉叠加的不透明度（与容器一起变淡会把对比度压穿）。

**门禁。** 新增 `check-stroke-scale`（描边宽度只走 `--xh-stroke-*` / ring）、`check-keyboard-suites`（键盘表非空 ⇒ 一致性套件存在且两个适配器都登记）；`check-control-height` 按「组件 → 控件本体部件」显式管辖（button / toggle / segmented / pagination 等此前在门禁外）并校验 sm/md/lg 档位与 `data-size` 对应；`check-disabled-contrast` 改正则并加跨块判定；`check-shape-scale` 扩到逻辑角与私有槽；`check-keyframe-refs` 增扫适配器源码里的内联动画名（反馈服务的加载徽记改用 Web Animations，不再依赖某份皮肤在场）；`check-state-vocabulary` 接上 `state-vocabulary.json` 真源（`data-state` 的 43 个取值分 9 个族，connect 字面量与皮肤选择器两头对表，并报告「发射但零引用」的属性）；`check-token-refs` 禁皮肤里的颜色字面量。

**套件。** 补 image-viewer（8 行键盘表，Tab 循环两行 jsdom 豁免）与 side-nav（10 行含折叠态弹出）的一致性套件，Vue 与 WC 两侧登记。
