const t=`<!-- 按语气着色 | 空状态自己不带语气，图标槽里放一枚带 tone 的图标，成功、警示、出错就各是一族颜色 -->
<!-- 图标槽收任意内容，放一枚带语气的图标，着色就落在这一处，标题与说明不动 -->
<xh-empty-state live="off" size="sm">
  <div data-xh-part="root" style="inline-size: 240px">
    <span data-xh-part="icon">
      <xh-icon id="empty-state-tone-success" tone="success" size="lg">
        <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
      </xh-icon>
    </span>
    <p data-xh-part="title">全部导入成功</p>
    <p data-xh-part="description">128 条记录已入库，没有需要人工处理的行。</p>
    <div data-xh-part="action">
      <xh-button size="sm" variant="outline">
        <button data-xh-part="root">查看结果</button>
      </xh-button>
    </div>
  </div>
</xh-empty-state>

<xh-empty-state live="off" size="sm">
  <div data-xh-part="root" style="inline-size: 240px">
    <span data-xh-part="icon">
      <xh-icon id="empty-state-tone-warning" tone="warning" size="lg">
        <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
      </xh-icon>
    </span>
    <p data-xh-part="title">部分行被跳过</p>
    <p data-xh-part="description">有 6 行缺少必填字段，这次没有导入它们。</p>
    <div data-xh-part="action">
      <xh-button size="sm" variant="outline">
        <button data-xh-part="root">下载跳过清单</button>
      </xh-button>
    </div>
  </div>
</xh-empty-state>

<xh-empty-state live="off" size="sm">
  <div data-xh-part="root" style="inline-size: 240px">
    <span data-xh-part="icon">
      <xh-icon id="empty-state-tone-danger" tone="danger" size="lg">
        <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
      </xh-icon>
    </span>
    <p data-xh-part="title">导入没有完成</p>
    <p data-xh-part="description">文件读到一半中断，这次改动已经整体回滚。</p>
    <div data-xh-part="action">
      <xh-button size="sm" variant="outline">
        <button data-xh-part="root">重新上传</button>
      </xh-button>
    </div>
  </div>
</xh-empty-state>

<script type="module">
  // 图标记录是对象，只走 property
  const stroke = {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  };
  document.getElementById("empty-state-tone-success").icon = {
    name: "check-circle",
    viewBox: "0 0 24 24",
    attrs: stroke,
    nodes: [
      { tag: "circle", attrs: { cx: "12", cy: "12", r: "9" } },
      { tag: "path", attrs: { d: "M8 12.5L11 15.5L16 9" } },
    ],
  };
  document.getElementById("empty-state-tone-warning").icon = {
    name: "alert",
    viewBox: "0 0 24 24",
    attrs: stroke,
    nodes: [
      { tag: "path", attrs: { d: "M12 4L21 19H3Z" } },
      { tag: "path", attrs: { d: "M12 10V14" } },
      { tag: "path", attrs: { d: "M12 16.5V17" } },
    ],
  };
  document.getElementById("empty-state-tone-danger").icon = {
    name: "cross-circle",
    viewBox: "0 0 24 24",
    attrs: stroke,
    nodes: [
      { tag: "circle", attrs: { cx: "12", cy: "12", r: "9" } },
      { tag: "path", attrs: { d: "M9 9L15 15" } },
      { tag: "path", attrs: { d: "M15 9L9 15" } },
    ],
  };
<\/script>
`;export{t as default};
