"use client";

import{useEffect,useRef,useState}from"react";

export function CinematicScripture({verse,reference,reflection,logoUrl,brandName}:{verse:string;reference:string;reflection?:string|null;logoUrl?:string|null;brandName?:string|null}){
  const ref=useRef<HTMLElement>(null);
  const[visible,setVisible]=useState(false);
  const words=String(verse||"").trim().split(/\s+/).filter(Boolean);

  useEffect(()=>{
    const node=ref.current;
    if(!node)return;
    const observer=new IntersectionObserver(([entry])=>{
      if(entry.isIntersecting){setVisible(true);observer.disconnect()}
    },{threshold:.24,rootMargin:"0px 0px -8% 0px"});
    observer.observe(node);
    return()=>observer.disconnect();
  },[]);

  return <section ref={ref} className={"home3-word "+(visible?"is-visible":"")}>
    <div className="home3-word-art" aria-hidden="true"/>
    <div className="container home3-word-inner">
      <div className="home3-word-kicker"><span>Palavra para este tempo</span><i/><b aria-hidden="true">✦</b><i/></div>
      <blockquote aria-label={verse}>
        <span className="home3-word-quote home3-word-quote-open">“</span>
        <span className="home3-word-verse">{words.map((word,i)=><span className="home3-word-token" key={i} style={{transitionDelay:`${260+i*78}ms`}}>{word}&nbsp;</span>)}</span>
        <span className="home3-word-quote home3-word-quote-close" style={{transitionDelay:`${320+words.length*78}ms`}}>”</span>
      </blockquote>
      <strong className="home3-word-reference" style={{transitionDelay:`${470+words.length*78}ms`}}>{reference}</strong>
      <span className="home3-word-rule" style={{transitionDelay:`${560+words.length*78}ms`}}/>
      {reflection&&<p className="home3-word-reflection" style={{transitionDelay:`${650+words.length*78}ms`}}>{reflection}</p>}
      {logoUrl&&<div className="home3-word-logo-wrap" style={{transitionDelay:`${760+words.length*78}ms`}}><img className="home3-word-logo" src={logoUrl} alt={brandName||"Café com Testemunho"}/></div>}
    </div>
  </section>;
}