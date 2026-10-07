import Link from"next/link";
import{notFound}from"next/navigation";
import{createServerSupabaseClient}from"@/lib/supabase/server";
import{Reveal}from"@/components/reveal";
import{SectionWaveDivider}from"@/components/section-wave-divider";

export default async function TestemunhoPage({params}:{params:Promise<{slug:string}>}){
  const{slug}=await params;
  const s=await createServerSupabaseClient();
  const[{data:item},{data:hero}]=await Promise.all([
    s.from("testimonial_publications").select("*").eq("slug",slug).not("published_at","is",null).maybeSingle(),
    s.from("institutional_sections").select("image_url").eq("section_key","testimonials_hero").maybeSingle()
  ]);
  if(!item)notFound();

  const paragraphs=String(item.public_text||"").split(/\n+/).map((text:string)=>text.trim()).filter(Boolean);
  const heroStyle=hero?.image_url
    ?{backgroundImage:`linear-gradient(180deg,rgba(29,13,6,.48),rgba(31,14,7,.84)),url("${hero.image_url}")`}
    :undefined;

  return <main className="inner-page testimonial-detail-page">
    <section className="testimonial-detail-hero" style={heroStyle}>
      <div className="testimonial-detail-shade" aria-hidden="true"/>
      <div className="container testimonial-detail-hero-content">
        <Reveal className="testimonial-detail-hero-copy">
          <Link className="testimonial-detail-back" href="/testemunhos"><span aria-hidden="true">←</span> Testemunhos</Link>
          <div className="testimonials-eyebrow">UMA HISTÓRIA COMPARTILHADA</div>
          <h1>{item.public_title}</h1>
          {item.public_display_name&&<p>{item.public_display_name}</p>}
        </Reveal>
      </div>
    </section>

    <SectionWaveDivider tone="dark-light" lightSurface="paper" hero/>

    <section className="testimonial-reading-section">
      <div className="container testimonial-reading-column">
        <div className="testimonial-reading-topline" aria-hidden="true"/>
        {paragraphs.map((paragraph:string,index:number)=><Reveal key={index} delay={Math.min(index*30,180)} className={index===0?"testimonial-paragraph first":"testimonial-paragraph"}>
          <p>{paragraph}</p>
        </Reveal>)}
      </div>
    </section>

    <section className="testimonial-detail-next">
      <div className="container inner-narrow">
        <Reveal className="testimonial-detail-next-content">
          <div className="testimonials-eyebrow">OUTRAS HISTÓRIAS</div>
          <h2>Há outras histórias esperando para ser lidas.</h2>
          <Link href="/testemunhos">Continuar lendo testemunhos <span aria-hidden="true">→</span></Link>
        </Reveal>

        <Reveal className="testimonial-detail-share" delay={80}>
          <div className="testimonial-detail-share-rule" aria-hidden="true"/>
          <h3>Sua história também pode alcançar alguém.</h3>
          <Link href="/enviar-testemunho">Compartilhar meu testemunho <span aria-hidden="true">→</span></Link>
        </Reveal>
      </div>
    </section>
  </main>;
}
