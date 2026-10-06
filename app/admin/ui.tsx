"use client";

import{useMemo,useRef,useState}from"react";
import{createClient}from"@/lib/supabase/client";
import{
  Home,PanelsTopLeft,CalendarDays,LibraryBig,Settings2,ChevronLeft,ChevronRight,
  Image as ImageIcon,Upload,Save,Plus,Eye,EyeOff,BookHeart,Instagram,MessageSquareQuote,
  Images,LogOut,ExternalLink,SlidersHorizontal,LayoutDashboard,UsersRound,Clock3,Ticket,MapPin,Trash2
}from"lucide-react";

type AnyRow=Record<string,any>;
type MainTab="dashboard"|"pages"|"events"|"library"|"settings";
type EditMode="basic"|"advanced";
type PageKey="home"|"about"|"agenda"|"photos"|"testimonials"|"submit";
type LibraryKey="photos"|"testimonials"|"scripture"|"instagram";

const pages:{key:PageKey;label:string;description:string;sections:string[];special?:string}[]=[
  {key:"home",label:"Página inicial",description:"Hero, história, Palavra, encontro, fotos, testemunhos, Instagram e chamada final.",sections:["home_hero","home_intro","home_word","home_event","home_photos","home_testimonials","home_instagram","home_cta"]},
  {key:"about",label:"Sobre",description:"Apresentação, história em capítulos, Palavra, memórias, testemunho fundador, Instagram e CTA.",sections:["about_mission","about_word","about_photos","about_testimony","about_instagram","about_cta"],special:"story"},
  {key:"agenda",label:"Agenda",description:"Hero, introdução e chamada da página de encontros.",sections:["agenda_hero","agenda_intro","agenda_cta"]},
  {key:"photos",label:"Fotos",description:"Hero, introdução e chamada da galeria de memórias.",sections:["photos_hero","photos_intro","photos_cta"]},
  {key:"testimonials",label:"Testemunhos",description:"Hero, introdução e chamada da página de testemunhos.",sections:["testimonials_hero","testimonials_intro","testimonials_cta"]},
  {key:"submit",label:"Enviar testemunho",description:"Hero, introdução e bloco de privacidade do formulário.",sections:["submit_testimonial_hero","submit_testimonial_intro","submit_testimonial_privacy"]}
];

const sectionNames:Record<string,string>={
  home_hero:"Hero principal",home_intro:"Apresentação do projeto",home_word:"Palavra em destaque",home_event:"Próximo encontro",
  home_photos:"Fotos em destaque",home_testimonials:"Testemunhos em destaque",home_instagram:"Instagram em destaque",home_cta:"Chamada final",
  about_mission:"Abertura da história",about_word:"Palavra na história",about_photos:"Memórias da história",about_testimony:"Testemunho fundador",about_instagram:"Instagram",about_cta:"Chamada final",
  agenda_hero:"Hero da agenda",agenda_intro:"Introdução da agenda",agenda_cta:"Chamada final",
  photos_hero:"Hero das fotos",photos_intro:"Introdução da galeria",photos_cta:"Chamada final",
  testimonials_hero:"Hero dos testemunhos",testimonials_intro:"Introdução dos testemunhos",testimonials_cta:"Chamada final",
  submit_testimonial_hero:"Hero do formulário",submit_testimonial_intro:"Introdução do formulário",submit_testimonial_privacy:"Privacidade e cuidado",
  global_footer:"Rodapé"
};

