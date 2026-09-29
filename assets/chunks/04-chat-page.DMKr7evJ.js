async function g(){const t=document.getElementById("chat-page"),c=t.querySelector("#chat-page-feed"),u=c.querySelector('[data-xh-part="list"]'),n=t.querySelector("#chat-page-reasoning"),d=t.querySelector("#chat-page-stream"),m=t.querySelector("#chat-page-code"),r=t.querySelector("#chat-page-approval"),h=r.querySelector('[data-xh-part="result"]'),i=t.querySelector("#chat-page-input"),p=t.querySelector("#chat-page-note");n.translations={label:"思考过程",thoughtFor:"想了 {seconds} 秒"},n.querySelector('[data-xh-part="label"]').textContent=n.statusText,d.blocks=[{key:"0:a",kind:"markdown",html:"<p>按你给的约束，改动落在<strong>一个文件</strong>里：</p>",complete:!0},{key:"1:b",kind:"markdown",html:`<ul>
<li>事件仍从内核发出，视图不新增状态</li>
<li>退场那一档交给动效令牌，组件里不写时长</li>
</ul>`,complete:!0}],m.code=`export function onClose(reason: CloseReason) {
  if (reason === "escape") return restoreFocus()
  return dismiss()
}`,r.scopes=[{value:"read",label:"读 src/ 下的文件",required:!0},{value:"write",label:"把这段改动写回去"}],r.addEventListener("decision",s=>{const e=s.detail.decision==="approved"?"已批准":"已拒绝";h.textContent=e,p.textContent=`批准闸门：${e}`,p.hidden=!1}),i.translations={input:"接着问点什么"};let a=2;i.addEventListener("submit",s=>{const e=document.createElement("article");e.setAttribute("data-xh-part","item"),e.setAttribute("item-id",`q${a}`),e.setAttribute("item-index",String(a)),e.setAttribute("item-role","user");const o=document.createElement("span");o.setAttribute("data-xh-part","item-label"),o.innerHTML=`<span style="display: inline-flex; align-items: center; gap: var(--xh-space-2)">
      <xh-avatar size="sm"><span data-xh-part="root"><span data-xh-part="fallback">我</span></span></xh-avatar>
      我
    </span>`;const l=document.createElement("p");l.style.margin="0",l.textContent=s.detail.value,e.append(o,l),u.append(e),a+=1,c.setAttribute("count",String(a))})}export{g as default};
