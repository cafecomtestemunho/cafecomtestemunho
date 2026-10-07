import Link from"next/link";
import{ArrowRight,CalendarDays,MapPin}from"lucide-react";
import{createServerSupabaseClient}from"@/lib/supabase/server";
import{Reveal}from"@/components/reveal";
import{SectionWaveDivider}from"@/components/section-wave-divider";

export const metadata={title:"Agenda"};

export default async function AgendaPage(){
  const s=await createServerSupabaseClient();
  const[{data:events},{data:hero},{data:intro},{data:cta}]=await Promise.all([
    s.from("events").select("*").in("status",["PUBLICADO","ENCERRADO"]).order("starts_at",{ascending:true}),
    s.from("institutional_sections").select("*").eq("section_key","agenda_hero").maybeSingle(),
    s.from("institutional_sections").select("*").eq("section_key","agenda_intro").maybeSingle(),
    s.from("institutional_sections").select("*").eq("section_key","agenda_cta").maybeSingle()
  ]);

  const nextEvent=events?.find((event)=>event.status==="PUBLICADO");
  const heroStyle=hero?.image_url
    ?{backgroundImage:`linear-gradient(180deg,rgba(28,14,7,.52),rgba(35,17,8,.78)),url("${hero.image_url}")`}
    :undefined;
  const ctaStyle=cta?.image_url
    ?{backgroundImage:`linear-gradient(180deg,rgba(38,18,8,.88),rgba(31,14,7,.95)),url("${cta.image_url}")`}
    :undefined;
  const participateHref=cta?.cta_url|| (nextEvent?"/eventos/"+nextEvent.slug:"/agenda");

  return <main className="inner-page agenda-page">
    <section className="agenda-hero-refined" style={heroStyle}>
      <div className="agenda-hero-shade" aria-hidden="true"/>
      <div className="container agenda-hero-content">
        <Reveal className="agenda-hero-copy">
          <div className="agenda-eyebrow">AGENDA</div>
          <h1>Encontros do Café</h1>
          <div className="agenda-gold-rule" aria-hidden="true"/>
          <p>Um tempo para estar juntas, ouvir, compartilhar e fortalecer a fé.</p>
        </Reveal>
      </div>
    </section>

    <SectionWaveDivider tone="dark-light" lightSurface="paper" hero/>

    <section className="agenda-main-section">
      <div className="container inner-narrow">
        {intro?.visible!==false&&<Reveal className="agenda-section-intro">
          <div className="agenda-eyebrow">PRÓXIMOS ENCONTROS</div>
          <h2>O próximo capítulo</h2>
          <p>Confira as próximas datas e venha viver esse momento com a gente.</p>
        </Reveal>}

        <div className="agenda-list agenda-list-refined">
          {events?.map((e,i)=>{
            const d=e.starts_at?new Date(e.starts_at):null;
            return <Reveal key={e.id} delay={Math.min(i*55,240)}>
              <article className={"agenda-card agenda-card-refined "+(i===0&&e.status==="PUBLICADO"?"featured":"")}>
                <div className="agenda-date">{d?<><strong>{new Intl.DateTimeFormat("pt-BR",{day:"2-digit",timeZone:"America/Sao_Paulo"}).format(d)}</strong><span>{new Intl.DateTimeFormat("pt-BR",{month:"short",timeZone:"America/Sao_Paulo"}).format(d).replace(".","").toUpperCase()}</span><small>{new Intl.DateTimeFormat("pt-BR",{year:"numeric",timeZone:"America/Sao_Paulo"}).format(d)}</small></>:<><strong>—</strong><span>DATA</span><small>BREVE</small></>}</div>
                {e.cover_url&&<Link href={"/eventos/"+e.slug} className="agenda-cover"><img src={e.cover_url} alt="" loading="lazy"/></Link>}
                <div className="agenda-copy">
                  <span className="agenda-pill">{e.status==="PUBLICADO"?"Encontro":"Memória"}</span>
                  <h2>{e.title}</h2>
                  {e.summary&&<p>{e.summary}</p>}
                  <div className="agenda-meta">
                    {e.city&&<span><MapPin size={15}/>{e.city}</span>}
                    {d&&<span><CalendarDays size={15}/>{new Intl.DateTimeFormat("pt-BR",{weekday:"long",hour:"2-digit",minute:"2-digit",timeZone:"America/Sao_Paulo"}).format(d)}</span>}
                  </div>
                  <Link className="inner-btn dark" href={"/eventos/"+e.slug}>Ver encontro <ArrowRight size={15}/></Link>
                </div>
              </article>
            </Reveal>
          })}
          {!events?.length&&<Reveal><div className="inner-empty">Novas datas serão anunciadas em breve.</div></Reveal>}
        </div>
      </div>
    </section>

    {cta?.visible!==false&&<SectionWaveDivider tone="light-dark"/>}

    {cta?.visible!==false&&<section className="agenda-participate" style={ctaStyle}>
      <div className="agenda-participate-overlay" aria-hidden="true"/>
      <div className="container inner-narrow">
        <Reveal className="agenda-participate-copy">
          <div className="agenda-eyebrow">FAÇA PARTE</div>
          <h2>Há um lugar para você neste encontro.</h2>
          <div className="agenda-participate-rule" aria-hidden="true"/>
          <p>Cada encontro é feito de mulheres, histórias, fé e comunhão. Venha viver o próximo capítulo do Café com Testemunho conosco.</p>

          <blockquote>
            “Oh! Como é bom e agradável viverem unidos os irmãos!”
            <cite>Salmos 133:1</cite>
          </blockquote>

          <Link className="agenda-participate-button" href={participateHref}>
            Quero participar <span aria-hidden="true">→</span>
          </Link>
        </Reveal>
      </div>
    </section>}
  </main>;
}
