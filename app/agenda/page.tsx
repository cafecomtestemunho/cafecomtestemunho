import Link from"next/link";
import{ArrowRight,CalendarDays,MapPin}from"lucide-react";
import{createServerSupabaseClient}from"@/lib/supabase/server";
import{Reveal}from"@/components/reveal";

export const metadata={title:"Agenda"};

function AgendaDivider({tone,lightSurface="paper",hero=false}:{tone:"light-dark"|"dark-light";lightSurface?:"paper";hero?:boolean}){
  const nextColor=tone==="light-dark"?"#32180d":"#fffaf4";

  return <div className={"about-wave about-wave-"+tone+" about-wave-light-"+lightSurface+(hero?" about-wave-hero":"")} aria-hidden="true">
    <svg className="about-wave-svg" viewBox="0 0 1200 84" preserveAspectRatio="none">
      <path
        className="about-wave-next-fill"
        fill={nextColor}
        d="M0 24C185 7 332 12 505 31C703 54 887 54 1200 18V84H0Z"
      />
      <path className="about-wave-gold-band" d="M0 24C185 7 332 12 505 31C703 54 887 54 1200 18"/>
      <path className="about-wave-gold-soft" d="M0 19C185 2 332 7 505 26C703 49 887 49 1200 13"/>
      <path className="about-wave-gold-line" d="M0 24C185 7 332 12 505 31C703 54 887 54 1200 18"/>
    </svg>
  </div>;
}

export default async function AgendaPage(){
  const s=await createServerSupabaseClient();
  const[{data:events},{data:hero},{data:intro},{data:cta}]=await Promise.all([
    s.from("events").select("*").in("status",["PUBLICADO","ENCERRADO"]).order("starts_at",{ascending:true}),
    s.from("institutional_sections").select("*").eq("section_key","agenda_hero").maybeSingle(),
    s.from("institutional_sections").select("*").eq("section_key","agenda_intro").maybeSingle(),
    s.from("institutional_sections").select("*").eq("section_key","agenda_cta").maybeSingle()
  ]);

  const heroStyle=hero?.image_url
    ?{backgroundImage:`linear-gradient(180deg,rgba(29,13,6,.52),rgba(31,14,7,.82)),url("${hero.image_url}")`}
    :undefined;
  const nextEvent=events?.find(e=>e.status==="PUBLICADO");
  const ctaHref=cta?.cta_url||(nextEvent?"/eventos/"+nextEvent.slug:"#proximos-encontros");

  return <main className="inner-page agenda-page">
    <section className="agenda-hero-refined" style={heroStyle}>
      <div className="container agenda-hero-content">
        <Reveal className="agenda-hero-copy">
          <div className="agenda-hero-kicker">AGENDA</div>
          <h1>Encontros do Café</h1>
          <p>Um tempo para estar juntas, ouvir, compartilhar e fortalecer a fé.</p>
        </Reveal>
      </div>
    </section>

    <AgendaDivider tone="dark-light" lightSurface="paper" hero/>

    <section id="proximos-encontros" className="inner-section inner-paper agenda-main-section">
      <div className="container inner-narrow">
        {intro?.visible!==false&&<Reveal className="inner-section-intro compact agenda-section-intro">
          <div className="inner-kicker">PRÓXIMOS ENCONTROS</div>
          <h2>O próximo capítulo</h2>
          <p>Confira as próximas datas e venha viver esse momento com a gente.</p>
        </Reveal>}

        <div className="agenda-list">
          {events?.map((e,i)=>{
            const d=e.starts_at?new Date(e.starts_at):null;
            return <Reveal key={e.id} delay={Math.min(i*55,240)}>
              <article className={"agenda-card "+(i===0&&e.status==="PUBLICADO"?"featured":"")}>
                <div className="agenda-date">
                  {d?<><strong>{new Intl.DateTimeFormat("pt-BR",{day:"2-digit",timeZone:"America/Sao_Paulo"}).format(d)}</strong><span>{new Intl.DateTimeFormat("pt-BR",{month:"short",timeZone:"America/Sao_Paulo"}).format(d).replace(".","").toUpperCase()}</span><small>{new Intl.DateTimeFormat("pt-BR",{year:"numeric",timeZone:"America/Sao_Paulo"}).format(d)}</small></>:<><strong>—</strong><span>DATA</span><small>BREVE</small></>}
                </div>
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
            </Reveal>;
          })}
          {!events?.length&&<Reveal><div className="inner-empty">Novas datas serão anunciadas em breve.</div></Reveal>}
        </div>
      </div>
    </section>

    {cta?.visible!==false&&<>
      <AgendaDivider tone="light-dark"/>
      <section className="agenda-join-section">
        <div className="container inner-narrow">
          <Reveal className="agenda-join-content">
            <div className="agenda-join-kicker">FAÇA PARTE</div>
            <h2>Há um lugar para você neste encontro.</h2>
            <p>Cada encontro é feito de mulheres, histórias, fé e comunhão. Venha viver o próximo capítulo do Café com Testemunho conosco.</p>
            <div className="agenda-join-rule" aria-hidden="true"/>
            <blockquote>“Oh! Como é bom e agradável viverem unidos os irmãos!”</blockquote>
            <cite>Salmos 133:1</cite>
            <Link className="agenda-join-btn" href={ctaHref}>Quero participar <span aria-hidden="true">→</span></Link>
          </Reveal>
        </div>
      </section>
    </>}
  </main>;
}
