import { createThemeController } from '@xihan-ui/system/runtime'
import { defineXhElements } from '@xihan-ui/wc/define'
import '@xihan-ui/system/tokens.css'
import '@xihan-ui/styled'

// 注册自定义元素（惰性），并应用主题到根元素
defineXhElements()
const theme = createThemeController({ storageKey: 'xh-wc-demo-theme' })

const app = document.getElementById('app')!
app.innerHTML = `
<main class="wrap">
  <header>
    <h1>XiHan.UI · Web Components</h1>
    <button id="theme">切换主题</button>
  </header>
  <p class="lead">
    这些是原生自定义元素（Light-DOM 行为宿主），和 Vue 版共用同一套 headless（machine + connect）。
    打开 DevTools 看 <code>&lt;xh-button&gt;</code>/<code>&lt;xh-dialog&gt;</code> 内被打上的 data-* / aria-*。
  </p>

  <section>
    <h2>Button</h2>
    <div class="row">
      <xh-button variant="solid"><button data-xh-part="root">Solid</button></xh-button>
      <xh-button><button data-xh-part="root">Subtle</button></xh-button>
      <xh-button variant="outline"><button data-xh-part="root">Outline</button></xh-button>
      <xh-button variant="ghost"><button data-xh-part="root">Ghost</button></xh-button>
      <xh-button disabled><button data-xh-part="root">Disabled</button></xh-button>
      <xh-button loading><button data-xh-part="root">Loading</button></xh-button>
      <xh-button size="lg"><button data-xh-part="root">Large</button></xh-button>
    </div>
  </section>

  <section>
    <h2>Dialog</h2>
    <p class="lead">点击打开：焦点陷入内容、Esc 或点遮罩关闭、关闭后焦点回到触发按钮。</p>
    <xh-dialog>
      <button data-xh-part="trigger">打开对话框</button>
      <div data-xh-part="backdrop"></div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <h3 data-xh-part="title">确认操作</h3>
          <p data-xh-part="description">由 dialog 状态机驱动的模态框——与 Vue 版是同一套 headless 逻辑，仅适配器不同。</p>
          <div class="row end">
            <xh-button variant="ghost"><button data-xh-part="root" data-close>取消</button></xh-button>
            <xh-button variant="solid"><button data-xh-part="root" data-close>确定</button></xh-button>
          </div>
          <button data-xh-part="close-trigger" aria-label="关闭">✕</button>
        </div>
      </div>
    </xh-dialog>
  </section>

  <section>
    <h2>Switch</h2>
    <div class="row" style="gap: 16px;">
      <label class="row" style="gap: 8px;">
        <xh-switch default-checked aria-label="Wi-Fi"><button data-xh-part="root"><span data-xh-part="thumb"></span></button></xh-switch>
        <span>Wi-Fi</span>
      </label>
      <label class="row" style="gap: 8px;">
        <xh-switch aria-label="非受控开关"><button data-xh-part="root"><span data-xh-part="thumb"></span></button></xh-switch>
        <span>非受控</span>
      </label>
      <label class="row" style="gap: 8px;">
        <xh-switch disabled aria-label="禁用开关"><button data-xh-part="root"><span data-xh-part="thumb"></span></button></xh-switch>
        <span>禁用</span>
      </label>
    </div>
  </section>

  <section>
    <h2>Checkbox</h2>
    <div class="row" style="gap: 16px;">
      <label class="row" style="gap: 8px;">
        <xh-checkbox aria-label="同意条款"><button data-xh-part="root"><span data-xh-part="indicator"></span></button></xh-checkbox>
        <span>同意条款</span>
      </label>
      <label class="row" style="gap: 8px;">
        <xh-checkbox default-checked aria-label="默认勾选"><button data-xh-part="root"><span data-xh-part="indicator"></span></button></xh-checkbox>
        <span>默认勾选</span>
      </label>
      <label class="row" style="gap: 8px;">
        <xh-checkbox disabled aria-label="禁用"><button data-xh-part="root"><span data-xh-part="indicator"></span></button></xh-checkbox>
        <span>禁用</span>
      </label>
    </div>
  </section>

  <section>
    <h2>Collapsible</h2>
    <xh-collapsible>
      <div data-xh-part="root">
        <button data-xh-part="trigger">展开详情 ▾</button>
        <div data-xh-part="content">
          <p class="lead" style="margin: 8px 0 0;">
            折叠面板跑的是与 Vue 版同一份 collapsible 机器；收起时 content 带 hidden 属性并由元素内联隐藏。
          </p>
        </div>
      </div>
    </xh-collapsible>
  </section>

  <section>
    <h2>Separator</h2>
    <div class="row" style="gap: 0;">
      <span>左</span>
      <xh-separator orientation="vertical"><div data-xh-part="root" style="block-size: 16px; margin-inline: 12px;"></div></xh-separator>
      <span>中</span>
      <xh-separator orientation="vertical"><div data-xh-part="root" style="block-size: 16px; margin-inline: 12px;"></div></xh-separator>
      <span>右</span>
    </div>
    <xh-separator><div data-xh-part="root" style="margin-block: 16px;"></div></xh-separator>
    <span class="lead">上面是水平分隔线。</span>
  </section>

  <section>
    <h2>Toggle</h2>
    <div class="row" style="gap: 16px;">
      <xh-toggle aria-label="加粗"><button data-xh-part="root">B</button></xh-toggle>
      <xh-toggle default-pressed aria-label="默认按下"><button data-xh-part="root">I</button></xh-toggle>
      <xh-toggle disabled aria-label="禁用"><button data-xh-part="root">U</button></xh-toggle>
      <span class="lead">aria-pressed 驱动</span>
    </div>
  </section>

  <section>
    <h2>Progress</h2>
    <xh-progress id="wc-progress" value="40">
      <div data-xh-part="root">
        <div data-xh-part="track"><div data-xh-part="range"></div></div>
      </div>
    </xh-progress>
    <div class="row" style="margin-block-start: 12px;">
      <xh-button variant="subtle"><button data-xh-part="root" data-progress="-20">−20</button></xh-button>
      <xh-button variant="subtle"><button data-xh-part="root" data-progress="20">+20</button></xh-button>
      <span class="lead" id="wc-progress-label">40 / 100</span>
    </div>
  </section>

  <section>
    <h2>Badge</h2>
    <div class="row">
      <xh-badge variant="solid"><span data-xh-part="root">Solid</span></xh-badge>
      <xh-badge variant="subtle"><span data-xh-part="root">Subtle</span></xh-badge>
      <xh-badge variant="outline"><span data-xh-part="root">Outline</span></xh-badge>
    </div>
  </section>

  <section>
    <h2>RadioGroup</h2>
    <p class="lead">四个方向键都能切换；组内只有一个 Tab 停靠点，方向键跳过禁用项。</p>
    <xh-radio-group default-value="standard" name="plan">
      <div data-xh-part="root">
        <span data-xh-part="label">套餐</span>
        <label data-xh-part="item" value="free">
          <input data-xh-part="hidden-input" />
          <span data-xh-part="indicator"></span>
          <span data-xh-part="item-text">免费版</span>
        </label>
        <label data-xh-part="item" value="standard">
          <input data-xh-part="hidden-input" />
          <span data-xh-part="indicator"></span>
          <span data-xh-part="item-text">标准版</span>
        </label>
        <label data-xh-part="item" value="pro" aria-disabled="true">
          <input data-xh-part="hidden-input" />
          <span data-xh-part="indicator"></span>
          <span data-xh-part="item-text">专业版（禁用）</span>
        </label>
      </div>
    </xh-radio-group>
  </section>

  <section>
    <h2>Tabs</h2>
    <p class="lead">automatic 模式：方向键移动焦点并顺带切换；横排时上下键放行给页面。</p>
    <xh-tabs default-value="overview">
      <div data-xh-part="root">
        <div data-xh-part="list">
          <button data-xh-part="trigger" value="overview">概览</button>
          <button data-xh-part="trigger" value="usage">用法</button>
          <button data-xh-part="trigger" value="api" aria-disabled="true">API（禁用）</button>
        </div>
        <div data-xh-part="content" value="overview">概览面板：与 Vue 版共用同一份 tabs 机器。</div>
        <div data-xh-part="content" value="usage">用法面板：面板常挂，靠 hidden 显隐。</div>
        <div data-xh-part="content" value="api">API 面板。</div>
      </div>
    </xh-tabs>
  </section>

  <section>
    <h2>Accordion</h2>
    <p class="lead">不用 roving：每个标题都是正常 Tab 停靠点，方向键额外在标题间移动焦点。</p>
    <xh-accordion multiple>
      <div data-xh-part="root">
        <div data-xh-part="item" value="a">
          <h3 data-xh-part="header"><button data-xh-part="trigger">第一节</button></h3>
          <div data-xh-part="content">展开集合是 string[]，multiple 时可并存。</div>
        </div>
        <div data-xh-part="item" value="b">
          <h3 data-xh-part="header"><button data-xh-part="trigger">第二节</button></h3>
          <div data-xh-part="content">方向键只在标题间搬焦点，永不进内容区。</div>
        </div>
        <div data-xh-part="item" value="c">
          <h3 data-xh-part="header"><button data-xh-part="trigger">第三节</button></h3>
          <div data-xh-part="content">首尾不回绕。</div>
        </div>
      </div>
    </xh-accordion>
  </section>

  <section>
    <h2>Tooltip</h2>
    <p class="lead">悬停等 700ms 才出；聚焦立即出，且此时鼠标移出不会收走它。指针停在提示上也不收起。</p>
    <div class="row" style="gap: 24px;">
      <xh-tooltip placement="top">
        <button data-xh-part="trigger">上方（默认延时）</button>
        <div data-xh-part="positioner">
          <div data-xh-part="content">
            与 Vue 版共用同一份 tooltip 机器
            <div data-xh-part="arrow"></div>
          </div>
        </div>
      </xh-tooltip>
      <xh-tooltip placement="right" open-delay="0">
        <button data-xh-part="trigger">右侧（无延时）</button>
        <div data-xh-part="positioner">
          <div data-xh-part="content">
            placement 由定位引擎落定，空间不够会自动翻面
            <div data-xh-part="arrow"></div>
          </div>
        </div>
      </xh-tooltip>
    </div>
  </section>

  <section>
    <h2>Menu</h2>
    <p class="lead">Enter / Space / ArrowDown 展开并落到首项，ArrowUp 落到末项；方向键跳过禁用项，Escape 关闭并归还焦点。</p>
    <xh-menu id="wc-menu">
      <button data-xh-part="trigger">操作</button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="item" value="copy">复制</div>
          <div data-xh-part="item" value="paste">粘贴</div>
          <div data-xh-part="separator"></div>
          <div data-xh-part="item" value="delete" aria-disabled="true">删除（禁用）</div>
        </div>
        <div data-xh-part="arrow"></div>
      </div>
    </xh-menu>
    <span class="lead" id="wc-menu-picked">最近选中：（无）</span>
  </section>

  <section>
    <h2>Popover</h2>
    <p class="lead">
      点击展开、Escape 或点外部关闭；展开时焦点进入内容，关闭后回到触发按钮。
      下方空间不够时引擎会自动翻到上方（flip）。
    </p>
    <xh-popover placement="bottom-start">
      <button data-xh-part="trigger">打开浮层</button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <h2 data-xh-part="title">订阅设置</h2>
          <p data-xh-part="description">role=dialog，四处 ARIA 互指；定位与 Tooltip 共用同一个引擎。</p>
          <!-- close-trigger 是右上角的图标按钮（定宽定高），放图标而非文案 -->
          <button data-xh-part="close-trigger" aria-label="关闭">✕</button>
          <div data-xh-part="arrow"></div>
        </div>
      </div>
    </xh-popover>
  </section>

  <section>
    <h2>Select</h2>
    <p class="lead">
      Enter / Space / 方向键展开，展开后方向键与 Home / End 移高亮、连打字母检索、Enter 选中；
      收起时直接连打字母即可就地换值。列表用的是与 Popover 同一个定位引擎。
    </p>
    <xh-select id="wc-select" name="fruit" placeholder="请选择">
      <!-- 表单影子控件由作者写这个空壳，元素只按当前值往里补选项 -->
      <select data-xh-part="hidden-select"></select>
      <span data-xh-part="label">水果</span>
      <!-- 必须是 button：div 不可聚焦，"关闭后焦点归还 trigger"就永远等不到 -->
      <button data-xh-part="trigger">
        <span data-xh-part="value-text"></span>
        <span data-xh-part="indicator">▾</span>
      </button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="item" value="apple">
            <span data-xh-part="item-text">苹果</span>
            <span data-xh-part="item-indicator">✓</span>
          </div>
          <div data-xh-part="item" value="banana">
            <span data-xh-part="item-text">香蕉</span>
            <span data-xh-part="item-indicator">✓</span>
          </div>
          <div data-xh-part="item" value="blueberry">
            <span data-xh-part="item-text">蓝莓</span>
            <span data-xh-part="item-indicator">✓</span>
          </div>
          <!-- 条目禁用用 aria-disabled 声明：原生 disabled 会让它不可聚焦，
               而规格要求禁用条目仍可作为方向键的起点 -->
          <div data-xh-part="item" value="cherry" aria-disabled="true">
            <span data-xh-part="item-text">樱桃（缺货）</span>
            <span data-xh-part="item-indicator">✓</span>
          </div>
          <div data-xh-part="item" value="durian">
            <span data-xh-part="item-text">榴莲</span>
            <span data-xh-part="item-indicator">✓</span>
          </div>
        </div>
      </div>
    </xh-select>
    <span class="lead" id="wc-select-value">当前值：（未选）</span>
  </section>

  <section>
    <h2>Avatar</h2>
    <p class="lead">
      图片取回成功才显图，失败或没有 src 则显回退内容——两者始终只有一个可见，不会闪一下再换。
      第二个的地址故意写坏，用来看回退。
    </p>
    <div class="row">
      <!-- root 这层要自己写：data-status 落在它上面，样式按状态切换靠的就是它 -->
      <xh-avatar src="https://avatars.githubusercontent.com/u/1?v=4" alt="ok">
        <span data-xh-part="root">
          <img data-xh-part="image">
          <span data-xh-part="fallback">XH</span>
        </span>
      </xh-avatar>
      <xh-avatar src="https://example.invalid/404.png" alt="broken">
        <span data-xh-part="root">
          <img data-xh-part="image">
          <span data-xh-part="fallback">失败</span>
        </span>
      </xh-avatar>
      <xh-avatar>
        <span data-xh-part="root">
          <img data-xh-part="image">
          <span data-xh-part="fallback">无</span>
        </span>
      </xh-avatar>
    </div>
  </section>

  <section>
    <h2>Field</h2>
    <p class="lead">
      标题的 for、控件的 id 与描述链（aria-describedby）自动对齐：点标题聚焦到输入框，
      勾上“标记为无效”后错误文案接入描述链并显出。控件由你自己写，Field 只把属性并上去。
    </p>
    <xh-field id="wc-field" required>
      <!-- root 这层要自己写：data-invalid / data-required / data-disabled 落在它上面。
           label 须是原生 &lt;label&gt;、control 须标在真正的输入控件上：
           for 指向一个不可标注的元素时点标题不聚焦，读屏也念不出控件的名字 -->
      <div data-xh-part="root">
        <label data-xh-part="label">邮箱</label>
        <input data-xh-part="control" type="email" placeholder="you@example.com">
        <p data-xh-part="description">用于接收账单与安全提醒</p>
        <p data-xh-part="error-text">邮箱格式不正确</p>
      </div>
    </xh-field>
    <label class="row">
      <input type="checkbox" id="wc-field-invalid"> 标记为无效
    </label>
  </section>

  <section>
    <h2>NumberField</h2>
    <p class="lead">
      键盘全在输入框上：ArrowUp / ArrowDown 走 step，PageUp / PageDown 走 largeStep，
      Home / End 取端点。加减按钮按住不放会连发；贴住边界时对应按钮自动转灰。
      失焦时把 12.50 收成 12.5、把越界值夹回区间，输入途中不打断。
    </p>
    <xh-number-field id="wc-number" default-value="3" min="0" max="20" step="1" name="qty">
      <div data-xh-part="root">
        <label data-xh-part="label">数量</label>
        <!-- 加减钮与输入框中间这层包裹归作者：皮肤只把三者做成同高同圆角，
             gap 归零它们才贴成一体（.row 自带 10px，得就地压掉） -->
        <div class="row" style="gap: 0;">
          <button data-xh-part="decrement-trigger">−</button>
          <input data-xh-part="input" style="inline-size: 80px; text-align: center;">
          <button data-xh-part="increment-trigger">+</button>
        </div>
      </div>
    </xh-number-field>
    <span class="lead" id="wc-number-value">当前值：3</span>
  </section>

  <section>
    <h2>TextField</h2>
    <p class="lead">
      清空按钮只是指针用户的快捷方式：框里没字时它是灰的，敲进第一个字才亮起来，清完当场再转灰；
      它不占 Tab 位、也不抢焦点，清完能接着打字。键盘那一路走 Escape——有值时清空并把这一下吃掉，
      没值时原样交回去，套在弹层里时 Esc 仍然关得掉弹层。上限 10 个字符，顶满后再敲进不去，
      root 与 input 一起挂上 data-at-limit；勾上下面的复选框看 aria-invalid 翻成 true。
    </p>
    <xh-text-field id="wc-text-field" clearable max-length="10" name="nickname" placeholder="请输入昵称">
      <!-- root 这层要自己写：data-empty / data-at-limit / data-invalid 落在它上面。
           label 须是原生 &lt;label&gt;、输入框须是原生 &lt;input&gt;：for 恒写向 input 的 id，
           指到不可标注的元素上点标题不聚焦，读屏也念不出控件的名字 -->
      <div data-xh-part="root">
        <label data-xh-part="label">昵称</label>
        <!-- 同上：清空钮与输入框同高同圆角，gap 归零才贴成一体 -->
        <div class="row" style="gap: 0;">
          <input data-xh-part="input" style="inline-size: 200px;">
          <!-- 清空按钮须是 button：要能被点、被置灰；没开 clearable 时元素会把它整个收起来 -->
          <button data-xh-part="clear-trigger">✕</button>
        </div>
      </div>
    </xh-text-field>
    <span class="lead" id="wc-text-field-value">当前值：（空） · 0 / 10</span>
    <label class="row">
      <input type="checkbox" id="wc-text-field-invalid"> 标记为无效
    </label>
  </section>

  <section>
    <h2>PinInput</h2>
    <p class="lead">
      每格都是原生输入框：敲一个数字自动跳下一格；退格在有值的格上清本格、在空格上退回上一格并把它清掉；
      左右键与 Home / End 在格间移动，两端停住不回绕。numeric 下字母根本进不来，敲了既不进值也不会赖在框里。
      粘贴这条务必真试一次：复制 123456，聚焦任意一格按 Ctrl+V，整串会从落点那一格起按格铺开，
      而不是整串挤进一格（从第三格粘 345 就只填后三格）。六格填满时 root 挂上 data-complete，
      隐藏输入同时拿到拼好的整串，那才是随表单提交的值。
    </p>
    <xh-pin-input id="wc-pin-input" length="6" type="numeric" otp name="code" placeholder="·">
      <!-- 标签须是原生 &lt;label&gt;：for 恒写向首格，点标题落到第一个待填的格子。
           每格自带 index 声明下标，不写就按文档序 -->
      <div data-xh-part="root">
        <label data-xh-part="label">验证码</label>
        <!-- 格间距长在格子自己身上（相邻兄弟的 margin-inline-start），这层包裹不该再给 gap：
             .row 自带 10px，两份叠起来就成了 18px，所以就地压回 0。要调间距改 --xh-pin-input-box-gap -->
        <div class="row" style="gap: 0;">
          <input data-xh-part="input" index="0">
          <input data-xh-part="input" index="1">
          <input data-xh-part="input" index="2">
          <input data-xh-part="input" index="3">
          <input data-xh-part="input" index="4">
          <input data-xh-part="input" index="5">
        </div>
        <!-- 整份验证码的表单出口，与逐格的输入框分开：元素会把它转成 type=hidden -->
        <input data-xh-part="hidden-input">
      </div>
    </xh-pin-input>
    <span class="lead" id="wc-pin-input-value">当前值：（空） · 未填满</span>
  </section>

  <section>
    <h2>CheckboxGroup</h2>
    <p class="lead">
      数组值：各选各的，多项能同时选中，再点一次即取消。与单选组正相反——组内有几项就有几个 Tab 停靠点，
      容器自己不占位，禁用项也留着位子（点不动，但焦点落得上去、读屏念得出来）。
      Space 翻转聚焦的那一项；改不动的条目不吞这个键，Space 照样把页面往下滚。
      “全选”那一格是第三种状态：勾了一部分时它的 aria-checked 是 mixed，全勾上才转 true；
      半选时再按一次是整批取消而不是补齐。松露是禁用项，全选勾不上它、整批取消也摘不掉它已有的那一份。
    </p>
    <xh-checkbox-group id="wc-checkbox-group" default-value="cheese,truffle" item-values="cheese,bacon,truffle,basil" name="topping">
      <div data-xh-part="root">
        <!-- label 是组标题、由 aria-labelledby 指过来，不是 for 指向控件的原生 label，写 span 即可 -->
        <span data-xh-part="label">配料</span>
        <!-- trigger 必须写在 root 之内：全选那一步是顺祖先链找回本组、再现查条目的。
             它与条目同形是 div 不是 button——三态的 aria-checked=mixed 只有非原生控件表达得出，
             Space 也由 connect 自己接管。方框与三态的 ✓ / − 由皮肤的伪元素画，这里不写节点 -->
        <div data-xh-part="trigger">
          <span>全选</span>
        </div>
        <!-- 条目内那份随表单提交的隐藏 checkbox 要作者手写，且排在条目的第一个子节点。
             item-control 留空：勾号由皮肤按 data-state 补，往里写字符会出现两个 ✓ -->
        <div data-xh-part="item" value="cheese">
          <input data-xh-part="item-hidden-input" />
          <span data-xh-part="item-control"></span>
          <span data-xh-part="item-text">芝士</span>
        </div>
        <div data-xh-part="item" value="bacon">
          <input data-xh-part="item-hidden-input" />
          <span data-xh-part="item-control"></span>
          <span data-xh-part="item-text">培根</span>
        </div>
        <!-- 条目禁用用 aria-disabled 声明：原生 disabled 不可聚焦，而规格要求禁用条目仍占一个 Tab 位 -->
        <div data-xh-part="item" value="truffle" aria-disabled="true">
          <input data-xh-part="item-hidden-input" />
          <span data-xh-part="item-control"></span>
          <span data-xh-part="item-text">松露（套餐自带，改不动）</span>
        </div>
        <div data-xh-part="item" value="basil">
          <input data-xh-part="item-hidden-input" />
          <span data-xh-part="item-control"></span>
          <span data-xh-part="item-text">罗勒</span>
        </div>
      </div>
    </xh-checkbox-group>
    <span class="lead" id="wc-checkbox-group-value">当前值：cheese、truffle</span>
  </section>

  <section>
    <h2>ToggleGroup</h2>
    <p class="lead">
      单选与多选是两套 ARIA，任何时候只出现一套：单选 root=radiogroup、条目 role=radio + aria-checked；
      多选 root=group、条目退回原生按钮 + aria-pressed。
      两组都只占一个 Tab 位，进组后改用方向键走——四个方向键都响应（与横竖排无关），跳过禁用项、到头回绕，
      而且只搬焦点不改选中：路过不算数，要按 Enter 或 Space 才切（条目是原生 button，这一路交给平台）。
      禁用项点不动，但焦点落得上去、仍能当方向键的起点。单选组里再点一次当前项就清空，回调给 null。
    </p>
    <!-- 条目必须是原生 button：Enter/Space 的激活交给平台，组件不自己实现这一路。
         禁用一律用 aria-disabled 声明——原生 disabled 不可聚焦，禁用项就当不成方向键的起点了 -->
    <!-- 分段控件的 root 是 inline-flex（不该撑满一行），所以每组各包一层块级容器：
         否则两组连同后面的说明文字会挤进同一个行内格式化上下文，组间距也撑不开 -->
    <div class="row">
    <xh-toggle-group id="wc-toggle-group-single" default-value="left">
      <div data-xh-part="root">
        <button data-xh-part="item" value="left">左对齐</button>
        <button data-xh-part="item" value="center" aria-disabled="true">居中（禁用）</button>
        <button data-xh-part="item" value="right">右对齐</button>
      </div>
    </xh-toggle-group>
    <span class="lead" id="wc-toggle-group-single-value">对齐（单选）：left</span>
    </div>
    <div class="row" style="margin-block-start: 12px;">
    <xh-toggle-group id="wc-toggle-group-multi" multiple default-value="bold">
      <div data-xh-part="root">
        <button data-xh-part="item" value="bold">B</button>
        <button data-xh-part="item" value="italic">I</button>
        <button data-xh-part="item" value="underline" aria-disabled="true">U（禁用）</button>
      </div>
    </xh-toggle-group>
    <span class="lead" id="wc-toggle-group-multi-value">样式（多选）：bold</span>
    </div>
  </section>

  <section>
    <h2>Slider</h2>
    <p class="lead">
      键盘全在拇指上：方向键走一格 step，PageUp / PageDown 走 largeStep（这里是 10），
      Home / End 直接贴到端点。按下轨道任意位置，最近的那个拇指当场跳过来并接着能拖；
      松手后焦点留在它身上，方向键可以继续微调。
      区间滑块的两个拇指互为对方的边界，永不交叉——按 End 也只走到邻居让出的位置为止。
      禁用那条的拇指退出 Tab 序列，值也不再随表单提交。
    </p>
    <xh-slider id="wc-slider-volume" default-value="60" min="0" max="100" step="1" large-step="10" name="volume">
      <div data-xh-part="root" style="max-inline-size: 360px;">
        <!-- 拇指是 div、不是可被 label 关联的表单控件，所以这里不写 for；
             名字经拇指上的 aria-labelledby 反向挂过去 -->
        <label data-xh-part="label">音量</label>
        <div data-xh-part="control">
          <div data-xh-part="track">
            <!-- 主轴上的起止（inset-inline-start / inline-size）由元素每帧写进内联样式，
                 交叉轴与配色归皮肤：这里一条都别写，写了就是跟连接层抢位置 -->
            <div data-xh-part="range"></div>
          </div>
          <div data-xh-part="thumb">
            <input data-xh-part="hidden-input" />
          </div>
        </div>
      </div>
    </xh-slider>
    <span class="lead" id="wc-slider-volume-value">音量：60</span>

    <xh-slider id="wc-slider-price" default-value="200,800" min="0" max="1000" step="10" min-steps-between-thumbs="2" name="price">
      <div data-xh-part="root" style="max-inline-size: 360px; margin-block-start: 20px;">
        <label data-xh-part="label">价格区间（两个拇指至少隔 2 格）</label>
        <div data-xh-part="control">
          <div data-xh-part="track">
            <div data-xh-part="range"></div>
          </div>
          <!-- 多拇指时每个都要用 index 写明自己是第几个；拇指内的表单影子跟着所在拇指走 -->
          <div data-xh-part="thumb" index="0">
            <input data-xh-part="hidden-input" />
          </div>
          <div data-xh-part="thumb" index="1">
            <input data-xh-part="hidden-input" />
          </div>
        </div>
      </div>
    </xh-slider>
    <span class="lead" id="wc-slider-price-value">价格：¥200 – ¥800</span>

    <xh-slider default-value="30" disabled name="brightness">
      <div data-xh-part="root" style="max-inline-size: 360px; margin-block-start: 20px;">
        <label data-xh-part="label">亮度（已锁定）</label>
        <div data-xh-part="control">
          <div data-xh-part="track">
            <div data-xh-part="range"></div>
          </div>
          <div data-xh-part="thumb">
            <input data-xh-part="hidden-input" />
          </div>
        </div>
      </div>
    </xh-slider>
  </section>

  <section>
    <h2>Rating</h2>
    <p class="lead">
      划过星星只是预览：回显里的“评分”纹丝不动，只有“悬停预览”跟着指针走，指针一离开预览立刻收起，
      点下去才算真的落值。允许半颗时，落点在一颗星的左半边给半颗、右半边给整颗；
      方向键按半档走，Home / End 取最低一档与满分。
      只读那条仍进得了 Tab 序列、读屏也念得出，但改不动、也不给悬停预览；
      禁用那条整条退出 Tab 序列，值不再随表单提交。
    </p>
    <!-- 星星是作者写死的字符，元素只往上打属性、不改文本：
         点亮与半亮由皮肤按 data-highlighted / data-half 上色 -->
    <xh-rating id="wc-rating" allow-half default-value="3" name="score">
      <!-- 表单影子是根下的兄弟节点，它只管提交；键盘与朗读全在 control 那条星星带上 -->
      <div data-xh-part="root">
        <span data-xh-part="label">整体满意度</span>
        <div data-xh-part="control">
          <span data-xh-part="item" value="1">★</span>
          <span data-xh-part="item" value="2">★</span>
          <span data-xh-part="item" value="3">★</span>
          <span data-xh-part="item" value="4">★</span>
          <span data-xh-part="item" value="5">★</span>
        </div>
        <input data-xh-part="hidden-input" />
      </div>
    </xh-rating>
    <span class="lead" id="wc-rating-value">评分：3 · 悬停预览：（无）</span>

    <div class="row" style="gap: 32px; margin-block-start: 20px;">
      <xh-rating read-only default-value="4">
        <div data-xh-part="root">
          <span data-xh-part="label">只读（4 星）</span>
          <div data-xh-part="control">
            <span data-xh-part="item" value="1">★</span>
            <span data-xh-part="item" value="2">★</span>
            <span data-xh-part="item" value="3">★</span>
            <span data-xh-part="item" value="4">★</span>
            <span data-xh-part="item" value="5">★</span>
          </div>
        </div>
      </xh-rating>
      <xh-rating disabled default-value="2">
        <div data-xh-part="root">
          <span data-xh-part="label">禁用（2 星）</span>
          <div data-xh-part="control">
            <span data-xh-part="item" value="1">★</span>
            <span data-xh-part="item" value="2">★</span>
            <span data-xh-part="item" value="3">★</span>
            <span data-xh-part="item" value="4">★</span>
            <span data-xh-part="item" value="5">★</span>
          </div>
        </div>
      </xh-rating>
    </div>
  </section>

  <section>
    <h2>Listbox</h2>
    <p class="lead">
      焦点与选中是两条线：方向键与 Home / End 只搬焦点，Enter 或空格才落值。
      连打字母就地检索——连按 b 在几个 B 开头的城市间轮转，打 ber 落到 Berlin、再补一个 n 走到 Bern。
      禁用的 Busan 被方向键与检索一并跳过，但它仍点得中、仍是方向键的起点。
      整组只占一个 Tab 位，焦点从外面进来先落在已选中的那条上。
      勾上多选后空格改成切换，Shift + 方向键顺手扩选，Ctrl / Cmd + A 全选或全不选。
    </p>
    <xh-listbox id="wc-listbox" default-value="beijing">
      <!-- root / label / content 与每个条目都由作者写：条目身份取自身的 value 属性，
           禁用一律用 aria-disabled 声明——原生 disabled 不可聚焦，禁用项就当不成方向键的起点。
           分组同样用 value 声明身份，分组标题的 id 由它派生 -->
      <div data-xh-part="root" style="max-inline-size: 320px;">
        <span data-xh-part="label">城市</span>
        <div data-xh-part="content">
          <div data-xh-part="item-group" value="asia">
            <span data-xh-part="item-group-label">亚洲</span>
            <div data-xh-part="item" value="bangkok">
              <span data-xh-part="item-text">Bangkok 曼谷</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="beijing">
              <span data-xh-part="item-text">Beijing 北京</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="busan" aria-disabled="true">
              <span data-xh-part="item-text">Busan 釜山（禁用）</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="chengdu">
              <span data-xh-part="item-text">Chengdu 成都</span>
              <span data-xh-part="item-indicator"></span>
            </div>
          </div>
          <div data-xh-part="item-group" value="europe">
            <span data-xh-part="item-group-label">欧洲</span>
            <div data-xh-part="item" value="barcelona">
              <span data-xh-part="item-text">Barcelona 巴塞罗那</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="berlin">
              <span data-xh-part="item-text">Berlin 柏林</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="bern">
              <span data-xh-part="item-text">Bern 伯尔尼</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="london">
              <span data-xh-part="item-text">London 伦敦</span>
              <span data-xh-part="item-indicator"></span>
            </div>
          </div>
        </div>
      </div>
    </xh-listbox>
    <label class="row">
      <input type="checkbox" id="wc-listbox-multiple"> 多选（multiple）
    </label>
    <span class="lead" id="wc-listbox-value"></span>
  </section>

  <section>
    <h2>Pagination</h2>
    <p class="lead">
      196 条、每页 10 条，正好 20 页，当前页两侧各留一页：序列长度恒为 7，切页时省略号左右挪、按钮不左右抖动；
      贴到两端时省略位让给页码（只隔一页就把那页直接显出来，不折成省略号）。
      首页的上一页与末页的下一页转成原生 disabled，Tab 都停不上去。
      末页只有 6 条，区间回显跟着收窄。
    </p>
    <xh-pagination id="wc-pagination" count="196" page-size="10" sibling-count="1">
      <!-- root 必须是 nav：地标语义由标签自己给，元素只往上打 aria-label。
           页码节点也归作者建（元素不替作者生成，否则外层壳与图标就再塞不进来），
           下面那个空容器由脚本按当前页填 -->
      <nav data-xh-part="root">
        <button data-xh-part="prev-trigger">上一页</button>
        <!-- 这层容器只是脚本填页码的落点，间距跟 root 取同一档，与前后两颗按钮排得齐 -->
        <span id="wc-pagination-pages" class="row" style="gap: var(--xh-space-1);"></span>
        <button data-xh-part="next-trigger">下一页</button>
        <!-- root 自己就是横排 flex + wrap，回显想独占一行只能自己占满 -->
        <span class="lead" id="wc-pagination-range" style="flex-basis: 100%;"></span>
      </nav>
    </xh-pagination>
  </section>

  <section>
    <h2>Drawer</h2>
    <p class="lead">
      贴边渲染的对话框：Escape 关闭、Tab 与 Shift+Tab 在面板里循环出不去、点遮罩关闭，
      关掉后焦点回到刚按下的那个触发按钮；展开期间页面滚不动。
      四个按钮各走一条边——面板到底贴住哪边，看的是 root 与 content 上那个 data-side：
      遮罩、贴边与四条边各自的滑入滑出都由皮肤按它接管，面板宽窄改 <code>--xh-drawer-size</code> 即可。
    </p>
    <div class="row">
      <xh-drawer side="top">
        <!-- root 这层要自己写：content 会被 portal 走/隐藏，而 data-side 在收起态也得有个落点 -->
        <div data-xh-part="root">
          <button data-xh-part="trigger">从上方</button>
          <div data-xh-part="backdrop"></div>
          <div data-xh-part="positioner">
            <div data-xh-part="content">
              <h3 data-xh-part="title">从上方</h3>
              <p data-xh-part="description">data-side 是 top，面板就该压在视口顶边。</p>
              <!-- close-trigger 是右上角的图标按钮（定宽定高），放图标而非文案 -->
              <button data-xh-part="close-trigger">✕</button>
            </div>
          </div>
        </div>
      </xh-drawer>
      <xh-drawer side="right">
        <div data-xh-part="root">
          <button data-xh-part="trigger">从右侧</button>
          <div data-xh-part="backdrop"></div>
          <div data-xh-part="positioner">
            <div data-xh-part="content">
              <h3 data-xh-part="title">从右侧</h3>
              <p data-xh-part="description">side 缺省就是 right，这一个把它显式写出来。</p>
              <button data-xh-part="close-trigger">✕</button>
            </div>
          </div>
        </div>
      </xh-drawer>
      <xh-drawer side="bottom">
        <div data-xh-part="root">
          <button data-xh-part="trigger">从下方</button>
          <div data-xh-part="backdrop"></div>
          <div data-xh-part="positioner">
            <div data-xh-part="content">
              <h3 data-xh-part="title">从下方</h3>
              <p data-xh-part="description">遮罩铺满视口，positioner 只是抬层用的空壳，贴边由面板自己完成。</p>
              <button data-xh-part="close-trigger">✕</button>
            </div>
          </div>
        </div>
      </xh-drawer>
      <xh-drawer side="left">
        <div data-xh-part="root">
          <button data-xh-part="trigger">从左侧</button>
          <div data-xh-part="backdrop"></div>
          <div data-xh-part="positioner">
            <div data-xh-part="content">
              <h3 data-xh-part="title">从左侧</h3>
              <p data-xh-part="description">四个抽屉共用一份机器，换的只有 side 这一个属性。</p>
              <button data-xh-part="close-trigger">✕</button>
            </div>
          </div>
        </div>
      </xh-drawer>
    </div>
    <span class="lead" id="wc-drawer-state">当前展开：（无）</span>
  </section>

  <section>
    <h2>Toaster / Toast</h2>
    <p class="lead">
      toaster 是队列，toast 是队列里的一条，四颗按钮走的都是元素自己的命令式接口。
      create 入队并返回 id；同一个 id 再 create 一次就是就地改写、位置不动——“上传”那颗先挂一条 loading
      （它说的是事情还没完，不自动消失），中途用 <code>updateToast</code> 改一次说明文字，最后原地换成 success 才开始倒计时。
      改写队列的方法叫 <code>updateToast</code> 而不是 update：后者是 Lit 自己的渲染钩子，占用它组件当场不工作。
      把鼠标停在通知上倒计时会被按住，移开是接着走剩下那一段而不是从头重来；Tab 进撤销 / ✕ 同样按住。
      error 那条走 alert + assertive，读屏会打断当前朗读。“全部清空”是把队列直接倒掉，不走退场窗口。
      条目由作者按队列渲染，元素不替你生成——下面 group 是空的，通知节点全由脚本按 visibleToasts 增删。
    </p>
    <div class="row">
      <xh-button variant="subtle"><button data-xh-part="root" data-toast="info">弹一条 info</button></xh-button>
      <xh-button variant="subtle"><button data-xh-part="root" data-toast="error">弹一条 error</button></xh-button>
      <xh-button variant="solid"><button data-xh-part="root" data-toast="upload">上传（loading → success）</button></xh-button>
      <xh-button variant="ghost"><button data-xh-part="root" data-toast="clear">全部清空</button></xh-button>
      <span class="lead" id="wc-toaster-count">队列：0 条</span>
    </div>
    <!-- root 是 role=region 的地标容器，本身不定位：落位由 placement 写成 group 上的
         data-placement，皮肤按它把这一摞贴到九宫格中的某一格；队列只往 group 上打一条摞内间距 -->
    <xh-toaster id="wc-toaster" placement="bottom-end" max="4" gap="12">
      <div data-xh-part="root">
        <div data-xh-part="group" id="wc-toast-stack"></div>
      </div>
    </xh-toaster>
  </section>

  <section>
    <h2>Combobox</h2>
    <p class="lead">
      打字即展开并就地过滤——筛出哪几条是本页自己算的（脚本按输入串匹配整条文本再增删候选节点），
      元素只管高亮、选中与空态：打 be 只剩 Beijing / Berlin，打 北 一样筛得动。
      焦点自始至终在输入框上，方向键移的是高亮而不是焦点，长列表里高亮会自己滚进可视区；
      Home / End 跳首尾，禁用的 Busan 一路被跳过（打 bu 只剩它一条时，方向键无处可落、Enter 也不落值）。
      Enter 落值并收起；Escape 分两拍——先摘掉高亮，再按一次才收起列表。
      打一串谁也接不上的字（比如 zz），列表让位给“无匹配城市”那条空态，它是列表的兄弟而不是列表里的一项。
      这一个开了 <code>open-on-click</code>，点输入框即展开；缺省不开，键盘与 ▾ 才是入口。
      选中之后输入框被回填成候选文本，列表因此只剩它自己——过滤权在调用方手里就是这个后果，按 ✕ 清空即回到全集。
    </p>
    <div class="row">
      <xh-combobox id="wc-combobox" open-on-click placeholder="输入城市名筛选">
        <!-- root 这层要自己写：开合、禁用、只读、校验四种状态都打在它身上 -->
        <div data-xh-part="root">
          <!-- 必须是 label：元素写上去的 for 只在原生 label 上生效，点标题聚焦输入框靠它 -->
          <label data-xh-part="label">城市</label>
          <!-- 画成一个框的是 control：输入框与两颗按钮看起来是一体的，它同时是浮层的定位锚点 -->
          <div data-xh-part="control">
            <!-- 必须是 input：换成 div 就既不可聚焦也没有 value，整个组合框演不出来 -->
            <input data-xh-part="input">
            <!-- 两颗都要是 button：它们不占 Tab 位，但得点得动、按得下 -->
            <button data-xh-part="trigger">▾</button>
            <button data-xh-part="clear-trigger">✕</button>
          </div>
          <div data-xh-part="positioner">
            <!-- 候选由脚本按输入串填进来。这里不写 id：content 的 id 归元素自己写（输入框要 aria-controls 指它），
                 作者挂上去的会被盖掉，所以脚本按 data-xh-part 找它 -->
            <div data-xh-part="content"></div>
            <!-- 空态摆在 positioner 里当 content 的兄弟：列表里只放候选 -->
            <div data-xh-part="empty">无匹配城市</div>
          </div>
        </div>
      </xh-combobox>
      <span class="lead" id="wc-combobox-value">当前值：（未选）</span>
    </div>
    <p class="lead" style="margin-block-start: 20px;">
      多选的差别全在选完之后：列表不收起、输入串自动清空，候选立刻回到全集，接着挑下一个；
      再点一次已选项就是取消。输入框空着时按退格删掉最后一个已选项（框里有字则照常删字）。
      已选项怎么显示由本页决定，这里就回显成一行文字。
    </p>
    <div class="row">
      <xh-combobox id="wc-combobox-multi" multiple placeholder="挑几个城市">
        <div data-xh-part="root">
          <label data-xh-part="label">常去城市</label>
          <div data-xh-part="control">
            <input data-xh-part="input">
            <button data-xh-part="trigger">▾</button>
            <button data-xh-part="clear-trigger">✕</button>
          </div>
          <div data-xh-part="positioner">
            <div data-xh-part="content"></div>
            <div data-xh-part="empty">无匹配城市</div>
          </div>
        </div>
      </xh-combobox>
      <span class="lead" id="wc-combobox-multi-value">已选：（无）</span>
    </div>
  </section>

  <section>
    <h2>TagsInput</h2>
    <p class="lead">
      三个标签是预置的。框里打字后按 Enter 落一个；直接打逗号也断词——一口气打 <code>React,Svelte</code> 会一次进两个，
      最后没打完的那一段留在框里接着打。
      框里空着时退格分两步：头一下只把最后一个标签反白（这一下什么都不删），再按一下才真删掉；
      左右方向键在标签之间走，Home / End 跳到头尾，Escape 把光标交回输入框。
      粘一段 <code>a,b,c</code> 试试：开着 <code>add-on-paste</code> 就按分隔符拆成三个标签，而不是整串塞进框里。
      上限是 5——顶满后框的描边转成警示色，再打再粘都进不去，但已经打进去的字不会被悄悄吃掉，原样留在框里。
      双击任一标签就地改写它：Enter 提交、Escape 撤销回原样，改成空白等于把这个标签删了。
      标签节点归作者按当前值渲染，元素只打属性、不建节点——下面 control 里只写死了输入框与清空钮，标签由脚本插在输入框之前。
    </p>
    <xh-tags-input id="wc-tags" default-value="Vue,TypeScript,Vite" max="5" add-on-paste editable name="stack" placeholder="回车落一个">
      <!-- label 与两个输入框都写成原生标签：label 的 for 恒写向 input 的 id，任一边换成 div 这条关联当场作废。
           hidden-input 是表单出口，值是按分隔符拼好的整串 -->
      <div data-xh-part="root" style="max-inline-size: 420px;">
        <label data-xh-part="label">技术栈</label>
        <div data-xh-part="control">
          <input data-xh-part="input">
          <button data-xh-part="clear-trigger">⨯</button>
        </div>
        <input data-xh-part="hidden-input">
      </div>
    </xh-tags-input>
    <span class="lead" id="wc-tags-value"></span>
  </section>

  <section>
    <h2>Editable</h2>
    <p class="lead">
      预览与编辑两态轮流上场：点预览区（或按“编辑”）进编辑态，进去就把整段选中；退出时焦点回到预览区，不会掉进 body。
      两态的文字左右位置对齐，来回切文字不挪一下。
      上面这个 <code>submit-mode</code> 走 blur——点到页面别处或 Tab 走开就落定，Enter 不接管（这一页没有外层表单，按下去看着像没反应，值也确实还没提交）；
      下面这个走 enter——Enter 才落定，失焦与 Tab 反过来是撤销，没提交过的值不会留在界面上。
      两个都认 Escape：撤销回的是上一次提交的那个值，不是刚进编辑态时看到的那一屏——改一次存下，再改一次按 Escape 就看得出区别。
      “保存 / 取消”只在编辑态露面，按下时不抢焦点：下面那个失焦即撤销的模式里点“保存”仍然存得下。
      预览与输入框是互斥收起而不是卸载，两个节点始终都在文档里，DevTools 里看得到收起的那个。
    </p>
    <div class="row">
      <xh-editable id="wc-editable-blur" default-value="阿旺" placeholder="未填写" submit-mode="blur">
        <!-- label 与 input 都写成原生标签：label 的 for 恒写向 input 的 id。
             preview 留空——显示什么由元素填（值，或值为空时的占位），写死了就再也刷不动 -->
        <div data-xh-part="root">
          <label data-xh-part="label">昵称</label>
          <div data-xh-part="area">
            <span data-xh-part="preview"></span>
            <input data-xh-part="input">
          </div>
          <div data-xh-part="control">
            <button data-xh-part="edit-trigger">编辑</button>
            <button data-xh-part="submit-trigger">保存</button>
            <button data-xh-part="cancel-trigger">取消</button>
          </div>
        </div>
      </xh-editable>
      <span class="lead" id="wc-editable-blur-value"></span>
    </div>
    <div class="row" style="margin-block-start: 12px;">
      <xh-editable id="wc-editable-enter" default-value="且将新火试新茶" placeholder="未填写" submit-mode="enter">
        <div data-xh-part="root">
          <label data-xh-part="label">签名</label>
          <div data-xh-part="area">
            <span data-xh-part="preview"></span>
            <input data-xh-part="input">
          </div>
          <div data-xh-part="control">
            <button data-xh-part="edit-trigger">编辑</button>
            <button data-xh-part="submit-trigger">保存</button>
            <button data-xh-part="cancel-trigger">取消</button>
          </div>
        </div>
      </xh-editable>
      <span class="lead" id="wc-editable-enter-value"></span>
    </div>
  </section>

  <section>
    <h2>FileUpload</h2>
    <p class="lead">
      拖着文件经过投放区，边框与底色当场换成品牌色，指针在区内几个子节点之间挪动不会让它闪——
      这是“现在松手就放得下”的唯一提示。投放区自己就是一个大按钮：Tab 停得上去，
      Enter 或空格都打得开系统选择框（空格顺带被拦下、不滚屏），点标题“附件”同样打得开。
      最多 3 个、单个不超过 512 KB，越界的当场被拒并说清是哪一条——一次拖十个进来，前 3 个收下、其余报“放不下”；
      而已经因为太大出局的文件不占名额，也不会再多背一条“太多了”。
      每行的删除按钮读屏念的是“删除 具体文件名”而不是一串“删除”；列表为空时“清空”带原生 disabled，Tab 停都停不上去。
      缩略图占位上挂着 data-file-type（系统给不出 MIME 时是 unknown），皮肤按它挑颜色。
    </p>
    <xh-file-upload id="wc-file-upload" max-files="3" max-file-size="524288">
      <!-- label 必须是原生 label（for 恒写向隐藏输入），hidden-input 必须是原生 input（type=file 由元素写）；
           trigger 刻意放在投放区之外：按钮里再套按钮，读屏只念得出外面那一个。
           条目节点归作者建，下面那个空列表由脚本按已选文件数增删，文件名与大小由元素代填 -->
      <div data-xh-part="root">
        <label data-xh-part="label">附件</label>
        <div data-xh-part="dropzone">
          <span>把文件拖到这里</span>
          <span>最多 3 个，单个不超过 512 KB</span>
        </div>
        <!-- 这层行容器是本页自己的排版，不是角色节点：root 是纵向 flex，按钮不套一层会被拉满整行 -->
        <div class="row">
          <button data-xh-part="trigger">选择文件</button>
        </div>
        <input data-xh-part="hidden-input">
        <div data-xh-part="item-group" id="wc-file-upload-items"></div>
        <button data-xh-part="clear-trigger">清空</button>
      </div>
    </xh-file-upload>
    <span class="lead" id="wc-file-upload-state"></span>
  </section>

  <section>
    <h2>Tree</h2>
    <p class="lead">
      三层目录树：src 默认展开，docs、dist 与 components / utils 都收着。上下键走的是可见行——
      src 收起时它底下那三行一并退出序列，展开了才回来；禁用的 pnpm-lock.yaml 被上下键与连打一并跳过，
      点上去仍能当方向键的起点，只是确认键不认它。右键在收起的分支上就地展开、已展开则进首个子节点，叶子上不吞键；
      左键反过来：展开的分支就地收起，收起的分支与叶子跳回父层，根层的行什么也不做。Home / End 落在首末可见行。
      连打字母只在可见行上检索——连按 d 在 docs 与 dist 之间轮转，藏在收起分支里的 Dialog.vue 与 dom.ts 一次也走不到。
      停在 components 上按 * 只展开它同一层的分支（components 与 utils），docs 与 dist 不动。
      点分支行连选带展开，点箭头只切展开、不动选中；整棵树只占一个 Tab 位，焦点从外面进来先落在已选中的那行上。
      每深一层的缩进由子层容器自己顶着，本页一行样式都不写；dist 的子层是空数组，它照样是分支——展得开，只是里头没有行。
    </p>
    <xh-tree id="wc-tree">
      <!-- 层级三件套、禁用与检索用的名字全查树数据（它只能按 property 交，数组表达不了属性），
           标记与它必须同源：标记里有、树数据里没有的节点报不出层级，也进不了导航。
           节点身份写在自己的 value 属性上，行内的文本与箭头向上找最近的 item / branch -->
      <div data-xh-part="root" style="max-inline-size: 360px;">
        <span data-xh-part="label">项目文件</span>
        <div data-xh-part="tree">
          <div data-xh-part="branch" value="src">
            <div data-xh-part="branch-control">
              <!-- 箭头写成 span 不是 button：它 aria-hidden 且不占 Tab 位，焦点该落在 branch 上。
                   分支行只放这一个图标位，与叶子的勾选标记同宽，两种行的文字起点才对得齐 -->
              <span data-xh-part="branch-trigger">▸</span>
              <span data-xh-part="branch-text">src</span>
            </div>
            <div data-xh-part="branch-content">
              <div data-xh-part="branch" value="components">
                <div data-xh-part="branch-control">
                  <span data-xh-part="branch-trigger">▸</span>
                  <span data-xh-part="branch-text">components</span>
                </div>
                <div data-xh-part="branch-content">
                  <div data-xh-part="item" value="button">
                    <span data-xh-part="item-indicator">✓</span>
                    <span data-xh-part="item-text">Button.vue</span>
                  </div>
                  <div data-xh-part="item" value="dialog">
                    <span data-xh-part="item-indicator">✓</span>
                    <span data-xh-part="item-text">Dialog.vue</span>
                  </div>
                  <div data-xh-part="item" value="field">
                    <span data-xh-part="item-indicator">✓</span>
                    <span data-xh-part="item-text">Field.vue</span>
                  </div>
                </div>
              </div>
              <div data-xh-part="branch" value="utils">
                <div data-xh-part="branch-control">
                  <span data-xh-part="branch-trigger">▸</span>
                  <span data-xh-part="branch-text">utils</span>
                </div>
                <div data-xh-part="branch-content">
                  <div data-xh-part="item" value="dom">
                    <span data-xh-part="item-indicator">✓</span>
                    <span data-xh-part="item-text">dom.ts</span>
                  </div>
                  <div data-xh-part="item" value="format">
                    <span data-xh-part="item-indicator">✓</span>
                    <span data-xh-part="item-text">format.ts</span>
                  </div>
                </div>
              </div>
              <div data-xh-part="item" value="main">
                <span data-xh-part="item-indicator">✓</span>
                <span data-xh-part="item-text">main.ts</span>
              </div>
            </div>
          </div>
          <div data-xh-part="branch" value="docs">
            <div data-xh-part="branch-control">
              <span data-xh-part="branch-trigger">▸</span>
              <span data-xh-part="branch-text">docs</span>
            </div>
            <div data-xh-part="branch-content">
              <div data-xh-part="item" value="guide">
                <span data-xh-part="item-indicator">✓</span>
                <span data-xh-part="item-text">guide.md</span>
              </div>
              <div data-xh-part="item" value="api">
                <span data-xh-part="item-indicator">✓</span>
                <span data-xh-part="item-text">api.md</span>
              </div>
            </div>
          </div>
          <div data-xh-part="branch" value="dist">
            <div data-xh-part="branch-control">
              <span data-xh-part="branch-trigger">▸</span>
              <span data-xh-part="branch-text">dist</span>
            </div>
            <!-- 空目录的子层容器照写：它展得开，只是里头没有行 -->
            <div data-xh-part="branch-content"></div>
          </div>
          <!-- 禁用不写在标记上：元素照树数据给这一行打 aria-disabled，
               绝不打原生 disabled——那样它就不可聚焦，也当不成方向键的起点 -->
          <div data-xh-part="item" value="lockfile">
            <span data-xh-part="item-indicator">✓</span>
            <span data-xh-part="item-text">pnpm-lock.yaml（禁用）</span>
          </div>
          <div data-xh-part="item" value="readme">
            <span data-xh-part="item-indicator">✓</span>
            <span data-xh-part="item-text">README.md</span>
          </div>
        </div>
      </div>
    </xh-tree>
    <span class="lead" id="wc-tree-state"></span>
  </section>

  <section>
    <h2>Toolbar</h2>
    <p class="lead">
      整条在 Tab 序列里只占一个位子：从上一个控件按 Tab 进来会落在其中一个条目上，再按一次 Tab 就整条离开，
      条内改用方向键走。横排那条收左右键、把上下键原样放行给页面滚动，竖排那条正相反——两条摆在一起，
      按方向键就看得出 orientation 换掉的是哪一对键，分隔线也跟着转向（它的朝向恒与主轴垂直）。
      方向键跨得过分隔线、也走得进分组（分组只是把一伙控件收紧，不是导航里多出来的一层），到尽头回绕；
      斜体是禁用项，方向键路过时直接跳过，但拿鼠标点它焦点仍落得上去、Tab 位也归它，再按方向键就从它这儿起步。
      Home / End 取的是首尾两个可用条目，分隔线与分组容器都不算端点。
      勾上「整条禁用」条目全转 aria-disabled、方向键当场不再接管（焦点进来就停在容器上）；
      取消勾选后禁用的仍然只有斜体那一项。
      条目是作者自己的按钮：工具条不覆盖它的 role、也不接管它的点击，下面那行回显是按钮自己的 click 记的。
    </p>
    <div class="row" style="gap: 24px; align-items: flex-start;">
      <!-- root / item / group / separator 全由作者写：条目身份取自身的 value 属性，
           禁用一律写 aria-disabled——原生 disabled 不可聚焦，禁用项就当不成方向键的起点。
           条目落成 button，它的角色、按下态与点击行为都归它自己，元素只打导航要用的那几样 -->
      <xh-toolbar id="wc-toolbar">
        <div data-xh-part="root">
          <button data-xh-part="item" value="bold">粗体</button>
          <button data-xh-part="item" value="italic" aria-disabled="true">斜体（禁用）</button>
          <button data-xh-part="item" value="underline">下划线</button>
          <div data-xh-part="separator"></div>
          <div data-xh-part="group">
            <button data-xh-part="item" value="align-left">左对齐</button>
            <button data-xh-part="item" value="align-center">居中</button>
            <button data-xh-part="item" value="align-right">右对齐</button>
          </div>
        </div>
      </xh-toolbar>
      <xh-toolbar orientation="vertical">
        <div data-xh-part="root">
          <button data-xh-part="item" value="undo">撤销</button>
          <button data-xh-part="item" value="redo">重做</button>
          <div data-xh-part="separator"></div>
          <button data-xh-part="item" value="clear">清除格式</button>
        </div>
      </xh-toolbar>
    </div>
    <label class="row">
      <input type="checkbox" id="wc-toolbar-disabled"> 整条禁用（横排那条）
    </label>
    <span class="lead" id="wc-toolbar-command">最近点击：（无）</span>
  </section>

  <section>
    <h2>Breadcrumb</h2>
    <p class="lead">
      最后那一级是当前页：它照样是个 <code>&lt;a&gt;</code>、照样写着 href，
      但连接层给它打上 aria-current="page" 并把点击拦了下来——点前面几条地址栏跟着变，点它什么都不会发生。
      它也不占 Tab 位（tabindex="-1"）：Tab 一路走过去只停在前面那几条上，
      停在一个点了也没去处的链接上，只会让人每次都多按一下。
      中间那个省略号是被折叠掉的一层，和几个斜杠一样只是视觉占位，读屏那边一并被 aria-hidden 摘掉，
      念出来仍是“列表，共 3 项”——层级关系由 ol / li 自己给。
      要让折叠掉的那几层可达，得在省略号那儿另放一个菜单，那是另一个组件的事。
    </p>
    <xh-breadcrumb>
      <!-- 标签由作者写，且必须写对：root 是 nav（地标语义只有标签给得了），list 是 ol，
           item / separator / ellipsis 都是 li（ol 里只放得下 li），link 是 a。
           href 同样归作者写——那是路由的事，元素只在当前页那条上拦住点击 -->
      <nav data-xh-part="root">
        <ol data-xh-part="list">
          <li data-xh-part="item"><a data-xh-part="link" href="#/">首页</a></li>
          <li data-xh-part="separator">/</li>
          <li data-xh-part="item"><a data-xh-part="link" href="#/components">组件</a></li>
          <li data-xh-part="separator">/</li>
          <li data-xh-part="ellipsis">…</li>
          <li data-xh-part="separator">/</li>
          <!-- 当前页那条只多一个 current 声明，其余与前面几条一模一样 -->
          <li data-xh-part="item"><a data-xh-part="link" href="#/components/breadcrumb" current>面包屑</a></li>
        </ol>
      </nav>
    </xh-breadcrumb>
  </section>

  <section>
    <h2>Steps</h2>
    <p class="lead">
      四步下单流程，进退由下面那两颗按钮驱动。方向键在一排 trigger 之间走（横排认 ArrowLeft / ArrowRight，两端不回绕），
      但它只搬焦点、不切步——走到想去的那一步还得按 Enter 或空格才真的切过去：
      切一步往往要跑校验、发请求，不能跟着焦点自动发生。
      整条步骤条只占一个 Tab 位，Tab 进来落在当前步上，再按一次就整组离开。
      面板不做懒挂载，五块一直挂着、只按当前步 hidden 显隐——第 1 步里勾上的那个复选框，走到第 4 步再退回来还在。
      走完最后一步还有一格“全部完成”：那时没有任何一步是当前步，四块步骤面板全收起、完成页显出来，下一步随之禁用；
      此刻也没有条目认领得了那个 Tab 位，于是整条 list 自己进 Tab 序列兜底（落焦有一圈 focus 环），不然键盘就再也进不来了。
      下面第二台只多了一个 linear：还没走到的那几步一律禁用，走的是 aria-disabled 而不是原生 disabled——
      它们仍聚焦得上、仍能当方向键的起点，只是点不动、方向键也跳过，所以停在第 1 步按 ArrowRight 会原地不动，
      往前只能靠“下一步”一格格推；已走过的与当前这一步照常点得动（回头看是允许的），但一退回去，后面那几步立刻重新锁上。
    </p>
    <!-- 步骤序列归作者渲染（元素不替作者建节点，否则图标、自定义序号、i18n 文案都再塞不进来）：
         身份写在 item 的 value 上（第几步，0 起），trigger / indicator / title / description / separator
         向上找自己的 item；content 挂在 list 之外够不到 item，因此自带 value 与 trigger 配对。
         元素不暴露命令式接口：写了 step 属性即受控，点 trigger 只发 step-change 意图，
         由脚本写回属性才真的切步——下面那两颗按钮走的也是这条路 -->
    <xh-steps id="wc-steps" count="4" step="0">
      <div data-xh-part="root">
        <div data-xh-part="list">
          <div data-xh-part="item" value="0">
            <button data-xh-part="trigger">
              <span data-xh-part="indicator">1</span>
              <span data-xh-part="title">收货信息</span>
              <span data-xh-part="description">收货人与地址</span>
            </button>
            <div data-xh-part="separator"></div>
          </div>
          <div data-xh-part="item" value="1">
            <button data-xh-part="trigger">
              <span data-xh-part="indicator">2</span>
              <span data-xh-part="title">支付方式</span>
              <span data-xh-part="description">在线支付或货到付款</span>
            </button>
            <div data-xh-part="separator"></div>
          </div>
          <div data-xh-part="item" value="2">
            <button data-xh-part="trigger">
              <span data-xh-part="indicator">3</span>
              <span data-xh-part="title">开具发票</span>
              <span data-xh-part="description">抬头与税号</span>
            </button>
            <div data-xh-part="separator"></div>
          </div>
          <div data-xh-part="item" value="3">
            <button data-xh-part="trigger">
              <span data-xh-part="indicator">4</span>
              <span data-xh-part="title">确认下单</span>
              <span data-xh-part="description">核对金额与优惠</span>
            </button>
            <div data-xh-part="separator"></div>
          </div>
        </div>
        <div data-xh-part="content" value="0">
          <label class="row"><input type="checkbox"> 保存为默认地址（勾上，切到别的步再切回来看看）</label>
        </div>
        <div data-xh-part="content" value="1">面板 2：选支付方式。</div>
        <div data-xh-part="content" value="2">面板 3：填发票抬头与税号。</div>
        <div data-xh-part="content" value="3">面板 4：核对金额，按“下一步”提交。</div>
        <!-- value 等于 count 的这块是完成页：走完最后一步之后的那一格 -->
        <div data-xh-part="content" value="4">全部完成：订单已提交。按“上一步”可以退回最后一步。</div>
        <!-- 进退按钮通常长在步骤条外面（真实表单里它们在页面底部），这里只是把它们放在同一块里 -->
        <div class="row">
          <xh-button id="wc-steps-prev" variant="subtle"><button data-xh-part="root">上一步</button></xh-button>
          <xh-button id="wc-steps-next" variant="solid"><button data-xh-part="root">下一步</button></xh-button>
          <span class="lead" id="wc-steps-value"></span>
        </div>
      </div>
    </xh-steps>
    <!-- 同一台机器，只多了一个 linear。margin 写在 root 上而不是宿主上：
         自定义元素默认是 inline，纵向外边距在它身上不生效 -->
    <xh-steps id="wc-steps-linear" count="3" step="0" linear>
      <div data-xh-part="root" style="margin-block-start: 20px;">
        <div data-xh-part="list">
          <div data-xh-part="item" value="0">
            <button data-xh-part="trigger">
              <span data-xh-part="indicator">1</span>
              <span data-xh-part="title">上传资料</span>
            </button>
            <div data-xh-part="separator"></div>
          </div>
          <div data-xh-part="item" value="1">
            <button data-xh-part="trigger">
              <span data-xh-part="indicator">2</span>
              <span data-xh-part="title">人工审核</span>
            </button>
            <div data-xh-part="separator"></div>
          </div>
          <div data-xh-part="item" value="2">
            <button data-xh-part="trigger">
              <span data-xh-part="indicator">3</span>
              <span data-xh-part="title">开通服务</span>
            </button>
            <div data-xh-part="separator"></div>
          </div>
        </div>
        <div data-xh-part="content" value="0">面板 1：上传营业执照与法人身份证。</div>
        <div data-xh-part="content" value="1">面板 2：等待人工审核。</div>
        <div data-xh-part="content" value="2">面板 3：签署协议并开通。</div>
        <div data-xh-part="content" value="3">全部完成：服务已开通。</div>
        <div class="row">
          <xh-button id="wc-steps-linear-prev" variant="subtle"><button data-xh-part="root">上一步</button></xh-button>
          <xh-button id="wc-steps-linear-next" variant="solid"><button data-xh-part="root">下一步</button></xh-button>
          <span class="lead" id="wc-steps-linear-value"></span>
        </div>
      </div>
    </xh-steps>
  </section>

  <section>
    <h2>HoverCard</h2>
    <p class="lead">
      悬停停够 700ms 才展开、移开 300ms 才收起——那段收起等待正是留给指针从触发器走到卡片上的通行时间，
      中间隔着一段间距也走得过去，途中卡片不会消失。与 Tooltip 的分界就在卡片本体是可交互的：
      指针停在卡片上一直不收，里面的“主页”链接与“关注”按钮都点得到、Tab 也走得进去（点“关注”卡片不会关）。
      键盘把焦点落到触发器上是立刻展开、不走那 700ms；焦点离开卡片即收起，Escape 当场收起、不等那 300ms。
      卡片从不抢焦点、不锁滚动，触发器本身是透明按钮，颜色与字体都随行文走，所以它在正文里读起来就是个普通用户名。
    </p>
    <div>
      最近这批组件由
      <xh-hover-card id="wc-hover-card" placement="bottom-start">
        <!-- root 这层要自己写：data-state 落在它上面，trigger 与浮层也都要收在它里面。
             卡片里嵌 xh-button 不会串味：角色节点发现遇到 xh-* 子树就止步，内层的 part 归内层自己 -->
        <div data-xh-part="root">
          <button data-xh-part="trigger">@xihan</button>
          <div data-xh-part="positioner">
            <div data-xh-part="content">
              <div data-xh-part="arrow"></div>
              <strong>XiHan.UI</strong>
              <span>框架无关的设计系统运行时，Vue 与 Web Components 共用同一套 headless。</span>
              <!-- 这层行容器是本页自己的排版，不是角色节点 -->
              <div class="row">
                <a href="#profile">主页</a>
                <xh-button variant="subtle"><button data-xh-part="root" id="wc-hover-card-follow">关注</button></xh-button>
              </div>
            </div>
          </div>
        </div>
      </xh-hover-card>
      推上来。
    </div>
    <span class="lead" id="wc-hover-card-state"></span>
  </section>

  <section>
    <h2>ContextMenu</h2>
    <p class="lead">
      这一段必须拿真浏览器试：在下面那块区域上点右键，浏览器自带的那张菜单会被拦掉，换成这一张，
      而且它钉在鼠标点下去的那一点上——不是贴着区域某条边。换个角落再点一次，菜单就跟着坐标走；
      区域之外右键仍是浏览器自带的那张，正好对照着看接管到哪儿为止。
      已经开着的时候在别处再右键，它只是挪到新坐标，不先关再开，也不多发一对开合回调。
      触摸端在区域上按住 700ms 同样弹得出来，中途手指滑开或提前抬手就取消（鼠标按住不动不算长按）。
      区域自带一个 Tab 位，键盘按 ContextMenu 键或 Shift+F10 打开（裸 F10 不归它管），此时锚点取区域的起始角。
      展开后方向键跳过禁用的粘贴、Home / End 越过分隔线取首尾、连打 d 直接落到 Delete；
      Enter 与鼠标点击走同一条出口——选中、关闭、焦点还回区域，Escape 与在菜单外按左键同样关得掉。
    </p>
    <xh-context-menu id="wc-context-menu">
      <!-- root / trigger / positioner / content 与每个条目都由作者写：条目身份取自身的 value 属性，
           禁用用 aria-disabled 声明——原生 disabled 不可聚焦，禁用项就当不成方向键的起点。
           触发区是一块普通内容区域、不是按钮，它的 Tab 位与那套 ARIA 由元素打上去；
           content 常挂在 DOM 里，收起靠 hidden，作者节点不卸载 -->
      <div data-xh-part="root">
        <!-- 皮肤只管触发区的交互观感，尺寸与排布归作者：这里只写一条把区域撑开的版面约束 -->
        <div data-xh-part="trigger" style="display: grid; place-items: center; min-block-size: 120px;">
          <span>在这块区域上右键（触摸端长按）</span>
        </div>
        <div data-xh-part="positioner">
          <div data-xh-part="content">
            <div data-xh-part="item" value="copy">
              <span data-xh-part="item-text">Copy 复制</span>
            </div>
            <div data-xh-part="item" value="paste" aria-disabled="true">
              <span data-xh-part="item-text">Paste 粘贴（剪贴板是空的）</span>
            </div>
            <div data-xh-part="item" value="rename">
              <span data-xh-part="item-text">Rename 重命名</span>
            </div>
            <div data-xh-part="separator"></div>
            <div data-xh-part="item" value="delete">
              <span data-xh-part="item-text">Delete 删除</span>
            </div>
          </div>
        </div>
      </div>
    </xh-context-menu>
    <span class="lead" id="wc-context-menu-picked">最近选中：（无）</span>
  </section>

  <section>
    <h2>Clipboard</h2>
    <p class="lead">
      写入是异步的，也真的会失败：按下去先进 copying（按钮压暗，此刻连点也只发一次写请求），
      写成功才翻成“已复制”，2 秒后自己回落。失败一律退回初始态并把原因报出来——
      用 http 打开这个页面（非安全上下文）、或权限被拒都会走到这条路上，界面上绝不会留下“已复制”的假象。
      展示框是只读而不是禁用：聚焦即全选，键盘用户照样能用 Ctrl / Cmd + C 自己带走；
      点标题“接口密钥”会聚焦到框里（for 指的就是那个 input）。
      两个指示器都常挂在 DOM 里、靠 hidden 互斥显隐，来回切按钮不抖宽。
    </p>
    <xh-clipboard id="wc-clipboard" value="xh_live_9f2c7a41b6d84e05" timeout="2000">
      <!-- label 必须是原生 label（for 恒写向下面那个 input），input 必须是原生 input（值、只读与全选都落在它身上），
           trigger 必须是原生 button（Enter / Space 的激活归平台）。两个指示器各用 copied 属性声明自己属于哪一侧 -->
      <div data-xh-part="root">
        <label data-xh-part="label">接口密钥</label>
        <div data-xh-part="control">
          <input data-xh-part="input">
          <button data-xh-part="trigger">
            <span data-xh-part="indicator">复制</span>
            <span data-xh-part="indicator" copied>✓ 已复制</span>
          </button>
        </div>
      </div>
    </xh-clipboard>
    <span class="lead" id="wc-clipboard-state"></span>
  </section>

  <section>
    <h2>Image</h2>
    <p class="lead">
      比 Avatar 通用：不预设圆形、也不预设首字母兜底，尺寸由 <code>--xh-image-w</code> 与 <code>--xh-image-ratio</code>
      说了算，同一个组件既当封面图也当缩略图。图片与回退内容始终同时挂在 DOM 里、靠 hidden 互斥，换人时盒子不塌也不跳。
      三个例子分别是正常加载、地址写坏走回退、压根没有 src——后两者是同一个落点，
      DevTools 里看 root 上的 data-status 一眼分得清三态（loaded / error）。
      加载途中回退内容要不要立刻露面由 fallback-delay 决定，默认 0 就是立刻；给它一个值，走缓存的快图就不会先闪一下占位。
    </p>
    <div class="row">
      <!-- image 必须是原生 img，src / alt 由宿主写入，作者别自己往上写；
           root 上那两条自定义属性是皮肤留给作者的尺寸接口（不给就是满宽、高度 auto），不是在覆盖皮肤。
           第一张是内嵌 SVG：不联网也看得到加载成功那一态 -->
      <xh-image id="wc-image-ok" src="data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2016%209%22%3E%3Crect%20width=%2216%22%20height=%229%22%20fill=%22%23475569%22/%3E%3Cpath%20d=%22M0%209%206%203%2016%209z%22%20fill=%22%2394a3b8%22/%3E%3C/svg%3E" alt="示例封面图">
        <div data-xh-part="root" style="--xh-image-w: 200px; --xh-image-ratio: 16 / 9;">
          <img data-xh-part="image">
          <div data-xh-part="fallback">加载中</div>
        </div>
      </xh-image>
      <xh-image id="wc-image-broken" src="https://example.invalid/broken.png" alt="地址写坏的图">
        <div data-xh-part="root" style="--xh-image-w: 200px; --xh-image-ratio: 16 / 9;">
          <img data-xh-part="image">
          <div data-xh-part="fallback">图挂了</div>
        </div>
      </xh-image>
      <xh-image id="wc-image-none">
        <div data-xh-part="root" style="--xh-image-w: 200px; --xh-image-ratio: 16 / 9;">
          <img data-xh-part="image">
          <div data-xh-part="fallback">没有来源</div>
        </div>
      </xh-image>
    </div>
    <span class="lead" id="wc-image-state"></span>
  </section>
</main>
`

