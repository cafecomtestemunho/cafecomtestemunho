import Link from"next/link";
import{ArrowRight,Images,Instagram,BookHeart,HeartHandshake}from"lucide-react";
import{createServerSupabaseClient}from"@/lib/supabase/server";
import{Reveal}from"@/components/reveal";
import{BrandMark}from"@/components/brand-mark";

export const metadata={title:"Sobre"};

export default async function SobrePage(){
  const s=await createServerSupabaseClient();
  const[
    {data:mission},{data:story},{data:scripture},{data:photos},{data:instagram},{data:cta},{data:social}
  ]=await Promise.all([
    s.from("institutional_sections").select("*").eq("section_key","about_mission").maybeSingle(),
    s.from("story_chapters").select("*").eq("visible",true).order("sort_order"),
    s.from("scripture_spotlights").select("*").eq("location","about").eq("visible",true).order("sort_order").limit(1).maybeSingle(),
    s.from("media_assets").select("id,url,alt_text,created_at").eq("media_type","image").eq("is_private",false).order("created_at",{ascending:false}).limit(5),
    s.from("instagram_highlights").select("*").eq("visible",true).in("location",["about","both"]).order("sort_order").limit(3),
    s.from("institutional_sections").select("*").eq("section_key","about_cta").maybeSingle(),
    s.from("social_links").select("url").eq("icon_key","instagram").eq("visible",true).order("sort_order").limit(1).maybeSingle()
  ]);

  return <main>
    <section className="hero about-hero ambient-bg">
      <div className="ambient-orb orb-one"/><div className="ambient-orb orb-two"/>
      <div className="container about-hero-grid">
        <Reveal><BrandMark/></Reveal>
        <Reveal delay={120}>
          <div className="eyebrow">Como tudo começou</div>
          <h1>Antes de ser um projeto, foi uma resposta em um momento de dor.</h1>
          <p>{mission?.body??"O Café com Testemunho nasceu de uma experiência pessoal e cresceu para reunir mulheres em torno de fé, escuta e partilha."}</p>
        </Reveal>
      </div>
    </section>

    <section className="section section-paper">
      <div className="container">
        <Reveal><div className="eyebrow">Nossa história</div><h2 className="section-title">Um testemunho contado em capítulos</h2><p className="lead">A história do Café com Testemunho não começou pronta. Ela foi atravessando dor, direção, retorno, recomeço e encontro.</p></Reveal>

        <div className="story-timeline">
          <div className="story-line" aria-hidden/>
          {story?.map((chapter,i)=><Reveal key={chapter.id} delay={Math.min(i*55,250)} className={"story-chapter "+(i%2?"story-chapter-right":"story-chapter-left")}>
            <article>
              <span className="story-number">{String(i+1).padStart(2,"0")}</span>
              <div className="eyebrow">{chapter.eyebrow}</div>
              <h3>{chapter.title}</h3>
              <p>{chapter.body}</p>
              {chapter.quote&&<blockquote>{chapter.quote}</blockquote>}
            </article>
          </Reveal>)}
        </div>
      </div>
    </section>

    {scripture&&<section className="section scripture-section">
      <div className="container"><Reveal className="scripture-panel wide"><div className="scripture-symbol">✦</div><div><div className="eyebrow">Uma palavra que acompanha essa história</div><blockquote>“{scripture.verse_text}”</blockquote><strong>{scripture.reference}</strong>{scripture.reflection&&<p>{scripture.reflection}</p>}</div></Reveal></div>
    </section>}

    <section className="section">
      <div className="container">
        <Reveal className="section-heading-row"><div><div className="eyebrow">Memórias</div><h2 className="section-title">Momentos que fazem parte dessa história</h2></div><Link className="text-link" href="/fotos">Ver todas as memórias <Images size={17}/></Link></Reveal>
        {photos?.length?<div className="about-photo-strip">{photos.map((p,i)=><Reveal key={p.id} delay={i*70} className="about-photo"><img src={p.url} alt={p.alt_text||"Momento do Café com Testemunho"} loading="lazy"/></Reveal>)}</div>:<Reveal><div className="photo-placeholder"><Images size={34}/><strong>Este capítulo também será contado em imagens</strong><span>As fotos dos encontros aparecerão aqui conforme forem sendo cadastradas.</span></div></Reveal>}
      </div>
    </section>

    <section className="section founder-testimony-section">
      <div className="container">
        <Reveal className="founder-testimony-card">
          <BookHeart size={34}/>
          <div className="eyebrow">Testemunho fundador</div>
          <h2>Leia o relato completo de Kathia Andreia</h2>
          <p>A narrativa desta página foi construída a partir do próprio testemunho que deu origem ao projeto. O relato completo também está preservado na área de testemunhos.</p>
          <Link className="btn btn-dark" href="/testemunhos/como-surgiu-o-cafe-com-testemunho">Ler testemunho completo <ArrowRight size={17}/></Link>
        </Reveal>
      </div>
    </section>

    {(instagram?.length||social?.url)&&<section className="section instagram-section">
      <div className="container">
        <Reveal className="section-heading-row"><div><div className="eyebrow">A história continua acontecendo</div><h2 className="section-title">@cafe_testemunho</h2></div>{social?.url&&<a className="text-link" href={social.url} target="_blank" rel="noreferrer">Acompanhar no Instagram <Instagram size={17}/></a>}</Reveal>
        {instagram?.length?<div className="grid grid-3">{instagram.map((p,i)=><Reveal key={p.id} delay={i*80}><a className="instagram-card" href={p.post_url} target="_blank" rel="noreferrer">{p.cover_url?<img src={p.cover_url} alt=""/>:<div className="instagram-card-placeholder"><Instagram size={34}/></div>}<div><span>Instagram</span><h3>{p.title||"Publicação do Café"}</h3><p>{p.caption}</p></div></a></Reveal>)}</div>:null}
      </div>
    </section>}

    <section className="section cta-section ambient-bg">
      <div className="ambient-orb orb-three"/>
      <div className="container"><Reveal className="cta-panel"><HeartHandshake size={35}/><div className="eyebrow">Faça parte</div><h2>{cta?.title??"Essa história continua sendo escrita"}</h2><p>{cta?.body??"O Café com Testemunho nasceu de um testemunho, mas hoje é formado por muitas histórias. Faça parte do próximo capítulo."}</p><div className="actions"><Link className="btn btn-primary" href="/agenda">Participar de um encontro</Link><Link className="btn btn-ghost-light" href="/enviar-testemunho">Compartilhar meu testemunho</Link>{social?.url&&<a className="btn btn-ghost-light" href={social.url} target="_blank" rel="noreferrer">Instagram</a>}</div></Reveal></div>
    </section>
  </main>
}