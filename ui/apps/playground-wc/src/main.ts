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

  <section>
    <h2>Calendar</h2>
    <p class="lead">
      网格是作者照 weeks 自己渲染的，键盘全在 grid 上收口：左右方向键走一天、上下走一周，
      Home / End 落到本周首末（zh-CN 从周一起算，Home 落的是周一而不是周日），
      PageUp / PageDown 翻一个月，按住 Shift 再翻就是翻一年，Enter 或空格选中当前聚焦的那天。
      走到月末再按一下右键就直接跨进下个月——展示月跟着聚焦日翻，焦点也跟着落进新月份的那一格，
      不会掉回页面；首尾两行那些邻月的日子是真日子，点上去照样翻月。
      三张都开着 fixed-weeks：恒六行，翻月时网格高度不跳。
      今天那格只描一圈边、不占选中色，被选中时两件事仍分得开。
      第一张的可选窗口是今天前后各七天：窗口外的日子转 aria-disabled，仍聚焦得上、仍是方向键的起点，
      只是 Enter 落不了值；整个上一月都够不着时，上一月按钮转成原生 disabled，Tab 都停不上去。
    </p>
    <xh-calendar id="wc-calendar-single" fixed-weeks>
      <!-- 元素只交 weeks / weekDays / headingLabel 三份数据，一个节点都不生成：
           表头行与日期行这两个容器留空，由脚本一次建好骨架（恒六行四十二格），
           翻月时只改每格的 value 与文字、不重建节点。标题文案也归作者写进 heading -->
      <div data-xh-part="root" style="max-inline-size: 280px;">
        <div data-xh-part="header">
          <!-- 翻月是单体控件，必须是原生 button（越界时元素给它打原生 disabled）；
               箭头字符念不出「上个月」，可及名字得作者自己给 -->
          <button data-xh-part="prev-trigger" aria-label="上个月">‹</button>
          <div data-xh-part="heading"></div>
          <button data-xh-part="next-trigger" aria-label="下个月">›</button>
        </div>
        <div data-xh-part="grid">
          <div data-xh-part="grid-head">
            <!-- 列头得待在一行里：columnheader 直接挂在 rowgroup 下，行列语义从表头就断了 -->
            <div data-xh-part="week-row"></div>
          </div>
          <div data-xh-part="grid-body"></div>
        </div>
      </div>
    </xh-calendar>
    <span class="lead" id="wc-calendar-single-value"></span>

    <p class="lead" style="margin-block-start: 20px;">
      区间：第一下落起点，第二下落终点，中间那些天铺着一条连续底色——底色画在格子这一层、不是画在圆角的选中片上，
      所以它在格与格之间不断开，只有两端各自收圆。起点落下之后，指针划过哪天就预览到哪天；
      不摸鼠标也一样，方向键走的同时区间跟着长。指针要移出整张网格预览才收，格与格之间挪动不会闪。
      挑到一半时回显里只有起点一个值，区间已经完整时再点一下就是重开一段。
      起点落在本月、翻到下个月再落终点也接得上，只是当前展示月里只看得到那一段。
    </p>
    <xh-calendar id="wc-calendar-range" selection-mode="range" fixed-weeks>
      <div data-xh-part="root" style="max-inline-size: 280px;">
        <div data-xh-part="header">
          <button data-xh-part="prev-trigger" aria-label="上个月">‹</button>
          <div data-xh-part="heading"></div>
          <button data-xh-part="next-trigger" aria-label="下个月">›</button>
        </div>
        <div data-xh-part="grid">
          <div data-xh-part="grid-head">
            <div data-xh-part="week-row"></div>
          </div>
          <div data-xh-part="grid-body"></div>
        </div>
      </div>
    </xh-calendar>
    <span class="lead" id="wc-calendar-range-value"></span>

    <p class="lead" style="margin-block-start: 20px;">
      这张用 isDateUnavailable 把周六周日全判成不可用，要试的正是「不可用不等于走不到」：
      用方向键横着走过一整周，焦点在周末那两格照样停得住（回显里的聚焦日会走到它们身上），
      从周末那格接着按方向键也照常起步，只是 Enter 落不下去、点它也只挪焦点不落值。
      这跟翻月按钮那种原生 disabled 是两码事——后者根本进不了 Tab 序列，焦点压根停不上去。
      表头这张用 narrow 的单字缩写，另两张是默认的 short，对着看就是 weekday-format 的差别。
    </p>
    <!-- 判定函数是函数，走不了 HTML 属性，只能在脚本里作为 property 交过去 -->
    <xh-calendar id="wc-calendar-weekend" weekday-format="narrow" fixed-weeks>
      <div data-xh-part="root" style="max-inline-size: 280px;">
        <div data-xh-part="header">
          <button data-xh-part="prev-trigger" aria-label="上个月">‹</button>
          <div data-xh-part="heading"></div>
          <button data-xh-part="next-trigger" aria-label="下个月">›</button>
        </div>
        <div data-xh-part="grid">
          <div data-xh-part="grid-head">
            <div data-xh-part="week-row"></div>
          </div>
          <div data-xh-part="grid-body"></div>
        </div>
      </div>
    </xh-calendar>
    <span class="lead" id="wc-calendar-weekend-value"></span>
  </section>

  <section>
    <h2>DateField</h2>
    <p class="lead">
      三段各是一个可加减的数：上下键给当前段加一减一，到区间两端回绕——月份停在 12 再按上键回到 1，不是卡住。
      左右键与 Home / End 在段之间走，两端停住不回绕；整组只占一个 Tab 位，换段时那个 Tab 位跟着焦点挪。
      数字直接敲：月份先打 1 还留在本段等第二位，接着打 2 就成 12 并当场跳下一段；
      打 7 那一下没有第二位可接（70 早越过 12），当场就跳。年份只打两位不会立刻当成 19xx，走开那一下才补全。
      Backspace 只清当前段，另外两段一个不动；三段没填齐整份值就是 null，隐藏输入随之空着——
      一路敲到最后一位落定，才第一次报出值来。
      日的上界跟着年月走：把月推到 2 月，31 日会被收敛到 28（闰年 29）。
      上面这个给了 2020-01-01 到 2030-12-31 的边界，年份段的上下键因此只在这十一年里转。
      两个只差一个 <code>locale</code>：上面按年月日排，下面 en-US 排成月日年——同一份标记，段序换了副面孔。
      段之间的“年 / 月 / 日”与“/”是本页自己写的普通节点，不在角色表里，换段时不会被当成一站。
    </p>
    <div class="row">
      <xh-date-field id="wc-date-field-cn" locale="zh-CN" min="2020-01-01" max="2030-12-31" name="due">
        <!-- root / label / control / 每一段 / hidden-input 全由作者写。
             标题须是 span 而不是 label：段位是 div，&lt;label for&gt; 指不到它，写成 label 只会给出一个点了没反应的标题，
             “点标题聚焦首段”由元素自己接管。
             段位写 div，只声明下标（index），是年是月由 locale 与 granularity 算出来 -->
        <div data-xh-part="root">
          <span data-xh-part="label">截止日期</span>
          <div data-xh-part="control">
            <!-- 段里不写文字：显示什么由元素每帧填，写死了就再也刷不动 -->
            <div data-xh-part="segment" index="0"></div>
            <!-- 分隔符没有 data-xh-part，换段时不会被当成一站 -->
            <span>年</span>
            <div data-xh-part="segment" index="1"></div>
            <span>月</span>
            <div data-xh-part="segment" index="2"></div>
            <span>日</span>
          </div>
          <!-- 表单出口：元素把它改写成 type=hidden，值是 ISO 串，没填齐时是空的 -->
          <input data-xh-part="hidden-input">
        </div>
      </xh-date-field>
      <span class="lead" id="wc-date-field-cn-value">当前值：（未填齐）</span>
    </div>
    <div class="row" style="margin-block-start: 12px;">
      <xh-date-field id="wc-date-field-us" locale="en-US" default-value="2026-07-28">
        <div data-xh-part="root">
          <span data-xh-part="label">Due date（en-US）</span>
          <div data-xh-part="control">
            <div data-xh-part="segment" index="0"></div>
            <span>/</span>
            <div data-xh-part="segment" index="1"></div>
            <span>/</span>
            <div data-xh-part="segment" index="2"></div>
          </div>
        </div>
      </xh-date-field>
      <span class="lead" id="wc-date-field-us-value">当前值：2026-07-28</span>
    </div>
    <p class="lead" style="margin-block-start: 20px;">
      三种状态摆在一起对着看：禁用的那个段位连 tabindex 都没有，整组从 Tab 序里消失，键盘推不动值，隐藏输入也退出提交；
      显式 <code>invalid</code> 的边框转成危险色，每段的 aria-invalid 一并翻真；
      值落在 <code>min</code> / <code>max</code> 之外则是第三回事——root 挂上 data-out-of-range、段的 aria-invalid 照样翻真，
      但边框不动（那条颜色留给显式 invalid），值本身更不会被悄悄改回区间里，年份段的下界倒是当场收窄到 2020。
    </p>
    <div class="row" style="gap: 32px;">
      <xh-date-field locale="zh-CN" default-value="2026-07-28" disabled>
        <div data-xh-part="root">
          <span data-xh-part="label">禁用</span>
          <div data-xh-part="control">
            <div data-xh-part="segment" index="0"></div>
            <span>年</span>
            <div data-xh-part="segment" index="1"></div>
            <span>月</span>
            <div data-xh-part="segment" index="2"></div>
            <span>日</span>
          </div>
        </div>
      </xh-date-field>
      <xh-date-field locale="zh-CN" default-value="2026-07-28" invalid>
        <div data-xh-part="root">
          <span data-xh-part="label">invalid</span>
          <div data-xh-part="control">
            <div data-xh-part="segment" index="0"></div>
            <span>年</span>
            <div data-xh-part="segment" index="1"></div>
            <span>月</span>
            <div data-xh-part="segment" index="2"></div>
            <span>日</span>
          </div>
        </div>
      </xh-date-field>
      <xh-date-field locale="zh-CN" default-value="2019-05-01" min="2020-01-01">
        <div data-xh-part="root">
          <span data-xh-part="label">越界（min 2020-01-01）</span>
          <div data-xh-part="control">
            <div data-xh-part="segment" index="0"></div>
            <span>年</span>
            <div data-xh-part="segment" index="1"></div>
            <span>月</span>
            <div data-xh-part="segment" index="2"></div>
            <span>日</span>
          </div>
        </div>
      </xh-date-field>
    </div>
  </section>

  <section>
    <h2>TimeField</h2>
    <p class="lead">
      与日期那组同一套键盘：上下键加减当前段并在段区间里回绕（23 时再按上键回到 0 点），
      左右键与 Home / End 换段、两端停住不回绕，整组只占一个 Tab 位，Backspace 或 Delete 清掉当前段。
      数字直接敲：时段打 1 还留在本段等第二位，接着打 3 成 13 并跳到分段；打 5 那一下当场跳（50 早越过 23）；
      先打 2 再打 5 拼不成 25，落下来的是 5 并跳段。
      清掉一段整份值就退回空串，隐藏输入随之空着；点标题会把焦点送到第一段。
      上面这个是 24 小时制。中间那个 <code>hour-cycle="12"</code>，多出一个上午/下午段——上下键翻面，或者直接按 a / p 指定，
      13:45 在它那儿显示成 01:45 PM，把时段推到 0 点则显示 12 AM。
      下面那个精度到秒，秒段显出来并参与值；空段按上下键从该段的边界起步（分段从 0 起，时段按下键从 23 起）。
      段之间的“:”是本页自己写的普通节点，不在角色表里，换段时不会被当成一站。
    </p>
    <div class="row">
      <xh-time-field id="wc-time-field-24" default-value="09:30" name="start">
        <!-- root / label / control / 每一段 / hidden-input 全由作者写。
             标题写原生 label：它在表单里的语义与样式照旧，只是 for 无处可指（段是 span），
             “点标题聚焦第一段”由元素接管。
             段写 span，身份由 segment 属性声明；段里不写文字——显示什么由元素每帧填，
             作者一旦写了内容元素就再也不碰它 -->
        <div data-xh-part="root">
          <label data-xh-part="label">开始时间</label>
          <div data-xh-part="control">
            <span data-xh-part="segment" segment="hour"></span>
            <!-- 分隔符没有 data-xh-part，换段时不会被当成一站 -->
            <span>:</span>
            <span data-xh-part="segment" segment="minute"></span>
          </div>
          <!-- 表单出口：元素把它改写成 type=hidden，值是完整 ISO 串，缺段时是空的 -->
          <input data-xh-part="hidden-input">
        </div>
      </xh-time-field>
      <span class="lead" id="wc-time-field-24-value">24 小时制 · 当前值：09:30</span>
    </div>
    <div class="row" style="margin-block-start: 12px;">
      <xh-time-field id="wc-time-field-12" hour-cycle="12" default-value="13:45">
        <div data-xh-part="root">
          <label data-xh-part="label">会议时间</label>
          <div data-xh-part="control">
            <span data-xh-part="segment" segment="hour"></span>
            <span>:</span>
            <span data-xh-part="segment" segment="minute"></span>
            <span>&nbsp;</span>
            <!-- 属性值大小写敏感：段名就是 dayPeriod，写成 dayperiod 会退回按文档序认段 -->
            <span data-xh-part="segment" segment="dayPeriod"></span>
          </div>
        </div>
      </xh-time-field>
      <span class="lead" id="wc-time-field-12-value">12 小时制 · 值仍是 24 小时的串：13:45</span>
    </div>
    <div class="row" style="margin-block-start: 12px;">
      <xh-time-field id="wc-time-field-sec" granularity="second" default-value="00:05:30">
        <div data-xh-part="root">
          <label data-xh-part="label">定时（到秒）</label>
          <div data-xh-part="control">
            <span data-xh-part="segment" segment="hour"></span>
            <span>:</span>
            <span data-xh-part="segment" segment="minute"></span>
            <span>:</span>
            <span data-xh-part="segment" segment="second"></span>
          </div>
        </div>
      </xh-time-field>
      <span class="lead" id="wc-time-field-sec-value">granularity=second · 当前值：00:05:30</span>
    </div>
    <p class="lead" style="margin-block-start: 20px;">
      左边禁用：段位连 tabindex 都没有，整组退出 Tab 序，键盘推不动值，隐藏输入也不参与提交。
      右边给了 09:00 到 18:00 的区间而值是 08:00——越界只做标注、不改写值：
      root 与 control 一起挂上 data-invalid、边框转成危险色，每段的 aria-invalid 翻真，08:00 原样留着。
    </p>
    <div class="row" style="gap: 32px;">
      <xh-time-field default-value="13:45" disabled>
        <div data-xh-part="root">
          <label data-xh-part="label">禁用</label>
          <div data-xh-part="control">
            <span data-xh-part="segment" segment="hour"></span>
            <span>:</span>
            <span data-xh-part="segment" segment="minute"></span>
          </div>
        </div>
      </xh-time-field>
      <xh-time-field default-value="08:00" min="09:00" max="18:00">
        <div data-xh-part="root">
          <label data-xh-part="label">越界（09:00 – 18:00）</label>
          <div data-xh-part="control">
            <span data-xh-part="segment" segment="hour"></span>
            <span>:</span>
            <span data-xh-part="segment" segment="minute"></span>
          </div>
        </div>
      </xh-time-field>
    </div>
  </section>

  <section>
    <h2>DatePicker</h2>
    <p class="lead">
      点右端那颗按钮展开日历，焦点直接落到聚焦日那一格——有选中值就是它、没有就是今天，而不是浮层里第一个能聚焦的东西。
      网格里左右键走天、上下键走周、PageUp / PageDown 换月（按住 Shift 是换年），Home / End 落在本周首末天；
      左右键越过月界就翻到相邻月，整张网格重画，焦点仍稳稳落在该落的那天上。
      段位与日历写的是同一个值：在段位上按上下键改日、或在网格里点一天，另一边当场跟着改口，末尾那个表单出口也一起。
      Escape 收起并把焦点还给触发按钮，值一点不动；Tab 不被拦下——焦点顺着序列走出浮层，浮层随即收起，且不把焦点抢回来。
      上面这个是单选，选完即收起；周末由本页判定为不可用，那些格子转 aria-disabled，方向键照样走得过去，只是落不了值、点也不动。
      今天只描一圈边：今天与被选中是两件事，同一天上两者要能同时看得出来。
      网格与表头归脚本按元素给的 <code>weeks</code> / <code>weekDays</code> 渲染，元素一个节点都不建；
      <code>focused-value-change</code> 是“该重画了”的唯一信号，不听它日历就永远停在首帧那个月。
    </p>
    <div class="row">
      <xh-date-picker id="wc-date-picker" locale="zh-CN" name="due">
        <!-- label 刻意不是原生 label：段位是 div，不是能被 for 指向的控件，点标题聚焦首段由元素接管。
             三颗按钮必须是 button——要能聚焦，也要接得住 Enter / Space -->
        <div data-xh-part="root">
          <span data-xh-part="label">交付日期</span>
          <div data-xh-part="control">
            <div data-xh-part="input">
              <!-- 段位留空：显示什么由元素按当前值填。index 声明它是第几段（缺省按文档序），
                   分隔符是普通节点，不在角色表里 -->
              <div data-xh-part="segment" index="0"></div>
              <span>-</span>
              <div data-xh-part="segment" index="1"></div>
              <span>-</span>
              <div data-xh-part="segment" index="2"></div>
            </div>
            <button data-xh-part="clear-trigger">✕</button>
            <button data-xh-part="trigger">▾</button>
          </div>
          <!-- 表单出口：随表单提交的是 ISO 串，给了 name 才带 name -->
          <input data-xh-part="hidden-input">
          <div data-xh-part="positioner">
            <div data-xh-part="content">
              <div data-xh-part="calendar">
                <div data-xh-part="header">
                  <button data-xh-part="prev-trigger">‹</button>
                  <!-- 标题文字与网格都由脚本填：元素只交数据，不写内容 -->
                  <div data-xh-part="heading"></div>
                  <button data-xh-part="next-trigger">›</button>
                </div>
                <div data-xh-part="grid">
                  <div data-xh-part="grid-head">
                    <!-- 列头得待在一行里：columnheader 直接挂在 rowgroup 下，行列语义从表头这一层就断了 -->
                    <div data-xh-part="week-row" id="wc-date-picker-week-days"></div>
                  </div>
                  <div data-xh-part="grid-body" id="wc-date-picker-grid"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </xh-date-picker>
      <span class="lead" id="wc-date-picker-value">当前值：（未选）</span>
    </div>
    <p class="lead" style="margin-block-start: 20px;">
      下面这个是区间：先落起点再落终点，只落了起点浮层不收——“选完了”的判据是两端都在，收起那一路整个不起跳。
      挑到一半时把指针在网格上移开，起点到指针之间先铺一层预览底色；底色铺在格子上而不是格子里那个圆角块上，中间那些天才连得成一条。
      段位只显示起点：一排段位表达不出两个日期，在段位上改日改的就是起点，终点原样留着。
      这一个没写表单出口，理由同上。
    </p>
    <div class="row">
      <xh-date-picker id="wc-date-picker-range" locale="zh-CN" selection-mode="range">
        <div data-xh-part="root">
          <span data-xh-part="label">起止日期</span>
          <div data-xh-part="control">
            <div data-xh-part="input">
              <div data-xh-part="segment" index="0"></div>
              <span>-</span>
              <div data-xh-part="segment" index="1"></div>
              <span>-</span>
              <div data-xh-part="segment" index="2"></div>
            </div>
            <button data-xh-part="clear-trigger">✕</button>
            <button data-xh-part="trigger">▾</button>
          </div>
          <div data-xh-part="positioner">
            <div data-xh-part="content">
              <div data-xh-part="calendar">
                <div data-xh-part="header">
                  <button data-xh-part="prev-trigger">‹</button>
                  <div data-xh-part="heading"></div>
                  <button data-xh-part="next-trigger">›</button>
                </div>
                <div data-xh-part="grid">
                  <div data-xh-part="grid-head">
                    <div data-xh-part="week-row" id="wc-date-picker-range-week-days"></div>
                  </div>
                  <div data-xh-part="grid-body" id="wc-date-picker-range-grid"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </xh-date-picker>
      <span class="lead" id="wc-date-picker-range-value">已选区间：（未选）</span>
    </div>
  </section>

  <section>
    <h2>TimePicker</h2>
    <p class="lead">
      改值有两条路，写的是同一个值：输入行里逐段敲——每段是一个可加减的数，上下键加减、数字直接输、
      一段填满自动跳下一段、退格清掉本段；浮层里按列挑——上下键在列内走（到头到尾都回绕），
      左右键换列并落到目标列的锚点上（两端停住，不回绕），Home / End 到本列首末格，Enter 选中焦点所在那一格。
      改哪边另一边都跟着走：在段上敲 0930，浮层里 09 与 30 两格当场变成选中；在列里挑一格，段上的数字同时改口。
      选一格不收起浮层——其余列还要接着挑，两列都挑完才凑得成一个值（只挑了时，回显仍是空的）。
      触发按钮上按上下键也能展开，焦点直接交给时列的锚点那一格；Escape 收起并把焦点归还它，值不变；Tab 同样收起且不抢回焦点。
      右端的清空钮把值倒掉、各段退回占位符，按完焦点回到首段——它不占 Tab 位也不报给读屏，键盘用户在段上按退格是同一个能力。
      上面这个 <code>step=15</code>，分列因此只剩 00 / 15 / 30 / 45 四格；时列 24 格装不下，方向键走到列尾它自己滚起来（滚的是那一列，不是整个面板）。
      列里的格归脚本按同一份规则生成，元素只打属性、不建节点。
    </p>
    <div class="row">
      <xh-time-picker id="wc-time-picker" step="15" name="start">
        <!-- label 必须是原生 label：段不是能被 for 指向的控件，点标题聚焦首段由元素接管，
             写成 label 是为了让它在表单里保持惯常的语义。两颗按钮必须是 button -->
        <div data-xh-part="root">
          <label data-xh-part="label">会议开始</label>
          <div data-xh-part="control">
            <!-- 段留空：显示什么由元素按当前值填（空段是占位串）。segment 声明它是哪一段（缺省按文档序），
                 分隔符是普通节点，不在角色表里 -->
            <span data-xh-part="input" segment="hour"></span>
            <span>:</span>
            <span data-xh-part="input" segment="minute"></span>
            <button data-xh-part="trigger">▾</button>
            <button data-xh-part="clear-trigger">✕</button>
          </div>
          <div data-xh-part="positioner">
            <!-- 每列一个 listbox，格由脚本填；格上的文字同样归元素写 -->
            <div data-xh-part="content">
              <div data-xh-part="column" unit="hour" id="wc-time-picker-hours"></div>
              <div data-xh-part="column" unit="minute" id="wc-time-picker-minutes"></div>
            </div>
          </div>
          <!-- 表单出口：随表单提交的是完整 ISO 串 -->
          <input data-xh-part="hidden-input">
        </div>
      </xh-time-picker>
      <span class="lead" id="wc-time-picker-value">当前值：（空）</span>
    </div>
    <p class="lead" style="margin-block-start: 20px;">
      下面这个是 12 小时制：时列写的是显示值 01-12，落到哪个真实小时上由上下午段说了算——
      在那一段上按 a / p 直接指定（认的是键不是那两个字，所以显示成“上午 / 下午”也照样管用），
      翻一次面段上的数字一动不动，隐藏输入里的整串却从 09:30 变成了 21:30。
      浮层里没有上下午这一列，它只在输入行里改。分列这次是逐分钟的 60 格，正好看看列自己的滚动。
    </p>
    <div class="row">
      <xh-time-picker id="wc-time-picker-12" hour-cycle="12" locale="zh-CN">
        <div data-xh-part="root">
          <label data-xh-part="label">提醒时间</label>
          <div data-xh-part="control">
            <span data-xh-part="input" segment="hour"></span>
            <span>:</span>
            <span data-xh-part="input" segment="minute"></span>
            <span data-xh-part="input" segment="dayPeriod"></span>
            <button data-xh-part="trigger">▾</button>
            <button data-xh-part="clear-trigger">✕</button>
          </div>
          <div data-xh-part="positioner">
            <div data-xh-part="content">
              <div data-xh-part="column" unit="hour" id="wc-time-picker-12-hours"></div>
              <div data-xh-part="column" unit="minute" id="wc-time-picker-12-minutes"></div>
            </div>
          </div>
        </div>
      </xh-time-picker>
      <span class="lead" id="wc-time-picker-12-value">当前值：（空）</span>
    </div>
  </section>

  <section>
    <h2>TreeSelect</h2>
    <p class="lead">
      收起时整个控件只占一个 Tab 位（就是那个触发按钮）：Enter、空格与上下键都展开，
      展开那一刻焦点真的进树、落在已选中的那行上（没选过就落首个可停留行），Tab 停靠点随之移进树里。
      上下键走的是可见行——docs 默认展开，它底下那几行才在序列里；收起的子树一行不算。
      右键在收起的分支上就地展开、已展开则进首个子节点；左键反过来：展开的分支就地收起，
      收起的分支与叶子跳回父层，根层的行什么也不做。Home / End 落首末可见行，连打字母只在可见行里检索。
      Enter 选中并收起浮层、焦点归还触发按钮；Escape 也收起，但选中值与展开集合一个都不变。
      draft.md 是禁用叶子：方向键与检索跳过它，它仍点得中、仍能当方向键的起点，只是确认键不认它。
      点分支那一行只改选中值、不切展开（单选选完浮层就收起了，顺手切一下你根本看不见），
      展开归行首那个箭头与左右方向键；每深一层的缩进由子层容器自己顶着，本页一行样式都没写。
    </p>
    <xh-tree-select id="wc-tree-select" name="doc" placeholder="选一个文件">
      <!-- 层级三件套、禁用与显示文本全查树数据（数组表达不了属性，只能按 property 交），
           标记与它必须同源：标记里有、树数据里没有的节点报不出层级，也进不了导航。
           节点身份写在自己的 value 属性上，行内的文本、箭头与子层容器向上找最近的 item / branch -->
      <div data-xh-part="root" style="max-inline-size: 320px;">
        <span data-xh-part="label">文档</span>
        <!-- 必须是原生 button：div 不可聚焦，「收起后焦点归还触发按钮」就永远等不到 -->
        <button data-xh-part="trigger">
          <!-- 留空即由元素填当前值的文本（名字住在树数据里，作者写不出来）；写了内容就归作者 -->
          <span data-xh-part="value-text"></span>
          <span data-xh-part="indicator">▾</span>
        </button>
        <button data-xh-part="clear-trigger">✕</button>
        <div data-xh-part="positioner">
          <div data-xh-part="content">
            <div data-xh-part="tree">
              <div data-xh-part="branch" value="docs">
                <div data-xh-part="branch-control">
                  <!-- 箭头写成 span 不是 button：它 aria-hidden 且不占 Tab 位，焦点该落在分支上 -->
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
                  <!-- 禁用不写在标记上：元素照树数据给这一行打 aria-disabled，
                       绝不打原生 disabled——那样它就不可聚焦，也当不成方向键的起点 -->
                  <div data-xh-part="item" value="draft">
                    <span data-xh-part="item-indicator">✓</span>
                    <span data-xh-part="item-text">draft.md（禁用）</span>
                  </div>
                  <div data-xh-part="branch" value="i18n">
                    <div data-xh-part="branch-control">
                      <span data-xh-part="branch-trigger">▸</span>
                      <span data-xh-part="branch-text">i18n</span>
                    </div>
                    <div data-xh-part="branch-content">
                      <div data-xh-part="item" value="zh">
                        <span data-xh-part="item-indicator">✓</span>
                        <span data-xh-part="item-text">zh-CN.md</span>
                      </div>
                      <div data-xh-part="item" value="en">
                        <span data-xh-part="item-indicator">✓</span>
                        <span data-xh-part="item-text">en-US.md</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div data-xh-part="branch" value="assets">
                <div data-xh-part="branch-control">
                  <span data-xh-part="branch-trigger">▸</span>
                  <span data-xh-part="branch-text">assets</span>
                </div>
                <div data-xh-part="branch-content">
                  <div data-xh-part="item" value="logo">
                    <span data-xh-part="item-indicator">✓</span>
                    <span data-xh-part="item-text">logo.svg</span>
                  </div>
                  <div data-xh-part="item" value="cover">
                    <span data-xh-part="item-indicator">✓</span>
                    <span data-xh-part="item-text">cover.png</span>
                  </div>
                </div>
              </div>
              <div data-xh-part="item" value="readme">
                <span data-xh-part="item-indicator">✓</span>
                <span data-xh-part="item-text">README.md</span>
              </div>
            </div>
          </div>
        </div>
        <!-- 表单出口：写了这个节点才随表单提交，元素自己把它置成 type=hidden -->
        <input data-xh-part="hidden-input">
      </div>
    </xh-tree-select>
    <span class="lead" id="wc-tree-select-state"></span>
  </section>

  <section>
    <h2>Splitter</h2>
    <p class="lead">
      两栏并排，拖分隔条改的是百分比而不是绝对宽度——面板在排布轴上的尺寸由元素每帧写成 flex-basis，
      总和恒为 100，容器变宽变窄比例不动。每条分隔条各占一个 Tab 位（不是一组只留一个），
      焦点落上去后方向键按 step 推一格，Shift + 方向键按 large-step 一次走 10%；
      水平排布只认左右两键，上下键原样放行给页面滚动，按下去滚的是页面。
      Home 把侧栏收到 20%、End 撑到 60%，那是它眼下真走得到的两端，越不过去也不回绕。
      拖动途中 size-change 连着发，松开手才发一次 size-change-end——键盘推动只发前者，
      下面两行回显的正是这两件不一样的事（“上次收尾”要拖过才会变）。
      勾上禁用后拖不动也推不动，分隔条整个退出 Tab 序列；方向键此刻不被拦下，该滚页面还是滚页面。
    </p>
    <!-- root / panel / resize-trigger 全由作者写：面板与分隔条都要用 index 属性写明自己是第几个。
         分隔条落成 div——元素给它 role="separator" 与 tabindex，原生 disabled 在它身上不生效，
         禁用只表达成 aria-disabled 与 data-disabled。逐块约束走 panels 那份 JSON。
         root 的高度是本页给的：分栏不给容器一个确定的跨轴尺寸就没什么可看的 -->
    <xh-splitter id="wc-splitter-row" default-size="35,65" panels='[{"id":"side","min":20,"max":60},{"id":"main","min":25}]'>
      <div data-xh-part="root" style="block-size: 140px;">
        <div data-xh-part="panel" index="0">
          <p class="lead">
            侧栏：写着 min 20% / max 60%，一路往左拖到底也留得住 20%，往右撑到 60% 就再也推不动了。
          </p>
        </div>
        <div data-xh-part="resize-trigger" index="0"></div>
        <div data-xh-part="panel" index="1">
          <p class="lead">
            正文：写着 min 25%，侧栏再怎么撑也吃不掉它这一份；面板自己 overflow 收着，长文本顶不开算好的比例。
          </p>
        </div>
      </div>
    </xh-splitter>
    <label class="row">
      <input type="checkbox" id="wc-splitter-row-disabled"> 禁用（disabled）
    </label>
    <div class="row">
      <span class="lead" id="wc-splitter-row-size"></span>
      <span class="lead" id="wc-splitter-row-end">上次收尾：（还没拖过）</span>
    </div>
    <p class="lead" style="margin-block-start: 20px;">
      竖排三栏，方向键跟着换轴：这里只认上下两键，左右两键放行。
      每条分隔条调的都是它前面那一块，aria-controls 指的也是前一块——所以中间那栏归第 1 条（它下面那条）管。
      停在第 1 条上按 Enter 折叠中间那栏，腾出来的地方先给底栏；再按一次展开，回到折叠前的尺寸而不是某个默认值。
      同一颗 Enter 落在上面那条分隔条上什么也不做：它管的是顶栏，顶栏没写 collapsible，这一键就留给页面。
      从 30/40/30 出发在第 1 条上按 End，中间那栏停在 60% 而不是纸面上的 100%——底栏至少要留 10%，
      分隔条报的 aria-valuemax 恒是眼下真走得到的那个数。
    </p>
    <xh-splitter id="wc-splitter-col" orientation="vertical" default-size="30,40,30" panels='[{"id":"head","min":10},{"id":"body","min":15,"collapsible":true},{"id":"foot","min":10}]'>
      <div data-xh-part="root" style="block-size: 220px;">
        <div data-xh-part="panel" index="0">
          <p class="lead">顶栏：min 10%，不可折叠。</p>
        </div>
        <div data-xh-part="resize-trigger" index="0"></div>
        <div data-xh-part="panel" index="1">
          <p class="lead">中间这栏写着 collapsible：折叠后带上 data-collapsed，连边框都不留。</p>
        </div>
        <div data-xh-part="resize-trigger" index="1"></div>
        <div data-xh-part="panel" index="2">
          <p class="lead">底栏：min 10%，中间那栏能撑到多大由它这条地板说了算。</p>
        </div>
      </div>
    </xh-splitter>
    <span class="lead" id="wc-splitter-col-size"></span>
  </section>

  <section>
    <h2>ScrollArea</h2>
    <p class="lead">
      三十行文字塞进一个 180px 高的框：右边那条滚动条是自绘的，原生那条只是被藏了外观，滚动能力一点没动。
      滚轮、触控板、以及 PageUp / PageDown、方向键、Home / End、空格走的全是浏览器原生通路——
      元素一个按键都不监听，也一个 preventDefault 都不写。
      视口自己占一个 Tab 位：滚动区里可能一个可聚焦元素都没有，不给 Tab 位键盘用户根本落不进来，
      Tab 停上去再按 PageDown 就试得出来。滑块按住能拖，手拖出滚动条甚至拖出窗口都还跟着走；
      点轨道空白处滑块中心跳到落点，而按在滑块上的那一下不会跳（它本来就在指针底下）。
      这一台是 <code>type="hover"</code>：指针进入才露出，离开后要等满 scroll-hide-delay（这里放宽到 800ms）
      才收起——擦一下边就闪没了很难看，所以离开的那一刻它还露着；光滚动不算数，指针不进来它一直收着。
      下面那行回显挂的是视口自己的原生 scroll 事件。
    </p>
    <!-- root / viewport / content / scrollbar / thumb / corner 全由作者写：
         每条滚动条用 orientation 属性写明自己管哪条轴（不写即 vertical），滑块住在自己那条滚动条里，
         元素按子树把它归到对应的轴上。这三十行由脚本填进 content，省得在这儿摊三十行标签。
         root 的高度与宽度是本页给的：滚动区不给一个确定的框，内容就永远不溢出 -->
    <xh-scroll-area id="wc-scroll-area" type="hover" scroll-hide-delay="800" orientation="vertical">
      <div data-xh-part="root" style="block-size: 180px; max-inline-size: 420px;">
        <div data-xh-part="viewport">
          <div data-xh-part="content" id="wc-scroll-area-lines"></div>
        </div>
        <div data-xh-part="scrollbar" orientation="vertical">
          <div data-xh-part="thumb"></div>
        </div>
      </div>
    </xh-scroll-area>
    <span class="lead" id="wc-scroll-area-progress">已滚过 0%</span>
    <p class="lead" style="margin-block-start: 20px;">
      这一台两条轴都溢出，且 <code>type="always"</code> 让滚动条恒露着——内容不溢出时也留着槽位，
      布局不会因为内容长短而抖一下。右下角那块补丁只在两条滚动条同时在场时才有它的位置：
      把 orientation 改成 vertical，横轴那条与补丁会一并带上 hidden 让位，视口那一向也随即不滚了。
      横轴的滑块用的全是逻辑属性（inset-inline-start / inline-size），root 上标一个 dir="rtl" 整条就反过来，
      本页一个定位声明都没写。内容那层的宽度倒是本页给的：横向不给内容一个比视口宽的尺寸，
      就永远量不出溢出，横条也永远不显形。
    </p>
    <xh-scroll-area id="wc-scroll-area-both" type="always">
      <div data-xh-part="root" style="block-size: 120px; max-inline-size: 420px;">
        <div data-xh-part="viewport">
          <div data-xh-part="content" style="inline-size: 760px;">
            <p class="lead">这一层被本页写死成 760px 宽，比视口宽出去的那截就是横向要滚的量。</p>
            <p class="lead">竖向也溢出：五段文字加起来比 120px 高的框长，两条滚动条因此同时在场。</p>
            <p class="lead">按住横轴的滑块左右拖，视口的 scrollLeft 跟着走；松手后再动指针就不跟了。</p>
            <p class="lead">点横轨空白处，滑块中心跳到落点；两条轨道各认各的轴，手按在哪条上只有那条变深。</p>
            <p class="lead">右下角那块补丁盖住的正是两条轨道交叉的那个缺口，少了它会露出底下的内容。</p>
          </div>
        </div>
        <div data-xh-part="scrollbar" orientation="vertical">
          <div data-xh-part="thumb"></div>
        </div>
        <div data-xh-part="scrollbar" orientation="horizontal">
          <div data-xh-part="thumb"></div>
        </div>
        <div data-xh-part="corner"></div>
      </div>
    </xh-scroll-area>
    <span class="lead" id="wc-scroll-area-both-progress">横向已滚过 0% · 纵向 0%</span>
  </section>

  <section>
    <h2>Carousel</h2>
    <p class="lead">
      键盘落在两端按钮或指示点上就能翻页：横轨认左右键（上下键不归它管，原样放行给页面滚动），
      Home / End 直接跳首末页。指示点一页一个，各自留在 Tab 序列里，点一下即跳到那一页。
      这一条开着自动播放：鼠标停上去、或焦点走进来都会把计时按住，两个来源各记一笔——
      鼠标移开时若焦点还留在里面，画面仍不会自己翻，两笔都撤了才继续走（根节点上的 data-paused 同步亮灭）。
      手动翻一页会重新计满一整个间隔，不会刚点完就被上一轮的余数接着翻走。
      它开了回绕，末页的下一张回到首页。视口不给高度就没有可裁的窗口，什么也看不见，高度是本页给的。
    </p>
    <xh-carousel id="wc-carousel" slide-count="3" autoplay="2500" loop>
      <!-- 角色节点全归作者写，元素只往上打属性：两端按钮与指示点必须是原生 button，
           它们要能聚焦、要能被 Enter / 空格激活；到头时转的也是原生 disabled -->
      <div data-xh-part="root">
        <button data-xh-part="prev-trigger">‹</button>
        <!-- 皮肤只给视口 overflow: hidden，尺寸归本页：不给高度轨道就没有高度可裁 -->
        <div data-xh-part="viewport" style="block-size: 140px;">
          <div data-xh-part="item-group">
            <!-- 下标写在自己的 index 属性上；漏写则按文档序，把节点排好本身就是声明 -->
            <div data-xh-part="item" index="0">
              <!-- 幻灯片里装什么归作者，皮肤一概不碰；这一层只把字撑到整张中间 -->
              <div style="display: grid; place-items: center; block-size: 100%;">雪山</div>
            </div>
            <div data-xh-part="item" index="1">
              <div style="display: grid; place-items: center; block-size: 100%;">海岸</div>
            </div>
            <div data-xh-part="item" index="2">
              <div style="display: grid; place-items: center; block-size: 100%;">沙漠</div>
            </div>
          </div>
        </div>
        <button data-xh-part="next-trigger">›</button>
        <!-- 一页一个指示点：页数由 slide-count 与 slides-per-page 算出，作者照着渲染 -->
        <div data-xh-part="indicator-group">
          <button data-xh-part="indicator" index="0"></button>
          <button data-xh-part="indicator" index="1"></button>
          <button data-xh-part="indicator" index="2"></button>
        </div>
        <!-- root 自己就是会换行的横排 flex，回显想独占一行只能自己占满（纯本页版式） -->
        <span class="lead" id="wc-carousel-page" style="flex-basis: 100%;"></span>
      </div>
    </xh-carousel>
    <p class="lead" style="margin-block-start: 20px;">
      一屏两张、六张共三页：一次翻几张缺省跟随一屏几张，所以仍是整屏翻。
      这一条不回绕，首页的上一张与末页的下一张转成原生 disabled，Tab 都停不上去。
      张与张的间距走 spacing，它落成每张自己的内边距而不是轨道的 gap——
      用 gap 的话「一张 = 100%/2」这条位移前提就不成立，越翻越偏。
    </p>
    <xh-carousel id="wc-carousel-wide" slide-count="6" slides-per-page="2" spacing="12px">
      <div data-xh-part="root">
        <button data-xh-part="prev-trigger">‹</button>
        <div data-xh-part="viewport" style="block-size: 120px;">
          <div data-xh-part="item-group">
            <div data-xh-part="item" index="0">
              <div style="display: grid; place-items: center; block-size: 100%;">一月</div>
            </div>
            <div data-xh-part="item" index="1">
              <div style="display: grid; place-items: center; block-size: 100%;">二月</div>
            </div>
            <div data-xh-part="item" index="2">
              <div style="display: grid; place-items: center; block-size: 100%;">三月</div>
            </div>
            <div data-xh-part="item" index="3">
              <div style="display: grid; place-items: center; block-size: 100%;">四月</div>
            </div>
            <div data-xh-part="item" index="4">
              <div style="display: grid; place-items: center; block-size: 100%;">五月</div>
            </div>
            <div data-xh-part="item" index="5">
              <div style="display: grid; place-items: center; block-size: 100%;">六月</div>
            </div>
          </div>
        </div>
        <button data-xh-part="next-trigger">›</button>
        <div data-xh-part="indicator-group">
          <button data-xh-part="indicator" index="0"></button>
          <button data-xh-part="indicator" index="1"></button>
          <button data-xh-part="indicator" index="2"></button>
        </div>
        <span class="lead" id="wc-carousel-wide-page" style="flex-basis: 100%;"></span>
      </div>
    </xh-carousel>
  </section>

  <section>
    <h2>Anchor</h2>
    <p class="lead">
      这一段是活的：往下滚页面，左边目录里高亮的那条会自己跟着换。
      判定线贴着视口顶边（offset 默认 0，页面有吸顶栏就把栏高填进去），越过它的最后一节即当前节，
      那条链接拿到 aria-current="location"——location 说的是「本页面里的这个位置」，page 说的是「这就是当前页面」，用在这儿不对。
      四节都还在判定线下方时谁都不亮、指示条也整条收起：此时硬把首条点亮就是让「当前位置」说谎。
      反过来，把整页拉到最底会强制点亮末条——末几节都很短时谁也越不过判定线，不特判它就永远亮不了。
      这一条开了 smooth：点链接不走原生片段跳转，而是拦下来自己平滑滚过去，且高亮当场就切到点中的那条，
      途中扫过的那几节不抢（滚到目标之前观察器说的都不算数）。
      目录本身是 nav 地标加一个 ul，指示条的位置由元素量好、写成它自己的内联样式。
    </p>
    <!-- 纯本页版式：左目录右正文分两栏，目录吸在视口上，不然滚到正文里就看不见高亮在动了。
         吸顶写在宿主元素上（它才是那一栏），写在里面的 nav 上是吸不住的 -->
    <div style="display: grid; grid-template-columns: 180px 1fr; gap: 20px; align-items: start;">
      <xh-anchor id="wc-anchor" smooth style="position: sticky; inset-block-start: 12px;">
        <!-- 标签必须写对：root 是 nav（地标语义只有标签给得了），list 是 ul，item 与指示条都是 li，
             link 是 a——Enter 跟随链接一行代码都没写，全靠平台。href 反过来由元素按 value 派生 -->
        <nav data-xh-part="root">
          <ul data-xh-part="list">
            <li data-xh-part="item">
              <a data-xh-part="link" value="wc-anchor-brief">这是什么</a>
            </li>
            <li data-xh-part="item">
              <a data-xh-part="link" value="wc-anchor-keyboard">键盘怎么走</a>
            </li>
            <li data-xh-part="item">
              <a data-xh-part="link" value="wc-anchor-edge">边界在哪</a>
            </li>
            <li data-xh-part="item">
              <a data-xh-part="link" value="wc-anchor-tokens">主题与令牌</a>
            </li>
            <li data-xh-part="indicator"></li>
          </ul>
        </nav>
      </xh-anchor>
      <div>
        <!-- 目标区块是页面内容、不是元素的部件；元素按链接的 value 现查 id -->
        <div id="wc-anchor-brief" style="block-size: 200px;">
          <strong>这是什么</strong>
          <p class="lead">滚动页面，看左边这一条什么时候亮起来、什么时候交给下一条。</p>
        </div>
        <div id="wc-anchor-keyboard" style="block-size: 200px;">
          <strong>键盘怎么走</strong>
          <p class="lead">滚动页面，看左边这一条什么时候亮起来、什么时候交给下一条。</p>
        </div>
        <div id="wc-anchor-edge" style="block-size: 200px;">
          <strong>边界在哪</strong>
          <p class="lead">滚动页面，看左边这一条什么时候亮起来、什么时候交给下一条。</p>
        </div>
        <div id="wc-anchor-tokens" style="block-size: 200px;">
          <strong>主题与令牌</strong>
          <p class="lead">滚动页面，看左边这一条什么时候亮起来、什么时候交给下一条。</p>
        </div>
      </div>
    </div>
    <span class="lead" id="wc-anchor-value"></span>
  </section>

  <section>
    <h2>NavigationMenu</h2>
    <p class="lead">
      鼠标停在某个入口上、或用 Tab 把焦点送上去，都要等一小会儿面板才展开（这一条把延时调到 400ms，
      肉眼看得出那段等待）——防的是指针横穿导航栏时一路闪出三个面板。
      等待期间划到隔壁入口不重新计时：横穿本来就是一次连续的动作，每换一个就把秒表归零的话，慢慢划过去一个也等不出来。
      已经有面板开着时再碰别的入口是当场换项、不再等——人已经在这套导航里了。
      Enter 与空格立即展开，不走延时；自动弹出来的那一项被点中时不会当场关掉，再按一次才收起。
      Escape 收起并把焦点还给对应入口，且刚还回去的这一下不会把面板重新弹出来；
      收起之后的一小段静默窗口内，再碰任意入口都是直接展开。
      指针移出整块导航或焦点走出去，面板一并收起；但鼠标扫出去时若焦点还留在里面就不收——键盘用户正读的东西不该被鼠标带走。
      面板里的条目是链接不是命令，这正是它与 Menu 的分野：点了就跳走，元素不拦，只顺手把面板收起；
      指向当前页的那条写了 current，拿到 aria-current="page"。
      每个面板都紧跟在自己的入口之后，展开时按 Tab 就走得进去，收起的那些带 hidden、整个被跳过。
    </p>
    <xh-navigation-menu id="wc-nav-menu" delay-duration="400">
      <!-- 标签必须写对：root 是 nav（地标语义只有标签给得了），list 是 ul，
           item 与指示条都是 li，入口是 button，面板里的条目是 a。
           入口与面板各自带 value 属性配对，元素据此把 aria-controls / aria-labelledby 互指 -->
      <nav data-xh-part="root">
        <ul data-xh-part="list">
          <li data-xh-part="item">
            <button data-xh-part="trigger" value="products">产品</button>
            <div data-xh-part="content" value="products">
              <a data-xh-part="link" href="#nav-products-runtime">运行时内核</a>
              <a data-xh-part="link" href="#nav-products-vue">Vue 适配器</a>
              <a data-xh-part="link" href="#nav-products-wc">Web Components 适配器</a>
            </div>
          </li>
          <li data-xh-part="item">
            <button data-xh-part="trigger" value="docs">文档</button>
            <div data-xh-part="content" value="docs">
              <!-- 指向当前页面的那一条：写 current 即得 aria-current="page" -->
              <a data-xh-part="link" href="#nav-docs-guide" current>上手指南</a>
              <a data-xh-part="link" href="#nav-docs-anatomy">部件解剖</a>
              <a data-xh-part="link" href="#nav-docs-keyboard">键盘规格</a>
            </div>
          </li>
          <li data-xh-part="item">
            <button data-xh-part="trigger" value="company">关于</button>
            <div data-xh-part="content" value="company">
              <a data-xh-part="link" href="#nav-company-team">团队</a>
              <a data-xh-part="link" href="#nav-company-contact">联系我们</a>
            </div>
          </li>
          <li data-xh-part="indicator"></li>
        </ul>
      </nav>
    </xh-navigation-menu>
    <span class="lead" id="wc-nav-menu-value"></span>
  </section>

  <section>
    <h2>Thread</h2>
    <p class="lead">
      点「追加一条消息」看粘底：内容变高的那一刻滚动位置被同步补到底，所以不会先闪一帧旧位置再跳。
      粘附是意图不是几何——滚轮往上拨一下，或按 ArrowUp / PageUp / Home，当场撒手；
      此后再追加多少条都停在原处不跟，右下角那颗「回到底部」随即露出来（在底时它带 hidden，Tab 都停不上去）。
      手滚回底部阈值内（默认 64px，留的是一行多的余量，免得最后一行没露全就被判成不在底）自动重新粘上，
      不必去点那颗按钮。拖滚动条滑块往上不算脱锚：那条路上浏览器既不派 wheel 也不派 keydown，方向判不出来，
      这是眼下的边界。
      视口自己占一个 Tab 位，且恒 <code>aria-live="off"</code>——role="log" 隐含 polite，不显式关掉的话
      逐段长出来的文字会被读屏一路念下去。播报只发生在下面那个视觉隐藏的 live-region 里，
      一轮结束时把整段最终文本一次性写进去。
      root 的高度是本页给的：不给一个确定的框，内容永远不溢出，粘底也就无从谈起。
      这里不接后端，消息由脚本往 content 里插。
    </p>
    <!-- root / viewport / content / scroll-button / live-region 全由作者写，元素只往上打属性。
         「回到底部」必须是原生 button：它要能聚焦、要能被 Enter / 空格激活。
         插进 content 的消息是普通段落、不是角色节点，不会引发重新接线；
         但内容变高会被粘底那边的尺寸观察接住，滚动位置随即补回底部 -->
    <xh-thread id="wc-thread" status="idle">
      <div data-xh-part="root" style="block-size: 260px;">
        <div data-xh-part="viewport">
          <div data-xh-part="content" id="wc-thread-messages"></div>
        </div>
        <button data-xh-part="scroll-button">↓ 回到底部</button>
        <div data-xh-part="live-region" id="wc-thread-live"></div>
      </div>
    </xh-thread>
    <div class="row" style="margin-block-start: 12px;">
      <xh-button variant="subtle"><button data-xh-part="root" id="wc-thread-append">追加一条消息</button></xh-button>
      <span class="lead" id="wc-thread-stick"></span>
    </div>
  </section>

  <section>
    <h2>Composer</h2>
    <p class="lead">
      勾上「流式中」，发送按钮原位变「停止」：同一个节点、同一个位置，只换 data-mode 与 aria-label。
      拆成两个按钮就意味着一个卸载、另一个挂载，刚点完发送、手指还停在原处的人会扑空。
      运行态的真源在宿主，元素既不猜也不改——这里发一次就自动勾上，按停止再解开。
      Enter 直接提交、Shift+Enter 换行；IME 组合态里的那颗 Enter 一律放行，拼音选词的回车不是发送的回车。
      输入为空或只有空白时发送按钮转成原生 disabled，但位置留着不收起，敲进第一个非空白字符就亮。
      清空发生在 submit 派发之后，所以下面回显里拿到的是提交那一刻的原文。
      按钮上那两个字归作者换：元素只切 data-mode 与 aria-label，两处得一起改，
      否则读屏念的是「停止」、眼睛看到的还是「发送」。
    </p>
    <!-- input 角色节点必须是原生 textarea：值经 property 写、禁用走原生 disabled，
         换成 div contenteditable 这两条都落空。换行、光标位置与撤销栈也全靠它自己 -->
    <xh-composer id="wc-composer">
      <div data-xh-part="root">
        <textarea data-xh-part="input" rows="1" placeholder="说点什么…"></textarea>
        <button data-xh-part="submit-trigger" id="wc-composer-submit">发送</button>
      </div>
    </xh-composer>
    <div class="row" style="margin-block-start: 12px;">
      <label class="row">
        <input type="checkbox" id="wc-composer-streaming"> 流式中（run-status="streaming"）
      </label>
      <label class="row">
        <input type="checkbox" id="wc-composer-disabled"> 禁用（disabled）
      </label>
      <span class="lead" id="wc-composer-log">（还没发过）</span>
    </div>
    <p class="lead" style="margin-block-start: 20px;">
      这一台写了 <code>submit-on-enter="false"</code>：Enter 老老实实换行，只剩按钮一条发送的路。
      长表单里回车键的默认预期本来就是换行不是提交，这类场景把它关掉比教用户改习惯划算。
      缺省为真的开关也只能这么关：布尔属性「写了即真、不写即假」那套在这儿反着，
      所以它走三态转换器——不写=用缺省、写 false=关、其余=开。
    </p>
    <xh-composer submit-on-enter="false">
      <div data-xh-part="root">
        <textarea data-xh-part="input" rows="2" placeholder="Enter 在这里只换行"></textarea>
        <button data-xh-part="submit-trigger">发送</button>
      </div>
    </xh-composer>
  </section>

  <section>
    <h2>CodeBlock</h2>
    <p class="lead">
      没有状态机：语言、行数、闭合与否全由属性逐帧递进来算一遍，连接函数不留缓存也不带副作用。
      <code>&lt;pre&gt;</code> 自己占一个 Tab 位，横向溢出的长行靠浏览器原生滚动，元素一个按键都不监听。
      最小高度按行数写进内联样式（calc 引的是行高令牌，行高本身仍归皮肤管）：流式吐字时代码一行行长出来，
      不预撑的话下方内容会被一行行顶着往下跑。
      语言角标带 aria-hidden，是纯装饰——语言名在 data-lang 上也有一份，读屏再念一遍只是噪音；
      它还写了 user-select: none，框选代码去复制时不会把「typescript」这行一起框走。
      这里没有复制按钮：复制是一段带「已复制」反馈的状态机，要它就把上面的 Clipboard 组合进来，别在这儿再造一套。
    </p>
    <!-- 元素不改角色节点的子节点：语言角标那几个字与代码原文都由作者写。
         Vue 那侧是组件自己渲染这两段文本，差的只是适配器的分工，行为一模一样。
         代码原文由脚本填：摊在这段模板里的话，pre 会把这份 HTML 自身的缩进也当成代码的缩进渲染出来 -->
    <xh-code-block id="wc-code-block" lang="typescript" complete>
      <div data-xh-part="root">
        <span data-xh-part="lang-label">typescript</span>
        <pre data-xh-part="pre"><code data-xh-part="code"></code></pre>
      </div>
    </xh-code-block>
    <p class="lead" style="margin-block-start: 20px;">
      这一台是吐到一半的样子：最后一行断在半个表达式上，围栏也还没闭合，所以写的是 <code>complete="false"</code>，
      root 与 pre 上都不挂 data-complete（皮肤没给未闭合态另画样子，去 DevTools 里看这个属性的有无）。
      语言标注同样没吐出来：空白、半截、不认识的一律落到 plaintext，下游拿到的永远是个非空串，不必各自再兜一遍空值。
    </p>
    <xh-code-block id="wc-code-block-partial" complete="false">
      <div data-xh-part="root">
        <span data-xh-part="lang-label">plaintext</span>
        <pre data-xh-part="pre"><code data-xh-part="code"></code></pre>
      </div>
    </xh-code-block>
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