export function AdminClient({
  userId,userEmail,roles,initialEvents,initialEventGuests,initialEventSchedule,initialEventFaqs,initialTestimonials,initialSections,initialStory,
  initialScriptures,initialInstagram,initialPhotos,initialAlbums,initialSocial,initialSettings
}:{
  userId:string;userEmail:string;roles:string[];
  initialEvents:AnyRow[];initialEventGuests:AnyRow[];initialEventSchedule:AnyRow[];initialEventFaqs:AnyRow[];
  initialTestimonials:AnyRow[];initialSections:AnyRow[];initialStory:AnyRow[];
  initialScriptures:AnyRow[];initialInstagram:AnyRow[];initialPhotos:AnyRow[];initialAlbums:AnyRow[];
  initialSocial:AnyRow[];initialSettings:AnyRow[];
}){
  const s=useMemo(()=>createClient(),[]);
  const[tab,setTab]=useState<MainTab>("dashboard");
  const[selectedPage,setSelectedPage]=useState<PageKey|null>(null);
  const[selectedLibrary,setSelectedLibrary]=useState<LibraryKey>("photos");
  const[mode,setMode]=useState<EditMode>("basic");
  const[message,setMessage]=useState("");
  const[events,setEvents]=useState(initialEvents);
  const[selectedEventId,setSelectedEventId]=useState<string|null>(null);
  const[eventGuests,setEventGuests]=useState(initialEventGuests);
  const[eventSchedule,setEventSchedule]=useState(initialEventSchedule);
  const[eventFaqs,setEventFaqs]=useState(initialEventFaqs);
  const[testimonials,setTestimonials]=useState(initialTestimonials);
  const[sections,setSections]=useState(initialSections);
  const[story,setStory]=useState(initialStory);
  const[scriptures,setScriptures]=useState(initialScriptures);
  const[instagram,setInstagram]=useState(initialInstagram);
  const[photos,setPhotos]=useState(initialPhotos);
  const[albums,setAlbums]=useState(initialAlbums);
  const[social,setSocial]=useState(initialSocial);
  const[settings,setSettings]=useState(initialSettings);

  const notify=(v:string)=>{setMessage(v);window.setTimeout(()=>setMessage(""),4500)};
  const slugify=(v:string)=>v.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"").slice(0,70);
  async function audit(action:string,entity_type:string,entity_id?:string,metadata:Record<string,any>={}){
    await s.from("audit_logs").insert({user_id:userId,action,entity_type,entity_id,metadata});
  }
  async function logout(){await s.auth.signOut();location.href="/admin/login"}

  async function saveSection(id:string,patch:AnyRow){
    const{data,error}=await s.from("institutional_sections").update({...patch,updated_by:userId}).eq("id",id).select().single();
    if(error){notify(error.message);return}
    setSections(sections.map(x=>x.id===id?data:x));await audit("SECTION_UPDATED","institutional_section",id);notify("Seção salva.");
  }
  async function saveStory(id:string,patch:AnyRow){
    const{data,error}=await s.from("story_chapters").update(patch).eq("id",id).select().single();
    if(error){notify(error.message);return}
    setStory(story.map(x=>x.id===id?data:x));await audit("STORY_UPDATED","story_chapter",id);notify("Capítulo salvo.");
  }
  async function saveEvent(id:string,patch:AnyRow){
    const{data,error}=await s.from("events").update({...patch,updated_by:userId}).eq("id",id).select().single();
    if(error){notify(error.message);return null}
    setEvents(current=>current.map(x=>x.id===id?data:x));await audit("EVENT_UPDATED","event",id);notify("Etapa salva.");
    return data;
  }
  async function addEventGuest(eventId:string,payload:AnyRow){
    const{data,error}=await s.from("event_guests").insert({...payload,event_id:eventId,sort_order:eventGuests.filter(x=>x.event_id===eventId).length*10+10}).select().single();
    if(error){notify(error.message);return}
    setEventGuests([...eventGuests,data]);await audit("EVENT_GUEST_CREATED","event_guest",data.id,{event_id:eventId});notify("Participação adicionada.");
  }
  async function updateEventGuest(id:string,patch:AnyRow){
    const{data,error}=await s.from("event_guests").update(patch).eq("id",id).select().single();
    if(error){notify(error.message);return}
    setEventGuests(eventGuests.map(x=>x.id===id?data:x));notify("Participação salva.");
  }
  async function deleteEventGuest(id:string){
    const{error}=await s.from("event_guests").delete().eq("id",id);if(error){notify(error.message);return}
    setEventGuests(eventGuests.filter(x=>x.id!==id));notify("Participação removida.");
  }
  async function addScheduleItem(eventId:string,payload:AnyRow){
    const{data,error}=await s.from("event_schedule").insert({...payload,event_id:eventId,sort_order:eventSchedule.filter(x=>x.event_id===eventId).length*10+10}).select().single();
    if(error){notify(error.message);return}
    setEventSchedule([...eventSchedule,data]);notify("Item da programação adicionado.");
  }
  async function updateScheduleItem(id:string,patch:AnyRow){
    const{data,error}=await s.from("event_schedule").update(patch).eq("id",id).select().single();
    if(error){notify(error.message);return}
    setEventSchedule(eventSchedule.map(x=>x.id===id?data:x));notify("Programação salva.");
  }
  async function deleteScheduleItem(id:string){
    const{error}=await s.from("event_schedule").delete().eq("id",id);if(error){notify(error.message);return}
    setEventSchedule(eventSchedule.filter(x=>x.id!==id));notify("Item removido.");
  }
  async function addEventFaq(eventId:string,payload:AnyRow){
    const{data,error}=await s.from("event_faqs").insert({...payload,event_id:eventId,sort_order:eventFaqs.filter(x=>x.event_id===eventId).length*10+10}).select().single();
    if(error){notify(error.message);return}
    setEventFaqs([...eventFaqs,data]);notify("Pergunta adicionada.");
  }
  async function updateEventFaq(id:string,patch:AnyRow){
    const{data,error}=await s.from("event_faqs").update(patch).eq("id",id).select().single();
    if(error){notify(error.message);return}
    setEventFaqs(eventFaqs.map(x=>x.id===id?data:x));notify("Pergunta salva.");
  }
  async function deleteEventFaq(id:string){
    const{error}=await s.from("event_faqs").delete().eq("id",id);if(error){notify(error.message);return}
    setEventFaqs(eventFaqs.filter(x=>x.id!==id));notify("Pergunta removida.");
  }
  async function createEvent(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();const fd=new FormData(e.currentTarget);const title=String(fd.get("title")||"").trim();
    if(!title){notify("Informe o nome do evento.");return}
    const slug=(slugify(title)||"evento")+"-"+Date.now().toString().slice(-5);
    const{data,error}=await s.from("events").insert({
      title,slug,status:"RASCUNHO",admission_type:"FREE",wizard_step:1,wizard_completed:{},
      created_by:userId,updated_by:userId
    }).select().single();
    if(error){notify(error.message);return}
    setEvents(current=>[data,...current]);setSelectedEventId(data.id);e.currentTarget.reset();await audit("EVENT_CREATED","event",data.id,{slug});
    notify("Rascunho criado. Comece pela primeira etapa.");
  }
  async function moderate(id:string,status:string){
    const{data,error}=await s.from("testimonials").update({status,reviewer_id:userId,reviewed_at:new Date().toISOString()}).eq("id",id).select("id,display_name_original,original_text,publication_consent,status,created_at").single();
    if(error){notify(error.message);return}
    setTestimonials(testimonials.map(t=>t.id===id?data:t));await audit("TESTIMONIAL_STATUS_CHANGED","testimonial",id,{status});notify("Testemunho atualizado.");
  }
  async function publish(t:AnyRow){
    if(t.publication_consent==="PRIVATE_ONLY"){notify("Este testemunho não autoriza publicação.");return}
    const title=(t.original_text.split(/[.!?\n]/)[0]||"Testemunho").trim().slice(0,90);
    const slug=(slugify(title)||"testemunho")+"-"+String(t.id).slice(0,8);
    const display=t.publication_consent==="ANONYMOUS"?"Anônimo":(t.display_name_original||"Anônimo");
    const excerpt=t.original_text.replace(/\s+/g," ").slice(0,220);
    const{error}=await s.from("testimonial_publications").upsert({testimonial_id:t.id,slug,public_title:title,public_excerpt:excerpt,public_text:t.original_text,public_display_name:display,published_at:new Date().toISOString(),edited_by:userId},{onConflict:"testimonial_id"});
    if(error){notify(error.message);return}
    await moderate(t.id,"PUBLICADO");
  }
  async function createAlbum(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();const fd=new FormData(e.currentTarget);const title=String(fd.get("title")||"").trim(),slug=slugify(String(fd.get("slug")||title));
    const{data,error}=await s.from("photo_albums").insert({title,slug,description:String(fd.get("description")||""),visible:true}).select().single();
    if(error){notify(error.message);return}
    setAlbums([data,...albums]);e.currentTarget.reset();notify("Álbum criado.");
  }
  async function uploadPhoto(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();const form=e.currentTarget;const fd=new FormData(form);fd.set("featured",String(fd.get("featured")==="on"));notify("Enviando imagem...");
    const res=await fetch("/api/admin/photos",{method:"POST",body:fd});const payload=await res.json();
    if(!res.ok){notify(payload.error||"Não foi possível enviar a imagem.");return}
    setPhotos([payload.photo,...photos]);form.reset();notify("Foto enviada.");
  }
  async function addScripture(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();const fd=new FormData(e.currentTarget);
    const{data,error}=await s.from("scripture_spotlights").insert({location:String(fd.get("location")),reference:String(fd.get("reference")),verse_text:String(fd.get("verse_text")),reflection:String(fd.get("reflection")||""),visible:true,sort_order:scriptures.length*10+10}).select().single();
    if(error){notify(error.message);return}
    setScriptures([...scriptures,data]);e.currentTarget.reset();notify("Palavra adicionada.");
  }
  async function saveScripture(id:string,patch:AnyRow){
    const{data,error}=await s.from("scripture_spotlights").update(patch).eq("id",id).select().single();
    if(error){notify(error.message);return}
    setScriptures(scriptures.map(x=>x.id===id?data:x));notify("Palavra salva.");
  }
  async function addInstagram(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();const fd=new FormData(e.currentTarget);
    const{data,error}=await s.from("instagram_highlights").insert({post_url:String(fd.get("post_url")),title:String(fd.get("title")||""),caption:String(fd.get("caption")||""),cover_url:String(fd.get("cover_url")||"")||null,location:String(fd.get("location")),visible:true,sort_order:instagram.length*10+10}).select().single();
    if(error){notify(error.message);return}
    setInstagram([...instagram,data]);e.currentTarget.reset();notify("Post adicionado.");
  }
  async function toggleInstagram(id:string,visible:boolean){
    const{data,error}=await s.from("instagram_highlights").update({visible}).eq("id",id).select().single();
    if(error){notify(error.message);return}
    setInstagram(instagram.map(x=>x.id===id?data:x));
  }
  async function saveSetting(key:string,value:AnyRow){
    const{data,error}=await s.from("site_settings").upsert({setting_key:key,value,updated_by:userId},{onConflict:"setting_key"}).select().single();
    if(error){notify(error.message);return}
    setSettings(settings.some(x=>x.setting_key===key)?settings.map(x=>x.setting_key===key?data:x):[...settings,data]);notify("Configuração salva.");
  }
  async function saveSocial(id:string,url:string){
    const{data,error}=await s.from("social_links").update({url}).eq("id",id).select().single();
    if(error){notify(error.message);return}
    setSocial(social.map(x=>x.id===id?data:x));notify("Rede social atualizada.");
  }

  const currentPage=pages.find(p=>p.key===selectedPage);
  const pageSections=currentPage?currentPage.sections.map(k=>sections.find(s=>s.section_key===k)).filter(Boolean) as AnyRow[]:[];
  const newCount=testimonials.filter(t=>t.status==="RECEBIDO").length;
  const brandSetting=settings.find(x=>x.setting_key==="brand")?.value||{};
  const contactSetting=settings.find(x=>x.setting_key==="contact")?.value||{};

  function goTab(next:MainTab){setTab(next);setSelectedPage(null);if(next!=="pages")setMode("basic")}

  return <main className="admin-mobile-shell">
    <div className="admin-mobile-content">
      <header className="admin-page-heading">
        <div>
          <span className="admin-kicker">Café com Testemunho</span>
          <h1>{tab==="dashboard"?"Painel":tab==="pages"?(currentPage?.label||"Páginas"):tab==="events"?"Eventos":tab==="library"?"Biblioteca":"Ajustes"}</h1>
        </div>
        <a className="admin-preview-button" href="/" target="_blank" rel="noreferrer"><ExternalLink size={18}/><span>Ver site</span></a>
      </header>

      {message&&<div className="admin-toast">{message}</div>}

      {tab==="dashboard"&&<section className="admin-screen">
        <div className="admin-welcome">
          <div><span className="eyebrow">Administração</span><h2>O que você quer fazer?</h2><p>Gerencie o conteúdo completo do projeto pelo celular, sem precisar entrar no código.</p></div>
        </div>
        <div className="admin-stat-grid">
          <div className="admin-stat-card"><span>Eventos</span><strong>{events.length}</strong></div>
          <div className="admin-stat-card"><span>Novos relatos</span><strong>{newCount}</strong></div>
          <div className="admin-stat-card"><span>Fotos</span><strong>{photos.length}</strong></div>
          <div className="admin-stat-card"><span>Posts</span><strong>{instagram.filter(x=>x.visible).length}</strong></div>
        </div>
        <div className="admin-action-list">
          <button onClick={()=>goTab("pages")}><PanelsTopLeft/><div><strong>Editar páginas</strong><span>Todas as páginas e todas as seções</span></div><ChevronRight/></button>
          <button onClick={()=>goTab("events")}><CalendarDays/><div><strong>Gerenciar eventos</strong><span>Criar, editar, publicar e arquivar</span></div><ChevronRight/></button>
          <button onClick={()=>goTab("library")}><LibraryBig/><div><strong>Abrir biblioteca</strong><span>Fotos, testemunhos, Palavra e Instagram</span></div><ChevronRight/></button>
          <button onClick={()=>goTab("settings")}><Settings2/><div><strong>Configurações</strong><span>Identidade, redes e dados globais</span></div><ChevronRight/></button>
        </div>
      </section>}

      {tab==="pages"&&<section className="admin-screen">
        {!currentPage?<div className="admin-page-list">
          <div className="admin-section-intro"><span className="eyebrow">Conteúdo</span><h2>Todas as páginas</h2><p>Entre em uma página para editar suas seções. Você pode usar o modo básico ou o modo avançado.</p></div>
          {pages.map(p=><button className="admin-page-card" key={p.key} onClick={()=>{setSelectedPage(p.key);setMode("basic")}}>
            <div><strong>{p.label}</strong><span>{p.description}</span></div><ChevronRight/>
          </button>)}
        </div>:<div className="admin-page-editor">
          <button className="admin-back" onClick={()=>setSelectedPage(null)}><ChevronLeft size={18}/>Voltar para páginas</button>
          <ModeSwitch mode={mode} setMode={setMode}/>
          <div className="admin-section-intro compact"><span className="eyebrow">{mode==="basic"?"Edição básica":"Modo avançado"}</span><h2>{currentPage.label}</h2><p>{mode==="basic"?"Edite os textos, imagens e visibilidade sem ver configurações técnicas.":"Controle completo da seção: ordem, CTA, alinhamento, estilo, movimento e configurações avançadas."}</p></div>
          <div className="admin-editor-stack">
            {pageSections.map(sec=><SectionEditor key={sec.id} section={sec} mode={mode} title={sectionNames[sec.section_key]||sec.title} onSave={saveSection} notify={notify}/>)}
            {currentPage.special==="story"&&<div className="admin-subsection-group"><div className="admin-subsection-title"><BookHeart size={20}/><div><strong>História em capítulos</strong><span>Linha do tempo completa da página Sobre</span></div></div>{story.map(ch=><StoryEditor key={ch.id} chapter={ch} mode={mode} onSave={saveStory} notify={notify}/>)}</div>}
          </div>
        </div>}
      </section>}

      {tab==="events"&&<section className="admin-screen">
        {!selectedEventId?<>
          <div className="admin-section-intro"><span className="eyebrow">Agenda</span><h2>Eventos</h2><p>Crie um rascunho e complete o evento em etapas. Cada etapa é salva antes de você avançar.</p></div>
          <form className="event-quick-create" onSubmit={createEvent}>
            <div><strong>Novo evento</strong><span>Comece apenas pelo nome. O restante será preenchido no wizard.</span></div>
            <Field label="Nome do evento"><input name="title" required placeholder="Ex.: Café com Testemunho"/></Field>
            <button className="btn btn-dark" type="submit"><Plus size={17}/>Criar e começar</button>
          </form>
          <div className="event-admin-list">{events.map(e=><button key={e.id} className="event-admin-row" onClick={()=>setSelectedEventId(e.id)}>
            <div className="event-admin-row-main"><span className={"event-status-dot "+String(e.status).toLowerCase()}/><div><strong>{e.title}</strong><span>{e.starts_at?new Intl.DateTimeFormat("pt-BR",{dateStyle:"medium",timeStyle:"short",timeZone:"America/Sao_Paulo"}).format(new Date(e.starts_at)):"Data ainda não definida"} · {e.status}</span></div></div>
            <div className="event-progress-mini"><span style={{width:Math.max(8,Math.min(100,Number(e.wizard_step||1)/8*100))+"%"}}/></div>
            <ChevronRight size={18}/>
          </button>)}
          {!events.length&&<div className="admin-empty">Nenhum evento cadastrado.</div>}
          </div>
        </>:(()=>{
          const e=events.find(x=>x.id===selectedEventId);
          if(!e)return <div className="admin-empty">Evento não encontrado.</div>;
          return <EventWizard
            event={e} mode={mode} setMode={setMode} onBack={()=>setSelectedEventId(null)} onSave={saveEvent} notify={notify}
            guests={eventGuests.filter(x=>x.event_id===e.id)} schedule={eventSchedule.filter(x=>x.event_id===e.id)} faqs={eventFaqs.filter(x=>x.event_id===e.id)}
            onAddGuest={addEventGuest} onUpdateGuest={updateEventGuest} onDeleteGuest={deleteEventGuest}
            onAddSchedule={addScheduleItem} onUpdateSchedule={updateScheduleItem} onDeleteSchedule={deleteScheduleItem}
            onAddFaq={addEventFaq} onUpdateFaq={updateEventFaq} onDeleteFaq={deleteEventFaq}
          />
        })()}
      </section>}

      {tab==="library"&&<section className="admin-screen">
        <div className="admin-library-tabs">
          {([
            ["photos","Fotos",Images],["testimonials","Testemunhos",MessageSquareQuote],["scripture","Palavra",BookHeart],["instagram","Instagram",Instagram]
          ] as [LibraryKey,string,any][]).map(([key,label,Icon])=><button key={key} className={selectedLibrary===key?"active":""} onClick={()=>setSelectedLibrary(key)}><Icon size={18}/><span>{label}</span></button>)}
        </div>

        {selectedLibrary==="photos"&&<div className="admin-library-view">
          <div className="admin-section-intro"><span className="eyebrow">Galeria</span><h2>Fotos e álbuns</h2><p>Envie imagens, destaque na Home e organize as memórias por álbum.</p></div>
          <details className="admin-create-panel" open><summary><Upload size={18}/>Enviar foto</summary><form className="form" onSubmit={uploadPhoto}>
            <Field label="Imagem"><input type="file" name="file" accept="image/*" required/></Field>
            <Field label="Descrição"><input name="alt" placeholder="Descreva a foto"/></Field>
            <Field label="Álbum"><select name="album_id" defaultValue=""><option value="">Galeria geral</option>{albums.map(a=><option key={a.id} value={a.id}>{a.title}</option>)}</select></Field>
            <label className="admin-check"><input type="checkbox" name="featured"/>Destacar na página inicial</label>
            <button className="btn btn-dark">Enviar imagem</button>
          </form></details>
          <details className="admin-create-panel"><summary><Plus size={18}/>Criar álbum</summary><form className="form" onSubmit={createAlbum}>
            <Field label="Nome"><input name="title" required/></Field><Field label="Slug opcional"><input name="slug"/></Field><Field label="Descrição"><textarea name="description"/></Field><button className="btn btn-dark">Criar álbum</button>
          </form></details>
          <div className="admin-photo-grid">{photos.map(p=><figure key={p.id}><img src={p.url} alt={p.alt_text||""}/><figcaption>{p.alt_text||"Sem descrição"}{p.featured&&<span>Destaque</span>}</figcaption></figure>)}</div>
        </div>}

        {selectedLibrary==="testimonials"&&<div className="admin-library-view">
          <div className="admin-section-intro"><span className="eyebrow">Moderação</span><h2>Testemunhos</h2><p>Revise os relatos recebidos e escolha o que pode ser publicado.</p></div>
          <div className="admin-editor-stack">{testimonials.map(t=><article className="admin-content-card" key={t.id}><div className="admin-card-top"><span className="status-pill">{t.status}</span><small>{new Date(t.created_at).toLocaleDateString("pt-BR")}</small></div><h3>{t.display_name_original||"Sem identificação"}</h3><p className="admin-long-copy">{t.original_text}</p><div className="admin-card-actions"><button onClick={()=>moderate(t.id,"EM_ANALISE")}>Em análise</button><button onClick={()=>moderate(t.id,"APROVADO")}>Aprovar</button>{t.publication_consent!=="PRIVATE_ONLY"&&<button className="primary" onClick={()=>publish(t)}>Publicar</button>}<button className="danger" onClick={()=>moderate(t.id,"ARQUIVADO")}>Arquivar</button></div></article>)}</div>
        </div>}

        {selectedLibrary==="scripture"&&<div className="admin-library-view">
          <div className="admin-section-intro"><span className="eyebrow">Bíblia</span><h2>Palavra e versículos</h2><p>Cadastre as passagens que podem aparecer na Home e na página Sobre.</p></div>
          <details className="admin-create-panel"><summary><Plus size={18}/>Adicionar Palavra</summary><form className="form" onSubmit={addScripture}>
            <Field label="Onde aparece"><select name="location"><option value="home">Página inicial</option><option value="about">Sobre</option></select></Field>
            <Field label="Referência"><input name="reference" required/></Field><Field label="Versículo"><textarea name="verse_text" required/></Field><Field label="Reflexão"><textarea name="reflection"/></Field><button className="btn btn-dark">Adicionar</button>
          </form></details>
          <div className="admin-editor-stack">{scriptures.map(v=><ScriptureEditor key={v.id} item={v} onSave={saveScripture}/>)}</div>
        </div>}

        {selectedLibrary==="instagram"&&<div className="admin-library-view">
          <div className="admin-section-intro"><span className="eyebrow">Curadoria</span><h2>Instagram</h2><p>Escolha manualmente os posts de @cafe_testemunho que aparecem no site.</p></div>
          <details className="admin-create-panel"><summary><Plus size={18}/>Adicionar post</summary><form className="form" onSubmit={addInstagram}>
            <Field label="Link do post"><input name="post_url" type="url" required/></Field><Field label="Título"><input name="title"/></Field><Field label="Legenda curta"><textarea name="caption"/></Field><Field label="Imagem de capa (URL)"><input name="cover_url" type="url"/></Field><Field label="Onde aparece"><select name="location"><option value="home">Página inicial</option><option value="about">Sobre</option><option value="both">Home e Sobre</option></select></Field><button className="btn btn-dark">Adicionar</button>
          </form></details>
          <div className="admin-editor-stack">{instagram.map(p=><article className="admin-content-card instagram-admin-card" key={p.id}>{p.cover_url&&<img src={p.cover_url} alt=""/>}<div><div className="admin-card-top"><span className="status-pill">{p.location}</span><button className="admin-icon-button" onClick={()=>toggleInstagram(p.id,!p.visible)}>{p.visible?<Eye size={18}/>:<EyeOff size={18}/>}</button></div><h3>{p.title||"Post do Instagram"}</h3><p>{p.caption}</p><a href={p.post_url} target="_blank" rel="noreferrer">Abrir publicação</a></div></article>)}</div>
        </div>}
      </section>}

      {tab==="settings"&&<section className="admin-screen">
        <div className="admin-section-intro"><span className="eyebrow">Sistema</span><h2>Configurações</h2><p>Identidade, contato, redes sociais e dados globais do projeto.</p></div>
        <SettingCard title="Identidade do projeto">
          <BrandSettings value={brandSetting} onSave={v=>saveSetting("brand",v)} notify={notify}/>
        </SettingCard>
        <SettingCard title="Contato">
          <ContactSettings value={contactSetting} onSave={v=>saveSetting("contact",v)}/>
        </SettingCard>
        <SettingCard title="Redes sociais">
          <div className="admin-editor-stack">{social.map(item=><SocialEditor key={item.id} item={item} onSave={saveSocial}/>)}</div>
        </SettingCard>
        <SettingCard title="Rodapé">
          {sections.find(x=>x.section_key==="global_footer")&&<SectionEditor section={sections.find(x=>x.section_key==="global_footer")!} mode="advanced" title="Conteúdo global do rodapé" onSave={saveSection} notify={notify}/>}
        </SettingCard>
        <button className="admin-logout" onClick={logout}><LogOut size={18}/>Sair da conta <small>{userEmail}</small></button>
      </section>}
    </div>

    <nav className="admin-bottom-nav" aria-label="Navegação administrativa">
      <button className={tab==="dashboard"?"active":""} onClick={()=>goTab("dashboard")}><LayoutDashboard size={21}/><span>Início</span></button>
      <button className={tab==="pages"?"active":""} onClick={()=>goTab("pages")}><PanelsTopLeft size={21}/><span>Páginas</span></button>
      <button className={tab==="events"?"active":""} onClick={()=>goTab("events")}><CalendarDays size={21}/><span>Eventos</span></button>
      <button className={tab==="library"?"active":""} onClick={()=>goTab("library")}><LibraryBig size={21}/><span>Biblioteca</span></button>
      <button className={tab==="settings"?"active":""} onClick={()=>goTab("settings")}><Settings2 size={21}/><span>Ajustes</span></button>
    </nav>
  </main>
}

