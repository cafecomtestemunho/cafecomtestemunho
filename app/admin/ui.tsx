"use client";

import{useMemo,useRef,useState}from"react";
import{GalleryBulkUpload}from"./gallery-upload";
import{createClient}from"@/lib/supabase/client";
import{
  PanelsTopLeft,CalendarDays,Settings2,ChevronLeft,ChevronRight,
  Image as ImageIcon,Upload,Save,Plus,BookHeart,Instagram,MessageSquareQuote,
  Images,LogOut,ExternalLink,LayoutDashboard,UsersRound,Clock3,Ticket,Trash2
}from"lucide-react";

type AnyRow=Record<string,any>;
type MainTab="dashboard"|"events"|"testimonials"|"gallery"|"pages"|"settings";
type PageKey="home"|"about"|"agenda"|"photos"|"testimonials"|"submit";

const pages:{key:PageKey;label:string;description:string;sections:string[];special?:string}[]=[
  {key:"home",label:"Página inicial",description:"Hero, apresentação, Palavra e chamada final.",sections:["home_hero","home_intro","home_word","home_cta"]},
  {key:"about",label:"Sobre",description:"Hero delicada, história em capítulos, Palavra, memórias, testemunho fundador e CTA.",sections:["about_mission","about_word","about_photos","about_testimony","about_cta"],special:"story"},
  {key:"agenda",label:"Agenda",description:"Hero, introdução e chamada da página de encontros.",sections:["agenda_hero","agenda_intro","agenda_cta"]},
  {key:"photos",label:"Fotos",description:"Imagem da Hero da galeria pública.",sections:["photos_hero"]},
  {key:"testimonials",label:"Testemunhos",description:"Imagem da Hero e chamada final da página de testemunhos.",sections:["testimonials_hero","testimonials_cta"]},
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
  userId,userEmail,roles,initialEvents,initialEventGuests,initialEventSchedule,initialEventFaqs,initialTestimonials,initialPublications,initialSections,initialStory,
  initialScriptures,initialInstagram,initialPhotos,initialAlbums,initialSocial,initialSettings,initialPhotoCount,initialPublicPhotoCount
}:{
  userId:string;userEmail:string;roles:string[];
  initialEvents:AnyRow[];initialEventGuests:AnyRow[];initialEventSchedule:AnyRow[];initialEventFaqs:AnyRow[];
  initialTestimonials:AnyRow[];initialPublications:AnyRow[];initialSections:AnyRow[];initialStory:AnyRow[];
  initialScriptures:AnyRow[];initialInstagram:AnyRow[];initialPhotos:AnyRow[];initialAlbums:AnyRow[];
  initialSocial:AnyRow[];initialSettings:AnyRow[];initialPhotoCount:number;initialPublicPhotoCount:number;
}){
  const s=useMemo(()=>createClient(),[]);
  const[tab,setTab]=useState<MainTab>("dashboard");
  const[selectedPage,setSelectedPage]=useState<PageKey|null>(null);
  const[selectedTestimonialId,setSelectedTestimonialId]=useState<string|null>(null);
  const[testimonialView,setTestimonialView]=useState<"new"|"review"|"published"|"archived">("new");
  const[eventView,setEventView]=useState<"all"|"draft"|"published"|"closed">("all");
  const[message,setMessage]=useState("");
  const[events,setEvents]=useState(initialEvents);
  const[selectedEventId,setSelectedEventId]=useState<string|null>(null);
  const[eventGuests,setEventGuests]=useState(initialEventGuests);
  const[eventSchedule,setEventSchedule]=useState(initialEventSchedule);
  const[eventFaqs,setEventFaqs]=useState(initialEventFaqs);
  const[testimonials,setTestimonials]=useState(initialTestimonials);
  const[publications,setPublications]=useState(initialPublications);
  const[sections,setSections]=useState(initialSections);
  const[story,setStory]=useState(initialStory);
  const[scriptures,setScriptures]=useState(initialScriptures);
  const[instagram,setInstagram]=useState(initialInstagram);
  const[photos,setPhotos]=useState(initialPhotos);
  const[photoTotal,setPhotoTotal]=useState(initialPhotoCount);
  const[publicPhotoTotal,setPublicPhotoTotal]=useState(initialPublicPhotoCount);
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
  async function deleteStory(id:string){
    if(!window.confirm("Remover este capítulo definitivamente?"))return;
    const{error}=await s.from("story_chapters").delete().eq("id",id);
    if(error){notify(error.message);return}
    setStory(current=>current.filter(x=>x.id!==id));await audit("STORY_DELETED","story_chapter",id);notify("Capítulo removido.");
  }
  async function saveEvent(id:string,patch:AnyRow){
    const{data,error}=await s.from("events").update({...patch,updated_by:userId}).eq("id",id).select().single();
    if(error){notify(error.message);return null}
    setEvents(current=>current.map(x=>x.id===id?data:x));await audit("EVENT_UPDATED","event",id);notify("Etapa salva.");
    return data;
  }
  async function deleteEvent(id:string){
    if(!window.confirm("Remover este evento e todo o conteúdo ligado a ele? Essa ação não pode ser desfeita."))return;
    const{error}=await s.from("events").delete().eq("id",id);
    if(error){notify(error.message);return}
    setEvents(current=>current.filter(x=>x.id!==id));
    setEventGuests(current=>current.filter(x=>x.event_id!==id));
    setEventSchedule(current=>current.filter(x=>x.event_id!==id));
    setEventFaqs(current=>current.filter(x=>x.event_id!==id));
    setSelectedEventId(null);await audit("EVENT_DELETED","event",id);notify("Evento removido.");
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
    if(status==="ARQUIVADO"){
      const{data:pub}=await s.from("testimonial_publications").update({published_at:null,edited_by:userId}).eq("testimonial_id",id).select().maybeSingle();
      if(pub)setPublications(current=>current.map(x=>x.id===pub.id?pub:x));
    }
    setTestimonials(current=>current.map(t=>t.id===id?data:t));await audit("TESTIMONIAL_STATUS_CHANGED","testimonial",id,{status});notify("Testemunho atualizado.");
  }
  async function preparePublication(t:AnyRow){
    if(t.publication_consent==="PRIVATE_ONLY"){notify("Este testemunho foi enviado somente para leitura privada.");return}
    const title=(t.original_text.split(/[.!?\n]/)[0]||"Testemunho").trim().slice(0,90);
    const slug=(slugify(title)||"testemunho")+"-"+String(t.id).slice(0,8);
    const display=t.publication_consent==="ANONYMOUS"?"Anônimo":(t.display_name_original||"Anônimo");
    const excerpt=t.original_text.replace(/\s+/g," ").slice(0,220);
    const{data:pub,error}=await s.from("testimonial_publications").upsert({
      testimonial_id:t.id,slug,public_title:title,public_excerpt:excerpt,public_text:t.original_text,
      public_display_name:display,published_at:null,edited_by:userId
    },{onConflict:"testimonial_id"}).select().single();
    if(error){notify(error.message);return}
    setPublications(current=>current.some(x=>x.id===pub.id)?current.map(x=>x.id===pub.id?pub:x):[pub,...current]);
    const{data:reviewed}=await s.from("testimonials").update({status:"APROVADO",reviewer_id:userId,reviewed_at:new Date().toISOString()}).eq("id",t.id).select("id,display_name_original,original_text,publication_consent,status,created_at").single();
    if(reviewed)setTestimonials(current=>current.map(x=>x.id===t.id?reviewed:x));
    await audit("TESTIMONIAL_PREPARED","testimonial",t.id);
    notify("Rascunho de publicação preparado. Revise antes de publicar.");
  }

  async function savePublication(id:string,patch:AnyRow){
    const{data,error}=await s.from("testimonial_publications").update({...patch,edited_by:userId}).eq("id",id).select().single();
    if(error){notify(error.message);return}
    setPublications(current=>current.map(x=>x.id===id?data:x));notify("Publicação atualizada.");
  }
  async function deleteTestimonial(id:string){
    if(!window.confirm("Remover este testemunho definitivamente? A publicação ligada a ele também será removida."))return;
    const{error}=await s.from("testimonials").delete().eq("id",id);
    if(error){notify(error.message);return}
    setTestimonials(current=>current.filter(x=>x.id!==id));
    setPublications(current=>current.filter(x=>x.testimonial_id!==id));
    await audit("TESTIMONIAL_DELETED","testimonial",id);notify("Testemunho removido.");
  }
  async function createAlbum(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();const fd=new FormData(e.currentTarget);const title=String(fd.get("title")||"").trim(),slug=slugify(String(fd.get("slug")||title));
    const{data,error}=await s.from("photo_albums").insert({title,slug,description:String(fd.get("description")||""),visible:true}).select().single();
    if(error){notify(error.message);return}
    setAlbums([data,...albums]);e.currentTarget.reset();notify("Álbum criado.");
  }
  async function saveAlbum(id:string,patch:AnyRow){
    const{data,error}=await s.from("photo_albums").update(patch).eq("id",id).select().single();
    if(error){notify(error.message);return}
    setAlbums(current=>current.map(x=>x.id===id?data:x));notify("Álbum salvo.");
  }
  async function deleteAlbum(id:string){
    if(!window.confirm("Remover este álbum? As fotos continuarão na galeria geral."))return;
    const{error}=await s.from("photo_albums").delete().eq("id",id);
    if(error){notify(error.message);return}
    setAlbums(current=>current.filter(x=>x.id!==id));
    setPhotos(current=>current.map(x=>x.album_id===id?{...x,album_id:null}:x));notify("Álbum removido.");
  }
  async function savePhoto(id:string,patch:AnyRow){
    const previous=photos.find(x=>x.id===id);
    const{data,error}=await s.from("media_assets").update(patch).eq("id",id).select().single();
    if(error){notify(error.message);return}
    if(previous&&previous.is_private!==data.is_private){
      setPublicPhotoTotal(current=>Math.max(0,current+(data.is_private===true?-1:1)));
    }
    setPhotos(current=>current.map(x=>x.id===id?data:x));notify("Foto atualizada.");
  }
  async function deletePhoto(id:string){
    if(!window.confirm("Remover esta foto definitivamente?"))return;
    const previous=photos.find(x=>x.id===id);
    const res=await fetch("/api/admin/photos",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});
    const payload=await res.json();
    if(!res.ok){notify(payload.error||"Não foi possível remover a foto.");return}
    setPhotos(current=>current.filter(x=>x.id!==id));
    setPhotoTotal(current=>Math.max(0,current-1));
    if(previous?.is_private!==true)setPublicPhotoTotal(current=>Math.max(0,current-1));
    notify("Foto removida.");
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
  async function deleteScripture(id:string){
    if(!window.confirm("Remover esta Palavra definitivamente?"))return;
    const{error}=await s.from("scripture_spotlights").delete().eq("id",id);
    if(error){notify(error.message);return}
    setScriptures(current=>current.filter(x=>x.id!==id));notify("Palavra removida.");
  }
  async function addInstagram(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();const fd=new FormData(e.currentTarget);
    const post_url=String(fd.get("post_url")||"").trim();
    if(!/^https?:\/\/(www\.)?instagram\.com\/(p|reel|reels)\//i.test(post_url)){notify("Cole o link de um post ou Reel público do Instagram.");return}
    const{data,error}=await s.from("instagram_highlights").insert({post_url,location:String(fd.get("location")||"home"),visible:true,sort_order:instagram.length*10+10,title:null,caption:null,cover_url:null}).select().single();
    if(error){notify(error.message);return}
    setInstagram(current=>[...current,data]);e.currentTarget.reset();notify("Post do Instagram adicionado.");
  }
  async function saveInstagram(id:string,patch:AnyRow){
    const{data,error}=await s.from("instagram_highlights").update(patch).eq("id",id).select().single();
    if(error){notify(error.message);return}
    setInstagram(current=>current.map(x=>x.id===id?data:x));notify("Post atualizado.");
  }
  async function toggleInstagram(id:string,visible:boolean){await saveInstagram(id,{visible})}
  async function deleteInstagram(id:string){
    if(!window.confirm("Remover este post da curadoria do site? O post original no Instagram não será apagado."))return;
    const{error}=await s.from("instagram_highlights").delete().eq("id",id);
    if(error){notify(error.message);return}
    setInstagram(current=>current.filter(x=>x.id!==id));notify("Post removido do site.");
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
  const visiblePhotoCount=publicPhotoTotal;
  const hiddenPhotoCount=Math.max(0,photoTotal-publicPhotoTotal);
  const nextEvent=events.filter(event=>event.status==="PUBLICADO").sort((a,b)=>new Date(a.starts_at||0).getTime()-new Date(b.starts_at||0).getTime())[0]||events[0];
  const filteredEvents=events.filter(event=>eventView==="all"||eventView==="draft"&&event.status==="RASCUNHO"||eventView==="published"&&event.status==="PUBLICADO"||eventView==="closed"&&event.status==="ENCERRADO");
  const filteredTestimonials=testimonials.filter(item=>{
    const publication=publications.find(p=>p.testimonial_id===item.id);
    if(testimonialView==="new")return item.status==="RECEBIDO";
    if(testimonialView==="review")return ["EM_ANALISE","APROVADO"].includes(item.status)&&!publication?.published_at;
    if(testimonialView==="published")return !!publication?.published_at;
    return item.status==="ARQUIVADO";
  });
  const selectedTestimonial=testimonials.find(item=>item.id===selectedTestimonialId)||null;
  const selectedPublication=selectedTestimonial?publications.find(item=>item.testimonial_id===selectedTestimonial.id):null;

  function goTab(next:MainTab){setTab(next);setSelectedPage(null);setSelectedTestimonialId(null);setSelectedEventId(null)}

  return <main className="admin-mobile-shell">
    <div className="admin-mobile-content">
      <header className={"admin-page-heading "+((tab==="events"&&selectedEventId)||(tab==="testimonials"&&selectedTestimonialId)||(tab==="pages"&&selectedPage)?"is-editor":"")}>
        <div>
          <span className="admin-kicker">Café com Testemunho</span>
          <h1>{tab==="dashboard"?"Painel":tab==="events"?"Eventos":tab==="testimonials"?"Testemunhos":tab==="gallery"?"Galeria":tab==="pages"?(currentPage?.label||"Páginas"):"Ajustes"}</h1>
        </div>
        {!selectedEventId&&!selectedTestimonialId&&!selectedPage&&<div className="admin-heading-actions">
          <a className="admin-header-icon" href="/" target="_blank" rel="noreferrer" aria-label="Ver site"><ExternalLink size={18}/></a>
          <button className={"admin-header-icon "+(tab==="settings"?"active":"")} type="button" onClick={()=>goTab(tab==="settings"?"dashboard":"settings")} aria-label="Abrir ajustes"><Settings2 size={18}/></button>
        </div>}
      </header>

      {message&&<div className="admin-toast">{message}</div>}

      {tab==="dashboard"&&<section className="admin-screen admin-dashboard-clean">
        <div className="admin-welcome">
          <div><span className="eyebrow">Administração</span><h2>O que precisa de atenção?</h2><p>Os fluxos principais ficam aqui. Ajustes de conteúdo e configuração ficam separados para não misturar tarefas.</p></div>
        </div>

        <div className="admin-focus-list">
          <button onClick={()=>goTab("events")}><CalendarDays size={19}/><div><strong>Eventos</strong><span>{nextEvent?nextEvent.title:"Nenhum evento cadastrado"}</span></div><b>{events.length}</b><ChevronRight size={18}/></button>
          <button onClick={()=>goTab("testimonials")}><MessageSquareQuote size={19}/><div><strong>Testemunhos</strong><span>{newCount?newCount+" aguardando revisão":"Nenhum novo relato"}</span></div><b>{newCount}</b><ChevronRight size={18}/></button>
          <button onClick={()=>goTab("gallery")}><Images size={19}/><div><strong>Galeria</strong><span>{visiblePhotoCount+" fotos publicadas"}</span></div><b>{photoTotal}</b><ChevronRight size={18}/></button>
        </div>

        <button className="admin-pages-entry" onClick={()=>goTab("pages")}><PanelsTopLeft size={18}/><div><strong>Editar páginas</strong><span>Textos, imagens e visibilidade do site</span></div><ChevronRight size={18}/></button>
      </section>}

      {tab==="events"&&<section className="admin-screen">
        {!selectedEventId?<>
          <div className="admin-section-intro"><span className="eyebrow">Publicação</span><h2>Fluxo do evento</h2><p>Crie, complete e publique cada encontro em um fluxo único.</p></div>
          <form className="event-quick-create" onSubmit={createEvent}>
            <div><strong>Criar evento</strong><span>Informe apenas o nome para começar. O restante é preenchido por etapas.</span></div>
            <Field label="Nome do evento"><input name="title" required placeholder="Ex.: Café com Testemunho"/></Field>
            <button className="admin-primary-action" type="submit"><Plus size={17}/>Criar rascunho</button>
          </form>
          <div className="admin-segmented">
            <button className={eventView==="all"?"active":""} onClick={()=>setEventView("all")}>Todos</button>
            <button className={eventView==="draft"?"active":""} onClick={()=>setEventView("draft")}>Rascunhos</button>
            <button className={eventView==="published"?"active":""} onClick={()=>setEventView("published")}>Publicados</button>
            <button className={eventView==="closed"?"active":""} onClick={()=>setEventView("closed")}>Encerrados</button>
          </div>
          <div className="event-admin-list">{filteredEvents.map(e=><button key={e.id} className="event-admin-row" onClick={()=>setSelectedEventId(e.id)}>
            <div className="event-admin-row-main"><span className={"event-status-dot "+String(e.status).toLowerCase()}/><div><strong>{e.title}</strong><span>{e.starts_at?new Intl.DateTimeFormat("pt-BR",{dateStyle:"medium",timeStyle:"short",timeZone:"America/Sao_Paulo"}).format(new Date(e.starts_at)):"Data ainda não definida"} · {e.status==="RASCUNHO"?"Rascunho":e.status==="PUBLICADO"?"Publicado":"Encerrado"}</span></div></div>
            <div className="event-progress-mini"><span style={{width:Math.max(8,Math.min(100,Number(e.wizard_step||1)/8*100))+"%"}}/></div>
            <ChevronRight size={18}/>
          </button>)}
          {!filteredEvents.length&&<div className="admin-empty">Nenhum evento nesta etapa.</div>}
          </div>
        </>:(()=>{
          const e=events.find(x=>x.id===selectedEventId);
          if(!e)return <div className="admin-empty">Evento não encontrado.</div>;
          return <EventWizard
            event={e} onBack={()=>setSelectedEventId(null)} onSave={saveEvent} notify={notify}
            guests={eventGuests.filter(x=>x.event_id===e.id)} schedule={eventSchedule.filter(x=>x.event_id===e.id)} faqs={eventFaqs.filter(x=>x.event_id===e.id)}
            onAddGuest={addEventGuest} onUpdateGuest={updateEventGuest} onDeleteGuest={deleteEventGuest}
            onAddSchedule={addScheduleItem} onUpdateSchedule={updateScheduleItem} onDeleteSchedule={deleteScheduleItem}
            onAddFaq={addEventFaq} onUpdateFaq={updateEventFaq} onDeleteFaq={deleteEventFaq} onDeleteEvent={deleteEvent}
          />
        })()}
      </section>}

      {tab==="testimonials"&&<section className="admin-screen">
        {!selectedTestimonial?<>
          <div className="admin-section-intro"><span className="eyebrow">Fluxo editorial</span><h2>Caixa de entrada</h2><p>Leia o relato original, confirme a autorização e só então prepare a publicação.</p></div>
          <div className="admin-segmented admin-testimonial-tabs">
            <button className={testimonialView==="new"?"active":""} onClick={()=>setTestimonialView("new")}>Novos</button>
            <button className={testimonialView==="review"?"active":""} onClick={()=>setTestimonialView("review")}>Em revisão</button>
            <button className={testimonialView==="published"?"active":""} onClick={()=>setTestimonialView("published")}>Publicados</button>
            <button className={testimonialView==="archived"?"active":""} onClick={()=>setTestimonialView("archived")}>Arquivados</button>
          </div>
          <div className="admin-testimonial-list">
            {filteredTestimonials.map(t=>{const pub=publications.find(p=>p.testimonial_id===t.id);return <button key={t.id} className="admin-testimonial-row" onClick={()=>setSelectedTestimonialId(t.id)}>
              <div><strong>{t.display_name_original||"Sem identificação"}</strong><span>{String(t.original_text||"").replace(/\s+/g," ").slice(0,105)}{String(t.original_text||"").length>105?"…":""}</span><small>{new Date(t.created_at).toLocaleDateString("pt-BR")} · {t.publication_consent==="PRIVATE_ONLY"?"Somente privado":t.publication_consent==="ANONYMOUS"?"Pode publicar anônimo":"Pode publicar com nome"}</small></div>
              <span className={"admin-testimonial-status "+(pub?.published_at?"published":"")}>{pub?.published_at?"Publicado":t.status==="RECEBIDO"?"Novo":t.status==="ARQUIVADO"?"Arquivado":"Revisão"}</span>
              <ChevronRight size={18}/>
            </button>})}
            {!filteredTestimonials.length&&<div className="admin-empty">Nenhum testemunho nesta etapa.</div>}
          </div>
        </>:<div className="admin-testimonial-review">
          <button className="admin-back" onClick={()=>setSelectedTestimonialId(null)}><ChevronLeft size={18}/>Voltar para testemunhos</button>
          <div className="admin-review-header"><div><span className="eyebrow">Relato original</span><h2>{selectedTestimonial.display_name_original||"Sem identificação"}</h2></div><span className="status-pill">{selectedTestimonial.status}</span></div>

          <section className="admin-review-consent">
            <strong>Autorização recebida</strong>
            <span>{selectedTestimonial.publication_consent==="PRIVATE_ONLY"?"Somente leitura privada. Este relato não pode ser publicado.":selectedTestimonial.publication_consent==="ANONYMOUS"?"Pode ser publicado sem identificar a autora.":"Pode ser publicado com o nome informado."}</span>
          </section>

          <article className="admin-review-original">{selectedTestimonial.original_text}</article>

          <div className="admin-review-actions">
            {selectedTestimonial.status==="RECEBIDO"&&<button onClick={()=>moderate(selectedTestimonial.id,"EM_ANALISE")}>Marcar em revisão</button>}
            {selectedTestimonial.publication_consent!=="PRIVATE_ONLY"&&!selectedPublication&&<button className="primary" onClick={()=>preparePublication(selectedTestimonial)}>Preparar publicação</button>}
            {selectedTestimonial.status==="ARQUIVADO"?<button onClick={()=>moderate(selectedTestimonial.id,"EM_ANALISE")}>Reabrir para revisão</button>:<button onClick={()=>moderate(selectedTestimonial.id,"ARQUIVADO")}>Arquivar</button>}
          </div>

          {selectedPublication&&<TestimonialPublicationEditor item={selectedPublication} onSave={savePublication}/>}
          <button className="admin-text-danger" onClick={()=>deleteTestimonial(selectedTestimonial.id)}>Excluir definitivamente</button>
        </div>}
      </section>}

      {tab==="gallery"&&<section className="admin-screen">
        <div className="admin-section-intro"><span className="eyebrow">Galeria</span><h2>Fotos</h2><p>Envie em lote, organize por álbum e escolha o que fica visível no site.</p></div>
        <div className="admin-gallery-counts">
          <div><strong>{photoTotal}</strong><span>Total de fotos</span></div>
          <div><strong>{visiblePhotoCount}</strong><span>Publicadas</span></div>
          <div><strong>{hiddenPhotoCount}</strong><span>Ocultas</span></div>
        </div>

        <GalleryBulkUpload albums={albums} notify={notify} onUploaded={newPhotos=>{setPhotos(current=>[...newPhotos,...current]);setPhotoTotal(current=>current+newPhotos.length);setPublicPhotoTotal(current=>current+newPhotos.length)}}/>

        <section className="admin-gallery-albums">
          <div className="admin-inline-heading"><div><strong>Álbuns</strong><span>Use apenas quando precisar separar grupos de fotos.</span></div></div>
          <details className="admin-create-panel"><summary><Plus size={17}/>Criar álbum</summary><form className="form" onSubmit={createAlbum}>
            <Field label="Nome"><input name="title" required/></Field>
            <Field label="Descrição"><textarea name="description"/></Field>
            <button className="admin-primary-action" type="submit">Criar álbum</button>
          </form></details>
          {albums.length>0&&<div className="admin-editor-stack">{albums.map(a=><AlbumEditor key={a.id} album={a} onSave={saveAlbum} onDelete={deleteAlbum}/>)}</div>}
        </section>

        <div className="admin-inline-heading gallery-heading"><div><strong>Fotos cadastradas</strong><span>Toque em uma foto para editar descrição, álbum ou visibilidade.</span></div></div>
        <div className="admin-photo-grid">{photos.map(p=><PhotoEditor key={p.id} photo={p} albums={albums} onSave={savePhoto} onDelete={deletePhoto}/>)}</div>
        {!photos.length&&<div className="admin-empty">Nenhuma foto cadastrada.</div>}
      </section>}

      {tab==="pages"&&<section className="admin-screen">
        {!currentPage?<div className="admin-page-list">
          <div className="admin-section-intro"><span className="eyebrow">Conteúdo do site</span><h2>Escolha uma página</h2><p>Dentro dela aparecem somente os campos que realmente controlam aquela tela.</p></div>
          {pages.map(p=><button className="admin-page-card admin-page-card-clean" key={p.key} onClick={()=>setSelectedPage(p.key)}>
            <div><strong>{p.label}</strong><span>{p.description}</span></div><ChevronRight size={18}/>
          </button>)}
        </div>:<div className="admin-page-editor">
          <div className="admin-page-editor-bar">
            <button className="admin-back" onClick={()=>setSelectedPage(null)}><ChevronLeft size={18}/>Páginas</button>
            <a className="admin-page-preview" href={currentPage.key==="home"?"/":currentPage.key==="about"?"/sobre":currentPage.key==="submit"?"/enviar-testemunho":"/"+currentPage.key} target="_blank" rel="noreferrer"><ExternalLink size={15}/>Ver página</a>
          </div>
          <div className="admin-editor-context"><span className="eyebrow">Edição da página</span><p>Abra uma seção por vez, altere somente o que precisa e salve.</p></div>
          <div className="admin-editor-stack">
            {pageSections.map(sec=><SectionEditor key={sec.id} section={sec} title={sectionNames[sec.section_key]||sec.title} onSave={saveSection} notify={notify}/>)}
            {currentPage.special==="story"&&<div className="admin-subsection-group"><div className="admin-subsection-title"><div><strong>História em capítulos</strong><span>Linha do tempo da página Sobre</span></div></div>{story.map(ch=><StoryEditor key={ch.id} chapter={ch} onSave={saveStory} onDelete={deleteStory} notify={notify}/>)}</div>}
          </div>
        </div>}
      </section>}

      {tab==="settings"&&<section className="admin-screen">
        <div className="admin-section-intro"><span className="eyebrow">Ajustes</span><h2>Configurações</h2><p>Itens globais e conteúdos auxiliares. Você não precisa entrar aqui para publicar eventos, testemunhos ou fotos.</p></div>
        <SettingCard title="Identidade do projeto"><BrandSettings value={brandSetting} onSave={v=>saveSetting("brand",v)} notify={notify}/></SettingCard>
        <SettingCard title="Contato"><ContactSettings value={contactSetting} onSave={v=>saveSetting("contact",v)}/></SettingCard>
        <SettingCard title="Redes sociais"><div className="admin-editor-stack">{social.map(item=><SocialEditor key={item.id} item={item} onSave={saveSocial}/>)}</div></SettingCard>

        <div className="admin-settings-secondary">
          <div className="admin-inline-heading"><div><strong>Palavra e versículos</strong><span>Conteúdo bíblico usado na Home e na página Sobre.</span></div></div>
          <details className="admin-create-panel"><summary><Plus size={17}/>Adicionar Palavra</summary><form className="form" onSubmit={addScripture}>
            <Field label="Onde aparece"><select name="location"><option value="home">Página inicial</option><option value="about">Sobre</option></select></Field>
            <Field label="Referência"><input name="reference" required/></Field>
            <Field label="Versículo"><textarea name="verse_text" required/></Field>
            <Field label="Reflexão"><textarea name="reflection"/></Field>
            <button className="admin-primary-action">Adicionar Palavra</button>
          </form></details>
          <div className="admin-editor-stack">{scriptures.map(v=><ScriptureEditor key={v.id} item={v} onSave={saveScripture} onDelete={deleteScripture}/>)}</div>
        </div>

        <div className="admin-settings-secondary">
          <div className="admin-inline-heading"><div><strong>Publicações do Instagram</strong><span>Posts ou Reels selecionados para aparecer no site.</span></div></div>
          <details className="admin-create-panel"><summary><Plus size={17}/>Adicionar publicação</summary><form className="form" onSubmit={addInstagram}>
            <Field label="Link do post ou Reel"><input name="post_url" type="url" required placeholder="https://www.instagram.com/p/..."/></Field>
            <Field label="Onde aparece"><select name="location"><option value="home">Página inicial</option></select></Field>
            <button className="admin-primary-action">Adicionar ao site</button>
          </form></details>
          <div className="admin-editor-stack">{instagram.map(p=><InstagramAdminEditor key={p.id} item={p} onSave={saveInstagram} onDelete={deleteInstagram}/>)}</div>
        </div>

        <SettingCard title="Rodapé">{sections.find(x=>x.section_key==="global_footer")&&<SectionEditor section={sections.find(x=>x.section_key==="global_footer")!} title="Conteúdo global do rodapé" onSave={saveSection} notify={notify}/>}</SettingCard>
        <button className="admin-logout" onClick={logout}><LogOut size={18}/>Sair da conta <small>{userEmail}</small></button>
      </section>}
    </div>

    {!selectedEventId&&!selectedTestimonialId&&!selectedPage&&<><nav className="admin-bottom-nav" aria-label="Navegação administrativa">
      <button className={tab==="dashboard"?"active":""} onClick={()=>goTab("dashboard")}><LayoutDashboard size={20}/><span>Início</span></button>
      <button className={tab==="events"?"active":""} onClick={()=>goTab("events")}><CalendarDays size={20}/><span>Eventos</span></button>
      <button className={tab==="testimonials"?"active":""} onClick={()=>{goTab("testimonials");setSelectedTestimonialId(null)}}><MessageSquareQuote size={20}/><span>Testemunhos</span></button>
      <button className={tab==="gallery"?"active":""} onClick={()=>goTab("gallery")}><Images size={20}/><span>Galeria</span></button>
      <button className={tab==="pages"?"active":""} onClick={()=>goTab("pages")}><PanelsTopLeft size={20}/><span>Páginas</span></button>
    </nav></>}

  </main>
}

function Field({label,children,hint}:{label:string;children:React.ReactNode;hint?:string}){return <div className="field"><label>{label}</label>{children}{hint&&<small className="field-hint">{hint}</small>}</div>}

function SectionEditor({section,title,onSave,notify}:{section:AnyRow;title:string;onSave:(id:string,patch:AnyRow)=>void;notify:(m:string)=>void}){
  const isHomeHero=section.section_key==="home_hero";
  const isHomeIntro=section.section_key==="home_intro";
  const isHomeWord=section.section_key==="home_word";
  const imageOnlyHero=["agenda_hero","photos_hero","testimonials_hero"].includes(section.section_key);
  const isInternalHero=["about_mission","submit_testimonial_hero"].includes(section.section_key);
  const isAgendaIntro=section.section_key==="agenda_intro";
  const isAgendaCta=section.section_key==="agenda_cta";
  const isTestimonialsCta=section.section_key==="testimonials_cta";
  const isHomeCta=section.section_key==="home_cta";
  const isAboutWord=section.section_key==="about_word";
  const isAboutPhotos=section.section_key==="about_photos";
  const isAboutTestimony=section.section_key==="about_testimony";
  const isAboutCta=section.section_key==="about_cta";
  const isSubmitCopy=["submit_testimonial_intro","submit_testimonial_privacy"].includes(section.section_key);
  const[t,setT]=useState(section.title||""),[sub,setSub]=useState(section.subtitle||""),[body,setBody]=useState(section.body||""),[visible,setVisible]=useState(section.visible!==false);
  const[image,setImage]=useState(section.image_url||""),[ctaLabel,setCtaLabel]=useState(section.cta_label||""),[ctaUrl,setCtaUrl]=useState(section.cta_url||"");
  const[heroLogo,setHeroLogo]=useState(section.settings?.logo_url||"");

  async function upload(file:File){
    const fd=new FormData();fd.set("file",file);fd.set("folder","conteudo/secoes");notify("Enviando imagem...");
    const res=await fetch("/api/admin/upload",{method:"POST",body:fd});const data=await res.json();
    if(!res.ok){notify(data.error||"Falha no upload.");return}
    setImage(data.url);notify("Imagem enviada. Salve a seção para aplicar.");
  }
  async function uploadHeroLogo(file:File){
    const fd=new FormData();fd.set("file",file);fd.set("folder","conteudo/hero");notify("Enviando logotipo...");
    const res=await fetch("/api/admin/upload",{method:"POST",body:fd});const data=await res.json();
    if(!res.ok){notify(data.error||"Falha no upload.");return}
    setHeroLogo(data.url);notify("Logotipo enviado. Salve a Hero para aplicar.");
  }
  function save(){
    onSave(section.id,{
      title:t,subtitle:sub||null,body,image_url:image||null,visible,
      cta_label:ctaLabel||null,cta_url:ctaUrl||null,
      sort_order:section.sort_order??0,theme:section.theme||"default",alignment:section.alignment||"left",
      settings:{...(section.settings||{}),logo_url:heroLogo||null}
    });
  }

  return <details className="admin-section-card">
    <summary><div><span>{title}</span><small>{visible?"Visível no site":"Oculta no site"}</small></div><ChevronRight size={18}/></summary>
    <div className="admin-section-body">
      <div className="admin-inline-toggle"><div><strong>Exibir seção</strong><span>{visible?"Esta seção aparece no site.":"Esta seção está escondida."}</span></div><button className={visible?"on":""} onClick={()=>setVisible(!visible)} type="button" aria-label="Alternar visibilidade"><span/></button></div>

      {imageOnlyHero?<>
        <div className="admin-fixed-copy-note"><strong>Conteúdo visual da Hero</strong><span>O texto desta Hero faz parte do design da página. Aqui você troca somente a imagem de fundo.</span></div>
        <Field label="Imagem de fundo"><ImagePicker value={image} onChange={setImage} onUpload={upload}/></Field>
      </>:isAgendaIntro?<>
        <div className="admin-fixed-copy-note"><strong>Seção de próximos encontros</strong><span>O título e a chamada fazem parte do layout atual. Use este controle apenas para exibir ou ocultar a seção.</span></div>
      </>:isAgendaCta?<>
        <div className="admin-fixed-copy-note"><strong>Chamada para participar</strong><span>A copy já está definida no layout. Você pode trocar a imagem de fundo e o destino do botão.</span></div>
        <Field label="Imagem de fundo"><ImagePicker value={image} onChange={setImage} onUpload={upload}/></Field>
        <Field label="Destino do botão"><input value={ctaUrl} onChange={e=>setCtaUrl(e.target.value)} placeholder="/agenda"/></Field>
      </>:isTestimonialsCta?<>
        <div className="admin-fixed-copy-note"><strong>Chamada para enviar testemunho</strong><span>O texto faz parte do layout atual. Aqui você controla a visibilidade e o destino do botão.</span></div>
        <Field label="Destino do botão"><input value={ctaUrl} onChange={e=>setCtaUrl(e.target.value)} placeholder="/enviar-testemunho"/></Field>
      </>:isHomeHero?<>
        <Field label="Imagem de fundo da Hero" hint="Prefira uma foto vertical ou com o assunto principal no centro."><ImagePicker value={image} onChange={setImage} onUpload={upload}/></Field>
        <Field label="Logotipo da Hero" hint="Se ficar vazio, o sistema usa o logotipo principal."><ImagePicker value={heroLogo} onChange={setHeroLogo} onUpload={uploadHeroLogo}/></Field>
        <Field label="Chamada curta"><input value={sub} onChange={e=>setSub(e.target.value)}/></Field>
        <Field label="Título"><input value={t} onChange={e=>setT(e.target.value)}/></Field>
        <Field label="Texto"><textarea value={body} onChange={e=>setBody(e.target.value)}/></Field>
        <div className="admin-two-col"><Field label="Texto do botão"><input value={ctaLabel} onChange={e=>setCtaLabel(e.target.value)}/></Field><Field label="Destino"><input value={ctaUrl} onChange={e=>setCtaUrl(e.target.value)}/></Field></div>
      </>:isInternalHero?<>
        <Field label="Imagem de fundo da Hero"><ImagePicker value={image} onChange={setImage} onUpload={upload}/></Field>
        <Field label="Chamada pequena"><input value={sub} onChange={e=>setSub(e.target.value)}/></Field>
        <Field label="Título"><input value={t} onChange={e=>setT(e.target.value)}/></Field>
        <Field label="Texto de apoio"><textarea value={body} onChange={e=>setBody(e.target.value)}/></Field>
      </>:isHomeWord?<>
        <Field label="Logotipo desta seção"><ImagePicker value={image} onChange={setImage} onUpload={upload}/></Field>
      </>:isHomeIntro?<>
        <Field label="Imagem de fundo"><ImagePicker value={image} onChange={setImage} onUpload={upload}/></Field>
        <Field label="Título"><input value={t} onChange={e=>setT(e.target.value)}/></Field>
        <Field label="Texto"><textarea value={body} onChange={e=>setBody(e.target.value)}/></Field>
        <div className="admin-two-col"><Field label="Texto do botão"><input value={ctaLabel} onChange={e=>setCtaLabel(e.target.value)}/></Field><Field label="Destino"><input value={ctaUrl} onChange={e=>setCtaUrl(e.target.value)}/></Field></div>
      </>:isHomeCta?<>
        <Field label="Título"><input value={t} onChange={e=>setT(e.target.value)}/></Field>
        <Field label="Texto"><textarea value={body} onChange={e=>setBody(e.target.value)}/></Field>
        <div className="admin-fixed-copy-note"><strong>Botões desta seção</strong><span>Os dois botões seguem os fluxos oficiais: Agenda e Enviar testemunho.</span></div>
      </>:isAboutWord?<>
        <div className="admin-fixed-copy-note"><strong>Palavra da página Sobre</strong><span>O versículo e a reflexão são editados em Ajustes → Palavra. Aqui você controla apenas esta seção e a chamada pequena.</span></div>
        <Field label="Chamada pequena"><input value={sub} onChange={e=>setSub(e.target.value)} placeholder="Ex.: Bíblia"/></Field>
      </>:isAboutPhotos?<>
        <Field label="Chamada pequena"><input value={sub} onChange={e=>setSub(e.target.value)}/></Field>
        <Field label="Título"><input value={t} onChange={e=>setT(e.target.value)}/></Field>
        <Field label="Texto opcional"><textarea value={body} onChange={e=>setBody(e.target.value)}/></Field>
        <div className="admin-fixed-copy-note"><strong>Fotos desta seção</strong><span>As imagens vêm automaticamente da Galeria pública. Não é necessário cadastrar foto aqui.</span></div>
      </>:isAboutTestimony?<>
        <Field label="Chamada pequena"><input value={sub} onChange={e=>setSub(e.target.value)}/></Field>
        <Field label="Título"><input value={t} onChange={e=>setT(e.target.value)}/></Field>
        <Field label="Texto"><textarea value={body} onChange={e=>setBody(e.target.value)}/></Field>
        <div className="admin-fixed-copy-note"><strong>Testemunho fundador</strong><span>O relato completo é administrado no fluxo de Testemunhos.</span></div>
      </>:isAboutCta?<>
        <Field label="Título"><input value={t} onChange={e=>setT(e.target.value)}/></Field>
        <Field label="Texto"><textarea value={body} onChange={e=>setBody(e.target.value)}/></Field>
        <div className="admin-two-col"><Field label="Texto do botão principal"><input value={ctaLabel} onChange={e=>setCtaLabel(e.target.value)}/></Field><Field label="Destino do botão"><input value={ctaUrl} onChange={e=>setCtaUrl(e.target.value)}/></Field></div>
      </>:isSubmitCopy?<>
        <Field label="Título"><input value={t} onChange={e=>setT(e.target.value)}/></Field>
        <Field label="Texto"><textarea value={body} onChange={e=>setBody(e.target.value)}/></Field>
      </>:<>
        <Field label="Título"><input value={t} onChange={e=>setT(e.target.value)}/></Field>
        <Field label="Subtítulo"><input value={sub} onChange={e=>setSub(e.target.value)}/></Field>
        <Field label="Texto"><textarea value={body} onChange={e=>setBody(e.target.value)}/></Field>
        <Field label="Imagem da seção"><ImagePicker value={image} onChange={setImage} onUpload={upload}/></Field>
        {(section.cta_label||section.cta_url)&&<div className="admin-two-col"><Field label="Texto do botão"><input value={ctaLabel} onChange={e=>setCtaLabel(e.target.value)}/></Field><Field label="Destino"><input value={ctaUrl} onChange={e=>setCtaUrl(e.target.value)}/></Field></div>}
      </>}

      <button className="admin-save-button" onClick={save}><Save size={17}/>Salvar alterações</button>
    </div>
  </details>;
}

function StoryEditor({chapter,onSave,onDelete,notify}:{chapter:AnyRow;onSave:(id:string,patch:AnyRow)=>void;onDelete:(id:string)=>void;notify:(m:string)=>void}){
  const[t,setT]=useState(chapter.title||""),[body,setBody]=useState(chapter.body||""),[eyebrow,setEyebrow]=useState(chapter.eyebrow||""),[quote,setQuote]=useState(chapter.quote||""),[image,setImage]=useState(chapter.image_url||""),[visible,setVisible]=useState(chapter.visible!==false);
  async function upload(file:File){
    const fd=new FormData();fd.set("file",file);fd.set("folder","conteudo/historia");notify("Enviando imagem...");
    const res=await fetch("/api/admin/upload",{method:"POST",body:fd});const data=await res.json();
    if(!res.ok){notify(data.error||"Falha no upload.");return}
    setImage(data.url);notify("Imagem enviada. Salve o capítulo.");
  }
  return <details className="admin-section-card">
    <summary><div><span>{t||"Capítulo"}</span><small>{visible?"Visível":"Oculto"}</small></div><ChevronRight size={18}/></summary>
    <div className="admin-section-body">
      <div className="admin-inline-toggle"><div><strong>Exibir capítulo</strong></div><button className={visible?"on":""} onClick={()=>setVisible(!visible)} type="button"><span/></button></div>
      <Field label="Título"><input value={t} onChange={e=>setT(e.target.value)}/></Field>
      <Field label="Narrativa"><textarea value={body} onChange={e=>setBody(e.target.value)}/></Field>
      <details className="admin-secondary-options">
        <summary>Complementos do capítulo</summary>
        <div>
          <Field label="Marcador"><input value={eyebrow} onChange={e=>setEyebrow(e.target.value)}/></Field>
          <Field label="Frase em destaque"><textarea value={quote} onChange={e=>setQuote(e.target.value)}/></Field>
          <Field label="Imagem"><ImagePicker value={image} onChange={setImage} onUpload={upload}/></Field>
        </div>
      </details>
      <div className="admin-record-actions"><button className="admin-save-button" onClick={()=>onSave(chapter.id,{title:t,body,eyebrow,quote:quote||null,image_url:image||null,visible,sort_order:chapter.sort_order??0})}><Save size={17}/>Salvar capítulo</button><button className="admin-remove-button" onClick={()=>onDelete(chapter.id)}><Trash2 size={16}/>Remover</button></div>
    </div>
  </details>;
}

function EventWizard({
  event,onBack,onSave,notify,guests,schedule,faqs,
  onAddGuest,onUpdateGuest,onDeleteGuest,onAddSchedule,onUpdateSchedule,onDeleteSchedule,onAddFaq,onUpdateFaq,onDeleteFaq,onDeleteEvent
}:{
  event:AnyRow;onBack:()=>void;
  onSave:(id:string,patch:AnyRow)=>Promise<AnyRow|null>;notify:(m:string)=>void;
  guests:AnyRow[];schedule:AnyRow[];faqs:AnyRow[];
  onAddGuest:(eventId:string,payload:AnyRow)=>void;onUpdateGuest:(id:string,patch:AnyRow)=>void;onDeleteGuest:(id:string)=>void;
  onAddSchedule:(eventId:string,payload:AnyRow)=>void;onUpdateSchedule:(id:string,patch:AnyRow)=>void;onDeleteSchedule:(id:string)=>void;
  onAddFaq:(eventId:string,payload:AnyRow)=>void;onUpdateFaq:(id:string,patch:AnyRow)=>void;onDeleteFaq:(id:string)=>void;onDeleteEvent:(id:string)=>void;
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
    ["Apresentação","identity"],["Data e local","datetime_location"],["Entrada","audience_admission"],["Participações","participants"],
    ["Programação","schedule"],["Texto da página","content"],["Complementos","extras"],["Publicar","review"]
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
      <span className={"event-editor-status "+String(state.status||"RASCUNHO").toLowerCase()}>{state.status==="PUBLICADO"?"Publicado":state.status==="ENCERRADO"?"Encerrado":"Rascunho"}</span>
    </div>

    <div className="event-wizard-heading">
      <div><span className="eyebrow">Publicação do evento</span><h2>{state.title||"Novo evento"}</h2><p>Complete o necessário. Você pode voltar a qualquer etapa antes de publicar.</p></div>
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
        <WizardHeading icon={<Settings2 size={20}/>} title="Informações extras" text="Complete somente o que fizer sentido para este encontro."/>
        <div className="event-faq-block"><strong>Dúvidas frequentes</strong><FaqCreate eventId={event.id} onAdd={onAddFaq}/><div className="event-nested-list">{faqs.map(item=><FaqEditor key={item.id} item={item} onSave={onUpdateFaq} onDelete={onDeleteFaq}/>)}</div></div>
        <details className="admin-secondary-options">
          <summary>Detalhes opcionais</summary>
          <div>
            <div className="event-date-grid"><Field label="Data de término"><input type="date" value={endParts.date} onChange={e=>setEndDate(e.target.value)}/></Field><Field label="Horário de término"><input type="time" value={endParts.time} onChange={e=>setEndTime(e.target.value)}/></Field></div>
            <Field label="Link do mapa"><input type="url" value={state.map_url||""} onChange={e=>set("map_url",e.target.value)} placeholder="Google Maps ou outro serviço"/></Field>
            <Field label="Endereço da página"><input value={state.slug||""} onChange={e=>set("slug",slugifyLocal(e.target.value))}/></Field>
          </div>
        </details>
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
          <button className="btn btn-secondary" disabled={saving} onClick={saveDraft}>{state.status==="PUBLICADO"?"Ocultar do site":"Salvar como rascunho"}</button>
          <a className="btn btn-secondary" href={"/eventos/"+state.slug} target="_blank" rel="noreferrer">Visualizar página</a>
          <button className="btn btn-dark" disabled={saving} onClick={publishEvent}>{saving?"Salvando...":state.status==="PUBLICADO"?"Atualizar publicação":"Publicar evento"}</button>
          <button className="admin-remove-button full" type="button" onClick={()=>onDeleteEvent(event.id)}><Trash2 size={17}/>Remover evento</button>
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

function TestimonialPublicationEditor({item,onSave}:{item:AnyRow;onSave:(id:string,patch:AnyRow)=>void}){
  const[state,setState]=useState<AnyRow>({...item});
  const set=(k:string,v:any)=>setState((x:AnyRow)=>({...x,[k]:v}));
  const visible=!!state.published_at;
  function persist(publishedAt:any){
    set("published_at",publishedAt);
    onSave(item.id,{
      public_title:state.public_title,
      public_display_name:state.public_display_name,
      public_excerpt:state.public_excerpt||null,
      public_text:state.public_text,
      featured:state.featured===true,
      published_at:publishedAt
    });
  }
  return <section className="admin-publication-editor admin-publication-workflow">
    <div className="admin-publication-heading">
      <div><span className="eyebrow">Publicação</span><h3>Como este testemunho vai aparecer</h3><p>Revise título, nome e texto antes de tornar público.</p></div>
      <span className={"status-pill "+(visible?"published":"")}>{visible?"Publicado":"Rascunho"}</span>
    </div>
    <Field label="Título público"><input value={state.public_title||""} onChange={e=>set("public_title",e.target.value)}/></Field>
    <Field label="Nome exibido"><input value={state.public_display_name||""} onChange={e=>set("public_display_name",e.target.value)}/></Field>
    <Field label="Resumo"><textarea value={state.public_excerpt||""} onChange={e=>set("public_excerpt",e.target.value)}/></Field>
    <Field label="Texto publicado"><textarea value={state.public_text||""} onChange={e=>set("public_text",e.target.value)}/></Field>
    <label className="admin-check"><input type="checkbox" checked={state.featured===true} onChange={e=>set("featured",e.target.checked)}/>Destacar na página inicial</label>
    <div className="admin-publication-actions">
      {visible?<>
        <button className="primary" type="button" onClick={()=>persist(state.published_at)}>Salvar alterações</button>
        <button className="ghost-danger" type="button" onClick={()=>persist(null)}>Ocultar do site</button>
      </>:<>
        <button type="button" onClick={()=>persist(null)}>Salvar rascunho</button>
        <button className="primary" type="button" onClick={()=>persist(new Date().toISOString())}>Publicar no site</button>
      </>}
    </div>
  </section>;
}

function ScriptureEditor({item,onSave,onDelete}:{item:AnyRow;onSave:(id:string,patch:AnyRow)=>void;onDelete:(id:string)=>void}){
  const[state,setState]=useState<AnyRow>({...item});const set=(k:string,v:any)=>setState((x:AnyRow)=>({...x,[k]:v}));
  return <details className="admin-section-card"><summary><div><span>{item.reference}</span><small>{item.location==="home"?"Página inicial":"Sobre"}</small></div><ChevronRight size={18}/></summary><div className="admin-section-body">
    <div className="admin-inline-toggle"><div><strong>Exibir Palavra</strong></div><button className={state.visible?"on":""} onClick={()=>set("visible",!state.visible)} type="button"><span/></button></div>
    <Field label="Onde aparece"><select value={state.location||"home"} onChange={e=>set("location",e.target.value)}><option value="home">Página inicial</option><option value="about">Sobre</option></select></Field>
    <Field label="Referência"><input value={state.reference||""} onChange={e=>set("reference",e.target.value)}/></Field><Field label="Versículo"><textarea value={state.verse_text||""} onChange={e=>set("verse_text",e.target.value)}/></Field><Field label="Reflexão"><textarea value={state.reflection||""} onChange={e=>set("reflection",e.target.value)}/></Field>
    <div className="admin-record-actions"><button className="admin-save-button" onClick={()=>onSave(item.id,state)}><Save size={18}/>Salvar Palavra</button><button className="admin-remove-button" onClick={()=>onDelete(item.id)}><Trash2 size={17}/>Remover</button></div>
  </div></details>
}

function AlbumEditor({album,onSave,onDelete}:{album:AnyRow;onSave:(id:string,patch:AnyRow)=>void;onDelete:(id:string)=>void}){
  const[state,setState]=useState<AnyRow>({...album});const set=(k:string,v:any)=>setState((x:AnyRow)=>({...x,[k]:v}));
  return <details className="admin-section-card"><summary><div><span>{state.title}</span><small>{state.visible!==false?"Visível":"Oculto"}</small></div><ChevronRight size={18}/></summary><div className="admin-section-body">
    <div className="admin-inline-toggle"><div><strong>Exibir álbum</strong><span>Ocultar não apaga as fotos.</span></div><button className={state.visible!==false?"on":""} onClick={()=>set("visible",state.visible===false)} type="button"><span/></button></div>
    <Field label="Nome"><input value={state.title||""} onChange={e=>set("title",e.target.value)}/></Field>
    <Field label="Descrição"><textarea value={state.description||""} onChange={e=>set("description",e.target.value)}/></Field>
    <div className="admin-two-col"><Field label="Slug"><input value={state.slug||""} onChange={e=>set("slug",slugifyLocal(e.target.value))}/></Field><Field label="Ordem"><input type="number" value={state.sort_order??0} onChange={e=>set("sort_order",Number(e.target.value)||0)}/></Field></div>
    <div className="admin-record-actions"><button className="admin-save-button" onClick={()=>onSave(album.id,state)}><Save size={17}/>Salvar álbum</button><button className="admin-remove-button" onClick={()=>onDelete(album.id)}><Trash2 size={17}/>Remover</button></div>
  </div></details>
}

function PhotoEditor({photo,albums,onSave,onDelete}:{photo:AnyRow;albums:AnyRow[];onSave:(id:string,patch:AnyRow)=>void;onDelete:(id:string)=>void}){
  const[state,setState]=useState<AnyRow>({...photo});const set=(k:string,v:any)=>setState((x:AnyRow)=>({...x,[k]:v}));
  const visible=state.is_private!==true;
  return <details className={"admin-photo-manage "+(!visible?"is-hidden":"")}>
    <summary>
      <img src={state.url} alt={state.alt_text||""}/>
      <span className="admin-photo-status">{visible?"Publicada":"Oculta"}{state.featured?" · Destaque":""}</span>
    </summary>
    <div className="admin-photo-edit-body">
      <Field label="Descrição"><input value={state.alt_text||""} onChange={e=>set("alt_text",e.target.value)}/></Field>
      <Field label="Álbum"><select value={state.album_id||""} onChange={e=>set("album_id",e.target.value||null)}><option value="">Galeria geral</option>{albums.map(a=><option key={a.id} value={a.id}>{a.title}</option>)}</select></Field>
      <label className="admin-check"><input type="checkbox" checked={state.featured===true} onChange={e=>set("featured",e.target.checked)}/>Destacar na página inicial</label>
      <label className="admin-check"><input type="checkbox" checked={visible} onChange={e=>set("is_private",!e.target.checked)}/>Exibir no site</label>
      <div className="admin-record-actions compact"><button className="admin-save-button" onClick={()=>onSave(photo.id,{alt_text:state.alt_text||null,album_id:state.album_id||null,featured:state.featured===true,is_private:state.is_private===true,sort_order:Number(state.sort_order)||0})}><Save size={16}/>Salvar</button><button className="admin-remove-button" onClick={()=>onDelete(photo.id)}><Trash2 size={16}/>Excluir</button></div>
    </div>
  </details>;
}

function InstagramAdminEditor({item,onSave,onDelete}:{item:AnyRow;onSave:(id:string,patch:AnyRow)=>void;onDelete:(id:string)=>void}){
  const[state,setState]=useState<AnyRow>({...item});const set=(k:string,v:any)=>setState((x:AnyRow)=>({...x,[k]:v}));
  return <details className="admin-section-card"><summary><div><span>Post do Instagram</span><small>{state.visible!==false?"Visível":"Oculto"} · {state.location==="both"?"Home e Sobre":state.location==="about"?"Sobre":"Página inicial"}</small></div><ChevronRight size={18}/></summary><div className="admin-section-body">
    <div className="admin-inline-toggle"><div><strong>Exibir no site</strong><span>Ocultar mantém o post salvo para usar depois.</span></div><button className={state.visible!==false?"on":""} onClick={()=>set("visible",state.visible===false)} type="button"><span/></button></div>
    <Field label="Link do post ou Reel"><input type="url" value={state.post_url||""} onChange={e=>set("post_url",e.target.value)}/></Field>
    <div className="admin-two-col"><Field label="Onde aparece"><select value={state.location||"home"} onChange={e=>set("location",e.target.value)}><option value="home">Página inicial</option><option value="about">Sobre</option><option value="both">Home e Sobre</option></select></Field><Field label="Ordem"><input type="number" value={state.sort_order??0} onChange={e=>set("sort_order",Number(e.target.value)||0)}/></Field></div>
    <a className="admin-external-link" href={state.post_url} target="_blank" rel="noreferrer"><Instagram size={16}/>Abrir publicação original <ExternalLink size={14}/></a>
    <div className="admin-record-actions"><button className="admin-save-button" onClick={()=>onSave(item.id,{post_url:state.post_url,location:state.location,visible:state.visible!==false,sort_order:Number(state.sort_order)||0,title:null,caption:null,cover_url:null})}><Save size={17}/>Salvar</button><button className="admin-remove-button" onClick={()=>onDelete(item.id)}><Trash2 size={17}/>Remover</button></div>
  </div></details>
}

function BrandSettings({value,onSave,notify}:{value:AnyRow;onSave:(v:AnyRow)=>void;notify:(m:string)=>void}){
  const[state,setState]=useState<AnyRow>({...value});const set=(k:string,v:any)=>setState((x:AnyRow)=>({...x,[k]:v}));
  async function upload(file:File){const fd=new FormData();fd.set("file",file);fd.set("folder","identidade");notify("Enviando logotipo...");const res=await fetch("/api/admin/upload",{method:"POST",body:fd});const data=await res.json();if(!res.ok){notify(data.error||"Falha no upload.");return}set("logo_url",data.url);notify("Logotipo enviado. Salve para aplicar.");}
  return <div className="form"><Field label="Nome do projeto"><input value={state.name||""} onChange={e=>set("name",e.target.value)}/></Field><Field label="Logotipo principal"><ImagePicker value={state.logo_url||""} onChange={v=>set("logo_url",v)} onUpload={upload}/></Field><button className="admin-save-button" onClick={()=>onSave(state)}><Save size={18}/>Salvar identidade</button></div>
}
function ContactSettings({value,onSave}:{value:AnyRow;onSave:(v:AnyRow)=>void}){
  const[state,setState]=useState<AnyRow>({...value});const set=(k:string,v:any)=>setState((x:AnyRow)=>({...x,[k]:v}));
  return <div className="form"><Field label="WhatsApp"><input value={state.whatsapp||""} onChange={e=>set("whatsapp",e.target.value)}/></Field><Field label="E-mail"><input value={state.email||""} onChange={e=>set("email",e.target.value)}/></Field><button className="admin-save-button" onClick={()=>onSave(state)}><Save size={17}/>Salvar contato</button></div>
}
function SocialEditor({item,onSave}:{item:AnyRow;onSave:(id:string,url:string)=>void}){const[url,setUrl]=useState(item.url||"");return <div className="admin-inline-editor"><strong>{item.label}</strong><input value={url} onChange={e=>setUrl(e.target.value)}/><button onClick={()=>onSave(item.id,url)}><Save size={16}/></button></div>}
function SettingCard({title,children}:{title:string;children:React.ReactNode}){return <details className="admin-settings-card"><summary><span>{title}</span><ChevronRight size={17}/></summary><div className="admin-settings-body">{children}</div></details>}

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
