import Link from"next/link";
import{ArrowRight,BookHeart,HeartHandshake}from"lucide-react";
import{createServerSupabaseClient}from"@/lib/supabase/server";
import{Reveal}from"@/components/reveal";
import{AboutScripture}from"@/components/about-scripture";

export const metadata={title:"Sobre"};

function AboutDivider({tone,floral=false}:{tone:"light-dark"|"dark-light";floral?:boolean}){
  return <div className={"about-wave-divider about-wave-"+tone+(floral?" about-wave-with-floral":"")} aria-hidden="true">
    <svg className="about-wave-svg" viewBox="0 0 1200 76" preserveAspectRatio="none">
      <path className="about-wave-soft" d="M0 34 C165 24 292 39 430 37 C600 35 722 17 874 23 C1008 28 1105 36 1200 29 L1200 76 L0 76 Z"/>
      <path className="about-wave-main" d="M0 46 C170 35 300 49 445 47 C608 45 731 29 878 34 C1016 39 1113 47 1200 40 L1200 76 L0 76 Z"/>
      <path className="about-wave-line" d="M0 39 C168 29 298 43 438 41 C604 39 727 23 876 28 C1011 33 1108 41 1200 34"/>
    </svg>
    {floral&&<>
      <svg className="about-wave-floral-svg about-wave-floral-left" viewBox="0 0 240 92">
        <path d="M5 83 C39 75 61 59 86 43 C112 27 139 35 166 24 C193 13 214 7 235 5"/>
        <path d="M67 55 C56 43 50 34 49 24 M87 43 C94 29 105 19 119 12 M126 36 C123 23 127 12 137 5 M160 26 C168 16 179 9 192 6"/>
        <ellipse cx="49" cy="24" rx="9" ry="4" transform="rotate(34 49 24)"/>
        <ellipse cx="87" cy="43" rx="10" ry="4" transform="rotate(-48 87 43)"/>
        <ellipse cx="126" cy="36" rx="10" ry="4" transform="rotate(45 126 36)"/>
        <ellipse cx="160" cy="26" rx="10" ry="4" transform="rotate(-45 160 26)"/>
        <circle cx="203" cy="8" r="2.4"/><circle cx="211" cy="6" r="1.9"/><circle cx="218" cy="5" r="1.7"/>
      </svg>
      <svg className="about-wave-floral-svg about-wave-floral-right" viewBox="0 0 240 92">
        <path d="M5 83 C39 75 61 59 86 43 C112 27 139 35 166 24 C193 13 214 7 235 5"/>
        <path d="M67 55 C56 43 50 34 49 24 M87 43 C94 29 105 19 119 12 M126 36 C123 23 127 12 137 5 M160 26 C168 16 179 9 192 6"/>
        <ellipse cx="49" cy="24" rx="9" ry="4" transform="rotate(34 49 24)"/>
        <ellipse cx="87" cy="43" rx="10" ry="4" transform="rotate(-48 87 43)"/>
        <ellipse cx="126" cy="36" rx="10" ry="4" transform="rotate(45 126 36)"/>
        <ellipse cx="160" cy="26" rx="10" ry="4" transform="rotate(-45 160 26)"/>
        <circle cx="203" cy="8" r="2.4"/><circle cx="211" cy="6" r="1.9"/><circle cx="218" cy="5" r="1.7"/>
      </svg>
    </>}
  </div>;
}

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
  const hasPhotos=photosSection?.visible!==false&&!!photos?.length;

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

    {wordSection?.visible!==false&&scripture&&<AboutWave direction="light-dark"/>}
    {wordSection?.visible!==false&&scripture&&<AboutScripture verse={scripture.verse_text} reference={scripture.reference} reflection={scripture.reflection} kicker={wordSection?.subtitle}/>} 
    {wordSection?.visible!==false&&scripture&&<AboutDivider tone="dark-light"/>}


    {hasPhotos&&<section className="inner-section inner-memory-section">
      <div className="container inner-narrow">
        <Reveal className="inner-section-head"><div><div className="inner-kicker">{photosSection?.subtitle||"Memórias"}</div><h2>{photosSection?.title||"Momentos que fazem parte dessa história"}</h2>{photosSection?.body&&<p>{photosSection.body}</p>}</div><Link href="/fotos">Ver todas <ArrowRight size={16}/></Link></Reveal>
        <div className="inner-photo-strip">{photos.map((photo,i)=><Reveal key={photo.id} delay={i*45}><figure><img src={photo.url} alt={photo.alt_text||"Memória do Café com Testemunho"} loading="lazy"/></figure></Reveal>)}</div>
      </div>
    </section>}


    {testimonySection?.visible!==false&&<section className="founder-reference">
      <div className="container inner-narrow">
        <Reveal className="founder-reference-content">
          <div className="founder-reference-icon" aria-hidden="true"><BookHeart size={19}/></div>
          <div className="inner-kicker">{testimonySection?.subtitle||"Testemunho fundador"}</div>
          <h2>{testimonySection?.title||founder?.public_title||"Como surgiu o Café com Testemunho"}</h2>
          <div className="founder-reference-accent" aria-hidden="true"><span/><i/><span/></div>
          <p>{testimonySection?.body||founder?.public_excerpt||"Aquilo que começou em um dos momentos mais dolorosos da vida de Kathia Andreia foi crescendo e se tornando o Café com Testemunho."}</p>
          {founder?.public_display_name&&<small>{founder.public_display_name}</small>}
          <Link className="founder-reference-link" href={founder?"/testemunhos/"+founder.slug:"/testemunhos"}>
            <span>Ler testemunho completo</span><ArrowRight size={15}/>
          </Link>
        </Reveal>
      </div>
    </section>}


    {testimonySection?.visible!==false&&cta?.visible!==false&&<AboutDivider tone="light-dark" floral/>}

    {testimonySection?.visible!==false&&cta?.visible!==false&&<AboutWave direction="light-dark" floral/>}

    {cta?.visible!==false&&<section className="inner-closing">
      <div className="container inner-narrow"><Reveal className="inner-closing-copy"><HeartHandshake size={26}/><div className="inner-kicker">Faça parte</div><h2>{cta?.title||"Essa história continua sendo escrita"}</h2><p>{cta?.body||"Cada encontro, cada mulher e cada testemunho acrescentam um novo capítulo a essa caminhada."}</p><div className="inner-actions"><Link className="inner-btn primary" href={cta?.cta_url||"/agenda"}>{cta?.cta_label||"Participar de um encontro"} <ArrowRight size={16}/></Link><Link className="inner-btn ghost" href="/enviar-testemunho">Compartilhar meu testemunho</Link></div></Reveal></div>
    </section>}
  </main>
}