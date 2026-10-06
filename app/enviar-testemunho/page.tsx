import{createServerSupabaseClient}from"@/lib/supabase/server";
import{Reveal}from"@/components/reveal";
import{TestimonialSubmitForm}from"@/components/testimonial-submit-form";

export const metadata={title:"Enviar testemunho"};

export default async function EnviarTestemunhoPage(){
  const s=await createServerSupabaseClient();
  const[{data:hero},{data:intro},{data:privacy}]=await Promise.all([
    s.from("institutional_sections").select("*").eq("section_key","submit_testimonial_hero").maybeSingle(),
    s.from("institutional_sections").select("*").eq("section_key","submit_testimonial_intro").maybeSingle(),
    s.from("institutional_sections").select("*").eq("section_key","submit_testimonial_privacy").maybeSingle()
  ]);
  const heroStyle=hero?.image_url?{backgroundImage:`linear-gradient(90deg,rgba(38,19,9,.88),rgba(38,19,9,.48)),url("${hero.image_url}")`}:undefined;
  return <main className="inner-page">
    <section className="inner-hero inner-submit-hero" style={heroStyle}><div className="inner-hero-ornament" aria-hidden/><div className="container inner-hero-content solo"><Reveal className="inner-hero-copy centered"><div className="inner-kicker">{hero?.subtitle||"Enviar testemunho"}</div><h1>{hero?.title||"Compartilhe sua história"}</h1><p>{hero?.body||"Seu testemunho pode inspirar outras mulheres. Ele chega primeiro de forma privada e nada é publicado automaticamente."}</p></Reveal></div><div className="inner-hero-curve" aria-hidden/></section>
    <section className="inner-section inner-paper"><div className="container inner-form-wrap"><Reveal><TestimonialSubmitForm introTitle={intro?.title} introBody={intro?.body} privacyTitle={privacy?.title} privacyBody={privacy?.body}/></Reveal></div></section>
  </main>;
}
