"use client";
import{useState}from"react";
import{Heart,LockKeyhole}from"lucide-react";
import{createClient}from"@/lib/supabase/client";

export function TestimonialSubmitForm({introTitle,introBody,privacyTitle,privacyBody}:{introTitle?:string|null;introBody?:string|null;privacyTitle?:string|null;privacyBody?:string|null}){
  const[status,setStatus]=useState<"idle"|"sending"|"done"|"error">("idle");
  async function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();setStatus("sending");
    const fd=new FormData(e.currentTarget),consent=String(fd.get("publication_consent")||""),text=String(fd.get("original_text")||"").trim();
    if(text.length<20||!["NAMED","ANONYMOUS","PRIVATE_ONLY"].includes(consent)){setStatus("error");return}
    const s=createClient();
    const{error}=await s.from("testimonials").insert({
      display_name_original:String(fd.get("name")||"")||null,
      contact_email:String(fd.get("email")||"")||null,
      original_text:text,
      publication_consent:consent,
      privacy_consent_at:new Date().toISOString(),
      privacy_notice_version:"2026-10"
    });
    setStatus(error?"error":"done");
    if(!error)e.currentTarget.reset();
  }
  return <form className="testimonial-form" onSubmit={submit}>
    <div className="testimonial-form-heading"><Heart size={22}/><div><div className="inner-kicker">Conte sua história</div><h2>{introTitle||"Um espaço seguro para escrever com calma"}</h2>{introBody&&<p>{introBody}</p>}</div></div>
    <div className="testimonial-form-grid">
      <label><span>Seu nome</span><input name="name" placeholder="Como você gostaria de ser identificada?"/></label>
      <label><span>E-mail</span><input name="email" type="email" placeholder="Opcional, apenas se aceitar contato posterior"/></label>
    </div>
    <label><span>Seu testemunho</span><textarea name="original_text" required minLength={20} maxLength={12000} placeholder="Conte sua história aqui..."/></label>
    <label><span>Autorização para publicação</span><select name="publication_consent" required defaultValue=""><option value="" disabled>Escolha uma opção</option><option value="NAMED">Autorizo com meu nome</option><option value="ANONYMOUS">Autorizo de forma anônima</option><option value="PRIVATE_ONLY">Não autorizo publicação</option></select></label>
    <div className="testimonial-privacy"><LockKeyhole size={20}/><div><strong>{privacyTitle||"Privacidade e cuidado"}</strong><span>{privacyBody||"Seu relato será revisado com cuidado e só será publicado de acordo com a autorização escolhida."}</span></div></div>
    <label className="testimonial-check"><input type="checkbox" required/><span>Li e estou ciente de que este envio será tratado de forma privada pela equipe.</span></label>
    <button disabled={status==="sending"} className="inner-btn dark submit" type="submit">{status==="sending"?"Enviando...":"Enviar meu testemunho"}</button>
    {status==="done"&&<div className="form-status success">Recebemos seu testemunho. Obrigada por confiar sua história.</div>}
    {status==="error"&&<div className="form-status error">Não foi possível enviar agora. Revise os campos e tente novamente.</div>}
  </form>;
}