function ModeSwitch({mode,setMode}:{mode:EditMode;setMode:(m:EditMode)=>void}){
  return <div className="admin-mode-switch"><button className={mode==="basic"?"active":""} onClick={()=>setMode("basic")}>Básico</button><button className={mode==="advanced"?"active":""} onClick={()=>setMode("advanced")}><SlidersHorizontal size={16}/>Avançado</button></div>
}
function Field({label,children,hint}:{label:string;children:React.ReactNode;hint?:string}){return <div className="field"><label>{label}</label>{children}{hint&&<small className="field-hint">{hint}</small>}</div>}

function SectionEditor({section,mode,title,onSave,notify}:{section:AnyRow;mode:EditMode;title:string;onSave:(id:string,patch:AnyRow)=>void;notify:(m:string)=>void}){
  const[t,setT]=useState(section.title||""),[sub,setSub]=useState(section.subtitle||""),[body,setBody]=useState(section.body||""),[visible,setVisible]=useState(section.visible!==false);
  const[image,setImage]=useState(section.image_url||""),[ctaLabel,setCtaLabel]=useState(section.cta_label||""),[ctaUrl,setCtaUrl]=useState(section.cta_url||"");
  const[order,setOrder]=useState(String(section.sort_order??0)),[theme,setTheme]=useState(section.theme||"default"),[alignment,setAlignment]=useState(section.alignment||"left");
  const[background,setBackground]=useState(section.settings?.background_style||"default"),[motion,setMotion]=useState(section.settings?.motion||"fade");
  async function upload(file:File){const fd=new FormData();fd.set("file",file);fd.set("folder","conteudo/secoes");notify("Enviando imagem...");const res=await fetch("/api/admin/upload",{method:"POST",body:fd});const data=await res.json();if(!res.ok){notify(data.error||"Falha no upload.");return}setImage(data.url);notify("Imagem enviada. Salve a seção para aplicar.");}
  function save(){onSave(section.id,{title:t,subtitle:sub||null,body,image_url:image||null,visible,cta_label:ctaLabel||null,cta_url:ctaUrl||null,sort_order:Number(order)||0,theme,alignment,settings:{...(section.settings||{}),background_style:background,motion}})}
  return <details className="admin-section-card" open={mode==="basic"}>
    <summary><div><span>{title}</span><small>{visible?"Visível":"Oculta"}</small></div><ChevronRight size={18}/></summary>
    <div className="admin-section-body">
      <div className="admin-inline-toggle"><div><strong>Exibir seção</strong><span>Controla se esse bloco aparece no site.</span></div><button className={visible?"on":""} onClick={()=>setVisible(!visible)} type="button" aria-label="Alternar visibilidade"><span/></button></div>
      <Field label="Título"><input value={t} onChange={e=>setT(e.target.value)}/></Field>
      <Field label="Subtítulo"><input value={sub} onChange={e=>setSub(e.target.value)}/></Field>
      <Field label="Texto"><textarea value={body} onChange={e=>setBody(e.target.value)}/></Field>
      <Field label="Imagem da seção"><ImagePicker value={image} onChange={setImage} onUpload={upload}/></Field>
      {mode==="advanced"&&<div className="admin-advanced-box">
        <div className="admin-advanced-label"><SlidersHorizontal size={17}/><strong>Configurações avançadas</strong></div>
        <div className="admin-two-col"><Field label="Texto do botão"><input value={ctaLabel} onChange={e=>setCtaLabel(e.target.value)}/></Field><Field label="Link do botão"><input value={ctaUrl} onChange={e=>setCtaUrl(e.target.value)}/></Field></div>
        <div className="admin-two-col"><Field label="Ordem"><input type="number" value={order} onChange={e=>setOrder(e.target.value)}/></Field><Field label="Alinhamento"><select value={alignment} onChange={e=>setAlignment(e.target.value)}><option value="left">Esquerda</option><option value="center">Centro</option><option value="right">Direita</option></select></Field></div>
        <div className="admin-two-col"><Field label="Tema"><select value={theme} onChange={e=>setTheme(e.target.value)}><option value="default">Padrão</option><option value="light">Claro</option><option value="dark">Escuro</option><option value="warm">Acolhedor</option></select></Field><Field label="Fundo"><select value={background} onChange={e=>setBackground(e.target.value)}><option value="default">Padrão</option><option value="paper">Papel</option><option value="soft">Suave</option><option value="dark">Escuro</option><option value="image">Imagem</option></select></Field></div>
        <Field label="Microanimação"><select value={motion} onChange={e=>setMotion(e.target.value)}><option value="fade">Entrada suave</option><option value="rise">Subir suavemente</option><option value="none">Sem animação</option></select></Field>
        <Field label="Chave interna" hint="Somente leitura. Identifica a seção no sistema."><input value={section.section_key} readOnly/></Field>
      </div>}
      <button className="admin-save-button" onClick={save}><Save size={18}/>Salvar seção</button>
    </div>
  </details>
}

