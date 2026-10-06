import Link from"next/link";
import{ArrowRight,BookHeart,HeartHandshake}from"lucide-react";
import{createServerSupabaseClient}from"@/lib/supabase/server";
import{Reveal}from"@/components/reveal";
import{AboutScripture}from"@/components/about-scripture";

export const metadata={title:"Sobre"};

export default async function SobrePage(){
  const s=await createServerSupabaseClient();
  const[{data:mission},{data:story},{data:scripture},{data:photos},{data:founder},{data:wordSection},{data:photosSection},{data:testimonySection},{data:cta},{data:brandSetting}]=await Promise.all([
    s.from("institutional_sections").select("*").eq("section_key","about_mission").maybeSingle(),
    s.from("story_chapters").select("*").eq("visible",true).order("sort_order"),
    s.from("scripture_spotlights").select("*").eq("location","about").eq("visible",true).order("sort_order").limit(1).maybeSingle(),
    s.from("media_assets").select("id,url,alt_text,created_at").eq("media_type","image").eq("is_private",false).order("created_at",{ascending:false}).limit(6),
    s.from("testimonial_publications").select("slug,public_title,public_excerpt,public_display_name").eq("slug","como-surgiu-o-cafe-com-testemunho").maybeSingle(),
    s.from("institutional_sections").select("*").eq("section_key","about_word").maybeSingle(),
    s.from("institutional_sections").select("*").eq("section_key","about_photos").maybeSingle(),
    s.from("institutional_sections").select("*").eq("section_key","about_testimony").maybeSingle(),
    s.from("institutional_sections").select("*").eq("section_key","about_cta").maybeSingle(),
    s.from("site_settings").select("value").eq("setting_key","brand").maybeSingle()
  ]);
  const brand=(brandSetting?.value||{})as{name?:string;logo_url?:string};
  const heroStyle=mission?.image_url?{backgroundImage:`linear-gradient(180deg,rgba(34,17,8,.42),rgba(34,17,8,.76)),url("${mission.image_url}")`}:undefined;

  return <main className="inner-page">
    <section className="about-hero-refined" style={heroStyle}>
      <div className="about-hero-glow" aria-hidden="true"/>
      <div className="container about-hero-layout">
        {brand.logo_url&&<Reveal className="about-hero-logo-wrap"><img className="about-hero-logo" src={brand.logo_url} alt={brand.name||"Café com Testemunho"}/></Reveal>}
        <Reveal delay={90} className="about-hero-copy-refined">
          <div className="about-hero-kicker">{mission?.subtitle||"Para reunir, acolher e fortalecer mulheres por meio da fé e de testemunhos reais."}</div>
          <h1>{mission?.title||"Por que existimos"}</h1>
          <p>{mission?.body||"Cada encontro é um capítulo do projeto. As histórias compartilhadas formam uma memória viva de recomeços, aprendizados e esperança."}</p>
        </Reveal>
      </div>
      <div className="about-hero-curve" aria-hidden="true"/>
    </section>

    <section className="inner-section inner-paper">
      <div className="container inner-narrow">
        <Reveal className="inner-section-intro">
          <div className="inner-kicker">Nossa história</div>
          <h2>Como tudo começou</h2>
          <p>Um testemunho contado em capítulos, com espaço para respirar, lembrar e reconhecer cada passo dessa caminhada.</p>
        </Reveal>
        <div className="inner-timeline">
          <div className="inner-timeline-line" aria-hidden/>
          {story?.map((chapter,i)=><Reveal key={chapter.id} delay={Math.min(i*55,260)} className="inner-timeline-item">
            <span className="inner-timeline-number">{String(i+1).padStart(2,"0")}</span>
            <article>
              {chapter.eyebrow&&<div className="inner-kicker">{chapter.eyebrow}</div>}
              <h3>{chapter.title}</h3>
              <p>{chapter.body}</p>
              {chapter.quote&&<blockquote>{chapter.quote}</blockquote>}
            </article>
          </Reveal>)}
        </div>
      </div>
    </section>

    {wordSection?.visible!==false&&scripture&&<AboutScripture verse={scripture.verse_text} reference={scripture.reference} reflection={scripture.reflection} kicker={wordSection?.subtitle}/>} 

    {photosSection?.visible!==false&&!!photos?.length&&<section className="inner-section inner-memory-section">
      <div className="container inner-narrow">
        <Reveal className="inner-section-head"><div><div className="inner-kicker">{photosSection?.subtitle||"Memórias"}</div><h2>{photosSection?.title||"Momentos que fazem parte dessa história"}</h2>{photosSection?.body&&<p>{photosSection.body}</p>}</div><Link href="/fotos">Ver todas <ArrowRight size={16}/></Link></Reveal>
        <div className="inner-photo-strip">{photos.map((photo,i)=><Reveal key={photo.id} delay={i*45}><figure><img src={photo.url} alt={photo.alt_text||"Memória do Café com Testemunho"} loading="lazy"/></figure></Reveal>)}</div>
      </div>
    </section>}

    {testimonySection?.visible!==false&&<section className="inner-founder">
      <div className="container inner-narrow"><Reveal className="inner-founder-panel">
        <BookHeart size={25}/>
        <div className="inner-kicker">{testimonySection?.subtitle||"Testemunho fundador"}</div>
        <h2>{testimonySection?.title||founder?.public_title||"Leia o relato completo de Kathia Andreia"}</h2>
        <p>{testimonySection?.body||founder?.public_excerpt||"A narrativa desta página nasceu do testemunho que deu origem ao projeto. O relato completo está preservado na área de testemunhos."}</p>
        <Link href={founder?"/testemunhos/"+founder.slug:"/testemunhos"}>Ler testemunho completo <ArrowRight size={16}/></Link>
      </Reveal></div>
    </section>}

    {cta?.visible!==false&&<section className="inner-closing">
      <div className="container inner-narrow"><Reveal className="inner-closing-copy"><HeartHandshake size={26}/><div className="inner-kicker">Faça parte</div><h2>{cta?.title||"Essa história continua sendo escrita"}</h2><p>{cta?.body||"Cada encontro, cada mulher e cada testemunho acrescentam um novo capítulo a essa caminhada."}</p><div className="inner-actions"><Link className="inner-btn primary" href={cta?.cta_url||"/agenda"}>{cta?.cta_label||"Participar de um encontro"} <ArrowRight size={16}/></Link><Link className="inner-btn ghost" href="/enviar-testemunho">Compartilhar meu testemunho</Link></div></Reveal></div>
    </section>}
  </main>
}