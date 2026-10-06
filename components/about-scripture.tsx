"use client";
import{useEffect,useRef,useState}from"react";

export function AboutScripture({
  verse,reference,reflection,kicker
}:{verse:string;reference:string;reflection?:string|null;kicker?:string|null}){
  const ref=useRef<HTMLElement>(null);
  const[visible,setVisible]=useState(false);
  const words=String(verse||"").trim().split(/\s+/).filter(Boolean);

  useEffect(()=>{
    const node=ref.current;
    if(!node)return;
    const observer=new IntersectionObserver(([entry])=>{
      if(entry.isIntersecting){setVisible(true);observer.disconnect()}
    },{threshold:.22,rootMargin:"0px 0px -10% 0px"});
    observer.observe(node);
    return()=>observer.disconnect();
  },[]);

  return <section ref={ref} className={"about-word "+(visible?"is-visible":"")}>
    <div className="about-word-branch" aria-hidden="true"/>
    <div className="container about-word-inner">
      <div className="about-word-kicker">
        <span>{kicker||"Uma palavra que acompanha essa história"}</span>
        <i aria-hidden="true"/>
      </div>
      <blockquote aria-label={verse}>
        <span className="about-word-quote">“</span>
        <span>{words.map((word,i)=><span className="about-word-token" key={i} style={{transitionDelay:`${180+i*68}ms`}}>{word}&nbsp;</span>)}</span>
        <span className="about-word-quote close" style={{transitionDelay:`${240+words.length*68}ms`}}>”</span>
      </blockquote>
      <strong className="about-word-reference" style={{transitionDelay:`${360+words.length*68}ms`}}>{reference}</strong>
      <span className="about-word-rule" style={{transitionDelay:`${430+words.length*68}ms`}}/>
      {reflection&&<p className="about-word-reflection" style={{transitionDelay:`${510+words.length*68}ms`}}>{reflection}</p>}
    </div>
  </section>;
}