document.getElementById('theme')!.addEventListener('click', () => {
  theme.setPreference({ mode: theme.getState().mode === 'light' ? 'dark' : 'light' })
})

// 菜单选中回显
document.getElementById('wc-menu')!.addEventListener('select', (e) => {
  document.getElementById('wc-menu-picked')!.textContent = `最近选中：${(e as CustomEvent<{ value: string }>).detail.value}`
})

// 进度条加减：直接改宿主元素的 value 属性，元素自行重连接
const progressEl = document.getElementById('wc-progress')!
const progressLabel = document.getElementById('wc-progress-label')!
for (const btn of Array.from(document.querySelectorAll('[data-progress]'))) {
  btn.addEventListener('click', () => {
    const delta = Number((btn as HTMLElement).dataset.progress)
    const next = Math.min(100, Math.max(0, Number(progressEl.getAttribute('value')) + delta))
    progressEl.setAttribute('value', String(next))
    progressLabel.textContent = `${next} / 100`
  })
}

// 选中值回显
document.getElementById('wc-select')!.addEventListener('value-change', (e) => {
  const { value } = (e as CustomEvent<{ value: string | null }>).detail
  document.getElementById('wc-select-value')!.textContent = `当前值：${value ?? '（未选）'}`
})

// 数字框值回显
document.getElementById('wc-number')!.addEventListener('value-change', (e) => {
  const { value } = (e as CustomEvent<{ value: string }>).detail
  document.getElementById('wc-number-value')!.textContent = `当前值：${value === '' ? '（空）' : value}`
})

