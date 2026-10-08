"use client";

import{useEffect,useMemo,useState}from"react";

type Photo={id:string;url:string;alt_text:string|null};

function buildTrack(photos:Photo[],offset:number){
  if(!photos.length)return[];
  const minimum=Math.max(8,photos.length*2);
  return Array.from({length:minimum},(_,index)=>photos[(index+offset)%photos.length]);
}

export function PhotoShowcase({photos}:{photos:Photo[]}){
  const[active,setActive]=useState<Photo|null>(null);
  const trackA=useMemo(()=>buildTrack(photos,0),[photos]);
  const trackB=useMemo(()=>buildTrack(photos,Math.max(1,Math.floor(photos.length/2))),[photos]);

  useEffect(()=>{
    if(!active)return;
    const previous=document.body.style.overflow;
    document.body.style.overflow="hidden";
    const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape")setActive(null)};
    window.addEventListener("keydown",onKey);
    return()=>{
      document.body.style.overflow=previous;
      window.removeEventListener("keydown",onKey);
    };
  },[active]);

  const stopSave=(event:React.SyntheticEvent)=>event.preventDefault();

  return <>
    <div className="photo-showcase" aria-label="Galeria de fotos">
      <div className="photo-showcase-viewport">
        <div className="photo-showcase-track photo-showcase-track-forward" style={{"--photo-duration":`${Math.max(72,trackA.length*6)}s`}as React.CSSProperties}>
          {[...trackA,...trackA].map((photo,index)=><button
            type="button"
            className="photo-showcase-card"
            style={{"--photo-index":index}as React.CSSProperties}
            key={"a-"+photo.id+"-"+index}
            onClick={()=>setActive(photo)}
            onContextMenu={stopSave}
            onDragStart={stopSave}
            aria-label={"Ampliar "+(photo.alt_text||"foto do Café com Testemunho")}
          ><img src={photo.url} alt={photo.alt_text||"Registro do Café com Testemunho"} loading={index<3?"eager":"lazy"} draggable={false}/></button>)}
        </div>
      </div>

      <div className="photo-showcase-viewport photo-showcase-viewport-secondary">
        <div className="photo-showcase-track photo-showcase-track-reverse" style={{"--photo-duration":`${Math.max(80,trackB.length*6.5)}s`}as React.CSSProperties}>
          {[...trackB,...trackB].map((photo,index)=><button
            type="button"
            className="photo-showcase-card photo-showcase-card-secondary"
            style={{"--photo-index":index}as React.CSSProperties}
            key={"b-"+photo.id+"-"+index}
            onClick={()=>setActive(photo)}
            onContextMenu={stopSave}
            onDragStart={stopSave}
            aria-label={"Ampliar "+(photo.alt_text||"foto do Café com Testemunho")}
          ><img src={photo.url} alt={photo.alt_text||"Registro do Café com Testemunho"} loading="lazy" draggable={false}/></button>)}
        </div>
      </div>
    </div>

    {active&&<div className="photo-lightbox" role="dialog" aria-modal="true" aria-label="Foto ampliada" onClick={()=>setActive(null)} onContextMenu={stopSave}>
      <button type="button" className="photo-lightbox-close" onClick={()=>setActive(null)}>Fechar</button>
      <div className="photo-lightbox-frame" onClick={event=>event.stopPropagation()}>
        <img src={active.url} alt={active.alt_text||"Registro do Café com Testemunho"} draggable={false} onContextMenu={stopSave} onDragStart={stopSave}/>
        {active.alt_text&&<p>{active.alt_text}</p>}
      </div>
    </div>}
  </>;
}