function StoryEditor({chapter,mode,onSave,notify}:{chapter:AnyRow;mode:EditMode;onSave:(id:string,patch:AnyRow)=>void;notify:(m:string)=>void}){
  const[t,setT]=useState(chapter.title||""),[body,setBody]=useState(chapter.body||""),[eyebrow,setEyebrow]=useState(chapter.eyebrow||""),[quote,setQuote]=useState(chapter.quote||""),[image,setImage]=useState(chapter.image_url||""),[visible,setVisible]=useState(chapter.visible!==false),[order,setOrder]=useState(String(chapter.sort_order??0));
  async function upload(file:File){const fd=new FormData();fd.set("file",file);fd.set("folder","conteudo/historia");notify("Enviando imagem...");const res=await fetch("/api/admin/upload",{method:"POST",body:fd});const data=await res.json();if(!res.ok){notify(data.error||"Falha no upload.");return}setImage(data.url);notify("Imagem enviada. Salve o capítulo.");}
  return <details className="admin-section-card"><summary><div><span>{t||"Capítulo"}</span><small>{eyebrow}</small></div><ChevronRight size={18}/></summary><div className="admin-section-body">
    <div className="admin-inline-toggle"><div><strong>Exibir capítulo</strong></div><button className={visible?"on":""} onClick={()=>setVisible(!visible)} type="button"><span/></button></div>
    <Field label="Título"><input value={t} onChange={e=>setT(e.target.value)}/></Field><Field label="Narrativa"><textarea value={body} onChange={e=>setBody(e.target.value)}/></Field>
    {mode==="advanced"&&<><Field label="Marcador"><input value={eyebrow} onChange={e=>setEyebrow(e.target.value)}/></Field><Field label="Frase em destaque"><textarea value={quote} onChange={e=>setQuote(e.target.value)}/></Field><Field label="Imagem"><ImagePicker value={image} onChange={setImage} onUpload={upload}/></Field><Field label="Ordem"><input type="number" value={order} onChange={e=>setOrder(e.target.value)}/></Field></>}
    <button className="admin-save-button" onClick={()=>onSave(chapter.id,{title:t,body,eyebrow,quote:quote||null,image_url:image||null,visible,sort_order:Number(order)||0})}><Save size={18}/>Salvar capítulo</button>
  </div></details>
}

