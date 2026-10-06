import Link from"next/link";
import{ArrowRight,CalendarDays,MapPin}from"lucide-react";
import{createServerSupabaseClient}from"@/lib/supabase/server";
import{Reveal}from"@/components/reveal";

export const metadata={title:"Agenda"};

export default async function AgendaPage(){
  const s=await createServerSupabaseClient();
  const[{data:events},{data:hero},{data:intro},{data:cta}]=await Promise.all([
    s.from("events").select("*").in("status",["PUBLICADO","ENCERRADO"]).order("starts_at",{ascending:true}),
    s.from("institutional_sections").select("*").eq("section_key","agenda_hero").maybeSingle(),
    s.from("institutional_sections").select("*").eq("section_key","agenda_intro").maybeSingle(),
    s.from("institutional_sections").select("*").eq("section_key","agenda_cta").maybeSingle()
  ]);
  const heroStyle=hero?.image_url?{backgroundImage:`linear-gradient(90deg,rgba(38,19,9,.88),rgba(38,19,9,.52)),url("${hero.image_url}")`}:undefined;
  return <main className="inner-page">
    <section className="inner-hero inner-agenda-hero" style={heroStyle}><div className="inner-hero-ornament" aria-hidden/><div className="container inner-hero-content solo"><Reveal className="inner-hero-copy centered"><div className="inner-kicker">{hero?.subtitle||"Agenda"}</div><h1>{hero?.title||"Encontros do Café"}</h1><p>{hero?.body||"Momentos de comunhão, louvor e testemunhos que edificam."}</p></Reveal></div><div className="inner-hero-curve" aria-hidden/></section>
    <section className="inner-section inner-paper"><div className="container inner-narrow">
      {intro?.visible!==false&&<Reveal className="inner-section-intro compact"><div className="inner-kicker">{intro?.subtitle||"Próximos encontros"}</div><h2>{intro?.title||"Venha viver esse momento com a gente"}</h2>{intro?.body&&<p>{intro.body}</p>}</Reveal>}
      <div className="agenda-list">
        {events?.map((e,i)=>{const d=e.starts_at?new Date(e.starts_at):null;return <Reveal key={e.id} delay={Math.min(i*55,240)}><article className={"agenda-card "+(i===0&&e.status==="PUBLICADO"?"featured":"")}>
          <div className="agenda-date">{d?<><strong>{new Intl.DateTimeFormat("pt-BR",{day:"2-digit",timeZone:"America/Sao_Paulo"}).format(d)}</strong><span>{new Intl.DateTimeFormat("pt-BR",{month:"short",timeZone:"America/Sao_Paulo"}).format(d).replace(".","").toUpperCase()}</span><small>{new Intl.DateTimeFormat("pt-BR",{year:"numeric",timeZone:"America/Sao_Paulo"}).format(d)}</small></>:<><strong>—</strong><span>DATA</span><small>BREVE</small></>}</div>
          {e.cover_url&&<Link href={"/eventos/"+e.slug} className="agenda-cover"><img src={e.cover_url} alt="" loading="lazy"/></Link>}
          <div className="agenda-copy"><span className="agenda-pill">{e.status==="PUBLICADO"?"Encontro":"Memória"}</span><h2>{e.title}</h2>{e.summary&&<p>{e.summary}</p>}<div className="agenda-meta">{e.city&&<span><MapPin size={15}/>{e.city}</span>}{d&&<span><CalendarDays size={15}/>{new Intl.DateTimeFormat("pt-BR",{weekday:"long",hour:"2-digit",minute:"2-digit",timeZone:"America/Sao_Paulo"}).format(d)}</span>}</div><Link className="inner-btn dark" href={"/eventos/"+e.slug}>Ver encontro <ArrowRight size={15}/></Link></div>
        </article></Reveal>})}
        {!events?.length&&<Reveal><div className="inner-empty">Novas datas serão anunciadas em breve.</div></Reveal>}
      </div>
    </div></section>
    {cta?.visible!==false&&cta?.title&&<section className="inner-mini-cta"><div className="container inner-narrow"><Reveal><div className="inner-mini-cta-copy"><div className="inner-kicker">{cta.subtitle||"Faça parte"}</div><h2>{cta.title}</h2>{cta.body&&<p>{cta.body}</p>}{cta.cta_label&&cta.cta_url&&<Link className="inner-btn dark" href={cta.cta_url}>{cta.cta_label} <ArrowRight size={15}/></Link>}</div></Reveal></div></section>}
  </main>
}