// 无效态开关：改宿主元素的属性，元素自行重接线
document.getElementById('wc-field-invalid')!.addEventListener('change', (e) => {
  document.getElementById('wc-field')!.toggleAttribute('invalid', (e.target as HTMLInputElement).checked)
})

// 取消/确定：复用 close-trigger 关闭对话框
for (const btn of Array.from(document.querySelectorAll('[data-close]'))) {
  btn.addEventListener('click', () => {
    (document.querySelector('xh-dialog [data-xh-part="close-trigger"]') as HTMLElement | null)?.click()
  })
}

// 文本框值回显：顺带把字数贴出来，好对照 data-at-limit 是什么时候挂上的
document.getElementById('wc-text-field')!.addEventListener('value-change', (e) => {
  const { value } = (e as CustomEvent<{ value: string }>).detail
  document.getElementById('wc-text-field-value')!.textContent = `当前值：${value === '' ? '（空）' : value} · ${value.length} / 10`
})

// 无效态开关：改宿主元素的属性，元素自行重接线
document.getElementById('wc-text-field-invalid')!.addEventListener('change', (e) => {
  document.getElementById('wc-text-field')!.toggleAttribute('invalid', (e.target as HTMLInputElement).checked)
})

// 验证码值回显：填满与否由整份值当场算，value-complete 只在刚好填满那一下派，退格后不会再来一条
document.getElementById('wc-pin-input')!.addEventListener('value-change', (e) => {
  const { value, valueAsString } = (e as CustomEvent<{ value: string[], valueAsString: string }>).detail
  const complete = value.every(char => char !== '')
  document.getElementById('wc-pin-input-value')!.textContent = `当前值：${valueAsString === '' ? '（空）' : valueAsString} · ${complete ? '已填满' : '未填满'}`
})

