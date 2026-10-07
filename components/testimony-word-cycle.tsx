"use client";

import{useEffect,useState}from"react";

const WORDS=["recomeço","espera","resposta","restauração","gratidão","fé"];

export function TestimonyWordCycle(){
  const[index,setIndex]=useState(0);

  useEffect(()=>{
    const media=window.matchMedia("(prefers-reduced-motion: reduce)");
    if(media.matches)return;
    const timer=window.setInterval(()=>setIndex(current=>(current+1)%WORDS.length),2400);
    return()=>window.clearInterval(timer);
  },[]);

  return <div className="testimony-word-cycle" aria-label={"Há testemunhos de "+WORDS[index]}>
    <span className="testimony-word-prefix">Há testemunhos de</span>
    <span className="testimony-word-window" aria-hidden="true">
      <span key={WORDS[index]} className="testimony-word-current">{WORDS[index]}</span>
    </span>
  </div>;
}
