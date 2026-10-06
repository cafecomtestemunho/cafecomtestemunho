"use client";

import{useEffect}from"react";
import Script from"next/script";

declare global{
  interface Window{instgrm?:{Embeds?:{process:()=>void}}}
}

export function InstagramEmbed({url}:{url:string}){
  useEffect(()=>{window.instgrm?.Embeds?.process?.()},[url]);
  return <div className="instagram-embed-shell">
    <blockquote
      className="instagram-media"
      data-instgrm-permalink={url}
      data-instgrm-version="14"
      style={{background:"#fff",border:0,margin:0,maxWidth:"540px",minWidth:"280px",width:"100%"}}
    >
      <a href={url} target="_blank" rel="noreferrer">Ver publicação no Instagram</a>
    </blockquote>
    <Script src="https://www.instagram.com/embed.js" strategy="afterInteractive" onLoad={()=>window.instgrm?.Embeds?.process?.()}/>
  </div>
}