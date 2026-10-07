"use client";

import Link from"next/link";

type Story={slug:string;title:string};

function buildRail(items:Story[],offset:number){
  if(!items.length)return[];
  const minimum=Math.max(8,items.length*2);
  return Array.from({length:minimum},(_,index)=>items[(index+offset)%items.length]);
}

export function TestimonyTitleRail({items}:{items:Story[]}){
  const first=buildRail(items,0);
  const second=buildRail(items,Math.max(1,Math.floor(items.length/2)));

  return <div className="testimony-title-rails" aria-label="Testemunhos publicados">
    <div className="testimony-title-viewport">
      <div className="testimony-title-track testimony-title-track-forward">
        {[...first,...first].map((item,index)=><Link href={"/testemunhos/"+item.slug} key={"a-"+item.slug+"-"+index}>{item.title}</Link>)}
      </div>
    </div>
    <div className="testimony-title-viewport">
      <div className="testimony-title-track testimony-title-track-reverse">
        {[...second,...second].map((item,index)=><Link href={"/testemunhos/"+item.slug} key={"b-"+item.slug+"-"+index}>{item.title}</Link>)}
      </div>
    </div>
  </div>;
}
