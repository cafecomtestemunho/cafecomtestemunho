"use client";

import{useState}from"react";
import{CheckCircle2}from"lucide-react";

export function EventRsvpForm({eventId,eventTitle}:{eventId:string;eventTitle:string}){
  const[name,setName]=useState("");
  const[city,setCity]=useState("");
  const[website,setWebsite]=useState("");
  const[status,setStatus]=useState<"idle"|"sending"|"success"|"error">("idle");
  const[message,setMessage]=useState("");

  async function submit(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(status==="sending")return;
    const fullName=name.replace(/\s+/g," ").trim();
    const residentCity=city.replace(/\s+/g," ").trim();
    if(fullName.length<3){setStatus("error");setMessage("Informe seu nome completo.");return}
    if(residentCity.length<2){setStatus("error");setMessage("Informe a cidade onde você mora.");return}
    setStatus("sending");setMessage("");
    try{
      const response=await fetch("/api/events/"+eventId+"/rsvp",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({full_name:fullName,city:residentCity,website})
      });
      const payload=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(payload.error||"Não foi possível confirmar sua presença.");
      setStatus("success");
      setName("");setCity("");
    }catch(error){
      setStatus("error");
      setMessage(error instanceof Error?error.message:"Não foi possível confirmar sua presença.");
    }
  }

  if(status==="success")return <section className="event-public-card event-rsvp-card event-rsvp-success">
    <CheckCircle2 size={30}/>
    <div><span>Presença confirmada</span><h2>Obrigada por confirmar.</h2><p>Sua presença foi registrada para {eventTitle}.</p></div>
  </section>;

  return <section className="event-public-card event-rsvp-card">
    <div className="event-rsvp-heading"><span>Confirmação de presença</span><h2>Você estará com a gente?</h2><p>Preencha apenas seu nome completo e a cidade onde reside.</p></div>
    <form className="event-rsvp-form" onSubmit={submit}>
      <label><span>Nome completo</span><input autoComplete="name" maxLength={160} value={name} onChange={e=>setName(e.target.value)} placeholder="Seu nome completo" required/></label>
      <label><span>Cidade onde reside</span><input autoComplete="address-level2" maxLength={120} value={city} onChange={e=>setCity(e.target.value)} placeholder="Ex.: Telêmaco Borba" required/></label>
      <label className="event-rsvp-honeypot" aria-hidden="true"><span>Site</span><input tabIndex={-1} autoComplete="off" value={website} onChange={e=>setWebsite(e.target.value)}/></label>
      {status==="error"&&<p className="event-rsvp-error" role="alert">{message}</p>}
      <button type="submit" disabled={status==="sending"}>{status==="sending"?"Confirmando…":"Confirmar presença"}</button>
    </form>
  </section>;
}
