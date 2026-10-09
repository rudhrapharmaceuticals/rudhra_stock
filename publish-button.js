(()=>{"use strict";
const $=id=>document.getElementById(id);
const button=$("publishPublic"),tokenInput=$("publishToken"),status=$("publishResult");
if(!button||!tokenInput||!status)return;
// Remember the token on this device so publishing does not require pasting it every time.
try{tokenInput.value=localStorage.getItem("rudhra_github_publish_token")||"";}catch(e){}
tokenInput.addEventListener("input",()=>{try{if(tokenInput.value.trim())localStorage.setItem("rudhra_github_publish_token",tokenInput.value.trim());else localStorage.removeItem("rudhra_github_publish_token");}catch(e){}});
button.addEventListener("click",async()=>{
 const token=tokenInput.value.trim();
 if(!token){status.textContent="Paste your GitHub publishing token first.";tokenInput.focus();return}
 if(typeof buildPublishPayload!=="function"){status.textContent="Could not collect stock data. Refresh the Internal Dashboard and try again.";return}
 if(!confirm("Publish the current System Qty, Rack Qty, Samples and Damaged Stock to the Public Dashboard?"))return;
 button.disabled=true;button.textContent="Publishing…";status.textContent="Preparing stock data…";
 try{
  const payload=buildPublishPayload();
  const body=JSON.stringify(payload);
  const encoded=btoa(Array.from(new TextEncoder().encode(body),b=>String.fromCharCode(b)).join(""));
  const api="https://api.github.com/repos/rudhrapharmaceuticals/rudhra_stock/contents/rudhra-publish.json";
  const headers={"Authorization":"Bearer "+token,"Accept":"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28"};
  let existing=await fetch(api+"?ref=main",{headers});
  let sha;
  if(existing.ok){const obj=await existing.json();sha=obj.sha}
  else if(existing.status!==404){const err=await existing.json().catch(()=>({}));throw new Error(err.message||("GitHub read failed ("+existing.status+"). Check token permissions and repository access."))}
  status.textContent="Uploading stock data to GitHub…";
  const put=await fetch(api,{method:"PUT",headers:{...headers,"Content-Type":"application/json"},body:JSON.stringify({message:"Publish stock data from internal dashboard",content:encoded,branch:"main",...(sha?{sha}:{})})});
  const result=await put.json().catch(()=>({}));
  if(!put.ok)throw new Error(result.message||("Upload failed ("+put.status+"). Check token permissions."));
  status.textContent="Stock data uploaded. GitHub is updating the Public Dashboard now; wait about 1–2 minutes, then refresh the public page.";
 }catch(e){status.textContent="Publish failed: "+(e&&e.message?e.message:"Unexpected error")+". Your local dashboard data has not been deleted."}
 finally{button.disabled=false;button.textContent="Publish Stock to Public Dashboard"}
});
})();