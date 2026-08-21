const n=`<!-- 语气 | 换一族颜色只改 tone，形态那一轴一个字不动 -->
<div id="icon-wrapper-tone" style="display: grid; gap: 12px">
  <div style="display: flex; align-items: center; gap: 12px">
    <xh-icon-wrapper variant="solid" tone="brand">
      <span data-xh-part="root">
        <xh-icon>
          <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
        </xh-icon>
      </span>
    </xh-icon-wrapper>

    <xh-icon-wrapper variant="solid" tone="neutral">
      <span data-xh-part="root">
        <xh-icon>
          <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
        </xh-icon>
      </span>
    </xh-icon-wrapper>

    <xh-icon-wrapper variant="solid" tone="success">
      <span data-xh-part="root">
        <xh-icon>
          <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
        </xh-icon>
      </span>
    </xh-icon-wrapper>

    <xh-icon-wrapper variant="solid" tone="warning">
      <span data-xh-part="root">
        <xh-icon>
          <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
        </xh-icon>
      </span>
    </xh-icon-wrapper>

    <xh-icon-wrapper variant="solid" tone="danger">
      <span data-xh-part="root">
        <xh-icon>
          <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
        </xh-icon>
      </span>
    </xh-icon-wrapper>

    <xh-icon-wrapper variant="solid" tone="info">
      <span data-xh-part="root">
        <xh-icon>
          <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
        </xh-icon>
      </span>
    </xh-icon-wrapper>
  </div>

  <div style="display: flex; align-items: center; gap: 12px">
    <xh-icon-wrapper variant="subtle" tone="brand">
      <span data-xh-part="root">
        <xh-icon>
          <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
        </xh-icon>
      </span>
    </xh-icon-wrapper>

    <xh-icon-wrapper variant="subtle" tone="neutral">
      <span data-xh-part="root">
        <xh-icon>
          <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
        </xh-icon>
      </span>
    </xh-icon-wrapper>

    <xh-icon-wrapper variant="subtle" tone="success">
      <span data-xh-part="root">
        <xh-icon>
          <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
        </xh-icon>
      </span>
    </xh-icon-wrapper>

    <xh-icon-wrapper variant="subtle" tone="warning">
      <span data-xh-part="root">
        <xh-icon>
          <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
        </xh-icon>
      </span>
    </xh-icon-wrapper>

    <xh-icon-wrapper variant="subtle" tone="danger">
      <span data-xh-part="root">
        <xh-icon>
          <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
        </xh-icon>
      </span>
    </xh-icon-wrapper>

    <xh-icon-wrapper variant="subtle" tone="info">
      <span data-xh-part="root">
        <xh-icon>
          <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
        </xh-icon>
      </span>
    </xh-icon-wrapper>
  </div>
</div>

<script type="module">
  // 图标记录是对象，只走 property
  const star = {
    name: "star",
    viewBox: "0 0 24 24",
    attrs: {
      "fill": "none",
      "stroke": "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    },
    nodes: [
      { tag: "path", attrs: { d: "M12 3.5L14.7 9.2L21 10.1L16.5 14.5L17.6 20.7L12 17.8L6.4 20.7L7.5 14.5L3 10.1L9.3 9.2Z" } },
    ],
  };
  for (const icon of document.getElementById("icon-wrapper-tone").querySelectorAll("xh-icon")) {
    icon.icon = star;
  }
<\/script>
`;export{n as default};