function EventWizard({
  event,mode,setMode,onBack,onSave,notify,guests,schedule,faqs,
  onAddGuest,onUpdateGuest,onDeleteGuest,onAddSchedule,onUpdateSchedule,onDeleteSchedule,onAddFaq,onUpdateFaq,onDeleteFaq
}:{
  event:AnyRow;mode:EditMode;setMode:(m:EditMode)=>void;onBack:()=>void;
  onSave:(id:string,patch:AnyRow)=>Promise<AnyRow|null>;notify:(m:string)=>void;
  guests:AnyRow[];schedule:AnyRow[];faqs:AnyRow[];
  onAddGuest:(eventId:string,payload:AnyRow)=>void;onUpdateGuest:(id:string,patch:AnyRow)=>void;onDeleteGuest:(id:string)=>void;
  onAddSchedule:(eventId:string,payload:AnyRow)=>void;onUpdateSchedule:(id:string,patch:AnyRow)=>void;onDeleteSchedule:(id:string)=>void;
  onAddFaq:(eventId:string,payload:AnyRow)=>void;onUpdateFaq:(id:string,patch:AnyRow)=>void;onDeleteFaq:(id:string)=>void;
}){
  const[state,setState]=useState<AnyRow>({...event});
  const initialStep=Math.max(1,Math.min(8,Number(event.wizard_step||1)));
  const[step,setStep]=useState(initialStep);
  const[saving,setSaving]=useState(false);
  const wizardAnchorRef=useRef<HTMLDivElement>(null);
  const set=(key:string,value:any)=>setState((v:AnyRow)=>({...v,[key]:value}));
  const focusCurrentStep=()=>window.setTimeout(()=>wizardAnchorRef.current?.scrollIntoView({behavior:"smooth",block:"start"}),60);
  const startParts=splitLocalDateTime(state.starts_at);
  const endParts=splitLocalDateTime(state.ends_at);
  const admission=state.admission_type||"FREE";
  const completed=state.wizard_completed||{};

  const steps=[
    ["Identidade","identity"],["Data e local","datetime_location"],["Público e entrada","audience_admission"],["Participações","participants"],
    ["Programação","schedule"],["Conteúdo","content"],["Extras","extras"],["Revisão","review"]
  ] as const;

  async function uploadCover(file:File){
    const fd=new FormData();fd.set("file",file);fd.set("folder","eventos/capas");notify("Enviando capa...");
    const res=await fetch("/api/admin/upload",{method:"POST",body:fd});const data=await res.json();
    if(!res.ok){notify(data.error||"Falha no upload.");return}
    set("cover_url",data.url);notify("Capa enviada. Ela será confirmada ao salvar esta etapa.");
  }
  function setStartDate(date:string){set("starts_at",date?combineLocalDateTime(date,startParts.time||"14:00"):null)}
  function setStartTime(time:string){set("starts_at",time?combineLocalDateTime(startParts.date||todayInput(),time):null)}
  function setEndDate(date:string){set("ends_at",date?combineLocalDateTime(date,endParts.time||startParts.time||"18:00"):null)}
  function setEndTime(time:string){set("ends_at",time?combineLocalDateTime(endParts.date||startParts.date||todayInput(),time):null)}

  function validateCurrent(){
    if(step===1&&!String(state.title||"").trim()){notify("Informe o título do evento.");return false}
    if(step===2&&!state.starts_at){notify("Informe a data e o horário do evento.");return false}
    if(step===2&&!String(state.venue||"").trim()){notify("Informe o local do evento.");return false}
    if(step===3&&admission==="DONATION"&&!String(state.donation_item||"").trim()){notify("Informe qual doação será solicitada.");return false}
    if(step===3&&admission==="PAID"&&(state.admission_amount==null||String(state.admission_amount)==="")){notify("Informe o valor da entrada.");return false}
    if(step===3&&admission==="REGISTRATION"&&!String(state.registration_url||"").trim()){notify("Informe o link de inscrição.");return false}
    if(step===4&&!guests.length){notify("Cadastre pelo menos uma participação antes de continuar.");return false}
    return true;
  }
  function patchForStep(){
    const common={wizard_completed:{...completed,[steps[step-1][1]]:true}};
    if(step===1)return{...common,title:state.title,event_theme:state.event_theme||null,summary:state.summary||null,cover_url:state.cover_url||null};
    if(step===2)return{...common,starts_at:state.starts_at||null,venue:state.venue||null,address:state.address||null,city:state.city||null,reference:state.reference||null};
    if(step===3)return{...common,audience:state.audience||null,age_range:state.age_range||null,admission_type:admission,admission_label:state.admission_label||null,admission_amount:state.admission_amount===""||state.admission_amount==null?null:Number(String(state.admission_amount).replace(",",".")),donation_item:state.donation_item||null,registration_required:admission==="REGISTRATION"?state.registration_required!==false:false,registration_url:state.registration_url||null,entry_info:state.entry_info||null};
    if(step===6)return{...common,description:state.description||null,verse_reference:state.verse_reference||null,verse_text:state.verse_text||null};
    if(step===7)return{...common,ends_at:state.ends_at||null,map_url:state.map_url||null,slug:state.slug||event.slug};
    return common;
  }
  async function saveAndGo(target:number){
    if(saving)return;
    if(!validateCurrent())return;
    setSaving(true);
    const next=Math.max(1,Math.min(8,target));
    const saved=await onSave(event.id,{...patchForStep(),wizard_step:next});
    setSaving(false);
    if(!saved)return;
    setState(saved);setStep(next);focusCurrentStep();
  }
  async function saveDraft(){
    if(saving)return;setSaving(true);
    const saved=await onSave(event.id,{...patchForStep(),wizard_step:step,status:"RASCUNHO"});
    setSaving(false);if(saved)setState(saved);
  }
  async function publishEvent(){
    const missing:string[]=[];
    if(!String(state.title||"").trim())missing.push("título");
    if(!state.starts_at)missing.push("data e horário");
    if(!String(state.venue||"").trim())missing.push("local");
    if(!String(state.city||"").trim())missing.push("cidade");
    if(!guests.length)missing.push("participações");
    if(admission==="DONATION"&&!String(state.donation_item||"").trim())missing.push("doação");
    if(missing.length){notify("Antes de publicar, complete: "+missing.join(", ")+".");return}
    setSaving(true);
    const finalCompleted={...completed,review:true};
    const saved=await onSave(event.id,{status:"PUBLICADO",published_at:state.published_at||new Date().toISOString(),wizard_step:8,wizard_completed:finalCompleted});
    setSaving(false);if(saved){setState(saved);notify("Evento publicado.");}
  }
  async function jumpTo(target:number){await saveAndGo(target)}

  return <div className="event-wizard">
    <div className="event-wizard-top">
      <button className="admin-back" onClick={onBack}><ChevronLeft size={18}/>Eventos</button>
      <ModeSwitch mode={mode} setMode={setMode}/>
    </div>

    <div className="event-wizard-heading">
      <div><span className="eyebrow">Cadastro por etapas</span><h2>{state.title||"Novo evento"}</h2><p>Cada etapa é gravada no banco antes de você avançar. Participações, programação e FAQ são salvos individualmente no momento em que você adiciona.</p></div>
      <a className="admin-preview-button" href={"/eventos/"+state.slug} target="_blank" rel="noreferrer"><ExternalLink size={17}/><span>Prévia</span></a>
    </div>

    <div className="event-wizard-anchor" ref={wizardAnchorRef}>
      <div className="event-wizard-progress"><div><strong>Etapa {step} de 8 · {steps[step-1][0]}</strong><span>{Math.round(step/8*100)}%</span></div><div className="event-wizard-progress-bar"><span style={{width:(step/8*100)+"%"}}/></div></div>
      <div className="event-wizard-steps" aria-label="Etapas do cadastro">
        {steps.map(([label,key],i)=><button key={key} title={label} aria-label={"Etapa "+(i+1)+": "+label} className={(step===i+1?"active ":"")+(completed[key]?"done":"")} onClick={()=>jumpTo(i+1)}><span>{i+1}</span><small>{label}</small></button>)}
      </div>
    </div>

    <section className="event-wizard-panel">
      {step===1&&<>
        <WizardHeading icon={<ImageIcon size={20}/>} title="Identidade do evento" text="Defina como o encontro será apresentado na página pública."/>
        <Field label="Título do evento"><input value={state.title||""} onChange={e=>set("title",e.target.value)} placeholder="Ex.: Café com Testemunho"/></Field>
        <Field label="Chamada / tema"><input value={state.event_theme||""} onChange={e=>set("event_theme",e.target.value)} placeholder="Ex.: Um encontro de fé e louvor!"/></Field>
        <Field label="Resumo"><textarea value={state.summary||""} onChange={e=>set("summary",e.target.value)} placeholder="Uma chamada curta para o evento."/></Field>
        <Field label="Capa do evento" hint="Use 1600 × 900 px (16:9), JPG ou WebP. Mantenha rostos e textos importantes na região central para o recorte no celular."><ImagePicker value={state.cover_url||""} onChange={v=>set("cover_url",v)} onUpload={uploadCover}/></Field>
      </>}

      {step===2&&<>
        <WizardHeading icon={<Clock3 size={20}/>} title="Data e local" text="Data e hora ficam separadas para funcionar melhor no celular. O endereço aparece apenas nesta etapa."/>
        <div className="event-date-grid"><Field label="Data"><input type="date" value={startParts.date} onChange={e=>setStartDate(e.target.value)}/></Field><Field label="Horário"><input type="time" value={startParts.time} onChange={e=>setStartTime(e.target.value)}/></Field></div>
        <Field label="Nome do local"><input value={state.venue||""} onChange={e=>set("venue",e.target.value)} placeholder="Ex.: Casa da Cultura"/></Field>
        <Field label="Endereço completo"><input value={state.address||""} onChange={e=>set("address",e.target.value)} placeholder="Rua, número e bairro"/></Field>
        <div className="admin-two-col"><Field label="Cidade"><input value={state.city||""} onChange={e=>set("city",e.target.value)} placeholder="Telêmaco Borba"/></Field><Field label="Ponto de referência"><input value={state.reference||""} onChange={e=>set("reference",e.target.value)} placeholder="Opcional"/></Field></div>
      </>}

      {step===3&&<>
        <WizardHeading icon={<Ticket size={20}/>} title="Público e entrada" text="Esses campos viram informações visíveis e objetivas na página do evento."/>
        <div className="admin-two-col"><Field label="Público"><input value={state.audience||""} onChange={e=>set("audience",e.target.value)} placeholder="Ex.: Mulheres"/></Field><Field label="Faixa etária"><input value={state.age_range||""} onChange={e=>set("age_range",e.target.value)} placeholder="Ex.: Livre, 16+, adultas"/></Field></div>
        <Field label="Tipo de entrada"><select value={admission} onChange={e=>set("admission_type",e.target.value)}><option value="FREE">Gratuita</option><option value="PAID">Paga</option><option value="DONATION">Doação / contribuição</option><option value="REGISTRATION">Inscrição obrigatória</option></select></Field>
        {admission==="DONATION"&&<Field label="O que levar / doar"><input value={state.donation_item||""} onChange={e=>set("donation_item",e.target.value)} placeholder="Ex.: 1 kg de alimento não perecível"/></Field>}
        {admission==="PAID"&&<div className="admin-two-col"><Field label="Valor (R$)"><input inputMode="decimal" value={state.admission_amount??""} onChange={e=>set("admission_amount",e.target.value)} placeholder="0,00"/></Field><Field label="Como exibir"><input value={state.admission_label||""} onChange={e=>set("admission_label",e.target.value)} placeholder="Ex.: Ingresso antecipado"/></Field></div>}
        {admission==="REGISTRATION"&&<><Field label="Link da inscrição"><input type="url" value={state.registration_url||""} onChange={e=>set("registration_url",e.target.value)}/></Field><label className="admin-check"><input type="checkbox" checked={state.registration_required!==false} onChange={e=>set("registration_required",e.target.checked)}/>Inscrição obrigatória</label></>}
        <Field label="Orientação sobre a entrada"><textarea value={state.entry_info||""} onChange={e=>set("entry_info",e.target.value)} placeholder="Ex.: Entregue a doação na recepção."/></Field>
      </>}

      {step===4&&<>
        <WizardHeading icon={<UsersRound size={20}/>} title="Participações" text="Cadastre todas as pessoas que vão ministrar, pregar, cantar, testemunhar ou participar do encontro."/>
        <GuestCreate eventId={event.id} onAdd={onAddGuest} notify={notify}/>
        <div className="event-nested-list">{guests.map(g=><GuestEditor key={g.id} guest={g} onSave={onUpdateGuest} onDelete={onDeleteGuest} notify={notify}/>)}</div>
        {!guests.length&&<div className="wizard-empty-note">Adicione pelo menos uma participação para concluir esta etapa.</div>}
      </>}

      {step===5&&<>
        <WizardHeading icon={<Clock3 size={20}/>} title="Programação" text="Se a sequência já estiver definida, organize os momentos do encontro. Você pode deixar esta etapa sem itens e completar depois."/>
        <ScheduleCreate eventId={event.id} onAdd={onAddSchedule}/>
        <div className="event-nested-list">{schedule.map(item=><ScheduleEditor key={item.id} item={item} onSave={onUpdateSchedule} onDelete={onDeleteSchedule}/>)}</div>
        {!schedule.length&&<div className="wizard-empty-note">Programação ainda não definida. Você pode continuar e voltar depois.</div>}
      </>}

      {step===6&&<>
        <WizardHeading icon={<BookHeart size={20}/>} title="Conteúdo da página" text="Aqui fica o texto principal do encontro e, se houver, uma Palavra específica para esta edição."/>
        <Field label="Descrição completa"><textarea value={state.description||""} onChange={e=>set("description",e.target.value)} placeholder="Conte o propósito do encontro, o que vai acontecer e o convite para participar."/></Field>
        <div className="event-content-tip"><strong>Texto curto x descrição</strong><span>O resumo aparece como chamada. A descrição é o texto mais completo da página do evento.</span></div>
        <Field label="Referência bíblica opcional"><input value={state.verse_reference||""} onChange={e=>set("verse_reference",e.target.value)} placeholder="Ex.: Salmos 126:5"/></Field>
        <Field label="Versículo opcional"><textarea value={state.verse_text||""} onChange={e=>set("verse_text",e.target.value)}/></Field>
      </>}

      {step===7&&<>
        <WizardHeading icon={<SlidersHorizontal size={20}/>} title="Informações extras" text="Complete somente o que fizer sentido para este encontro."/>
        <div className="event-faq-block"><strong>Dúvidas frequentes</strong><FaqCreate eventId={event.id} onAdd={onAddFaq}/><div className="event-nested-list">{faqs.map(item=><FaqEditor key={item.id} item={item} onSave={onUpdateFaq} onDelete={onDeleteFaq}/>)}</div></div>
        {mode==="advanced"&&<div className="admin-advanced-box">
          <div className="admin-advanced-label"><SlidersHorizontal size={17}/><strong>Configurações avançadas</strong></div>
          <div className="event-date-grid"><Field label="Data de término"><input type="date" value={endParts.date} onChange={e=>setEndDate(e.target.value)}/></Field><Field label="Horário de término"><input type="time" value={endParts.time} onChange={e=>setEndTime(e.target.value)}/></Field></div>
          <Field label="Link do mapa"><input type="url" value={state.map_url||""} onChange={e=>set("map_url",e.target.value)} placeholder="Google Maps ou outro serviço"/></Field>
          <Field label="Slug da página"><input value={state.slug||""} onChange={e=>set("slug",slugifyLocal(e.target.value))}/></Field>
        </div>}
      </>}

      {step===8&&<>
        <WizardHeading icon={<Save size={20}/>} title="Revisão e publicação" text="Confira o que já está cadastrado antes de publicar."/>
        <div className="event-review-grid">
          <ReviewItem label="Evento" value={state.title||"Não informado"}/>
          <ReviewItem label="Data" value={state.starts_at?new Intl.DateTimeFormat("pt-BR",{dateStyle:"long",timeStyle:"short",timeZone:"America/Sao_Paulo"}).format(new Date(state.starts_at)):"Não informada"}/>
          <ReviewItem label="Local" value={[state.venue,state.city].filter(Boolean).join(" · ")||"Não informado"}/>
          <ReviewItem label="Entrada" value={admission==="DONATION"?(state.donation_item||"Doação"):admission==="PAID"?(state.admission_label||("R$ "+state.admission_amount)):admission==="REGISTRATION"?"Inscrição obrigatória":"Gratuita"}/>
          <ReviewItem label="Participações" value={guests.length?guests.map(g=>g.name+" — "+g.role_label).join(" · "):"Nenhuma cadastrada"}/>
          <ReviewItem label="Programação" value={schedule.length?schedule.length+" itens cadastrados":"Ainda não definida"}/>
          <ReviewItem label="Capa" value={state.cover_url?"Cadastrada":"Ainda não cadastrada"}/>
          <ReviewItem label="Status atual" value={state.status||"RASCUNHO"}/>
        </div>
        <div className="event-review-actions">
          <button className="btn btn-secondary" disabled={saving} onClick={saveDraft}>Salvar como rascunho</button>
          <a className="btn btn-secondary" href={"/eventos/"+state.slug} target="_blank" rel="noreferrer">Visualizar página</a>
          <button className="btn btn-dark" disabled={saving} onClick={publishEvent}>{saving?"Salvando...":"Publicar evento"}</button>
        </div>
      </>}
    </section>

    {step<8&&<div className="event-wizard-actions">
      <button className="wizard-back-button" disabled={saving} onClick={()=>step===1?onBack():saveAndGo(step-1)}><ChevronLeft size={18}/>{step===1?"Sair":"Voltar"}</button>
      <button className="wizard-save-button" disabled={saving} onClick={()=>saveAndGo(step+1)}>{saving?"Salvando...":"Salvar e continuar"}<ChevronRight size={18}/></button>
    </div>}
  </div>
}