// 复选框组回显：方框与全选那三态都由皮肤按 data-state 画，这里只把值贴出来
document.getElementById('wc-checkbox-group')!.addEventListener('value-change', (e) => {
  const { value } = (e as CustomEvent<{ value: string[] }>).detail
  document.getElementById('wc-checkbox-group-value')!.textContent = `当前值：${value.join('、') || '（无）'}`
})

// 开关组回显：值的形态跟着 multiple 走——单选给裸值（无选中为 null），多选给数组
document.getElementById('wc-toggle-group-single')!.addEventListener('value-change', (e) => {
  const { value } = (e as CustomEvent<{ value: string | null }>).detail
  document.getElementById('wc-toggle-group-single-value')!.textContent = `对齐（单选）：${value ?? '（无）'}`
})
document.getElementById('wc-toggle-group-multi')!.addEventListener('value-change', (e) => {
  const { value } = (e as CustomEvent<{ value: string[] }>).detail
  document.getElementById('wc-toggle-group-multi-value')!.textContent = `样式（多选）：${value.join('、') || '（无）'}`
})

// 滑块值回显：value-change 在拖动途中会连发，照单更新即可
const volumeOut = document.getElementById('wc-slider-volume-value')!
document.getElementById('wc-slider-volume')!.addEventListener('value-change', (e) => {
  const { value } = (e as CustomEvent<{ value: number[] }>).detail
  volumeOut.textContent = `音量：${value[0]}`
})

