async function s(){const e=document.getElementById("code-view-streaming"),n=["async function load(id: string) {","  const res = await fetch(`/api/items/${id}`)","  return res.json()","}"].join(`
`);let t=0;const i=()=>{if(e.isConnected){if(t=Math.min(t+2,n.length),e.setAttribute("code",n.slice(0,t)),t>=n.length){e.setAttribute("complete","");return}setTimeout(i,60)}};i()}export{s as default};
