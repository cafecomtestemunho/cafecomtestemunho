import Link from"next/link";
import{createServerSupabaseClient}from"@/lib/supabase/server";
import{Reveal}from"@/components/reveal";
import{SectionWaveDivider}from"@/components/section-wave-divider";
import{TestimonyWordCycle}from"@/components/testimony-word-cycle";
import{TestimonyTitleRail}from"@/components/testimony-title-rail";

export const metadata={title:"Testemunhos"};

export default async function TestemunhosPage(){
  const s=await createServerSupabaseClient();
  const[{data:items},{data:hero},{data:cta}]=await Promise.all([
    s.from("testimonial_publications").select("slug,public_title,public_excerpt,public_display_name,published_at").not("published_at","is",null).order("published_at",{ascending:false}),
    s.from("institutional_sections").select("*").eq("section_key","testimonials_hero").maybeSingle(),
    s.from("institutional_sections").select("*").eq("section_key","testimonials_cta").maybeSingle()
  ]);

  const founder=items?.find(item=>item.slug==="como-surgiu-o-cafe-com-testemunho")||items?.[0];
  const others=(items||[]).filter(item=>item.slug!==founder?.slug);
  const heroStyle=hero?.image_url
    ?{backgroundImage:`linear-gradient(180deg,rgba(29,13,6,.44),rgba(31,14,7,.82)),url("${hero.image_url}")`}
    :undefined;

  return <main className="inner-page testimonials-page">
    <section className="testimonials-hero-refined" style={heroStyle}>
      <div className="testimonials-hero-shade" aria-hidden="true"/>
      <div className="container testimonials-hero-content">
        <Reveal className="testimonials-hero-copy testimonials-hero-cycle-only">
          <TestimonyWordCycle/>
        </Reveal>
      </div>
    </section>

    <SectionWaveDivider tone="dark-light" lightSurface="founder" hero/>

    <section className="testimonials-founder-section">
      <div className="container inner-narrow">
        <Reveal className="testimonials-founder-intro">
          <div className="testimonials-eyebrow">ONDE TUDO COMEÇOU</div>
          <h2>O testemunho que deu início ao Café.</h2>
          <p>O Café com Testemunho nasceu de uma história real. Antes de existirem encontros, havia uma experiência que precisava ser compartilhada.</p>
        </Reveal>

        {founder&&<Reveal delay={80}>
          <article className="testimonials-founder-story">
            <div className="testimonials-story-rule" aria-hidden="true"/>
            <h3>{founder.public_title}</h3>
            {founder.public_excerpt&&<p>{founder.public_excerpt}</p>}
            {founder.public_display_name&&<small>{founder.public_display_name}</small>}
            <Link href={"/testemunhos/"+founder.slug}>Ler como tudo começou <span aria-hidden="true">→</span></Link>
          </article>
        </Reveal>}

        {!founder&&<Reveal><div className="testimonials-empty">As primeiras histórias estão chegando.</div></Reveal>}
      </div>
    </section>

    {others.length>0&&<section className="testimonials-growing-section">
      <div className="container inner-narrow">
        <Reveal className="testimonials-growing-intro">
          <div className="testimonials-eyebrow">HISTÓRIAS QUE CONTINUAM CHEGANDO</div>
          <h2>Cada nova história amplia esta conversa.</h2>
          <p>Algumas histórias já podem ser lidas aqui. Outras ainda estão sendo escritas. Todas carregam algo que pode alcançar outra mulher.</p>
        </Reveal>
      </div>

      <Reveal delay={70}>
        <TestimonyTitleRail items={others.map(item=>({slug:item.slug,title:item.public_title}))}/>
      </Reveal>

      <div className="container inner-narrow testimonials-story-list">
        {others.map((item,index)=><Reveal key={item.slug} delay={Math.min(index*55,220)} className={index%2===0?"testimonials-story-reveal from-left":"testimonials-story-reveal from-right"}>
          <article className="testimonials-story-card">
            <div className="testimonials-story-rule" aria-hidden="true"/>
            <h3>{item.public_title}</h3>
            {item.public_excerpt&&<p>{item.public_excerpt}</p>}
            {item.public_display_name&&<small>{item.public_display_name}</small>}
            <Link href={"/testemunhos/"+item.slug}>Ler testemunho <span aria-hidden="true">→</span></Link>
          </article>
        </Reveal>)}
      </div>
    </section>}

    {cta?.visible!==false&&<SectionWaveDivider tone="light-dark"/>}

    {cta?.visible!==false&&<section className="testimonials-cta-section">
      <div className="container inner-narrow">
        <Reveal className="testimonials-cta-content">
          <div className="testimonials-eyebrow">SUA HISTÓRIA TAMBÉM IMPORTA</div>
          <h2>Talvez o próximo testemunho seja o seu.</h2>
          <p>Você pode compartilhar sua história de forma privada. Ela só será publicada se você autorizar.</p>
          <Link href={cta?.cta_url||"/enviar-testemunho"}>Compartilhar meu testemunho <span aria-hidden="true">→</span></Link>
        </Reveal>
      </div>
    </section>}
  </main>;
}
