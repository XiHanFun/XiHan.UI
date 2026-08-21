const t=`<!-- 语气 | tone 换的是当前页选中态的底色与文字色，这里预置第 3 页为当前页 -->
<div style="inline-size: 100%; display: grid; gap: 12px">
  <div style="display: flex; align-items: center; gap: 12px">
    <span style="inline-size: 120px; flex: none">brand（缺省）</span>
    <xh-pagination count="50" page-size="10" default-page="3" tone="brand">
      <nav data-xh-part="root">
        <button data-xh-part="prev-trigger">上一页</button>
        <button data-xh-part="item" value="1">1</button>
        <button data-xh-part="item" value="2">2</button>
        <button data-xh-part="item" value="3">3</button>
        <button data-xh-part="item" value="4">4</button>
        <button data-xh-part="item" value="5">5</button>
        <button data-xh-part="next-trigger">下一页</button>
      </nav>
    </xh-pagination>
  </div>

  <div style="display: flex; align-items: center; gap: 12px">
    <span style="inline-size: 120px; flex: none">neutral</span>
    <xh-pagination count="50" page-size="10" default-page="3" tone="neutral">
      <nav data-xh-part="root">
        <button data-xh-part="prev-trigger">上一页</button>
        <button data-xh-part="item" value="1">1</button>
        <button data-xh-part="item" value="2">2</button>
        <button data-xh-part="item" value="3">3</button>
        <button data-xh-part="item" value="4">4</button>
        <button data-xh-part="item" value="5">5</button>
        <button data-xh-part="next-trigger">下一页</button>
      </nav>
    </xh-pagination>
  </div>

  <div style="display: flex; align-items: center; gap: 12px">
    <span style="inline-size: 120px; flex: none">success</span>
    <xh-pagination count="50" page-size="10" default-page="3" tone="success">
      <nav data-xh-part="root">
        <button data-xh-part="prev-trigger">上一页</button>
        <button data-xh-part="item" value="1">1</button>
        <button data-xh-part="item" value="2">2</button>
        <button data-xh-part="item" value="3">3</button>
        <button data-xh-part="item" value="4">4</button>
        <button data-xh-part="item" value="5">5</button>
        <button data-xh-part="next-trigger">下一页</button>
      </nav>
    </xh-pagination>
  </div>

  <div style="display: flex; align-items: center; gap: 12px">
    <span style="inline-size: 120px; flex: none">warning</span>
    <xh-pagination count="50" page-size="10" default-page="3" tone="warning">
      <nav data-xh-part="root">
        <button data-xh-part="prev-trigger">上一页</button>
        <button data-xh-part="item" value="1">1</button>
        <button data-xh-part="item" value="2">2</button>
        <button data-xh-part="item" value="3">3</button>
        <button data-xh-part="item" value="4">4</button>
        <button data-xh-part="item" value="5">5</button>
        <button data-xh-part="next-trigger">下一页</button>
      </nav>
    </xh-pagination>
  </div>

  <div style="display: flex; align-items: center; gap: 12px">
    <span style="inline-size: 120px; flex: none">danger</span>
    <xh-pagination count="50" page-size="10" default-page="3" tone="danger">
      <nav data-xh-part="root">
        <button data-xh-part="prev-trigger">上一页</button>
        <button data-xh-part="item" value="1">1</button>
        <button data-xh-part="item" value="2">2</button>
        <button data-xh-part="item" value="3">3</button>
        <button data-xh-part="item" value="4">4</button>
        <button data-xh-part="item" value="5">5</button>
        <button data-xh-part="next-trigger">下一页</button>
      </nav>
    </xh-pagination>
  </div>

  <div style="display: flex; align-items: center; gap: 12px">
    <span style="inline-size: 120px; flex: none">info</span>
    <xh-pagination count="50" page-size="10" default-page="3" tone="info">
      <nav data-xh-part="root">
        <button data-xh-part="prev-trigger">上一页</button>
        <button data-xh-part="item" value="1">1</button>
        <button data-xh-part="item" value="2">2</button>
        <button data-xh-part="item" value="3">3</button>
        <button data-xh-part="item" value="4">4</button>
        <button data-xh-part="item" value="5">5</button>
        <button data-xh-part="next-trigger">下一页</button>
      </nav>
    </xh-pagination>
  </div>
</div>
`;export{t as default};
