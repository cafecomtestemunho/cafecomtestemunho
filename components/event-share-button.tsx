"use client";
import{useState}from"react";
import{Share2,Check}from"lucide-react";

export function EventShareButton({title,text}:{title:string;text?:string}){
  const[copied,setCopied]=useState(false);
  async function share(){
    const url=window.location.href;
    try{
      if(navigator.share){await navigator.share({title,text,url});return}
      await navigator.clipboard.writeText(url);setCopied(true);window.setTimeout(()=>setCopied(false),1800);
    }catch{}
  }
  return <button className="event-share-button" type="button" onClick={share} aria-label="Compartilhar evento">{copied?<Check size={18}/>:<Share2 size={18}/>}<span>{copied?"Link copiado":"Compartilhar"}</span></button>
}