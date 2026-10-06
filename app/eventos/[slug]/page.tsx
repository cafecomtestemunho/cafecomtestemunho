import{notFound}from"next/navigation";
import{CalendarDays,Clock3,MapPin,Ticket,UsersRound,ExternalLink,BookOpen}from"lucide-react";
import{createServerSupabaseClient}from"@/lib/supabase/server";
import{Reveal}from"@/components/reveal";
import{EventShareButton}from"@/components/event-share-button";

export default async function EventoPage({params}:{params:Promise<{slug:string}>}){
  const{slug}=await params;
  const s=await createServerSupabaseClient();
  const{data:event}=await s.from("events").select("*").eq("slug",slug).maybeSingle();
  if(!event)notFound();

  const[{data:schedule},{data:faqs},{data:guests}]=await Promise.all([
    s.from("event_schedule").select("*").eq("event_id",event.id).order("sort_order"),
    s.from("event_faqs").select("*").eq("event_id",event.id).order("sort_order"),
    s.from("event_guests").select("*").eq("event_id",event.id).order("sort_order")
  ]);

  const dateLabel=event.starts_at?new Intl.DateTimeFormat("pt-BR",{dateStyle:"full",timeStyle:"short",timeZone:"America/Sao_Paulo"}).format(new Date(event.starts_at)):"Data a confirmar";
  const admissionLabel=event.admission_type==="PAID"
    ?(event.admission_label||((event.admission_amount!=null)?new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(Number(event.admission_amount)):"Entrada paga"))
    :event.admission_type==="DONATION"?(event.donation_item||"Doação")
    :event.admission_type==="REGISTRATION"?"Inscrição obrigatória":"Entrada gratuita";

  return <main>
    <section className="event-public-hero-v2">
      <div className="container">
        <Reveal>
          <div className="event-cover-frame">
            {event.cover_url?<img className="event-cover-image" src={event.cover_url} alt={"Capa do evento "+event.title}/>:<div className="event-cover-fallback"/>}
            <div className="event-cover-actions"><EventShareButton title={event.title} text={event.summary||undefined}/></div>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <div className="event-hero-copy-card">
            <div className="event-hero-copy-head">
              <div>
                <div className="eyebrow">Encontro</div>
                {event.event_theme&&<span className="event-theme-pill event-theme-pill-light">{event.event_theme}</span>}
              </div>
            </div>
            <h1>{event.title}</h1>
            {event.summary&&<p>{event.summary}</p>}
            <div className="event-hero-meta event-hero-meta-light">
              <span><CalendarDays size={18}/>{dateLabel}</span>
              {event.venue&&<span><MapPin size={18}/>{event.venue}{event.city?" · "+event.city:""}</span>}
              <span><Ticket size={18}/>{admissionLabel}</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>

    <section className="section event-public-section"><div className="container event-public-layout">
      <div className="event-public-main">
        {(event.description||event.audience||event.age_range)&&<Reveal><article className="event-public-card">
          <div className="event-card-heading"><BookOpen size={20}/><h2>Sobre o encontro</h2></div>
          {event.description&&<p>{event.description}</p>}
          <div className="event-info-chips">{event.audience&&<span><strong>Público</strong>{event.audience}</span>}{event.age_range&&<span><strong>Faixa etária</strong>{event.age_range}</span>}</div>
        </article></Reveal>}

        {guests?.length?<Reveal><section className="event-public-card">
          <div className="event-card-heading"><UsersRound size={20}/><div><h2>Quem estará com a gente</h2><p>Ministração, pregação, louvor e participações deste encontro.</p></div></div>
          <div className="event-guest-grid">{guests.map(g=><article key={g.id} className="event-guest-card">
            {g.image_url?<img src={g.image_url} alt={g.name}/>:<div className="event-guest-placeholder"><UsersRound size={26}/></div>}
            <div><span>{g.role_label||"Participação"}</span><h3>{g.name}</h3>{g.bio&&<p>{g.bio}</p>}{g.social_url&&<a href={g.social_url} target="_blank" rel="noreferrer">Ver perfil <ExternalLink size={14}/></a>}</div>
          </article>)}</div>
        </section></Reveal>:null}

        {schedule?.length?<Reveal><section className="event-public-card">
          <div className="event-card-heading"><Clock3 size={20}/><h2>Programação</h2></div>
          <div className="event-schedule-list">{schedule.map(item=><div key={item.id} className="event-schedule-item"><time>{item.time_label||"—"}</time><div>{item.category&&<span>{item.category}</span>}<strong>{item.title}</strong>{item.description&&<p>{item.description}</p>}</div></div>)}</div>
        </section></Reveal>:null}

        {event.verse_text&&<Reveal><blockquote className="event-verse"><span>Palavra</span>“{event.verse_text}”{event.verse_reference&&<cite>{event.verse_reference}</cite>}</blockquote></Reveal>}

        {faqs?.length?<Reveal><section className="event-public-card">
          <h2>Dúvidas frequentes</h2>
          <div className="event-faq-list">{faqs.map(f=><details key={f.id}><summary>{f.question}</summary><p>{f.answer}</p></details>)}</div>
        </section></Reveal>:null}
      </div>

      <aside className="event-public-side">
        <div className="event-public-card event-sticky-card">
          <h2>Informações</h2>
          <div className="event-detail-row"><CalendarDays size={19}/><div><strong>Data e horário</strong><span>{dateLabel}</span></div></div>
          {(event.venue||event.address||event.city)&&<div className="event-detail-row"><MapPin size={19}/><div><strong>Local</strong><span>{event.venue}</span><span>{[event.address,event.city].filter(Boolean).join(" · ")}</span>{event.reference&&<small>Referência: {event.reference}</small>}{event.map_url&&<a href={event.map_url} target="_blank" rel="noreferrer">Abrir mapa <ExternalLink size={14}/></a>}</div></div>}
          <div className="event-detail-row"><Ticket size={19}/><div><strong>Entrada</strong><span>{admissionLabel}</span>{event.entry_info&&<small>{event.entry_info}</small>}</div></div>
          {event.registration_url&&<a className="btn btn-dark event-register-btn" href={event.registration_url} target="_blank" rel="noreferrer">Fazer inscrição</a>}
        </div>
      </aside>
    </div></section>
  </main>
}