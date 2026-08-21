const n=`<!-- 受控 | 传了 value 就由宿主说了算，null 表示都收起 -->
<div style="inline-size: 100%; padding-block-end: 150px">
  <xh-navigation-menu id="navigation-menu-controlled" style="display: contents">
    <nav data-xh-part="root">
      <ul data-xh-part="list">
        <li data-xh-part="item">
          <button data-xh-part="trigger" value="solution">解决方案</button>
          <div data-xh-part="content" value="solution">
            <a data-xh-part="link" href="#/solution/saas">多租户 SaaS</a>
            <a data-xh-part="link" href="#/solution/portal">门户站点</a>
          </div>
        </li>
        <li data-xh-part="item">
          <button data-xh-part="trigger" value="support">支持</button>
          <div data-xh-part="content" value="support">
            <a data-xh-part="link" href="#/support/faq">常见问题</a>
            <a data-xh-part="link" href="#/support/contact">联系我们</a>
          </div>
        </li>
      </ul>
    </nav>
  </xh-navigation-menu>

  <div style="display: flex; align-items: center; gap: 8px; margin-block-start: 12px">
    <xh-button variant="outline">
      <button data-xh-part="root" id="navigation-menu-controlled-open">展开「支持」</button>
    </xh-button>
    <xh-button variant="outline">
      <button data-xh-part="root" id="navigation-menu-controlled-close">全部收起</button>
    </xh-button>
    <span>展开的面板：<span id="navigation-menu-controlled-value">（都收着）</span></span>
  </div>
</div>

<script type="module">
  // 展开项由宿主持有：组件只发 value-change，写回元素它才变
  const menu = document.getElementById("navigation-menu-controlled");
  const readout = document.getElementById("navigation-menu-controlled-value");

  function apply(next) {
    menu.value = next;
    readout.textContent = next ?? "（都收着）";
  }

  apply(null);
  menu.addEventListener("value-change", (event) => apply(event.detail.value));
  document
    .getElementById("navigation-menu-controlled-open")
    .addEventListener("click", () => apply("support"));
  document
    .getElementById("navigation-menu-controlled-close")
    .addEventListener("click", () => apply(null));
<\/script>
`;export{n as default};
