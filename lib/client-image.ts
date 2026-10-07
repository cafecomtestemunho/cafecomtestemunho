"use client";

export const SAFE_IMAGE_UPLOAD_BYTES=Math.floor(3.25*1024*1024);
const MAX_SOURCE_IMAGE_BYTES=50*1024*1024;

export function isSupportedImage(file:File){
  return file.type.startsWith("image/")||/\.(jpe?g|png|webp|gif)$/i.test(file.name);
}

export function guessImageMime(name:string){
  const ext=name.toLowerCase().split(".").pop();
  if(ext==="png")return"image/png";
  if(ext==="webp")return"image/webp";
  if(ext==="gif")return"image/gif";
  return"image/jpeg";
}

export function normalizeImageFile(file:File){
  if(file.type.startsWith("image/"))return file;
  return new File([file],file.name,{type:guessImageMime(file.name),lastModified:file.lastModified});
}

export async function prepareImageForUpload(file:File){
  if(!isSupportedImage(file))throw new Error("Use uma imagem JPG, JPEG, PNG, WebP ou GIF.");
  if(file.size>MAX_SOURCE_IMAGE_BYTES)throw new Error(`${file.name}: o arquivo original é muito grande. Use uma imagem de até 50 MB.`);

  const normalized=normalizeImageFile(file);
  if(normalized.size<=SAFE_IMAGE_UPLOAD_BYTES)return{file:normalized,optimized:false,originalSize:file.size,finalSize:normalized.size};

  const optimized=await compressImage(normalized);
  return{file:optimized,optimized:true,originalSize:file.size,finalSize:optimized.size};
}

async function compressImage(file:File){
  const url=URL.createObjectURL(file);
  try{
    const img=await loadImage(url);
    const originalWidth=img.naturalWidth||img.width;
    const originalHeight=img.naturalHeight||img.height;
    if(!originalWidth||!originalHeight)throw new Error("Não foi possível ler as dimensões da imagem.");

    let scale=Math.min(1,3200/Math.max(originalWidth,originalHeight));
    let quality=.86;
    let lastBlob:Blob|null=null;

    for(let attempt=0;attempt<12;attempt++){
      const width=Math.max(1,Math.round(originalWidth*scale));
      const height=Math.max(1,Math.round(originalHeight*scale));
      const canvas=document.createElement("canvas");
      canvas.width=width;
      canvas.height=height;
      const ctx=canvas.getContext("2d",{alpha:true});
      if(!ctx)throw new Error("Seu navegador não conseguiu preparar a imagem para envio.");
      ctx.imageSmoothingEnabled=true;
      ctx.imageSmoothingQuality="high";
      ctx.drawImage(img,0,0,width,height);

      const blob=await canvasToBlob(canvas,"image/webp",quality);
      lastBlob=blob;
      canvas.width=1;
      canvas.height=1;

      if(blob.size<=SAFE_IMAGE_UPLOAD_BYTES){
        const base=file.name.replace(/\.[^.]+$/,"")||"imagem";
        return new File([blob],base+".webp",{type:"image/webp",lastModified:Date.now()});
      }

      if(quality>.58)quality=Math.max(.58,quality-.08);
      else{scale*=.82;quality=.8}
    }

    if(lastBlob&&lastBlob.size<=SAFE_IMAGE_UPLOAD_BYTES){
      const base=file.name.replace(/\.[^.]+$/,"")||"imagem";
      return new File([lastBlob],base+".webp",{type:"image/webp",lastModified:Date.now()});
    }
    throw new Error(`${file.name}: não foi possível reduzir a imagem o suficiente para envio.`);
  }catch(error){
    if(error instanceof Error&&error.message.includes(file.name))throw error;
    throw new Error(`${file.name}: não foi possível otimizar esta imagem. Tente JPG, PNG ou WebP.`);
  }finally{
    URL.revokeObjectURL(url);
  }
}

function loadImage(url:string){
  return new Promise<HTMLImageElement>((resolve,reject)=>{
    const img=new Image();
    img.decoding="async";
    img.onload=()=>resolve(img);
    img.onerror=()=>reject(new Error("Falha ao abrir a imagem."));
    img.src=url;
  });
}

function canvasToBlob(canvas:HTMLCanvasElement,type:string,quality:number){
  return new Promise<Blob>((resolve,reject)=>{
    canvas.toBlob(blob=>blob?resolve(blob):reject(new Error("Falha ao compactar a imagem.")),type,quality);
  });
}