const priceOut = document.getElementById('wc-slider-price-value')!
document.getElementById('wc-slider-price')!.addEventListener('value-change', (e) => {
  const { value } = (e as CustomEvent<{ value: number[] }>).detail
  priceOut.textContent = `价格：¥${value[0]} – ¥${value[1]}`
})

// 评分回显：value-change 是真的落了值，hover-change 只是预览（指针离开时带 null）
const ratingOut = document.getElementById('wc-rating-value')!
let ratingScore = 3
let ratingHover: number | null = null
function renderRating(): void {
  ratingOut.textContent = `评分：${ratingScore} · 悬停预览：${ratingHover ?? '（无）'}`
}
const ratingEl = document.getElementById('wc-rating')!
ratingEl.addEventListener('value-change', (e) => {
  ratingScore = (e as CustomEvent<{ value: number }>).detail.value
  renderRating()
})
ratingEl.addEventListener('hover-change', (e) => {
  ratingHover = (e as CustomEvent<{ value: number | null }>).detail.value
  renderRating()
})

// 勾选字符是作者内容：皮肤只按 data-state 管它的显隐、并给它留住宽度（切换选中不抖行），
// 字符本身仍得自己写进去。顺带把选中集合回显出来
const wcListbox = document.getElementById('wc-listbox')!

