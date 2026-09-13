const input=document.getElementById("fileInput"), drop=document.getElementById("dropzone"), panel=document.getElementById("panel"), preview=document.getElementById("preview"), fileName=document.getElementById("fileName"), originalSize=document.getElementById("originalSize"), quality=document.getElementById("quality"), qualityValue=document.getElementById("qualityValue"), format=document.getElementById("format"), compressBtn=document.getElementById("compressBtn"), status=document.getElementById("status"), result=document.getElementById("result"), download=document.getElementById("download"), changeBtn=document.getElementById("changeBtn");
let file=null, objectUrl=null, downloadUrl=null;
const MAX=20*1024*1024;
function size(n){if(n<1024)return n+" B";if(n<1024**2)return (n/1024).toFixed(1)+" KB";return (n/1024**2).toFixed(2)+" MB"}
function setStatus(t,error=false){status.textContent=t;status.className="status"+(error?" error":"")}
function selectFile(f){if(!f)return;if(!f.type.startsWith("image/")||!["image/jpeg","image/png","image/webp"].includes(f.type)){setStatus("Please choose a JPG, PNG or WebP image.",true);return}if(f.size>MAX){setStatus("That image is larger than 20 MB.",true);return}file=f;if(objectUrl)URL.revokeObjectURL(objectUrl);objectUrl=URL.createObjectURL(f);preview.src=objectUrl;fileName.textContent=f.name;originalSize.textContent=size(f.size);drop.hidden=true;panel.hidden=false;result.hidden=true;setStatus("")}
input.addEventListener("change",e=>selectFile(e.target.files[0]));
["dragenter","dragover"].forEach(x=>drop.addEventListener(x,e=>{e.preventDefault();drop.classList.add("drag")}));
["dragleave","drop"].forEach(x=>drop.addEventListener(x,e=>{e.preventDefault();drop.classList.remove("drag")}));
drop.addEventListener("drop",e=>selectFile(e.dataTransfer.files[0]));
changeBtn.onclick=()=>input.click();
quality.oninput=()=>qualityValue.textContent=quality.value+"%";
compressBtn.onclick=async()=>{
 if(!file)return;
 compressBtn.disabled=true; setStatus("Compressing…"); result.hidden=true;
 try{
  const img=new Image();
  img.src=objectUrl;
  await new Promise((res,rej)=>{img.onload=res;img.onerror=rej});
  const canvas=document.createElement("canvas");
  canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
  const ctx=canvas.getContext("2d");
  if(format.value==="image/jpeg"){ctx.fillStyle="#fff";ctx.fillRect(0,0,canvas.width,canvas.height)}
  ctx.drawImage(img,0,0);
  const blob=await new Promise((res,rej)=>canvas.toBlob(b=>b?res(b):rej(new Error("Compression failed")),format.value,Number(quality.value)/100));
  if(downloadUrl)URL.revokeObjectURL(downloadUrl);downloadUrl=URL.createObjectURL(blob);
  const ext=format.value==="image/png"?"png":format.value==="image/webp"?"webp":"jpg";
  const base=file.name.replace(/\.[^.]+$/,"");
  download.href=downloadUrl;download.download=`${base}-compressed.${ext}`;
  document.getElementById("before").textContent=size(file.size);
  document.getElementById("after").textContent=size(blob.size);
  const saved=Math.max(0,Math.round((1-blob.size/file.size)*100));
  document.getElementById("saved").textContent=saved+"%";
  result.hidden=false;
  setStatus(blob.size<file.size?"Compression complete.":"This setting did not reduce the file size. Try lower quality or WebP.");
 }catch(e){setStatus("Could not compress this image. Please try another image.",true)}
 finally{compressBtn.disabled=false}
};