function WizardHeading({icon,title,text}:{icon:React.ReactNode;title:string;text:string}){return <div className="wizard-heading">{icon}<div><h3>{title}</h3><p>{text}</p></div></div>}
function ReviewItem({label,value}:{label:string;value:string}){return <div className="event-review-item"><span>{label}</span><strong>{value}</strong></div>}

const guestRoles=[
  ["MINISTRATION","Ministração"],["PREACHING","Pregadora / Pregação"],["SINGER","Cantora"],["WORSHIP","Louvor / música"],["TESTIMONY","Testemunho"],
  ["PRAYER","Oração"],["HOST","Apresentação"],["GUEST","Convidada"],["OTHER","Outra participação"]
] as const;

function GuestCreate({eventId,onAdd,notify}:{eventId:string;onAdd:(eventId:string,payload:AnyRow)=>void;notify:(m:string)=>void}){
  const[name,setName]=useState(""),[role,setRole]=useState("MINISTRATION"),[bio,setBio]=useState(""),[image,setImage]=useState("");
  async function upload(file:File){const fd=new FormData();fd.set("file",file);fd.set("folder","eventos/participantes");notify("Enviando foto...");const res=await fetch("/api/admin/upload",{method:"POST",body:fd});const data=await res.json();if(!res.ok){notify(data.error||"Falha no upload.");return}setImage(data.url);notify("Foto enviada.");}
  function add(){if(!name.trim()){notify("Informe o nome da participante.");return}const label=guestRoles.find(x=>x[0]===role)?.[1]||"Participação";onAdd(eventId,{name:name.trim(),role_key:role,role_label:label,bio:bio.trim()||null,image_url:image||null});setName("");setBio("");setImage("");}
  return <details className="event-add-panel"><summary><Plus size={17}/>Adicionar participação</summary><div className="event-add-body">
    <Field label="Tipo de participação"><select value={role} onChange={e=>setRole(e.target.value)}>{guestRoles.map(([k,l])=><option key={k} value={k}>{l}</option>)}</select></Field>
    <Field label="Nome"><input value={name} onChange={e=>setName(e.target.value)} placeholder="Nome da ministrante, pregadora, cantora..."/></Field>
    <Field label="Apresentação / bio curta"><textarea value={bio} onChange={e=>setBio(e.target.value)} placeholder="Opcional"/></Field>
    <Field label="Foto" hint="Recomendado: 800 × 800 px, imagem quadrada, JPG ou WebP."><ImagePicker value={image} onChange={setImage} onUpload={upload}/></Field>
    <button className="admin-save-button" type="button" onClick={add}><Plus size={17}/>Adicionar ao evento</button>
  </div></details>
}