function paintWcListbox(values: readonly string[]): void {
  for (const item of Array.from(wcListbox.querySelectorAll<HTMLElement>('[data-xh-part="item"]'))) {
    const indicator = item.querySelector<HTMLElement>('[data-xh-part="item-indicator"]')
    if (indicator)
      indicator.textContent = values.includes(item.getAttribute('value') ?? '') ? '✓' : ''
  }
  document.getElementById('wc-listbox-value')!.textContent = `已选：${values.length ? values.join('、') : '（无）'}`
}

// 属性形式的初始值只表达得了单选，多选得走 property（el.value = ['a', 'b']）
const wcListboxInitial = wcListbox.getAttribute('default-value')
paintWcListbox(wcListboxInitial ? [wcListboxInitial] : [])

wcListbox.addEventListener('value-change', (e) => {
  paintWcListbox((e as CustomEvent<{ value: string[] }>).detail.value)
})

// 单选 / 多选切换：改宿主属性，元素自行重接线（content 的 aria-multiselectable 跟着翻）
document.getElementById('wc-listbox-multiple')!.addEventListener('change', (e) => {
  wcListbox.toggleAttribute('multiple', (e.target as HTMLInputElement).checked)
})

// 页码序列由作者渲染（Vue 侧由 root 插槽的 pages 直接给出；WC 侧元素只打属性、不建节点）。
// 窗口规则与 headless 一致：贴首页 / 贴末页时把省略位让给页码，中间时当前页两侧各留一页，
// 序列长度恒为 7（siblingCount=1 且总页数装不下时的形状），切页时分页器不会左右抖动。
const wcPaginationCount = 196
const wcPaginationSize = 10
const wcPaginationTotal = Math.ceil(wcPaginationCount / wcPaginationSize)
const wcPaginationPages = document.getElementById('wc-pagination-pages')!
const wcPaginationRange = document.getElementById('wc-pagination-range')!
let wcPaginationSequenceKey = ''

