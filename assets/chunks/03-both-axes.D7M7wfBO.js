const n=`<!-- 双轴滚动 | 同时显示横向和纵向滚动条 -->
<div style="position: relative; inline-size: 320px">
  <div
    id="scrollbar-both-box"
    style="
      block-size: 200px;
      overflow: auto;
      border: 1px solid var(--xh-border-default);
      border-radius: var(--xh-shape-surface);
      padding: 8px;
    "
  ></div>

  <xh-scrollbar controls="scrollbar-both-box" type="auto" gutter>
    <div data-xh-part="root">
      <div data-xh-part="track">
        <div data-xh-part="thumb"></div>
      </div>
      <div data-xh-part="corner"></div>
    </div>
  </xh-scrollbar>
  <xh-scrollbar controls="scrollbar-both-box" type="auto" orientation="horizontal" gutter>
    <div data-xh-part="root">
      <div data-xh-part="track">
        <div data-xh-part="thumb"></div>
      </div>
    </div>
  </xh-scrollbar>
</div>

<script type="module">
  document.getElementById("scrollbar-both-box").replaceChildren(
    ...Array.from({ length: 30 }, (_, r) => {
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.gap = "8px";
      row.style.inlineSize = "max-content";
      row.style.paddingBlock = "2px";
      row.replaceChildren(
        ...Array.from({ length: 12 }, (_, c) => {
          const cell = document.createElement("span");
          cell.style.inlineSize = "56px";
          cell.style.color = "var(--xh-fg-muted)";
          cell.style.fontVariantNumeric = "tabular-nums";
          cell.textContent = \`\${r + 1}-\${c + 1}\`;
          return cell;
        }),
      );
      return row;
    }),
  );
<\/script>
`;export{n as default};