// 日历的网格归作者渲染：元素只交 weeks / weekDays / headingLabel 三份数据，一个节点都不生成。
// 三张都开着 fixed-weeks，网格恒是六行四十二格——骨架一次建好，翻月只改每格的 value 与文字。
// 不走 innerHTML 重建：那会把指针底下那一格抽走，点邻月的日子就只翻得了月、落不下值了
interface WcCalendarHost extends HTMLElement {
  readonly weeks: { value: string, day: number }[][]
  readonly weekDays: { value: number, label: string }[]
  readonly headingLabel: string
  isDateUnavailable?: (value: string) => boolean
}

// 直接取本地年月日拼串，不走 toISOString——那个会先折算成 UTC，东八区的傍晚会差出一天
function wcCalendarIsoFromToday(offsetDays: number): string {
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

// ISO 日期串按 UTC 零点解析，取 UTC 的星期几才不会被本地时区偏移带偏一天
function wcCalendarIsWeekend(value: string): boolean {
  const weekday = new Date(value).getUTCDay()
  return weekday === 0 || weekday === 6
}

function buildWcCalendarSkeleton(host: WcCalendarHost): void {
  // 列的身份是列序 0-6，写在自己的 value 上；可见文本是缩写，全称由元素补成 aria-label
  const headRow = host.querySelector<HTMLElement>('[data-xh-part="grid-head"] [data-xh-part="week-row"]')!
  headRow.innerHTML = host.weekDays
    .map(d => `<span data-xh-part="week-day" value="${d.value}">${d.label}</span>`)
    .join('')
  const cells = '<div data-xh-part="cell"><div data-xh-part="cell-trigger"></div></div>'.repeat(7)
  host.querySelector<HTMLElement>('[data-xh-part="grid-body"]')!.innerHTML
    = `<div data-xh-part="week-row">${cells}</div>`.repeat(6)
}

function paintWcCalendar(host: WcCalendarHost): void {
  host.querySelector<HTMLElement>('[data-xh-part="heading"]')!.textContent = host.headingLabel
  const cells = Array.from(host.querySelectorAll<HTMLElement>('[data-xh-part="grid-body"] [data-xh-part="cell"]'))
  host.weeks.flat().forEach((day, index) => {
    const cell = cells[index]
    if (!cell)
      return
    // 日期身份只写在 cell 上，格里的 cell-trigger 跟着它走；
    // 改 value 就等于换了一天，元素据此重新接线（选中、禁用、roving tabindex 一并重算）
    cell.setAttribute('value', day.value)
    const trigger = cell.querySelector<HTMLElement>('[data-xh-part="cell-trigger"]')
    if (trigger)
      trigger.textContent = String(day.day)
  })
}

const wcCalendarSingle = document.getElementById('wc-calendar-single')! as WcCalendarHost
const wcCalendarRange = document.getElementById('wc-calendar-range')! as WcCalendarHost
const wcCalendarWeekend = document.getElementById('wc-calendar-weekend')! as WcCalendarHost

// 可选窗口按今天算，只能在脚本里写；判定函数走不了属性，同样只能作为 property 交过去
const wcCalendarMin = wcCalendarIsoFromToday(-7)
const wcCalendarMax = wcCalendarIsoFromToday(7)
wcCalendarSingle.setAttribute('min', wcCalendarMin)
wcCalendarSingle.setAttribute('max', wcCalendarMax)
wcCalendarWeekend.isDateUnavailable = wcCalendarIsWeekend

for (const host of [wcCalendarSingle, wcCalendarRange, wcCalendarWeekend]) {
  buildWcCalendarSkeleton(host)
  paintWcCalendar(host)
  // 重画必须发生在收到这条事件的这一拍里：元素把焦点送回落点是推迟到本帧提交之后做的，
  // 晚一步那一格还没换成新月份的日子，焦点就掉回 body 了
  host.addEventListener('focused-value-change', () => paintWcCalendar(host))
}

const wcCalendarSingleOut = document.getElementById('wc-calendar-single-value')!
function paintWcCalendarSingleValue(values: readonly string[]): void {
  wcCalendarSingleOut.textContent = `选中：${values[0] ?? '（未选）'} · 可选窗口：${wcCalendarMin} ~ ${wcCalendarMax}`
}
paintWcCalendarSingleValue([])
wcCalendarSingle.addEventListener('value-change', (e) => {
  paintWcCalendarSingleValue((e as CustomEvent<{ value: string[] }>).detail.value)
})

// 区间挑到一半时集合里只有起点一个值，回显要如实把这个半成品显出来
const wcCalendarRangeOut = document.getElementById('wc-calendar-range-value')!
function paintWcCalendarRangeValue(values: readonly string[]): void {
  const [start, end] = values
  wcCalendarRangeOut.textContent = start ? `区间：${start} → ${end ?? '（待落终点）'}` : '区间：（未选）'
}
paintWcCalendarRangeValue([])
wcCalendarRange.addEventListener('value-change', (e) => {
  paintWcCalendarRangeValue((e as CustomEvent<{ value: string[] }>).detail.value)
})

// 选中与聚焦日分两条线回显：方向键走到周末那两格时聚焦日照样跟着动，选中却纹丝不动
const wcCalendarWeekendOut = document.getElementById('wc-calendar-weekend-value')!
let wcCalendarWeekendPicked = '（未选）'
let wcCalendarWeekendFocused = '（今天）'
function paintWcCalendarWeekendState(): void {
  wcCalendarWeekendOut.textContent = `选中：${wcCalendarWeekendPicked} · 聚焦日：${wcCalendarWeekendFocused}`
}
paintWcCalendarWeekendState()
wcCalendarWeekend.addEventListener('value-change', (e) => {
  wcCalendarWeekendPicked = (e as CustomEvent<{ value: string[] }>).detail.value[0] ?? '（未选）'
  paintWcCalendarWeekendState()
})
wcCalendarWeekend.addEventListener('focused-value-change', (e) => {
  wcCalendarWeekendFocused = (e as CustomEvent<{ focusedValue: string }>).detail.focusedValue
  paintWcCalendarWeekendState()
})

// 分段日期的回显：三段填齐才产出 ISO 串，没填齐时载荷里是 null
function wireWcDateField(hostId: string, outId: string): void {
  const out = document.getElementById(outId)!
  document.getElementById(hostId)!.addEventListener('value-change', (e) => {
    const { value } = (e as CustomEvent<{ value: string | null }>).detail
    out.textContent = `当前值：${value ?? '（未填齐）'}`
  })
}

wireWcDateField('wc-date-field-cn', 'wc-date-field-cn-value')
wireWcDateField('wc-date-field-us', 'wc-date-field-us-value')

// 分段时间的回显：缺段时载荷里是空串（不是 null），与日期那组的约定不同
function wireWcTimeField(hostId: string, outId: string, prefix: string): void {
  const out = document.getElementById(outId)!
  document.getElementById(hostId)!.addEventListener('value-change', (e) => {
    const { value } = (e as CustomEvent<{ value: string }>).detail
    out.textContent = `${prefix}${value === '' ? '（未填齐）' : value}`
  })
}

wireWcTimeField('wc-time-field-24', 'wc-time-field-24-value', '24 小时制 · 当前值：')
wireWcTimeField('wc-time-field-12', 'wc-time-field-12-value', '12 小时制 · 值仍是 24 小时的串：')
wireWcTimeField('wc-time-field-sec', 'wc-time-field-sec-value', 'granularity=second · 当前值：')

// 网格归作者渲染：元素只交 weeks / weekDays / headingLabel 三份只读数据，一个节点都不替作者建。
// 日期身份写在 cell 的 value 属性上（格子里的 trigger 跟着它所在的 cell 走），列头身份写在 week-day 的 value 上
interface WcCalendarDay {
  value: string
  day: number
}

type WcDatePickerHost = HTMLElement & {
  weeks: WcCalendarDay[][]
  weekDays: { value: number, label: string }[]
  headingLabel: string
  isDateUnavailable?: (value: string) => boolean
}

// 不可用日的判定归调用方，元素只按它给格子打 aria-disabled（那些天仍可聚焦，还得当方向键的起点）。
// 判定是函数，走不了 HTML 属性，只能按 property 交
function wcDateIsWeekend(value: string): boolean {
  const weekday = new Date(`${value}T00:00:00`).getDay()
  return weekday === 0 || weekday === 6
}

function wcDateRangeText(value: readonly string[]): string {
  const [start, end] = value
  if (!start)
    return '（未选）'
  return end ? `${start} → ${end}` : `${start} → 待定`
}

// 每台日期选择器当下画的是哪个月，用来判断要不要重建网格
const wcDatePickerMonths = new Map<string, string>()

function renderWcDatePicker(id: string): void {
  const host = document.getElementById(id)! as WcDatePickerHost
  const weeks = host.weeks
  if (weeks.length === 0)
    return
  const heading = host.querySelector<HTMLElement>('[data-xh-part="heading"]')
  if (heading)
    heading.textContent = host.headingLabel
  // 表头只跟 locale 走，建一次就够
  const head = document.getElementById(`${id}-week-days`)!
  if (head.childElementCount === 0) {
    head.innerHTML = host.weekDays
      .map(day => `<span data-xh-part="week-day" value="${day.value}">${day.label}</span>`)
      .join('')
  }
  // 换了月才重建：白换一批 DOM 会把焦点从格子上抖掉，元素也白接一次线。
  // 重建后的新节点由基类的变动观察器接住，下一帧照常接线
  const key = `${weeks[0]?.[0]?.value ?? ''}+${weeks.length}`
  if (wcDatePickerMonths.get(id) === key)
    return
  wcDatePickerMonths.set(id, key)
  const rows = weeks.map((week) => {
    const cells = week
      .map(day => `<div data-xh-part="cell" value="${day.value}"><div data-xh-part="cell-trigger">${day.day}</div></div>`)
      .join('')
    return `<div data-xh-part="week-row">${cells}</div>`
  })
  document.getElementById(`${id}-grid`)!.innerHTML = rows.join('')
}

// 两台日期选择器的接线一样，只有值怎么回显归各自决定
function wireWcDatePicker(id: string, paint: (value: readonly string[]) => void): void {
  renderWcDatePicker(id)
  paint([])
  // 聚焦日一变就照新的 weeks 重画：翻月按钮、方向键跨月、每次展开都会到这条
  document.getElementById(id)!.addEventListener('focused-value-change', () => {
    renderWcDatePicker(id)
  })
  document.getElementById(id)!.addEventListener('value-change', (e) => {
    paint((e as CustomEvent<{ value: string[] }>).detail.value)
  })
}

// 周末不可用只给上面这一个
const wcDatePickerSingle = document.getElementById('wc-date-picker')! as WcDatePickerHost
wcDatePickerSingle.isDateUnavailable = wcDateIsWeekend

wireWcDatePicker('wc-date-picker', (value) => {
  document.getElementById('wc-date-picker-value')!.textContent = `当前值：${value[0] ?? '（未选）'}`
})

wireWcDatePicker('wc-date-picker-range', (value) => {
  document.getElementById('wc-date-picker-range-value')!.textContent = `已选区间：${wcDateRangeText(value)}`
})

// 列里的格归作者渲染（元素只打属性、不建节点）：可选值由 step 与小时制决定，
// 这里照同一份规则生成，两个适配器看到的列因此逐格一致。格上留空，文字由元素填
function wcTimeOptionsHtml(from: number, count: number, step: number): string {
  const cells: string[] = []
  for (let i = 0; i < count; i += step)
    cells.push(`<div data-xh-part="option" value="${String(from + i).padStart(2, '0')}"></div>`)
  return cells.join('')
}

// 两台时间选择器的接线一样，差别全在时列从几起、分列多大步进
function wireWcTimePicker(id: string, firstHour: number, hourCount: number, minuteStep: number): void {
  document.getElementById(`${id}-hours`)!.innerHTML = wcTimeOptionsHtml(firstHour, hourCount, 1)
  document.getElementById(`${id}-minutes`)!.innerHTML = wcTimeOptionsHtml(0, 60, minuteStep)
  const out = document.getElementById(`${id}-value`)!
  document.getElementById(id)!.addEventListener('value-change', (e) => {
    const { value } = (e as CustomEvent<{ value: string }>).detail
    out.textContent = `当前值：${value === '' ? '（空）' : value}`
  })
}

// 24 小时制：时列 00-23；step=15 的分列只剩四格
wireWcTimePicker('wc-time-picker', 0, 24, 15)
// 12 小时制：时列写的是显示值 01-12，分列逐分钟排满 60 格，正好演列自己的滚动
wireWcTimePicker('wc-time-picker-12', 1, 12, 1)

// 树数据是层级元信息、显示文本与节点禁用的唯一事实源，
// 它只能按 property 交——数组表达不了属性。标记与它必须同源
interface WcTreeSelectNode {
  value: string
  label?: string
  disabled?: boolean
  children?: WcTreeSelectNode[]
}

const wcTreeSelect = document.getElementById('wc-tree-select')! as HTMLElement & {
  collection?: WcTreeSelectNode[]
  expandedValue?: string[]
}

// 连打检索按 label 首字母匹配，文件名因此都以拉丁字母开头
wcTreeSelect.collection = [
  {
    value: 'docs',
    label: 'docs',
    children: [
      { value: 'guide', label: 'guide.md' },
      { value: 'api', label: 'api.md' },
      // 禁用只声明在这里，标记里不必再抄一遍
      { value: 'draft', label: 'draft.md（禁用）', disabled: true },
      {
        value: 'i18n',
        label: 'i18n',
        children: [
          { value: 'zh', label: 'zh-CN.md' },
          { value: 'en', label: 'en-US.md' },
        ],
      },
    ],
  },
  {
    value: 'assets',
    label: 'assets',
    children: [
      { value: 'logo', label: 'logo.svg' },
      { value: 'cover', label: 'cover.png' },
    ],
  },
  { value: 'readme', label: 'README.md' },
]

// 展开集合走受控。元素连上那一刻就把机器建起来了，default-* 一类初值只在那一刻读一次，
// 而集合只能按 property 给、这几行又跑在 innerHTML 之后——追不上；受控值则是每次读都回头问 property，
// 所以下面那个监听必须把新集合写回来，不写回点开的分支会立刻弹回去。
// 选中值刻意留作非受控：元素自己记，本页只按事件回显
wcTreeSelect.expandedValue = ['docs']

const wcTreeSelectState = document.getElementById('wc-tree-select-state')!
let wcTreeSelectValue: readonly string[] = []

function paintWcTreeSelect(): void {
  const expanded = wcTreeSelect.expandedValue ?? []
  wcTreeSelectState.textContent = `已选：${wcTreeSelectValue.join('、') || '（无）'} · 展开：${expanded.join('、') || '（无）'}`
}

paintWcTreeSelect()

wcTreeSelect.addEventListener('value-change', (e) => {
  wcTreeSelectValue = (e as CustomEvent<{ value: string[] }>).detail.value
  paintWcTreeSelect()
})

wcTreeSelect.addEventListener('expanded-change', (e) => {
  wcTreeSelect.expandedValue = (e as CustomEvent<{ value: string[] }>).detail.value
  paintWcTreeSelect()
})

// 两组分栏都走非受控（写的是 default-size）：拖动与按键就地改布局，脚本只负责回显
function formatWcSplitterSize(size: readonly number[]): string {
  return size.map(n => `${n.toFixed(1)}%`).join(' / ')
}

function wireWcSplitterSize(hostId: string, outId: string): void {
  const host = document.getElementById(hostId)!
  const out = document.getElementById(outId)!
  const paint = (size: readonly number[]): void => {
    out.textContent = `当前比例：${formatWcSplitterSize(size)}`
  }
  // 属性形式的初值按逗号拆，与元素自己的转换器同一套
  paint((host.getAttribute('default-size') ?? '').split(',').map(Number))
  // 拖动途中这条会连着发很多次
  host.addEventListener('size-change', (e) => {
    paint((e as CustomEvent<{ size: number[] }>).detail.size)
  })
}

wireWcSplitterSize('wc-splitter-row', 'wc-splitter-row-size')
wireWcSplitterSize('wc-splitter-col', 'wc-splitter-col-size')

const wcSplitterRow = document.getElementById('wc-splitter-row')!
const wcSplitterRowEnd = document.getElementById('wc-splitter-row-end')!
// 收尾只在松手那一下来一次（键盘推动不走这条路），存布局那类活儿要的正是它
wcSplitterRow.addEventListener('size-change-end', (e) => {
  const { size, index } = (e as CustomEvent<{ size: number[], index: number }>).detail
  wcSplitterRowEnd.textContent = `上次收尾：第 ${index} 条 → ${formatWcSplitterSize(size)}`
})

document.getElementById('wc-splitter-row-disabled')!.addEventListener('change', (e) => {
  wcSplitterRow.toggleAttribute('disabled', (e.target as HTMLInputElement).checked)
})

// 三十行由脚本填：省得在模板里摊三十行标签。新节点由基类的变动观察器接住，尺寸随即被重新量一遍
const wcScrollAreaLines = document.getElementById('wc-scroll-area-lines')!
wcScrollAreaLines.innerHTML = Array.from(
  { length: 30 },
  (_, i) => `<p class="lead">第 ${i + 1} 行 · 视口只有 180px 高，这一行是被挤到框外的那一批之一</p>`,
).join('')

// 元素不对外报滚动：滚动是原生的，要听就直接在视口上监听
function wireWcScrollAreaProgress(
  hostId: string,
  outId: string,
  paint: (x: number, y: number) => string,
): void {
  const viewport = document.getElementById(hostId)!.querySelector<HTMLElement>('[data-xh-part="viewport"]')!
  const out = document.getElementById(outId)!
  const ratio = (offset: number, room: number): number => (room > 0 ? Math.round(offset / room * 100) : 0)
  viewport.addEventListener('scroll', () => {
    out.textContent = paint(
      ratio(viewport.scrollLeft, viewport.scrollWidth - viewport.clientWidth),
      ratio(viewport.scrollTop, viewport.scrollHeight - viewport.clientHeight),
    )
  })
}

wireWcScrollAreaProgress('wc-scroll-area', 'wc-scroll-area-progress', (_x, y) => `已滚过 ${y}%`)
wireWcScrollAreaProgress('wc-scroll-area-both', 'wc-scroll-area-both-progress', (x, y) => `横向已滚过 ${x}% · 纵向 ${y}%`)

// 页码回显：元素只发 page-change（页码 0 基），两条轮播的接线一模一样
function wireWcCarousel(hostId: string, outId: string, totalPages: number): void {
  const out = document.getElementById(outId)!
  const paint = (page: number): void => {
    out.textContent = `第 ${page + 1} / ${totalPages} 页`
  }
  paint(0)
  document.getElementById(hostId)!.addEventListener('page-change', (e) => {
    paint((e as CustomEvent<{ page: number }>).detail.page)
  })
}

wireWcCarousel('wc-carousel', 'wc-carousel-page', 3)
wireWcCarousel('wc-carousel-wide', 'wc-carousel-wide-page', 3)

// 激活项留作非受控：哪一节算当前是滚动位置这件 DOM 事实，元素自己结算，本页只按事件回显
const wcAnchorValue = document.getElementById('wc-anchor-value')!

function paintWcAnchor(value: string | null): void {
  wcAnchorValue.textContent = `当前：${value ?? '（还没有一节越过判定线）'}`
}

paintWcAnchor(null)

document.getElementById('wc-anchor')!.addEventListener('value-change', (e) => {
  paintWcAnchor((e as CustomEvent<{ value: string | null }>).detail.value)
})

// 展开项留作非受控：元素自己记，本页只按事件回显
const wcNavMenuValue = document.getElementById('wc-nav-menu-value')!

function paintWcNavMenu(value: string | null): void {
  wcNavMenuValue.textContent = `展开的面板：${value ?? '（都收着）'}`
}

paintWcNavMenu(null)

document.getElementById('wc-nav-menu')!.addEventListener('value-change', (e) => {
  paintWcNavMenu((e as CustomEvent<{ value: string | null }>).detail.value)
})

// 消息由脚本插：插进去的是普通段落而不是角色节点，重新接线不会被触发；
// 但内容变高会被粘底那边的尺寸观察接住，粘着就把滚动位置补到底
const wcThreadMessages = document.getElementById('wc-thread-messages')!
const wcThreadLive = document.getElementById('wc-thread-live')!
const wcThreadStick = document.getElementById('wc-thread-stick')!

function appendWcThreadMessage(role: string, text: string): void {
  const p = document.createElement('p')
  p.className = 'lead'
  // 消息之间的间距归皮肤的 content 管，段落自带的外边距会跟它叠成两份
  p.style.margin = '0'
  const who = document.createElement('strong')
  who.textContent = `${role}：`
  p.append(who, text)
  wcThreadMessages.append(p)
}

// 头几条只为把 260px 的框先撑溢出：首屏「挂上就在底」得有溢出才看得出来
const wcThreadSeed: [string, string][] = [
  ['用户', '粘底到底是按什么判的？'],
  ['助手', '按滚动位置离底还差多少像素。差值落在阈值内就算在底，默认阈值 64px。'],
  ['用户', '那我自己往上滚一段呢？'],
  ['助手', '当场撒手：此后再长多少都不跟，右下角那颗按钮露出来给你一条回去的路。'],
  ['用户', '滚回去要不要再点一下按钮？'],
  ['助手', '不用。滚进阈值内的那一下自动重新粘上，按钮跟着收起来。'],
  ['用户', '这几条先把框撑溢出，好让首屏就看得出「挂上就在底」。'],
]

for (const [role, text] of wcThreadSeed) appendWcThreadMessage(role, text)

let wcThreadNextId = wcThreadSeed.length

document.getElementById('wc-thread-append')!.addEventListener('click', () => {
  wcThreadNextId += 1
  const text = `第 ${wcThreadNextId} 条 · 这条是刚追加的，粘着就跟到底，撒手了就停在原处等你回来。`
  appendWcThreadMessage('助手', text)
  // 播报只在这一处发生，且只写整段最终文本：这个节点带 aria-atomic，写一次就重念一整块
  wcThreadLive.textContent = text
})

function paintWcThreadStick(atBottom: boolean, sticking: boolean): void {
  wcThreadStick.textContent = `在底：${atBottom ? '是' : '否'} · 粘附：${sticking ? '是' : '否'}`
}

paintWcThreadStick(true, true)

document.getElementById('wc-thread')!.addEventListener('stick-change', (e) => {
  const { atBottom, sticking } = (e as CustomEvent<{ atBottom: boolean, sticking: boolean }>).detail
  paintWcThreadStick(atBottom, sticking)
})

const wcComposer = document.getElementById('wc-composer')!
const wcComposerSubmit = document.getElementById('wc-composer-submit')!
const wcComposerLog = document.getElementById('wc-composer-log')!
const wcComposerStreaming = document.getElementById('wc-composer-streaming') as HTMLInputElement

// 运行态的真源在本页：元素只按 run-status 切 data-mode 与 aria-label，按钮上的字归作者换。
// 复选框、属性、按钮文字三处必须一起走，勾选与「发一条自动进流式」都汇到这一个入口
function paintWcComposerRun(streaming: boolean): void {
  wcComposerStreaming.checked = streaming
  wcComposer.setAttribute('run-status', streaming ? 'streaming' : 'ready')
  wcComposerSubmit.textContent = streaming ? '停止' : '发送'
}

paintWcComposerRun(false)

wcComposerStreaming.addEventListener('change', () => {
  paintWcComposerRun(wcComposerStreaming.checked)
})

document.getElementById('wc-composer-disabled')!.addEventListener('change', (e) => {
  wcComposer.toggleAttribute('disabled', (e.target as HTMLInputElement).checked)
})

wcComposer.addEventListener('submit', (e) => {
  // 先过一手 Event 再断言：submit 撞上了表单那个同名事件，DOM 类型把回调参数认成 SubmitEvent，
  // 与 CustomEvent 没有交集，直接断言过不去。派上来的确实是元素自己造的 CustomEvent
  const { value } = (e as Event as CustomEvent<{ value: string }>).detail
  // 清空发生在派发之后，拿到的是提交那一刻的原文
  wcComposerLog.textContent = `提交：${value}`
  paintWcComposerRun(true)
})

wcComposer.addEventListener('stop', () => {
  wcComposerLog.textContent = '已按下停止'
  paintWcComposerRun(false)
})

// 代码原文写进 code 角色节点，同一份再喂给 code 属性——元素只拿它数行数把最小高度先撑住，
// 显示什么始终是 code 节点里的文本说了算，两者不写成同一份就会出现「高度按 A 撑、显示的是 B」
function fillWcCodeBlock(hostId: string, source: string): void {
  const host = document.getElementById(hostId)!
  host.querySelector('[data-xh-part="code"]')!.textContent = source
  host.setAttribute('code', source)
}

fillWcCodeBlock('wc-code-block', `export function createTicker(intervalTime: number) {
  let handle = 0
  return {
    start(onTick: () => void) {
      handle = setInterval(onTick, intervalTime)
    },
    stop() {
      clearInterval(handle)
    },
  }
}`)

// 吐到一半被截断的样子：既没吐完这一行，也还没吐出闭合围栏
fillWcCodeBlock('wc-code-block-partial', `const stream = await client.chat({
  model: 'demo',
  messages,
  onToken(token) {
    buffer +=`)
