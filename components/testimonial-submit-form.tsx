"use client";

import { useState } from "react";
import { Heart, Instagram, PenLine, Send, ShieldCheck, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type SubmissionStatus = "idle" | "sending" | "done" | "error";

function normalizeInstagram(value: string): string | null | undefined {
  const raw = value.trim();
  if (!raw) return null;
  const handle = raw
    .replace(/^https?:\/\/(?:www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .replace(/\/$/, "");
  return /^[a-zA-Z0-9._]{1,30}$/.test(handle) ? "@" + handle : undefined;
}

export function TestimonialSubmitForm({
  introTitle,
  introBody,
  privacyBody
}: {
  introTitle?: string | null;
  introBody?: string | null;
  privacyBody?: string | null;
}) {
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "").replace(/\s+/g, " ").trim();
    const originalText = String(data.get("original_text") || "").trim();
    const instagram = normalizeInstagram(String(data.get("instagram") || ""));

    if (name.length < 2 || name.length > 160) {
      setStatus("error");
      setMessage("Informe seu nome.");
      return;
    }
    if (instagram === undefined) {
      setStatus("error");
      setMessage("Confira seu Instagram. Use @usuario ou o link do seu perfil.");
      return;
    }
    if (originalText.length < 20 || originalText.length > 12000) {
      setStatus("error");
      setMessage("Seu testemunho precisa ter pelo menos 20 caracteres.");
      return;
    }

    setStatus("sending");
    setMessage("");
    try {
      const supabase = createClient();
      const { error } = await supabase.from("testimonials").insert({
        display_name_original: name,
        contact_instagram: instagram,
        original_text: originalText,
        publication_consent: data.get("publication_opt_in") === "yes" ? "NAMED" : "PRIVATE_ONLY",
        privacy_consent_at: new Date().toISOString(),
        privacy_notice_version: "2026-10"
      });
      if (error) throw error;
      form.reset();
      setStatus("done");
    } catch {
      setStatus("error");
      setMessage("Não conseguimos enviar seu testemunho agora. Tente novamente em instantes.");
    }
  }

  if (status === "done") return <div className="submit-story-form testimonial-form submit-story-success" role="status">
    <Heart size={38} strokeWidth={1.5} />
    <div className="submit-story-eyebrow">TESTEMUNHO RECEBIDO</div>
    <h2>Obrigada por compartilhar sua história!</h2>
    <p>Seu testemunho chegou até nós e será lido com carinho pela equipe.</p>
    <button type="button" onClick={() => setStatus("idle")} className="submit-story-again">Escrever outro testemunho</button>
  </div>;

  return <form className="testimonial-form submit-story-form" onSubmit={submit}>
    <header className="submit-story-form-header">
      <div className="submit-story-form-eyebrow"><Heart size={20} strokeWidth={1.6} aria-hidden="true" /> CONTE PRA GENTE</div>
      <h2>{introTitle || "Queremos ouvir você"}</h2>
      <p>{introBody || "Seu testemunho é precioso. Escreva com liberdade e carinho aquilo que você viveu, sentiu ou recebeu nesse caminho."}</p>
    </header>

    <div className="submit-story-fields">
      <label>
        <span>Seu nome</span>
        <div className="submit-story-input"><UserRound aria-hidden="true" size={21} /><input name="name" autoComplete="name" required minLength={2} maxLength={160} placeholder="Digite seu nome" /></div>
      </label>
      <label>
        <span>Seu Instagram <small>(opcional)</small></span>
        <div className="submit-story-input"><Instagram aria-hidden="true" size={21} /><input name="instagram" autoComplete="off" inputMode="text" maxLength={100} placeholder="@seuinstagram" /></div>
      </label>
      <label>
        <span>Seu testemunho</span>
        <div className="submit-story-input submit-story-textarea"><PenLine aria-hidden="true" size={21} /><textarea name="original_text" required minLength={20} maxLength={12000} placeholder="Escreva aqui sua história, experiência ou aquilo que Deus fez na sua vida..." /></div>
      </label>
    </div>

    <label className="submit-story-consent">
      <input type="checkbox" name="publication_opt_in" value="yes" />
      <span>Autorizo a publicação do meu testemunho com meu nome, após a revisão da equipe.<small>Sem marcar, seu relato será recebido somente de forma privada.</small></span>
    </label>

    {status === "error" && <p className="submit-story-error" role="alert">{message}</p>}
    <button className="submit-story-button" type="submit" disabled={status === "sending"}>
      <Send size={19} aria-hidden="true" />
      {status === "sending" ? "Enviando..." : "Enviar testemunho"}
    </button>
    <p className="submit-story-note"><ShieldCheck size={18} aria-hidden="true" />{privacyBody || "Seu relato será lido com carinho pela equipe antes de qualquer publicação."}</p>
  </form>;
}
