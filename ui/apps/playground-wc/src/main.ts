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
