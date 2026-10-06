import{Images}from"lucide-react";
import{createServerSupabaseClient}from"@/lib/supabase/server";
import{Reveal}from"@/components/reveal";

export const metadata={title:"Fotos"};

export default async function FotosPage(){
  const s=await createServerSupabaseClient();
  const[{data:photos},{data:albums},{data:hero},{data:intro}]=await Promise.all([
    s.from("media_assets").select("id,url,alt_text,created_at,album_id,featured").eq("media_type","image").eq("is_private",false).order("featured",{ascending:false}).order("created_at",{ascending:false}),
    s.from("photo_albums").select("*").eq("visible",true).order("sort_order").order("created_at",{ascending:false}),
    s.from("institutional_sections").select("*").eq("section_key","photos_hero").maybeSingle(),
    s.from("institutional_sections").select("*").eq("section_key","photos_intro").maybeSingle()
  ]);
  const heroStyle=hero?.image_url?{backgroundImage:`linear-gradient(90deg,rgba(38,19,9,.88),rgba(38,19,9,.48)),url("${hero.image_url}")`}:undefined;
  return <main className="inner-page">
    <section className="inner-hero inner-photos-hero" style={heroStyle}><div className="inner-hero-ornament" aria-hidden/><div className="container inner-hero-content solo"><Reveal className="inner-hero-copy"><div className="inner-kicker">{hero?.subtitle||"Memórias"}</div><h1>{hero?.title||"Momentos do Café"}</h1><p>{hero?.body||"Registros dos encontros, capítulos e tudo o que torna essa história especial."}</p></Reveal></div><div className="inner-hero-curve" aria-hidden/></section>
    <section className="inner-section inner-paper"><div className="container inner-narrow">
      {albums?.length?<><Reveal className="inner-section-intro compact"><div className="inner-kicker">{intro?.subtitle||"Álbuns"}</div><h2>{intro?.title||"Nossos encontros em imagens"}</h2><p>{intro?.body||"Cada foto carrega um pedacinho do que Deus tem feito."}</p></Reveal><div className="album-scroll">{albums.map((a,i)=>{const cover=a.cover_url||photos?.find(p=>p.album_id===a.id)?.url;const count=photos?.filter(p=>p.album_id===a.id).length||0;return <Reveal key={a.id} delay={i*45}><article className="album-tile">{cover?<img src={cover} alt="" loading="lazy"/>:<div className="album-fallback"><Images size={26}/></div>}<div><h3>{a.title}</h3><span>{count} {count===1?"foto":"fotos"}</span></div></article></Reveal>})}</div></>:null}
      <Reveal className="inner-section-intro gallery-intro"><div className="inner-kicker">Galeria</div><h2>Momentos que falam por si</h2></Reveal>
      {photos?.length?<div className="photo-masonry">{photos.map((photo,i)=><Reveal key={photo.id} delay={Math.min(i*35,210)}><figure><img src={photo.url} alt={photo.alt_text||"Registro do Café com Testemunho"} loading="lazy"/>{photo.alt_text&&<figcaption>{photo.alt_text}</figcaption>}</figure></Reveal>)}</div>:<Reveal><div className="inner-empty photos-empty"><Images size={28}/><strong>As primeiras memórias estão chegando</strong><span>As fotos dos encontros aparecerão aqui conforme forem cadastradas.</span></div></Reveal>}
    </div></section>
  </main>
}