function wcPageSequence(page: number): (number | 'ellipsis')[] {
  const last = wcPaginationTotal
  if (page <= 4)
    return [1, 2, 3, 4, 5, 'ellipsis', last]
  if (page >= last - 3)
    return [1, 'ellipsis', last - 4, last - 3, last - 2, last - 1, last]
  return [1, 'ellipsis', page - 1, page, page + 1, 'ellipsis', last]
}

function renderWcPagination(page: number): void {
  const sequence = wcPageSequence(page)
  const key = sequence.join(',')
  // 序列没变就不重建节点：白换一批 DOM 会把焦点从刚按下的那颗页码上抖掉。
  // 重建后新节点由基类的变动观察器接住，下一帧照常接线
  if (key !== wcPaginationSequenceKey) {
    wcPaginationSequenceKey = key
    wcPaginationPages.innerHTML = sequence.map((p) => {
      if (p === 'ellipsis')
        return '<span data-xh-part="ellipsis">…</span>'
      return `<button data-xh-part="item" value="${p}">${p}</button>`
    }).join('')
  }
  const start = (page - 1) * wcPaginationSize + 1
  const end = Math.min(page * wcPaginationSize, wcPaginationCount)
  wcPaginationRange.textContent = `第 ${start}-${end} 条，共 ${wcPaginationCount} 条 · 第 ${page} / ${wcPaginationTotal} 页`
}

renderWcPagination(1)

document.getElementById('wc-pagination')!.addEventListener('page-change', (e) => {
  renderWcPagination((e as CustomEvent<{ page: number, pageSize: number }>).detail.page)
})

// 抽屉：关闭按钮的可及名走 translations（对象属性，走不了 HTML 属性，
// 写在按钮上的 aria-label 会被 connect 覆写），顺带把开合回显接上
const drawerState = document.getElementById('wc-drawer-state')!
for (const el of Array.from(document.querySelectorAll('xh-drawer'))) {
  const host = el as HTMLElement & { translations?: { close: string } }
  const side = host.getAttribute('side') ?? 'right'
  host.translations = { close: '关闭' }
  host.addEventListener('open-change', (e) => {
    const { open } = (e as CustomEvent<{ open: boolean }>).detail
    drawerState.textContent = `当前展开：${open ? side : '（无）'}`
  })
}

// Toaster / Toast：队列容器不替作者生成条目，队列变了由作者照 visibleToasts 增删 <xh-toast>。
// 改写队列的方法叫 updateToast，不叫 update——update 是 Lit 自己的渲染钩子，占用它组件当场不工作
const toasterEl = document.getElementById('wc-toaster')! as HTMLElement & {
  create: (options: { id?: string, type?: string, title?: string, description?: string }) => string
  updateToast: (id: string, options: { type?: string, title?: string, description?: string }) => void
  dismissAll: () => void
  visibleToasts: Array<{
    id: string
    type: string
    title?: string
    description?: string
    duration: number
    removeDelay: number
    closable: boolean
  }>
}
const toastStack = document.getElementById('wc-toast-stack')!
const toastCount = document.getElementById('wc-toaster-count')!
const toastNodes = new Map<string, HTMLElement>()

// title / description 两个部件留空：元素只在作者没写内容时才替他填，
// 一旦写死，loading 转 success 时那两行文案就再也刷不动了。
// 类型色条走皮肤的 data-type 五条规则，这边一条样式都不写
const TOAST_CARD = `
  <div data-xh-part="root">
    <div data-xh-part="title"></div>
    <div data-xh-part="description"></div>
    <div class="row" style="gap: 8px; margin-block-start: 6px;">
      <button data-xh-part="action-trigger">撤销</button>
      <button data-xh-part="close-trigger">✕</button>
    </div>
  </div>
`

function syncToasts(): void {
  const list = toasterEl.visibleToasts
  const alive = new Set<string>()
  for (const toast of list) {
    alive.add(toast.id)
    let node = toastNodes.get(toast.id)
    if (!node) {
      const created = document.createElement('xh-toast') as HTMLElement & { translations?: { close: string } }
      created.innerHTML = TOAST_CARD
      // id 是队列身份，元素按它认领自己那条记录
      created.setAttribute('id', toast.id)
      // 文案是对象，走不了属性，只能作为 property 交过去；写在 HTML 上的 aria-label 会被元素每帧盖掉
      created.translations = { close: '关闭' }
      node = created
      toastNodes.set(toast.id, node)
      toastStack.append(node)
    }
    // 条目已由队列补齐默认值，照原样摊上去即可，不在这边再兜一遍缺省
    node.setAttribute('type', toast.type)
    node.setAttribute('title', toast.title ?? '')
    node.setAttribute('description', toast.description ?? '')
    node.setAttribute('duration', String(toast.duration))
    node.setAttribute('remove-delay', String(toast.removeDelay))
    node.setAttribute('closable', String(toast.closable))
  }
  for (const [id, node] of Array.from(toastNodes)) {
    if (alive.has(id))
      continue
    node.remove()
    toastNodes.delete(id)
  }
  toastCount.textContent = `队列：${list.length} 条`
}

function startUpload(): void {
  toasterEl.create({ id: 'wc-upload', type: 'loading', title: '正在上传', description: '3 个文件排队中' })
  // 改一条已经在队列里的
  window.setTimeout(() => {
    toasterEl.updateToast('wc-upload', { description: '已传 2 / 3' })
  }, 1200)
  // 同一个 id 再 create 一次同样是就地改写，位置不动
  window.setTimeout(() => {
    toasterEl.create({ id: 'wc-upload', type: 'success', title: '上传完成', description: '3 个文件已入库' })
  }, 2400)
}

// 队列变了才重排条目。改 DOM 推到微任务里：unmounted 是 toast 机器在转移途中报上来的，
// 当场把节点摘走等于在它自己的转移里把它停掉
toasterEl.addEventListener('toasts-change', () => {
  queueMicrotask(syncToasts)
})

for (const btn of Array.from(document.querySelectorAll('[data-toast]'))) {
  btn.addEventListener('click', () => {
    const kind = (btn as HTMLElement).dataset.toast
    if (kind === 'info')
      toasterEl.create({ title: '草稿已保存', description: '内容已同步到云端' })
    else if (kind === 'error')
      toasterEl.create({ type: 'error', title: '同步失败', description: '网络中断，稍后自动重试' })
    else if (kind === 'clear')
      toasterEl.dismissAll()
    else
      startUpload()
  })
}

// 组合框的候选由本页现渲：过滤是调用方的活儿，元素只管高亮、选中与空态。
// 条目节点一改，元素就会重新接线并重新结算候选条数，空态节点据此显形。
// 禁用一律写 aria-disabled：原生 disabled 不派 click，禁用候选的点击就走不到守卫里
const wcComboCities: { value: string, label: string, disabled?: boolean }[] = [
  { value: 'amsterdam', label: 'Amsterdam 阿姆斯特丹' },
  { value: 'bangkok', label: 'Bangkok 曼谷' },
  { value: 'barcelona', label: 'Barcelona 巴塞罗那' },
  { value: 'beijing', label: 'Beijing 北京' },
  { value: 'berlin', label: 'Berlin 柏林' },
  { value: 'busan', label: 'Busan 釜山（禁用）', disabled: true },
  { value: 'chengdu', label: 'Chengdu 成都' },
  { value: 'chicago', label: 'Chicago 芝加哥' },
  { value: 'dubai', label: 'Dubai 迪拜' },
  { value: 'hangzhou', label: 'Hangzhou 杭州' },
  { value: 'istanbul', label: 'Istanbul 伊斯坦布尔' },
  { value: 'london', label: 'London 伦敦' },
  { value: 'melbourne', label: 'Melbourne 墨尔本' },
  { value: 'osaka', label: 'Osaka 大阪' },
  { value: 'paris', label: 'Paris 巴黎' },
  { value: 'seattle', label: 'Seattle 西雅图' },
  { value: 'shanghai', label: 'Shanghai 上海' },
  { value: 'toronto', label: 'Toronto 多伦多' },
]

function wcComboItemsHtml(query: string): string {
  const q = query.trim().toLowerCase()
  return wcComboCities
    .filter(city => q === '' || city.label.toLowerCase().includes(q))
    .map(city => `<div data-xh-part="item" value="${city.value}"${city.disabled ? ' aria-disabled="true"' : ''}>`
      + `<span data-xh-part="item-text">${city.label}</span>`
      // 勾选标记恒在，显不显由选中态驱动皮肤；未选中时它仍占着宽度，切换不抖行
      + `<span data-xh-part="item-indicator">✓</span></div>`)
    .join('')
}

// 两个组合框的接线一模一样，只有已选项怎么显示归各自决定
function wireWcCombobox(hostId: string, paintValue: (value: readonly string[]) => void): void {
  const host = document.getElementById(hostId)!
  // 列表按 data-xh-part 找：content 的 id 由元素写成输入框 aria-controls 指向的那个，作者写的 id 挂不住
  const list = host.querySelector<HTMLElement>('[data-xh-part="content"]')!
  let painted = ''

  const paintItems = (query: string): void => {
    const html = wcComboItemsHtml(query)
    // 筛出来还是同一批就不重建：白换一批 DOM 只会让元素多接一次线
    if (html === painted)
      return
    painted = html
    list.innerHTML = html
  }

  paintItems('')

  // 输入串一变就重筛。多选选完后元素会把输入串清空，这条事件同样会到，候选因此自动回到全集
  host.addEventListener('input-value-change', (e) => {
    paintItems((e as CustomEvent<{ inputValue: string }>).detail.inputValue)
  })
  host.addEventListener('value-change', (e) => {
    paintValue((e as CustomEvent<{ value: string[] }>).detail.value)
  })
}

wireWcCombobox('wc-combobox', (value) => {
  document.getElementById('wc-combobox-value')!.textContent = `当前值：${value[0] ?? '（未选）'}`
})
wireWcCombobox('wc-combobox-multi', (value) => {
  document.getElementById('wc-combobox-multi-value')!.textContent = `已选：${value.length ? value.join('、') : '（无）'}`
})

// 标签节点归作者按当前值渲染（元素只打属性、不建节点）：这里按 value-change 增删，
// 新节点由基类的变动观察器接住，下一帧照常接线
const wcTagsMax = 5
const wcTags = document.getElementById('wc-tags')!
const wcTagsControl = wcTags.querySelector<HTMLElement>('[data-xh-part="control"]')!
const wcTagsInput = wcTagsControl.querySelector<HTMLInputElement>('[data-xh-part="input"]')!
const wcTagsOut = document.getElementById('wc-tags-value')!
let wcTagsKey = ''

function renderWcTags(values: readonly string[]): void {
  // 标签没变就不重建节点：白换一批 DOM 会把焦点从正在就地编辑的那个框上抖掉
  const key = values.join(' ')
  if (key !== wcTagsKey) {
    wcTagsKey = key
    for (const gone of Array.from(wcTagsControl.querySelectorAll('[data-xh-part="item"]')))
      gone.remove()
    for (const value of values) {
      const item = document.createElement('span')
      item.setAttribute('data-xh-part', 'item')
      // 身份取节点自带的 value 属性，元素照它认领这一个标签
      item.setAttribute('value', value)
      const preview = document.createElement('span')
      preview.setAttribute('data-xh-part', 'item-preview')
      const text = document.createElement('span')
      text.setAttribute('data-xh-part', 'item-text')
      text.textContent = value
      // 删除钮要能被激活，写成原生 button（它不占 Tab 位，可及名由元素写成 aria-label）
      const remove = document.createElement('button')
      remove.setAttribute('data-xh-part', 'item-delete-trigger')
      remove.textContent = '×'
      preview.append(text, remove)
      // 就地编辑框常挂不卸载，不编辑时由元素收起
      const edit = document.createElement('input')
      edit.setAttribute('data-xh-part', 'item-input')
      item.append(preview, edit)
      // 标签一律排在输入框之前：输入框永远跟在最后一个标签后面
      wcTagsControl.insertBefore(item, wcTagsInput)
    }
  }
  const atMax = values.length >= wcTagsMax
  wcTagsOut.textContent = `${values.length} / ${wcTagsMax} 个标签${atMax ? ' · 已到上限' : ''}：${values.length ? values.join('、') : '（无）'}`
}

