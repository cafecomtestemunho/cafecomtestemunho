import Link from"next/link";
import{ArrowRight,BookHeart,Quote}from"lucide-react";
import{createServerSupabaseClient}from"@/lib/supabase/server";
import{Reveal}from"@/components/reveal";

export const metadata={title:"Testemunhos"};

export default async function TestemunhosPage(){
  const s=await createServerSupabaseClient();
  const[{data:items},{data:hero},{data:intro}]=await Promise.all([
    s.from("testimonial_publications").select("slug,public_title,public_excerpt,public_display_name,published_at").not("published_at","is",null).order("published_at",{ascending:false}),
    s.from("institutional_sections").select("*").eq("section_key","testimonials_hero").maybeSingle(),
    s.from("institutional_sections").select("*").eq("section_key","testimonials_intro").maybeSingle()
  ]);
  const founder=items?.find(x=>x.slug==="como-surgiu-o-cafe-com-testemunho")||items?.[0];
  const others=items?.filter(x=>x.slug!==founder?.slug)||[];
  const heroStyle=hero?.image_url?{backgroundImage:`linear-gradient(90deg,rgba(38,19,9,.9),rgba(38,19,9,.5)),url("${hero.image_url}")`}:undefined;
  return <main className="inner-page">
    <section className="inner-hero inner-testimonials-hero" style={heroStyle}><div className="inner-hero-ornament" aria-hidden/><div className="container inner-hero-content solo"><Reveal className="inner-hero-copy"><div className="inner-kicker">{hero?.subtitle||"Testemunhos"}</div><h1>{hero?.title||"Histórias reais que inspiram"}</h1><p>{hero?.body||"Relatos de vida, fé e recomeços que mostram o cuidado de Deus em cada detalhe."}</p><Link className="inner-btn primary" href="/enviar-testemunho">Enviar meu testemunho</Link></Reveal></div><div className="inner-hero-curve" aria-hidden/></section>
    <section className="inner-section inner-paper"><div className="container inner-narrow">
      {founder&&<Reveal><article className="founder-story"><BookHeart size={24}/><div className="inner-kicker">Testemunho fundador</div><h2>{founder.public_title}</h2><p>{founder.public_excerpt}</p><small>{founder.public_display_name}</small><Link href={"/testemunhos/"+founder.slug}>Ler testemunho completo <ArrowRight size={16}/></Link></article></Reveal>}
      <Reveal className="inner-section-intro compact testimony-list-intro"><div className="inner-kicker">{intro?.subtitle||"Outros testemunhos"}</div><h2>{intro?.title||"Mulheres que também fazem parte dessa história"}</h2>{intro?.body&&<p>{intro.body}</p>}</Reveal>
      <div className="testimony-list">{others.map((t,i)=><Reveal key={t.slug} delay={Math.min(i*45,220)}><article className="testimony-quote"><Quote size={22}/><div><h3>{t.public_title}</h3><p>{t.public_excerpt}</p><small>{t.public_display_name}</small><Link href={"/testemunhos/"+t.slug}>Ler testemunho <ArrowRight size={15}/></Link></div></article></Reveal>)}</div>
      {!items?.length&&<div className="inner-empty">Os testemunhos aprovados aparecerão aqui.</div>}
    </div></section>
  </main>
}