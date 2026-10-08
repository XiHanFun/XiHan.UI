var e=`<!-- 图片地址 | 同源或放行了跨域的地址先取回再印出剪影 -->
<xh-watermark id="watermark-image-url" text="XiHan" image="/images/demo-avatar.svg" style="display: block">
  <div data-xh-part="root">
    <div data-xh-part="content">
      <div style="inline-size: 320px; padding: 24px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)">
        <strong>设计稿预览</strong>
        <p style="margin-block-end: 0">预览版本仅供内部评审，请勿外传。</p>
      </div>
    </div>
  </div>
</xh-watermark>

<script type="module">
  // 图片尺寸是对象，只走 property
  document.getElementById("watermark-image-url").imageSize = { width: 40, height: 40 };
<\/script>
`;export{e as default};