import"./home-v3.css";
import Link from"next/link";
import{ArrowRight,CalendarDays,BookHeart,Instagram,Images,HeartHandshake,MapPin}from"lucide-react";
import{createServerSupabaseClient}from"@/lib/supabase/server";
import{Reveal}from"@/components/reveal";
import{InstagramCarousel}from"@/components/instagram-carousel";
import{CinematicScripture}from"@/components/cinematic-scripture";

export default async function HomePage(){
 const s=await createServerSupabaseClient(),now=new Date().toISOString();
 const[{data:sections},{data:event},{data:featured},{data:scripture},{data:photos},{data:instagram},{data:social},{data:brandSetting}]=await Promise.all([
  s.from("institutional_sections").select("*").in("section_key",["home_hero","home_intro","home_cta"]),
  s.from("events").select("*").eq("status","PUBLICADO").gte("starts_at",now).order("starts_at").limit(1).maybeSingle(),
  s.from("testimonial_publications").select("slug,public_title,public_excerpt,public_display_name,published_at").not("published_at","is",null).order("featured",{ascending:false}).order("published_at",{ascending:false}).limit(2),
  s.from("scripture_spotlights").select("*").eq("location","home").eq("visible",true).order("sort_order").limit(1).maybeSingle(),
  s.from("media_assets").select("id,url,alt_text,featured,created_at").eq("media_type","image").eq("is_private",false).order("featured",{ascending:false}).order("created_at",{ascending:false}).limit(6),
  s.from("instagram_highlights").select("id,post_url").eq("visible",true).in("location",["home","both"]).order("sort_order").limit(8),
  s.from("social_links").select("url").eq("icon_key","instagram").eq("visible",true).order("sort_order").limit(1).maybeSingle(),
  s.from("site_settings").select("value").eq("setting_key","brand").maybeSingle()
 ]);
 const hero=sections?.find(x=>x.section_key==="home_hero"),intro=sections?.find(x=>x.section_key==="home_intro"),cta=sections?.find(x=>x.section_key==="home_cta");
 const brand=(brandSetting?.value||{})as{name?:string;logo_url?:string};
 const heroSettings=(hero?.settings||{})as{logo_url?:string};
 const heroLogo=heroSettings.logo_url||brand.logo_url;
 const heroBackground=hero?.image_url?{backgroundImage:`linear-gradient(180deg,rgba(20,10,5,.18) 0%,rgba(20,10,5,.28) 42%,rgba(20,10,5,.82) 100%),url("${hero.image_url}")`}:undefined;
 const eventDate=event?.starts_at?new Intl.DateTimeFormat("pt-BR",{day:"2-digit",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit",timeZone:"America/Sao_Paulo"}).format(new Date(event.starts_at)):null;
 const storyTitle=String(intro?.title||"Um projeto que nasceu de um testemunho");
 const storyTitleParts=storyTitle.trim().split(/\s+/);
 const storyLastWord=storyTitleParts.pop()||"";
 const storyTitleLead=storyTitleParts.join(" ");
 const storyBackground=intro?.image_url?{backgroundImage:`linear-gradient(90deg,rgba(22,10,5,.90) 0%,rgba(22,10,5,.78) 48%,rgba(22,10,5,.35) 100%),url("${intro.image_url}")`}:undefined;
 return <>
  <header className={"home3-hero "+(hero?.image_url?"has-image":"")} style={heroBackground}><div className="home3-hero-inner">
   <Reveal className="home3-hero-brand">{heroLogo?<img className="home3-logo" src={heroLogo} alt={brand.name||"Café com Testemunho"}/>:<div className="home3-logo-fallback">Café com Testemunho</div>}</Reveal>
   <Reveal className="home3-hero-copy" delay={90}><span className="home3-kicker">{hero?.subtitle||"Fé · acolhimento · testemunho"}</span><h1>{hero?.title&&hero.title!=="Café com Testemunho"?hero.title:"Um lugar para ouvir, acolher e caminhar juntas."}</h1><p>{hero?.body??"Mulheres reunidas para compartilhar histórias, fortalecer a fé e lembrar que nenhum capítulo precisa ser vivido sozinho."}</p><div className="home3-hero-actions"><Link href={hero?.cta_url||"/sobre"}>{hero?.cta_label||"Conheça a história"} <ArrowRight size={17}/></Link><Link href="/agenda">Próximos encontros</Link></div></Reveal>
  </div></header>
  <main id="home-content" className="home3-main">
   {scripture&&<CinematicScripture verse={scripture.verse_text} reference={scripture.reference} reflection={scripture.reflection}/>}
   {intro?.visible!==false&&<section className={"home3-story "+(intro?.image_url?"has-image":"")} style={storyBackground}>
    <div className="home3-story-shade" aria-hidden="true"/>
    <div className="container home3-story-grid">
      <Reveal className="home3-story-copy">
        <div className="home3-story-kicker"><span>Nossa história</span><i/></div>
        <h2><span>{storyTitleLead}</span>{storyLastWord&&<em>{storyLastWord}</em>}</h2>
        <p>{intro?.body??"O Café com Testemunho começou de forma simples e cresceu encontro após encontro, preservando a mesma essência de acolhimento."}</p>
        <Link className="home3-story-link" href={intro?.cta_url||"/sobre"}>{intro?.cta_label||"Conhecer a história completa"} <ArrowRight size={17}/></Link>
      </Reveal>
    </div>
   </section>}
   {event&&<section className="home3-event-section"><div className="container"><Reveal><article className="home3-event">{event.cover_url&&<Link className="home3-event-cover" href={"/eventos/"+event.slug}><img src={event.cover_url} alt={"Capa do evento "+event.title}/></Link>}<div className="home3-event-copy"><span className="home3-kicker">Próximo encontro</span><h2>{event.title}</h2><p>{event.summary}</p><div className="home3-event-meta">{eventDate&&<span><CalendarDays size={18}/>{eventDate}</span>}{(event.venue||event.city)&&<span><MapPin size={18}/>{[event.venue,event.city].filter(Boolean).join(" · ")}</span>}</div><Link className="home3-event-link" href={"/eventos/"+event.slug}>Ver encontro <ArrowRight size={17}/></Link></div></article></Reveal></div></section>}
   {!!photos?.length&&<section className="home3-photos"><div className="container"><Reveal className="home3-section-head"><div><span className="home3-kicker">Memórias</span><h2>Momentos do Café</h2></div><Link href="/fotos">Ver galeria <Images size={17}/></Link></Reveal><div className="home3-photo-grid">{photos.map((p,i)=><Reveal key={p.id} delay={i*55} className={"home3-photo "+(i===0?"featured":"")}><img src={p.url} alt={p.alt_text||"Registro do Café com Testemunho"} loading="lazy"/></Reveal>)}</div></div></section>}
   {!!featured?.length&&<section className="home3-testimonies"><div className="container"><Reveal className="home3-section-head"><div><span className="home3-kicker">Histórias que acolhem</span><h2>Testemunhos</h2></div><Link href="/testemunhos">Ver todos <ArrowRight size={16}/></Link></Reveal><div className="home3-testimony-grid">{featured.map((t,i)=><Reveal key={t.slug} delay={i*70}><article className="home3-testimony"><BookHeart size={22}/><h3>{t.public_title}</h3><p>{t.public_excerpt}</p><small>{t.public_display_name}</small><Link href={"/testemunhos/"+t.slug}>Ler testemunho <ArrowRight size={15}/></Link></article></Reveal>)}</div></div></section>}
   {!!instagram?.length&&<section className="home3-instagram"><div className="container home3-instagram-layout"><Reveal className="home3-instagram-copy"><span className="home3-kicker">Do nosso Instagram</span><h2>@cafe_testemunho</h2><p>Um pouco dos encontros, mensagens e momentos que também compartilhamos por lá.</p>{social?.url&&<a href={social.url} target="_blank" rel="noreferrer">Abrir perfil <Instagram size={17}/></a>}</Reveal><Reveal delay={90}><InstagramCarousel posts={instagram}/></Reveal></div></section>}
   <section className="home3-cta"><div className="container"><Reveal className="home3-cta-inner"><HeartHandshake size={28}/><span className="home3-kicker">Faça parte</span><h2>{cta?.title??"Faça parte do próximo capítulo"}</h2><p>{cta?.body??"Essa história continua sendo escrita em cada encontro, em cada mulher que chega e em cada testemunho compartilhado."}</p><div><Link href="/agenda">Participar de um encontro</Link><Link href="/enviar-testemunho">Compartilhar meu testemunho</Link></div></Reveal></div></section>
  </main>
 </>;
}