// 属性形式的初始值按逗号拆，与元素自己的转换器同一套
renderWcTags((wcTags.getAttribute('default-value') ?? '').split(',').filter(v => v !== ''))

wcTags.addEventListener('value-change', (e) => {
  const { value } = (e as CustomEvent<{ value: string[] }>).detail
  // 增删推到微任务里：这条回调是机器在转移途中报上来的，当场抽走节点等于在它自己的收尾里把节点拆了
  queueMicrotask(() => renderWcTags(value))
})

// 就地编辑：当前值随每次敲键变（value-change），“上次提交”只在提交时变（value-commit）——
// Escape 撤销回的正是后面这个。提交即便没改动值也照发一条，故两行会同时对齐
function wireWcEditable(hostId: string, outId: string): void {
  const host = document.getElementById(hostId)!
  const out = document.getElementById(outId)!
  const mode = host.getAttribute('submit-mode') ?? 'both'
  let current = host.getAttribute('default-value') ?? ''
  let committed = current
  const paint = (): void => {
    out.textContent = `submitMode=${mode} · 当前：${current || '（空）'} · 上次提交：${committed || '（空）'}`
  }
  host.addEventListener('value-change', (e) => {
    current = (e as CustomEvent<{ value: string }>).detail.value
    paint()
  })
  host.addEventListener('value-commit', (e) => {
    committed = (e as CustomEvent<{ value: string, previousValue: string }>).detail.value
    paint()
  })
  paint()
}

wireWcEditable('wc-editable-blur', 'wc-editable-blur-value')
wireWcEditable('wc-editable-enter', 'wc-editable-enter-value')

// 上传：条目节点归作者建（元素只按文档序把文件绑上去，并代填文件名与大小），列表变了照数量增删即可。
// 增删而不是整块重建：整块重建会把焦点从刚按下的那颗删除按钮上抖掉。
// 新插进来的节点由基类的变动观察器接住，下一帧照常接线
const wcUploadItems = document.getElementById('wc-file-upload-items')!
const wcUploadOut = document.getElementById('wc-file-upload-state')!
const WC_UPLOAD_ITEM = '<div data-xh-part="item"><span data-xh-part="item-preview"></span><span data-xh-part="item-name"></span><span data-xh-part="item-size-text"></span><button data-xh-part="item-delete-trigger">✕</button></div>'
const wcUploadRejectText: Record<string, string> = {
  'type': '类型不在允许范围内',
  'size-too-large': '超过单个 512 KB 的上限',
  'size-too-small': '小于下限',
  'too-many-files': '列表最多只放得下 3 个',
}
let wcUploadCount = 0
let wcUploadReject = ''

function renderWcUpload(): void {
  while (wcUploadItems.children.length > wcUploadCount)
    wcUploadItems.lastElementChild!.remove()
  while (wcUploadItems.children.length < wcUploadCount)
    wcUploadItems.insertAdjacentHTML('beforeend', WC_UPLOAD_ITEM)
  wcUploadOut.textContent = `已选 ${wcUploadCount} / 3${wcUploadReject ? ` · 被拒：${wcUploadReject}` : ''}`
}

renderWcUpload()

const wcUpload = document.getElementById('wc-file-upload')! as HTMLElement & {
  translations?: { dropzone: string, deleteFile: (file: File) => string, clearFiles: string }
}
// 文案里有函数，走不了 HTML 属性，只能作为 property 交过去；写在按钮上的 aria-label 会被元素每帧盖掉
wcUpload.translations = {
  dropzone: '把文件拖到这里，或点开系统选择框',
  deleteFile: (file: File) => `删除 ${file.name}`,
  clearFiles: '清空全部文件',
}
wcUpload.addEventListener('files-change', (e) => {
  wcUploadCount = (e as CustomEvent<{ files: File[] }>).detail.files.length
  renderWcUpload()
})
// 一批里同时有收下的和被拒的是常态，accept 先到：先把上一次的原因清掉，随后那条 reject 再写新的
wcUpload.addEventListener('file-accept', () => {
  wcUploadReject = ''
  renderWcUpload()
})
wcUpload.addEventListener('file-reject', (e) => {
  const { files } = (e as CustomEvent<{ files: { file: File, reasons: string[] }[] }>).detail
  wcUploadReject = files
    .map(item => `${item.file.name}（${item.reasons.map(r => wcUploadRejectText[r] ?? r).join('、')}）`)
    .join('；')
  renderWcUpload()
})

// Tree：层级三件套（aria-level / aria-posinset / aria-setsize）、禁用与检索用的名字全取自树数据，
// 它只能按 property 交——数组表达不了属性。标记与它必须同源，标记里有、这份数据里没有的节点报不出层级
interface WcTreeNode {
  value: string
  label?: string
  disabled?: boolean
  children?: WcTreeNode[]
}

const wcTree = document.getElementById('wc-tree')! as HTMLElement & {
  collection?: WcTreeNode[]
  expandedValue?: string[]
  selectedValue?: string[]
}

// 连打检索按 label 首字母匹配，文件名因此都以拉丁字母开头（两个 d 开头的才轮转得出来）
wcTree.collection = [
  {
    value: 'src',
    label: 'src',
    children: [
      {
        value: 'components',
        label: 'components',
        children: [
          { value: 'button', label: 'Button.vue' },
          { value: 'dialog', label: 'Dialog.vue' },
          { value: 'field', label: 'Field.vue' },
        ],
      },
      {
        value: 'utils',
        label: 'utils',
        children: [
          { value: 'dom', label: 'dom.ts' },
          { value: 'format', label: 'format.ts' },
        ],
      },
      { value: 'main', label: 'main.ts' },
    ],
  },
  {
    value: 'docs',
    label: 'docs',
    children: [
      { value: 'guide', label: 'guide.md' },
      { value: 'api', label: 'api.md' },
    ],
  },
  // children 给了空数组照样算分支：「暂时没有子项的目录」与文件在 ARIA 上不是一回事，前者要报 aria-expanded
  { value: 'dist', label: 'dist', children: [] },
  // 禁用只声明在这里，标记里不必再抄一遍
  { value: 'lockfile', label: 'pnpm-lock.yaml（禁用）', disabled: true },
  { value: 'readme', label: 'README.md' },
]

// 展开与选中都走受控。元素连上那一刻就把机器建起来了，default-* 一类初值只在那一刻读一次，
// 而集合只能按 property 给、这几行又跑在 innerHTML 之后——追不上；受控值则是每次读都回头问 property，
// 所以下面两个监听必须把新集合写回来，不写回点开的分支会立刻弹回去
wcTree.expandedValue = ['src']
wcTree.selectedValue = []

const wcTreeState = document.getElementById('wc-tree-state')!

function paintWcTree(): void {
  const expanded = wcTree.expandedValue ?? []
  const selected = wcTree.selectedValue ?? []
  wcTreeState.textContent = `展开：${expanded.join('、') || '（无）'} · 选中：${selected.join('、') || '（无）'}`
}

paintWcTree()

wcTree.addEventListener('expanded-change', (e) => {
  wcTree.expandedValue = (e as CustomEvent<{ value: string[] }>).detail.value
  paintWcTree()
})

wcTree.addEventListener('selection-change', (e) => {
  wcTree.selectedValue = (e as CustomEvent<{ value: string[] }>).detail.value
  paintWcTree()
})

// 工具条不接管条目的点击：回显由按钮自己的 click 记。
// 禁用同样归条目自报——单项 aria-disabled 与整条 disabled 在这里读到的是同一件事，
// 整条禁用期间元素会把每个条目都写成 aria-disabled
const wcToolbarCommand = document.getElementById('wc-toolbar-command')!
for (const el of Array.from(document.querySelectorAll('xh-toolbar'))) {
  el.addEventListener('click', (e) => {
    const item = (e.target as HTMLElement).closest<HTMLElement>('[data-xh-part="item"]')
    if (!item || item.getAttribute('aria-disabled') === 'true')
      return
    wcToolbarCommand.textContent = `最近点击：${item.getAttribute('value')}`
  })
}

// 整条禁用：改宿主属性，元素自行重接线（解禁后单项声明照旧，元素留了作者声明的快照）
document.getElementById('wc-toolbar-disabled')!.addEventListener('change', (e) => {
  document.getElementById('wc-toolbar')!.toggleAttribute('disabled', (e.target as HTMLInputElement).checked)
})

// 步骤条：元素不暴露命令式接口，写了 step 属性即受控——点 trigger 只发 step-change 意图，
// 由这里写回属性才真的切步，外面那两颗按钮同样只是改这一个属性。
// 两台步骤条共用这段接线，差别全在 HTML 上写的 count 与 linear。
function wireWcSteps(id: string, count: number): void {
  const host = document.getElementById(id)!
  const prev = document.getElementById(`${id}-prev`)!
  const next = document.getElementById(`${id}-next`)!
  const out = document.getElementById(`${id}-value`)!
  const readStep = (): number => Number(host.getAttribute('step'))

  // 圆点里的字符是作者内容：皮肤只按 data-state 管描边与填充，走过的那几步换成对勾得自己写。
  // 禁用写在 xh-button 宿主上，元素自会往里面那颗原生 button 打 disabled
  function paint(step: number): void {
    for (const item of Array.from(host.querySelectorAll<HTMLElement>('[data-xh-part="item"]'))) {
      const index = Number(item.getAttribute('value'))
      const indicator = item.querySelector<HTMLElement>('[data-xh-part="indicator"]')
      if (indicator)
        indicator.textContent = index < step ? '✓' : String(index + 1)
    }
    prev.toggleAttribute('disabled', step === 0)
    next.toggleAttribute('disabled', step === count)
    out.textContent = step === count ? '当前：全部完成' : `当前：第 ${step + 1} / ${count} 步`
  }

  function setStep(step: number): void {
    host.setAttribute('step', String(step))
    paint(step)
  }

  host.addEventListener('step-change', (e) => {
    setStep((e as CustomEvent<{ step: number }>).detail.step)
  })
  // 上界取 count 而不是 count - 1：最后一步走完之后还有一格“全部完成”
  prev.addEventListener('click', () => setStep(Math.max(0, readStep() - 1)))
  next.addEventListener('click', () => setStep(Math.min(count, readStep() + 1)))
  paint(readStep())
}

wireWcSteps('wc-steps', 4)
wireWcSteps('wc-steps-linear', 3)

// 悬停卡片：开合与“关注”两件事贴在同一行回显，好一眼看出点卡片里的按钮并不会把卡片关掉
const hoverCardOut = document.getElementById('wc-hover-card-state')!
const hoverCardFollow = document.getElementById('wc-hover-card-follow')!
let hoverCardOpen = false
let hoverCardFollowing = false

function renderWcHoverCard(): void {
  hoverCardOut.textContent = `卡片：${hoverCardOpen ? '展开' : '收起'} · ${hoverCardFollowing ? '已关注' : '未关注'}`
}

renderWcHoverCard()

document.getElementById('wc-hover-card')!.addEventListener('open-change', (e) => {
  hoverCardOpen = (e as CustomEvent<{ open: boolean }>).detail.open
  renderWcHoverCard()
})

hoverCardFollow.addEventListener('click', () => {
  hoverCardFollowing = !hoverCardFollowing
  hoverCardFollow.textContent = hoverCardFollowing ? '已关注' : '关注'
  renderWcHoverCard()
})

// 右键菜单选中回显：select 从宿主冒泡出来，detail 只带 value
document.getElementById('wc-context-menu')!.addEventListener('select', (e) => {
  document.getElementById('wc-context-menu-picked')!.textContent
    = `最近选中：${(e as CustomEvent<{ value: string }>).detail.value}`
})

// 剪贴板：失败时 copy-error 先到、随后那条回 idle 的 status-change 才来，
// 状态与原因分开存，否则刚报出来的原因会被后一条当场冲掉
const clipboardOut = document.getElementById('wc-clipboard-state')!
const clipboardStatusText: Record<string, string> = { idle: '待命', copying: '写入中', copied: '已复制' }
let clipboardStatus = 'idle'
let clipboardError = ''

function renderWcClipboard(): void {
  const label = clipboardStatusText[clipboardStatus] ?? clipboardStatus
  clipboardOut.textContent = `状态：${label}${clipboardError ? ` · 上次失败：${clipboardError}` : ''}`
}

renderWcClipboard()

const wcClipboard = document.getElementById('wc-clipboard')!
wcClipboard.addEventListener('status-change', (e) => {
  const { status } = (e as CustomEvent<{ status: 'idle' | 'copying' | 'copied' }>).detail
  if (status === 'copying')
    clipboardError = ''
  clipboardStatus = status
  renderWcClipboard()
})
wcClipboard.addEventListener('copy-error', (e) => {
  const { error } = (e as CustomEvent<{ error: unknown, value: string }>).detail
  clipboardError = error instanceof Error ? error.message : String(error)
  renderWcClipboard()
})

// 三张图各报各的状态：加载成功、取回失败、压根没有来源——后两者落在同一个 error 上
const wcImageOut = document.getElementById('wc-image-state')!
const wcImageState = { ok: '—', broken: '—', none: '—' }

function renderWcImageState(): void {
  wcImageOut.textContent = `状态：正常 ${wcImageState.ok} · 坏地址 ${wcImageState.broken} · 无 src ${wcImageState.none}`
}

renderWcImageState()

for (const key of ['ok', 'broken', 'none'] as const) {
  document.getElementById(`wc-image-${key}`)!.addEventListener('status-change', (e) => {
    wcImageState[key] = (e as CustomEvent<{ status: string }>).detail.status
    renderWcImageState()
  })
}