function GuestEditor({guest,onSave,onDelete,notify}:{guest:AnyRow;onSave:(id:string,patch:AnyRow)=>void;onDelete:(id:string)=>void;notify:(m:string)=>void}){
  const[state,setState]=useState<AnyRow>({...guest});const set=(k:string,v:any)=>setState((x:AnyRow)=>({...x,[k]:v}));
  async function upload(file:File){const fd=new FormData();fd.set("file",file);fd.set("folder","eventos/participantes");notify("Enviando foto...");const res=await fetch("/api/admin/upload",{method:"POST",body:fd});const data=await res.json();if(!res.ok){notify(data.error||"Falha no upload.");return}set("image_url",data.url);notify("Foto enviada.");}
  return <details className="event-item-card"><summary><div>{state.image_url?<img src={state.image_url} alt=""/>:<span className="event-avatar"><UsersRound size={17}/></span>}<div><strong>{state.name}</strong><small>{state.role_label}</small></div></div><ChevronRight size={17}/></summary><div className="event-item-body">
    <Field label="Tipo"><select value={state.role_key||"OTHER"} onChange={e=>{const role=e.target.value;set("role_key",role);set("role_label",guestRoles.find(x=>x[0]===role)?.[1]||"Participação")}}>{guestRoles.map(([k,l])=><option key={k} value={k}>{l}</option>)}</select></Field>
    <Field label="Nome"><input value={state.name||""} onChange={e=>set("name",e.target.value)}/></Field>
    <Field label="Bio curta"><textarea value={state.bio||""} onChange={e=>set("bio",e.target.value)}/></Field>
    <Field label="Foto"><ImagePicker value={state.image_url||""} onChange={v=>set("image_url",v)} onUpload={upload}/></Field>
    <Field label="Instagram / link opcional"><input value={state.social_url||""} onChange={e=>set("social_url",e.target.value)}/></Field>
    <div className="event-item-actions"><button className="admin-save-button" onClick={()=>onSave(guest.id,state)}><Save size={16}/>Salvar</button><button className="event-delete-button" onClick={()=>onDelete(guest.id)}><Trash2 size={16}/>Remover</button></div>
  </div></details>
}

