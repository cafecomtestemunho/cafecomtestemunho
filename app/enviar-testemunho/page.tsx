import type { Metadata } from "next";
import { BookOpen, Coffee, Heart } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Reveal } from "@/components/reveal";
import { TestimonialSubmitForm } from "@/components/testimonial-submit-form";
import "./submit-testimonial.css";

export const metadata: Metadata = {
  title: "Enviar testemunho",
  description: "Sua história pode tocar outras vidas. Compartilhe seu testemunho com o Café com Testemunho."
};

function updatedCopy(current: string | null | undefined, old: string, replacement: string) {
  return !current || current.trim() === old ? replacement : current;
}

export default async function EnviarTestemunhoPage() {
  const s = await createServerSupabaseClient();
  const [{ data: hero }, { data: intro }, { data: privacy }] = await Promise.all([
    s.from("institutional_sections").select("title,subtitle,body,image_url").eq("section_key", "submit_testimonial_hero").maybeSingle(),
    s.from("institutional_sections").select("title,body").eq("section_key", "submit_testimonial_intro").maybeSingle(),
    s.from("institutional_sections").select("body").eq("section_key", "submit_testimonial_privacy").maybeSingle()
  ]);

  const kicker = updatedCopy(hero?.subtitle, "Envie seu testemunho", "COMPARTILHE SEU TESTEMUNHO");
  const title = updatedCopy(hero?.title, "Seu relato chega primeiro de forma privada", "Sua história pode tocar outras vidas");
  const description = updatedCopy(
    hero?.body,
    "A equipe fará a leitura. Nada é publicado automaticamente.",
    "Se você viveu algo especial através do Café com Testemunho, compartilhe com a gente. Será uma alegria conhecer aquilo que Deus fez na sua vida."
  );
  const introTitle = updatedCopy(intro?.title, "Compartilhe sua história", "Queremos ouvir você");
  const introBody = updatedCopy(
    intro?.body,
    "Envie seu testemunho com tranquilidade. A publicação só acontece após revisão e respeitando sua autorização.",
    "Seu testemunho é precioso. Escreva com liberdade e carinho aquilo que você viveu, sentiu ou recebeu nesse caminho."
  );
  const privacyBody = updatedCopy(
    privacy?.body,
    "Nada é publicado automaticamente. A equipe lê primeiro e respeita a autorização informada por você.",
    "Seu relato será lido com carinho pela equipe antes de qualquer publicação."
  );
  const heroStyle = hero?.image_url
    ? { backgroundImage: "linear-gradient(135deg,rgba(43,20,9,.88),rgba(54,27,13,.68)),url(" + JSON.stringify(hero.image_url) + ")" }
    : undefined;

  return <main className="inner-page submit-story-page">
    <section className="submit-story-hero" style={heroStyle}>
      <div className="submit-story-light" aria-hidden="true" />
      <div className="submit-story-art" aria-hidden="true">
        <Coffee className="submit-story-coffee" strokeWidth={1} />
        <BookOpen className="submit-story-book" strokeWidth={1} />
      </div>
      <div className="container submit-story-hero-content">
        <Reveal>
          <div className="submit-story-eyebrow">{kicker}</div>
          <div className="submit-story-line" aria-hidden="true"><span /><Heart size={14} /><span /></div>
          <h1>{title}</h1>
          <p>{description}</p>
        </Reveal>
      </div>
      <div className="submit-story-wave" aria-hidden="true">
        <svg viewBox="0 0 1440 84" preserveAspectRatio="none" focusable="false">
          <path d="M0 30 C250 -4 465 76 740 51 C1050 18 1210 7 1440 42 L1440 84 L0 84 Z" />
        </svg>
      </div>
    </section>
    <section className="submit-story-section">
      <div className="container submit-story-form-wrap">
        <Reveal>
          <TestimonialSubmitForm introTitle={introTitle} introBody={introBody} privacyBody={privacyBody} />
        </Reveal>
      </div>
    </section>
  </main>;
}
