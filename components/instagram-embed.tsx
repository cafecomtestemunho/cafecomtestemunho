"use client";

import{useEffect,useRef}from"react";
import Script from"next/script";

declare global{
  interface Window{instgrm?:{Embeds?:{process:()=>void}}}
}

export function InstagramEmbed({url,onReady}:{url:string;onReady?:()=>void}){
  const shellRef=useRef<HTMLDivElement>(null);

  useEffect(()=>{
    let active=true;
    const timers:number[]=[];
    const process=()=>{try{window.instgrm?.Embeds?.process?.()}catch{}};
    const markReady=()=>{
      if(!active)return;
      if(shellRef.current?.querySelector("iframe")){
        onReady?.();
        return true;
      }
      return false;
    };
    const observer=new MutationObserver(()=>{markReady()});
    if(shellRef.current)observer.observe(shellRef.current,{childList:true,subtree:true});
    requestAnimationFrame(()=>{process();markReady()});
    for(const delay of [180,520,1100,1900]){
      timers.push(window.setTimeout(()=>{process();markReady()},delay));
    }
    return()=>{
      active=false;
      observer.disconnect();
      timers.forEach(window.clearTimeout);
    };
  },[url,onReady]);

  return <div ref={shellRef} className="instagram-embed-shell">
    <blockquote
      className="instagram-media"
      data-instgrm-permalink={url}
      data-instgrm-version="14"
      style={{background:"#fff",border:0,margin:0,maxWidth:"540px",minWidth:"0",width:"100%"}}
    >
      <a href={url} target="_blank" rel="noreferrer">Abrir publicação no Instagram</a>
    </blockquote>
    <Script
      src="https://www.instagram.com/embed.js"
      strategy="afterInteractive"
      onLoad={()=>window.setTimeout(()=>window.instgrm?.Embeds?.process?.(),80)}
    />
  </div>;
}