function ScheduleCreate({eventId,onAdd}:{eventId:string;onAdd:(eventId:string,payload:AnyRow)=>void}){
  const[time,setTime]=useState(""),[title,setTitle]=useState(""),[category,setCategory]=useState(""),[description,setDescription]=useState("");
  function add(){if(!title.trim())return;onAdd(eventId,{time_label:time||null,title:title.trim(),category:category||null,description:description.trim()||null});setTime("");setTitle("");setCategory("");setDescription("");}
  return <details className="event-add-panel"><summary><Plus size={17}/>Adicionar item da programação</summary><div className="event-add-body">
    <div className="admin-two-col"><Field label="Horário"><input type="time" value={time} onChange={e=>setTime(e.target.value)}/></Field><Field label="Tipo"><input value={category} onChange={e=>setCategory(e.target.value)} placeholder="Ex.: Louvor"/></Field></div>
    <Field label="Título"><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ex.: Ministração com ..."/></Field>
    <Field label="Descrição"><textarea value={description} onChange={e=>setDescription(e.target.value)}/></Field>
    <button className="admin-save-button" type="button" onClick={add}><Plus size={17}/>Adicionar</button>
  </div></details>
}

function ScheduleEditor({item,onSave,onDelete}:{item:AnyRow;onSave:(id:string,patch:AnyRow)=>void;onDelete:(id:string)=>void}){
  const[state,setState]=useState<AnyRow>({...item});const set=(k:string,v:any)=>setState((x:AnyRow)=>({...x,[k]:v}));
  return <details className="event-item-card"><summary><div><span className="event-time-badge">{state.time_label||"—"}</span><div><strong>{state.title}</strong><small>{state.category}</small></div></div><ChevronRight size={17}/></summary><div className="event-item-body">
    <div className="admin-two-col"><Field label="Horário"><input type="time" value={state.time_label||""} onChange={e=>set("time_label",e.target.value)}/></Field><Field label="Tipo"><input value={state.category||""} onChange={e=>set("category",e.target.value)}/></Field></div>
    <Field label="Título"><input value={state.title||""} onChange={e=>set("title",e.target.value)}/></Field><Field label="Descrição"><textarea value={state.description||""} onChange={e=>set("description",e.target.value)}/></Field>
    <div className="event-item-actions"><button className="admin-save-button" onClick={()=>onSave(item.id,state)}><Save size={16}/>Salvar</button><button className="event-delete-button" onClick={()=>onDelete(item.id)}><Trash2 size={16}/>Remover</button></div>
  </div></details>
}

function FaqCreate({eventId,onAdd}:{eventId:string;onAdd:(eventId:string,payload:AnyRow)=>void}){
  const[q,setQ]=useState(""),[a,setA]=useState("");function add(){if(!q.trim()||!a.trim())return;onAdd(eventId,{question:q.trim(),answer:a.trim()});setQ("");setA("")}
  return <details className="event-add-panel"><summary><Plus size={17}/>Adicionar dúvida</summary><div className="event-add-body"><Field label="Pergunta"><input value={q} onChange={e=>setQ(e.target.value)}/></Field><Field label="Resposta"><textarea value={a} onChange={e=>setA(e.target.value)}/></Field><button className="admin-save-button" type="button" onClick={add}>Adicionar</button></div></details>
}

function FaqEditor({item,onSave,onDelete}:{item:AnyRow;onSave:(id:string,patch:AnyRow)=>void;onDelete:(id:string)=>void}){
  const[q,setQ]=useState(item.question||""),[a,setA]=useState(item.answer||"");
  return <details className="event-item-card"><summary><div><strong>{q}</strong></div><ChevronRight size={17}/></summary><div className="event-item-body"><Field label="Pergunta"><input value={q} onChange={e=>setQ(e.target.value)}/></Field><Field label="Resposta"><textarea value={a} onChange={e=>setA(e.target.value)}/></Field><div className="event-item-actions"><button className="admin-save-button" onClick={()=>onSave(item.id,{question:q,answer:a})}><Save size={16}/>Salvar</button><button className="event-delete-button" onClick={()=>onDelete(item.id)}><Trash2 size={16}/>Remover</button></div></div></details>
}

function ScriptureEditor({item,onSave}:{item:AnyRow;onSave:(id:string,patch:AnyRow)=>void}){
  const[state,setState]=useState<AnyRow>({...item});const set=(k:string,v:any)=>setState((x:AnyRow)=>({...x,[k]:v}));
  return <details className="admin-section-card"><summary><div><span>{item.reference}</span><small>{item.location==="home"?"Página inicial":"Sobre"}</small></div><ChevronRight size={18}/></summary><div className="admin-section-body">
    <div className="admin-inline-toggle"><div><strong>Exibir Palavra</strong></div><button className={state.visible?"on":""} onClick={()=>set("visible",!state.visible)} type="button"><span/></button></div>
    <Field label="Referência"><input value={state.reference||""} onChange={e=>set("reference",e.target.value)}/></Field><Field label="Versículo"><textarea value={state.verse_text||""} onChange={e=>set("verse_text",e.target.value)}/></Field><Field label="Reflexão"><textarea value={state.reflection||""} onChange={e=>set("reflection",e.target.value)}/></Field><button className="admin-save-button" onClick={()=>onSave(item.id,state)}><Save size={18}/>Salvar Palavra</button>
  </div></details>
}

function BrandSettings({value,onSave,notify}:{value:AnyRow;onSave:(v:AnyRow)=>void;notify:(m:string)=>void}){
  const[state,setState]=useState<AnyRow>({...value});const set=(k:string,v:any)=>setState((x:AnyRow)=>({...x,[k]:v}));
  async function upload(file:File){const fd=new FormData();fd.set("file",file);fd.set("folder","identidade");notify("Enviando logotipo...");const res=await fetch("/api/admin/upload",{method:"POST",body:fd});const data=await res.json();if(!res.ok){notify(data.error||"Falha no upload.");return}set("logo_url",data.url);notify("Logotipo enviado. Salve para aplicar.");}
  return <div className="form"><Field label="Nome do projeto"><input value={state.name||""} onChange={e=>set("name",e.target.value)}/></Field><Field label="Logotipo principal"><ImagePicker value={state.logo_url||""} onChange={v=>set("logo_url",v)} onUpload={upload}/></Field><button className="admin-save-button" onClick={()=>onSave(state)}><Save size={18}/>Salvar identidade</button></div>
}
function ContactSettings({value,onSave}:{value:AnyRow;onSave:(v:AnyRow)=>void}){
  const[state,setState]=useState<AnyRow>({...value});const set=(k:string,v:any)=>setState((x:AnyRow)=>({...x,[k]:v}));
  return <div className="form"><Field label="Instagram"><input value={state.instagram||""} onChange={e=>set("instagram",e.target.value)}/></Field><Field label="WhatsApp"><input value={state.whatsapp||""} onChange={e=>set("whatsapp",e.target.value)}/></Field><Field label="E-mail"><input value={state.email||""} onChange={e=>set("email",e.target.value)}/></Field><button className="admin-save-button" onClick={()=>onSave(state)}><Save size={18}/>Salvar contato</button></div>
}
function SocialEditor({item,onSave}:{item:AnyRow;onSave:(id:string,url:string)=>void}){const[url,setUrl]=useState(item.url||"");return <div className="admin-inline-editor"><strong>{item.label}</strong><input value={url} onChange={e=>setUrl(e.target.value)}/><button onClick={()=>onSave(item.id,url)}><Save size={16}/></button></div>}
function SettingCard({title,children}:{title:string;children:React.ReactNode}){return <section className="admin-settings-card"><h3>{title}</h3>{children}</section>}

function ImagePicker({value,onChange,onUpload}:{value:string;onChange:(v:string)=>void;onUpload:(file:File)=>void}){
  return <div className="admin-image-picker">
    {value?<div className="admin-image-preview"><img src={value} alt="Prévia"/><button type="button" onClick={()=>onChange("")}>Remover</button></div>:<div className="admin-image-empty"><ImageIcon size={24}/><span>Nenhuma imagem</span></div>}
    <label className="admin-upload-label"><Upload size={17}/>Escolher imagem<input type="file" accept="image/*" onChange={e=>{const f=e.target.files?.[0];if(f)onUpload(f)}}/></label>
    <input className="admin-url-input" value={value} onChange={e=>onChange(e.target.value)} placeholder="Ou cole a URL da imagem"/>
  </div>
}
function toLocalInput(v:any){if(!v)return"";const d=new Date(v);if(Number.isNaN(d.getTime()))return"";const pad=(n:number)=>String(n).padStart(2,"0");return`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`}
function splitLocalDateTime(v:any){const x=toLocalInput(v);if(!x)return{date:"",time:""};const[date,time]=x.split("T");return{date,time}}
function combineLocalDateTime(date:string,time:string){if(!date)return null;const d=new Date(`${date}T${time||"00:00"}:00`);return Number.isNaN(d.getTime())?null:d.toISOString()}
function todayInput(){const d=new Date();const pad=(n:number)=>String(n).padStart(2,"0");return`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`}
function slugifyLocal(v:string){return v.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"")}
