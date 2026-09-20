const n=`<!-- 判定线偏移 | 为吸顶内容预留空间 -->
<div
  style="
    display: grid;
    grid-template-columns: minmax(112px, 140px) minmax(0, 1fr);
    gap: 20px;
    inline-size: min(640px, 100%);
    align-items: start;
  "
>
  <template id="anchor-offset-nav">
    <xh-anchor offset="44" smooth>
      <nav data-xh-part="root">
        <ul data-xh-part="list">
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-offset-a">第一节</a>
          </li>
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-offset-b">第二节</a>
          </li>
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-offset-c">第三节</a>
          </li>
          <li data-xh-part="indicator"></li>
        </ul>
      </nav>
    </xh-anchor>
  </template>

  <div
    id="anchor-offset-scroll"
    data-xh-scroll
    style="
      position: relative;
      block-size: 240px;
      overflow: auto;
      border-radius: var(--xh-shape-surface);
      background: var(--xh-bg-subtle);
    "
  >
    <div
      style="
        position: sticky;
        inset-block-start: 0;
        z-index: 1;
        block-size: 44px;
        display: flex;
        align-items: center;
        padding-inline: 12px;
        background: var(--xh-bg-surface);
        border-block-end: 1px solid var(--xh-border-default);
      "
    >
      章节导航
    </div>

    <div id="anchor-offset-a" style="block-size: 180px; padding: 12px">
      <strong>第一节</strong>
      <p style="color: var(--xh-fg-muted)">第一节相关内容</p>
    </div>
    <div id="anchor-offset-b" style="block-size: 180px; padding: 12px">
      <strong>第二节</strong>
      <p style="color: var(--xh-fg-muted)">第二节相关内容</p>
    </div>
    <div id="anchor-offset-c" style="block-size: 180px; padding: 12px">
      <strong>第三节</strong>
      <p style="color: var(--xh-fg-muted)">第三节相关内容</p>
    </div>
  </div>
</div>

<script type="module">
  const template = document.getElementById("anchor-offset-nav");
  const anchor = template.content.firstElementChild;
  anchor.scrollElement = document.getElementById("anchor-offset-scroll");
  template.replaceWith(anchor);
<\/script>
`;export{n as default};
