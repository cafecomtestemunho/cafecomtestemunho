"use client";

import{useState}from"react";
import{Upload,Archive,Images}from"lucide-react";
import{isSupportedImage,prepareImageForUpload,guessImageMime}from"@/lib/client-image";

type AnyRow=Record<string,any>;

export function GalleryBulkUpload({
  albums,onUploaded,notify
}:{
  albums:AnyRow[];
  onUploaded:(photos:AnyRow[])=>void;
  notify:(message:string)=>void;
}){
  const[albumId,setAlbumId]=useState("");
  const[files,setFiles]=useState<File[]>([]);
  const[progress,setProgress]=useState<{done:number;total:number}|null>(null);
  const[preparing,setPreparing]=useState(false);

  async function expandSelection(selection:File[]){
    const output:File[]=[];
    let optimizedCount=0;
    for(const file of selection){
      if(file.name.toLowerCase().endsWith(".zip")||file.type==="application/zip"||file.type==="application/x-zip-compressed"){
        if(file.size>50*1024*1024)throw new Error("O ZIP deve ter no máximo 50 MB.");
        const JSZip=(await import("jszip")).default;
        const zip=await JSZip.loadAsync(file);
        const entries=Object.values(zip.files).filter(entry=>!entry.dir&&/\.(jpe?g|png|webp|gif)$/i.test(entry.name));
        for(const entry of entries){
          const blob=await entry.async("blob");
          const name=entry.name.split("/").pop()||"foto";
          const prepared=await prepareImageForUpload(new File([blob],name,{type:blob.type||guessImageMime(name)}));
          output.push(prepared.file);
          if(prepared.optimized)optimizedCount++;
          if(output.length>80)throw new Error("Envie no máximo 80 fotos por lote.");
        }
      }else if(isSupportedImage(file)){
        const prepared=await prepareImageForUpload(file);
        output.push(prepared.file);
        if(prepared.optimized)optimizedCount++;
      }
      if(output.length>80)throw new Error("Envie no máximo 80 fotos por lote.");
    }
    return{files:output,optimizedCount};
  }

  async function choose(list:FileList|null){
    if(!list)return;
    setPreparing(true);
    notify("Preparando imagens para envio...");
    try{
      const result=await expandSelection(Array.from(list));
      setFiles(result.files);
      notify(result.files.length?`${result.files.length} foto${result.files.length===1?"":"s"} pronta${result.files.length===1?"":"s"} para enviar.${result.optimizedCount?` ${result.optimizedCount} otimizada${result.optimizedCount===1?"":"s"} automaticamente.`:""}`:"Nenhuma imagem válida encontrada.");
    }catch(error){
      setFiles([]);
      notify(error instanceof Error?error.message:"Não foi possível preparar as imagens para envio.");
    }finally{
      setPreparing(false);
    }
  }

  async function upload(){
    if(!files.length){notify("Selecione fotos ou um arquivo ZIP.");return}
    setProgress({done:0,total:files.length});
    const uploaded:AnyRow[]=[];
    const errors:string[]=[];
    for(let index=0;index<files.length;index++){
      try{
        const fd=new FormData();
        fd.set("file",files[index]);
        fd.set("album_id",albumId);
        fd.set("featured","false");
        const res=await fetch("/api/admin/photos",{method:"POST",body:fd});
        const raw=await res.text();
        let payload:AnyRow={};
        try{payload=raw?JSON.parse(raw):{}}catch{}
        if(res.ok&&payload.photo)uploaded.push(payload.photo);
        else errors.push(payload.error||`Falha ao enviar ${files[index].name} (HTTP ${res.status}).`);
      }catch(error){
        errors.push(error instanceof Error?error.message:`Falha ao enviar ${files[index].name}.`);
      }
      setProgress({done:index+1,total:files.length});
    }
    if(uploaded.length)onUploaded(uploaded);
    const failed=files.length-uploaded.length;
    setFiles([]);
    setProgress(null);
    notify(failed?`${uploaded.length} fotos enviadas. ${failed} falharam. ${errors[0]||""}`.trim():`${uploaded.length} fotos enviadas para a galeria.`);
  }

  return <section className="admin-gallery-upload">
    <div className="admin-gallery-upload-head">
      <div><strong>Adicionar fotos</strong><span>Selecione várias imagens de uma vez ou envie um ZIP.</span></div>
      <Images size={20}/>
    </div>

    <label className="admin-gallery-drop">
      <Upload size={20}/>
      <span>{preparing?"Otimizando imagens…":"Selecionar fotos ou ZIP"}</span>
      <small>JPG, PNG, WebP, GIF ou ZIP · imagens grandes são otimizadas automaticamente</small>
      <input type="file" multiple accept="image/*,.zip,application/zip" disabled={preparing||!!progress} onChange={e=>{const list=e.currentTarget.files;void choose(list);e.currentTarget.value=""}}/>
    </label>

    {files.length>0&&<div className="admin-gallery-selection">
      <Archive size={17}/>
      <div><strong>{files.length} foto{files.length===1?"":"s"} selecionada{files.length===1?"":"s"}</strong><span>{files.slice(0,3).map(file=>file.name).join(" · ")}{files.length>3?"…":""}</span></div>
    </div>}

    <label className="admin-gallery-album">
      <span>Álbum para este envio</span>
      <select value={albumId} onChange={e=>setAlbumId(e.target.value)}>
        <option value="">Galeria geral</option>
        {albums.map(album=><option key={album.id} value={album.id}>{album.title}</option>)}
      </select>
    </label>

    {progress&&<div className="admin-gallery-progress">
      <div><strong>Enviando {progress.done} de {progress.total}</strong><span>{Math.round(progress.done/progress.total*100)}%</span></div>
      <div><span style={{width:(progress.done/progress.total*100)+"%"}}/></div>
    </div>}

    <button className="admin-primary-action" type="button" disabled={!files.length||!!progress||preparing} onClick={upload}>
      {preparing?"Otimizando…":progress?"Enviando…":`Enviar ${files.length||""} foto${files.length===1?"":"s"}`}
    </button>
  </section>;
}

