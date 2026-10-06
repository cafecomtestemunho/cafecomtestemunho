import Link from"next/link";
import{ArrowRight,CalendarDays,BookHeart,Instagram,Images,HeartHandshake}from"lucide-react";
import{createServerSupabaseClient}from"@/lib/supabase/server";
import{Reveal}from"@/components/reveal";
import{BrandMark}from"@/components/brand-mark";

export default async function HomePage(){
  const s=await createServerSupabaseClient();
  const now=new Date().toISOString();
  const[
    {data:sections},{data:event},{data:featured},{data:scripture},{data:photos},{data:instagram},{data:social}
  ]=await Promise.all([
    s.from("institutional_sections").select("*").in("section_key",["home_hero","home_intro","home_cta"]),
    s.from("events").select("*").eq("status","PUBLICADO").gte("starts_at",now).order("starts_at").limit(1).maybeSingle(),
    s.from("testimonial_publications").select("slug,public_title,public_excerpt,public_display_name,published_at").not("published_at","is",null).order("featured",{ascending:false}).order("published_at",{ascending:false}).limit(3),
    s.from("scripture_spotlights").select("*").eq("location","home").eq("visible",true).order("sort_order").limit(1).maybeSingle(),
    s.from("media_assets").select("id,url,alt_text,featured,created_at").eq("media_type","image").eq("is_private",false).order("featured",{ascending:false}).order("created_at",{ascending:false}).limit(6),
    s.from("instagram_highlights").select("*").eq("visible",true).in("location",["home","both"]).order("sort_order").limit(3),
    s.from("social_links").select("url").eq("icon_key","instagram").eq("visible",true).order("sort_order").limit(1).maybeSingle()
  ]);

  const hero=sections?.find(x=>x.section_key==="home_hero");
  const intro=sections?.find(x=>x.section_key==="home_intro");
  const cta=sections?.find(x=>x.section_key==="home_cta");

  return <>
    <header className="hero hero-home ambient-bg">
      <div className="ambient-orb orb-one"/><div className="ambient-orb orb-two"/>
      <div className="container hero-home-grid">
        <Reveal className="hero-brand-wrap">
          <BrandMark/>
        </Reveal>
        <Reveal className="hero-copy" delay={120}>
          <div className="eyebrow">Fé · acolhimento · testemunho</div>
          <h1>{hero?.title??"Café com Testemunho"}</h1>
          <p>{hero?.body??"Mulheres reunidas para compartilhar histórias, fortalecer a fé e lembrar que nenhum capítulo precisa ser vivido sozinho."}</p>
          <div className="actions">
            <Link className="btn btn-primary" href="/sobre">Conheça nossa história <ArrowRight size={18}/></Link>
            <Link className="btn btn-ghost-light" href="/agenda">Próximos encontros</Link>
          </div>
        </Reveal>
        {scripture&&<Reveal className="hero-scripture" delay={240}>
          <span className="scripture-kicker">Palavra para este tempo</span>
          <blockquote>“{scripture.verse_text}”</blockquote>
          <strong>{scripture.reference}</strong>
        </Reveal>}
      </div>
    </header>

    <main>
      <section className="section section-paper">
        <div className="container story-intro-grid">
          <Reveal>
            <div className="eyebrow">O projeto é a raiz</div>
            <h2 className="section-title">{intro?.title??"Uma história que começou com um testemunho"}</h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="lead">{intro?.body}</p>
            <Link className="text-link" href="/sobre">Ler a história completa <ArrowRight size={16}/></Link>
          </Reveal>
        </div>
      </section>

      {event&&<section className="section soft-section">
        <div className="container">
          <Reveal>
            <article className="event-feature card-elevated">
              <div>
                <div className="eyebrow">Próximo encontro</div>
                <h2>{event.title}</h2>
                <p>{event.summary}</p>
              </div>
              <div className="event-feature-side">
                <div className="event-date"><CalendarDays size={22}/><span>{event.starts_at?new Intl.DateTimeFormat("pt-BR",{dateStyle:"long",timeStyle:"short",timeZone:"America/Sao_Paulo"}).format(new Date(event.starts_at)):"Data a confirmar"}</span></div>
                <span>{event.venue}</span><span>{event.city}</span>
                <Link className="btn btn-dark" href={"/eventos/"+event.slug}>Ver encontro</Link>
              </div>
            </article>
          </Reveal>
        </div>
      </section>}

      {scripture&&<section className="section scripture-section">
        <div className="container">
          <Reveal className="scripture-panel">
            <div className="scripture-symbol">✦</div>
            <div><div className="eyebrow">Palavra</div><blockquote>“{scripture.verse_text}”</blockquote><strong>{scripture.reference}</strong>{scripture.reflection&&<p>{scripture.reflection}</p>}</div>
          </Reveal>
        </div>
      </section>}

      <section className="section">
        <div className="container">
          <Reveal className="section-heading-row"><div><div className="eyebrow">Memórias</div><h2 className="section-title">Momentos do Café</h2></div><Link className="text-link" href="/fotos">Ver galeria <Images size={17}/></Link></Reveal>
          {photos?.length?<div className="home-photo-grid">{photos.map((p,i)=><Reveal key={p.id} delay={i*70} className={i===0?"home-photo featured": "home-photo"}><img src={p.url} alt={p.alt_text||"Registro do Café com Testemunho"} loading="lazy"/></Reveal>)}</div>:<Reveal><div className="photo-placeholder"><Images size={34}/><strong>As primeiras memórias estão chegando</strong><span>Este espaço será preenchido com os registros dos encontros.</span></div></Reveal>}
        </div>
      </section>

      <section className="section soft-section">
        <div className="container">
          <Reveal><div className="eyebrow">Histórias que acolhem</div><h2 className="section-title">Testemunhos</h2></Reveal>
          <div className="grid grid-3">
            {featured?.map((t,i)=><Reveal key={t.slug} delay={i*80}><article className="card testimony-card"><BookHeart size={25}/><h3>{t.public_title}</h3><p>{t.public_excerpt}</p><small>{t.public_display_name}</small><div className="actions"><Link href={"/testemunhos/"+t.slug} className="btn btn-secondary">Ler testemunho</Link></div></article></Reveal>)}
            {!featured?.length&&<div className="card empty">Os primeiros testemunhos publicados aparecerão aqui.</div>}
          </div>
        </div>
      </section>

      <section className="section instagram-section">
        <div className="container">
          <Reveal className="section-heading-row"><div><div className="eyebrow">Do nosso Instagram</div><h2 className="section-title">@cafe_testemunho</h2></div>{social?.url&&<a className="text-link" href={social.url} target="_blank" rel="noreferrer">Abrir perfil <Instagram size={17}/></a>}</Reveal>
          {instagram?.length?<div className="grid grid-3">{instagram.map((p,i)=><Reveal key={p.id} delay={i*80}><a className="instagram-card" href={p.post_url} target="_blank" rel="noreferrer">{p.cover_url?<img src={p.cover_url} alt=""/>:<div className="instagram-card-placeholder"><Instagram size={34}/></div>}<div><span>Instagram</span><h3>{p.title||"Publicação do Café"}</h3><p>{p.caption}</p></div></a></Reveal>)}</div>:<Reveal><div className="instagram-empty"><Instagram size={30}/><p>Os posts escolhidos pela equipe aparecerão aqui.</p></div></Reveal>}
        </div>
      </section>

      <section className="section cta-section ambient-bg">
        <div className="ambient-orb orb-three"/>
        <div className="container">
          <Reveal className="cta-panel"><HeartHandshake size={35}/><div className="eyebrow">Faça parte</div><h2>{cta?.title??"Faça parte do próximo capítulo"}</h2><p>{cta?.body??"Essa história continua sendo escrita em cada encontro, em cada mulher que chega e em cada testemunho compartilhado."}</p><div className="actions"><Link className="btn btn-primary" href="/agenda">Participar de um encontro</Link><Link className="btn btn-ghost-light" href="/enviar-testemunho">Compartilhar meu testemunho</Link></div></Reveal>
        </div>
      </section>
    </main>
  </>;
}