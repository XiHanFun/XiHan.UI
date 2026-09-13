const n=`<!-- 嵌套目录 | 展示父级与子级章节 -->
<div
  style="
    display: grid;
    grid-template-columns: minmax(128px, 160px) minmax(0, 1fr);
    gap: 20px;
    inline-size: min(640px, 100%);
    align-items: start;
  "
>
  <template id="anchor-nested-nav">
    <xh-anchor smooth>
      <nav data-xh-part="root">
        <ul data-xh-part="list">
          <li data-xh-part="item" style="flex-direction: column; align-items: stretch">
            <a data-xh-part="link" value="anchor-nested-guide">指南</a>
            <ul style="margin: 0; padding: 0; padding-inline-start: 12px; list-style: none">
              <li data-xh-part="item">
                <a data-xh-part="link" value="anchor-nested-install">安装</a>
              </li>
              <li data-xh-part="item">
                <a data-xh-part="link" value="anchor-nested-start">快速开始</a>
              </li>
            </ul>
          </li>
          <li data-xh-part="item" style="flex-direction: column; align-items: stretch">
            <a data-xh-part="link" value="anchor-nested-api">接口</a>
            <ul style="margin: 0; padding: 0; padding-inline-start: 12px; list-style: none">
              <li data-xh-part="item">
                <a data-xh-part="link" value="anchor-nested-props">属性</a>
              </li>
              <li data-xh-part="item">
                <a data-xh-part="link" value="anchor-nested-events">事件</a>
              </li>
            </ul>
          </li>
          <li data-xh-part="indicator"></li>
        </ul>
      </nav>
    </xh-anchor>
  </template>

  <div
    id="anchor-nested-scroll"
    style="
      block-size: 240px;
      overflow: auto;
      padding-inline: 12px;
      border-radius: var(--xh-shape-surface);
      background: var(--xh-bg-subtle);
    "
  >
    <div id="anchor-nested-guide" style="block-size: 140px; padding-block: 12px">
      <strong>指南</strong>
      <p style="color: var(--xh-fg-muted)">指南相关内容</p>
    </div>
    <div id="anchor-nested-install" style="block-size: 140px; padding-block: 12px">
      <strong>安装</strong>
      <p style="color: var(--xh-fg-muted)">安装相关内容</p>
    </div>
    <div id="anchor-nested-start" style="block-size: 140px; padding-block: 12px">
      <strong>快速开始</strong>
      <p style="color: var(--xh-fg-muted)">快速开始相关内容</p>
    </div>
    <div id="anchor-nested-api" style="block-size: 140px; padding-block: 12px">
      <strong>接口</strong>
      <p style="color: var(--xh-fg-muted)">接口相关内容</p>
    </div>
    <div id="anchor-nested-props" style="block-size: 140px; padding-block: 12px">
      <strong>属性</strong>
      <p style="color: var(--xh-fg-muted)">属性相关内容</p>
    </div>
    <div id="anchor-nested-events" style="block-size: 140px; padding-block: 12px">
      <strong>事件</strong>
      <p style="color: var(--xh-fg-muted)">事件相关内容</p>
    </div>
  </div>
</div>

<script type="module">
  const groups = {
    "anchor-nested-guide": ["anchor-nested-install", "anchor-nested-start"],
    "anchor-nested-api": ["anchor-nested-props", "anchor-nested-events"],
  };

  const template = document.getElementById("anchor-nested-nav");
  const anchor = template.content.firstElementChild;

  function apply(next) {
    anchor.value = next;
    for (const [parent, children] of Object.entries(groups)) {
      const link = anchor.querySelector(\`[data-xh-part="link"][value="\${parent}"]\`);
      const on = next === parent || children.includes(next);
      link.style.color = on ? "var(--xh-fg-brand)" : "";
    }
  }

  anchor.scrollElement = document.getElementById("anchor-nested-scroll");
  apply(null);
  template.replaceWith(anchor);

  anchor.addEventListener("value-change", (event) => apply(event.detail.value));
<\/script>
`;export{n as default};
