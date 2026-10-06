"use client";

import{useEffect,useState}from"react";
import{ChevronLeft,ChevronRight}from"lucide-react";
import{InstagramEmbed}from"@/components/instagram-embed";

type InstagramPost={id:string;post_url:string};

export function InstagramCarousel({posts}:{posts:InstagramPost[]}){
  const[index,setIndex]=useState(0);
  const[paused,setPaused]=useState(false);

  useEffect(()=>{
    if(posts.length<2||paused)return;
    const timer=window.setInterval(()=>setIndex(v=>(v+1)%posts.length),7000);
    return()=>window.clearInterval(timer);
  },[posts.length,paused]);

  useEffect(()=>{if(index>=posts.length)setIndex(0)},[posts.length,index]);

  if(!posts.length)return null;
  const current=posts[index];

  return <div className="home-instagram-carousel" onPointerEnter={()=>setPaused(true)} onPointerLeave={()=>setPaused(false)} onTouchStart={()=>setPaused(true)}>
    <div className="home-instagram-stage">
      <InstagramEmbed key={current.id} url={current.post_url}/>
    </div>
    {posts.length>1&&<div className="home-instagram-controls">
      <button type="button" aria-label="Post anterior" onClick={()=>setIndex(v=>(v-1+posts.length)%posts.length)}><ChevronLeft size={19}/></button>
      <div className="home-instagram-dots">{posts.map((p,i)=><button key={p.id} type="button" aria-label={"Ver post "+(i+1)} className={i===index?"active":""} onClick={()=>setIndex(i)}/>)}</div>
      <button type="button" aria-label="Próximo post" onClick={()=>setIndex(v=>(v+1)%posts.length)}><ChevronRight size={19}/></button>
    </div>}
  </div>
}