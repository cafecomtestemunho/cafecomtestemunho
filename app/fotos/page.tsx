import Link from"next/link";
import{notFound}from"next/navigation";
import{createServerSupabaseClient}from"@/lib/supabase/server";
import{Reveal}from"@/components/reveal";
import{SectionWaveDivider}from"@/components/section-wave-divider";
import{PhotoShowcase}from"@/components/photo-showcase";

export const metadata={title:"Fotos"};

export default async function FotosPage(){
  const s=await createServerSupabaseClient();
  const[{data:photos},{data:hero},{data:instagram}]=await Promise.all([
    s.from("media_assets").select("id,url,alt_text,created_at,featured").eq("media_type","image").eq("is_private",false).order("featured",{ascending:false}).order("created_at",{ascending:false}),
    s.from("institutional_sections").select("*").eq("section_key","photos_hero").maybeSingle(),
    s.from("social_links").select("url").eq("icon_key","instagram").eq("visible",true).order("sort_order").limit(1).maybeSingle()
  ]);

  if(!photos?.length)notFound();

  const heroStyle=hero?.image_url
    ?{backgroundImage:`linear-gradient(180deg,rgba(28,14,7,.48),rgba(34,16,8,.80)),url("${hero.image_url}")`}
    :undefined;
  const instagramUrl=instagram?.url||"https://www.instagram.com/cafe_testemunho/";

  return <main className="inner-page photos-page">
    <section className="photos-hero-refined" style={heroStyle}>
      <div className="photos-hero-shade" aria-hidden="true"/>
      <div className="container photos-hero-content">
        <Reveal className="photos-hero-copy">
          <div className="photos-eyebrow">FOTOS</div>
          <h1>Momentos que falam por si</h1>
          <div className="photos-gold-rule" aria-hidden="true"/>
          <p>Registros dos encontros, da comunhão e das histórias que continuam sendo escritas.</p>
        </Reveal>
      </div>
    </section>

    <SectionWaveDivider tone="dark-light" lightSurface="paper" hero/>

    <section className="photos-gallery-section">
      <div className="container photos-gallery-heading">
        <Reveal>
          <div className="photos-eyebrow">GALERIA</div>
          <h2>Memórias em movimento</h2>
          <p>Toque em uma foto para ampliar e reviver cada detalhe.</p>
        </Reveal>
      </div>
      <Reveal delay={80}>
        <PhotoShowcase photos={photos.map(photo=>({id:photo.id,url:photo.url,alt_text:photo.alt_text}))}/>
      </Reveal>
    </section>

    <SectionWaveDivider tone="light-dark"/>

    <section className="photos-join-section">
      <div className="container inner-narrow">
        <Reveal className="photos-join-content">
          <div className="photos-eyebrow">CONTINUE PERTO</div>
          <h2>Os próximos momentos também podem ter você.</h2>
          <p>Participe dos próximos encontros e acompanhe no Instagram os registros, mensagens e novidades do Café com Testemunho.</p>
          <div className="photos-join-rule" aria-hidden="true"/>
          <div className="photos-join-actions">
            <Link href="/agenda">Ver próximos encontros <span aria-hidden="true">→</span></Link>
            <a href={instagramUrl} target="_blank" rel="noreferrer">Seguir @cafe_testemunho <span aria-hidden="true">→</span></a>
          </div>
        </Reveal>
      </div>
    </section>
  </main>;
}
