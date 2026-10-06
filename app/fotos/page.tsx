import{createServerSupabaseClient}from"@/lib/supabase/server";
import{Reveal}from"@/components/reveal";
import{BrandMark}from"@/components/brand-mark";
import{Images}from"lucide-react";

export const metadata={title:"Fotos"};

export default async function FotosPage(){
  const s=await createServerSupabaseClient();
  const[{data:photos},{data:albums}]=await Promise.all([
    s.from("media_assets").select("id,url,alt_text,created_at,album_id,featured").eq("media_type","image").eq("is_private",false).order("featured",{ascending:false}).order("created_at",{ascending:false}),
    s.from("photo_albums").select("*").eq("visible",true).order("sort_order").order("created_at",{ascending:false})
  ]);

  return <main>
    <section className="hero gallery-hero ambient-bg"><div className="ambient-orb orb-one"/><div className="container gallery-hero-grid"><Reveal><BrandMark compact/></Reveal><Reveal delay={100}><div className="eyebrow">Memórias</div><h1>Fotos do Café</h1><p>Registros dos encontros, momentos de comunhão e capítulos que fazem parte da história do projeto.</p></Reveal></div></section>

    <section className="section section-paper"><div className="container">
      {albums?.length?<><Reveal><div className="eyebrow">Álbuns</div><h2 className="section-title">Histórias organizadas por encontro</h2></Reveal><div className="album-row">{albums.map((a,i)=>{const count=photos?.filter(p=>p.album_id===a.id).length||0;return <Reveal key={a.id} delay={i*60}><article className="album-card"><div className="album-cover">{a.cover_url?<img src={a.cover_url} alt=""/>:<Images size={28}/>}</div><div><span>{count} {count===1?"foto":"fotos"}</span><h3>{a.title}</h3><p>{a.description}</p></div></article></Reveal>})}</div></>:null}

      <Reveal><div className="section-heading-row gallery-heading"><div><div className="eyebrow">Galeria completa</div><h2 className="section-title">Momentos do Café</h2></div></div></Reveal>
      {photos?.length?<div className="gallery">{photos.map((photo,i)=><Reveal key={photo.id} delay={Math.min(i*35,250)}><figure className="photo-card"><img src={photo.url} alt={photo.alt_text||"Registro do Café com Testemunho"} loading="lazy"/>{photo.alt_text&&<figcaption>{photo.alt_text}</figcaption>}</figure></Reveal>)}</div>:<Reveal><div className="card empty">As fotos dos encontros aparecerão aqui aos poucos.</div></Reveal>}
    </div></section>
  </main>
}