"use client";

import{useState}from"react";
import{Upload,Archive,Images}from"lucide-react";

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

  async function expandSelection(selection:File[]){
    const output:File[]=[];
    for(const file of selection){
      if(file.name.toLowerCase().endsWith(".zip")||file.type==="application/zip"||file.type==="application/x-zip-compressed"){
        if(file.size>50*1024*1024)throw new Error("O ZIP deve ter no máximo 50 MB.");
        const JSZip=(await import("jszip")).default;
        const zip=await JSZip.loadAsync(file);
        const entries=Object.values(zip.files).filter(entry=>!entry.dir&&/\.(jpe?g|png|webp|gif)$/i.test(entry.name));
        for(const entry of entries){
          const blob=await entry.async("blob");
          const name=entry.name.split("/").pop()||"foto";
          output.push(new File([blob],name,{type:blob.type||guessMime(name)}));
        }
      }else if(isSupportedImage(file)){
        if(file.size>8*1024*1024)throw new Error(`${file.name}: a imagem deve ter no máximo 8 MB.`);
        output.push(normalizeImageFile(file));
      }
      if(output.length>80)throw new Error("Envie no máximo 80 fotos por lote.");
    }
    return output;
  }

  async function choose(list:FileList|null){
    if(!list)return;
    try{
      const expanded=await expandSelection(Array.from(list));
      setFiles(expanded);
      notify(expanded.length?`${expanded.length} foto${expanded.length===1?"":"s"} pronta${expanded.length===1?"":"s"} para enviar.`:"Nenhuma imagem válida encontrada.");
    }catch(error){
      notify(error instanceof Error?error.message:"Não foi possível abrir o ZIP. Verifique se ele contém imagens JPG, PNG ou WebP.");
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
      <span>Selecionar fotos ou ZIP</span>
      <small>JPG, PNG, WebP ou ZIP · até 8 MB por imagem</small>
      <input type="file" multiple accept="image/*,.zip,application/zip" onChange={e=>choose(e.target.files)}/>
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

    <button className="admin-primary-action" type="button" disabled={!files.length||!!progress} onClick={upload}>
      {progress?"Enviando…":`Enviar ${files.length||""} foto${files.length===1?"":"s"}`}
    </button>
  </section>;
}

function isSupportedImage(file:File){
  return file.type.startsWith("image/")||/\.(jpe?g|png|webp|gif)$/i.test(file.name);
}

function normalizeImageFile(file:File){
  if(file.type.startsWith("image/"))return file;
  return new File([file],file.name,{type:guessMime(file.name),lastModified:file.lastModified});
}

function guessMime(name:string){
  const ext=name.toLowerCase().split(".").pop();
  if(ext==="png")return"image/png";
  if(ext==="webp")return"image/webp";
  if(ext==="gif")return"image/gif";
  return"image/jpeg";
}
