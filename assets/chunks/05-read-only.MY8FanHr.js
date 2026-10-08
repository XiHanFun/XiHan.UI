var e=`<!-- 只读展示 | 只呈现进度：步骤不可点、不可聚焦，也不置灰 -->
<xh-steps id="steps-read-only" count="4" value="2" read-only>
  <div data-xh-part="root">
    <div data-xh-part="list">
      <div data-xh-part="item" value="0">
        <div data-xh-part="trigger">
          <span data-xh-part="indicator"></span>
          <span data-xh-part="title">已下单</span>
          <span data-xh-part="description">09-26 10:12</span>
        </div>
        <div data-xh-part="separator"></div>
      </div>
      <div data-xh-part="item" value="1">
        <div data-xh-part="trigger">
          <span data-xh-part="indicator"></span>
          <span data-xh-part="title">已发货</span>
          <span data-xh-part="description">09-26 16:40</span>
        </div>
        <div data-xh-part="separator"></div>
      </div>
      <div data-xh-part="item" value="2">
        <div data-xh-part="trigger">
          <span data-xh-part="indicator">3</span>
          <span data-xh-part="title">运输中</span>
          <span data-xh-part="description">预计明日送达</span>
        </div>
        <div data-xh-part="separator"></div>
      </div>
      <div data-xh-part="item" value="3">
        <div data-xh-part="trigger">
          <span data-xh-part="indicator">4</span>
          <span data-xh-part="title">已签收</span>
        </div>
        <div data-xh-part="separator"></div>
      </div>
    </div>
  </div>
</xh-steps>

<script type="module">
  // 列表的可及名是对象，只走 property
  document.getElementById("steps-read-only").translations = { list: "物流进度" };
<\/script>
`;export{e as default};