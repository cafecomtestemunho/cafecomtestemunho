"use client";

import{useCallback,useEffect,useState}from"react";
import{ChevronLeft,ChevronRight}from"lucide-react";
import{InstagramEmbed}from"@/components/instagram-embed";

type InstagramPost={id:string;post_url:string};

export function InstagramCarousel({posts}:{posts:InstagramPost[]}){
  const[index,setIndex]=useState(0);
  const[paused,setPaused]=useState(false);
  const[ready,setReady]=useState(false);

  useEffect(()=>{if(index>=posts.length)setIndex(0)},[posts.length,index]);
  useEffect(()=>{setReady(false)},[index]);

  useEffect(()=>{
    if(posts.length<2||paused||!ready)return;
    const timer=window.setInterval(()=>setIndex(v=>(v+1)%posts.length),9000);
    return()=>window.clearInterval(timer);
  },[posts.length,paused,ready]);

  const previous=()=>{setReady(false);setIndex(v=>(v-1+posts.length)%posts.length)};
  const next=()=>{setReady(false);setIndex(v=>(v+1)%posts.length)};
  const markReady=useCallback(()=>setReady(true),[]);

  if(!posts.length)return null;
  const current=posts[index];

  return <div
    className={"home-instagram-carousel "+(ready?"is-ready":"is-loading")}
    onPointerEnter={()=>setPaused(true)}
    onPointerLeave={()=>setPaused(false)}
    onFocusCapture={()=>setPaused(true)}
    onBlurCapture={()=>setPaused(false)}
  >
    <div className="home-instagram-stage" aria-live="polite">
      {!ready&&<div className="home-instagram-loading" aria-hidden="true"><span/></div>}
      <InstagramEmbed key={current.id} url={current.post_url} onReady={markReady}/>
    </div>
    {posts.length>1&&<div className="home-instagram-controls">
      <button type="button" aria-label="Post anterior" onClick={previous}><ChevronLeft size={18}/></button>
      <div className="home-instagram-dots">{posts.map((p,i)=><button key={p.id} type="button" aria-label={"Ver post "+(i+1)} className={i===index?"active":""} onClick={()=>{setReady(false);setIndex(i)}}/>)}</div>
      <button type="button" aria-label="Próximo post" onClick={next}><ChevronRight size={18}/></button>
    </div>}
  </div>;
}
