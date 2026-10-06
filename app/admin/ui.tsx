"use client";

import{useMemo,useState}from"react";
import{createClient}from"@/lib/supabase/client";
import{
  LayoutDashboard,Home,BookOpen,CalendarDays,MessageSquareQuote,Images,BookHeart,
  Instagram,Settings2,LogOut,Plus,Save,Upload,Eye,EyeOff
}from"lucide-react";

type AnyRow=Record<string,any>;
type Tab="dashboard"|"home"|"about"|"events"|"testimonials"|"photos"|"bible"|"instagram"|"settings";

const tabItems:[
  Tab,string,React.ComponentType<{size?:number}>
][]=[
  ["dashboard","Visão geral",LayoutDashboard],
  ["home","Página inicial",Home],
  ["about","Sobre",BookOpen],
  ["events","Eventos",CalendarDays],
  ["testimonials","Testemunhos",MessageSquareQuote],
  ["photos","Fotos",Images],
  ["bible","Palavra",BookHeart],
  ["instagram","Instagram",Instagram],
  ["settings","Configurações",Settings2],
];

export function AdminClient({
  userId,userEmail,roles,initialEvents,initialTestimonials,initialSections,initialStory,
  initialScriptures,initialInstagram,initialPhotos,initialAlbums,initialSocial
}:{
  userId:string;userEmail:string;roles:string[];
  initialEvents:AnyRow[];initialTestimonials:AnyRow[];initialSections:AnyRow[];initialStory:AnyRow[];
  initialScriptures:AnyRow[];initialInstagram:AnyRow[];initialPhotos:AnyRow[];initialAlbums:AnyRow[];initialSocial:AnyRow[];
}){
  const s=useMemo(()=>createClient(),[]);
  const[tab,setTab]=useState<Tab>("dashboard");
  const[message,setMessage]=useState("");
  const[events,setEvents]=useState(initialEvents);
  const[testimonials,setTestimonials]=useState(initialTestimonials);
  const[sections,setSections]=useState(initialSections);
  const[story,setStory]=useState(initialStory);
  const[scriptures,setScriptures]=useState(initialScriptures);
  const[instagram,setInstagram]=useState(initialInstagram);
  const[photos,setPhotos]=useState(initialPhotos);
  const[albums,setAlbums]=useState(initialAlbums);
  const[social,setSocial]=useState(initialSocial);

  const notify=(v:string)=>{setMessage(v);window.setTimeout(()=>setMessage(""),5000)};
  async function audit(action:string,entity_type:string,entity_id?:string,metadata:Record<string,any>={}){
    await s.from("audit_logs").insert({user_id:userId,action,entity_type,entity_id,metadata});
  }
  async function logout(){await s.auth.signOut();location.href="/admin/login"}

  async function saveSection(id:string,patch:AnyRow){
    const{data,error}=await s.from("institutional_sections").update({...patch,updated_by:userId}).eq("id",id).select().single();
    if(error){notify(error.message);return}
    setSections(sections.map(x=>x.id===id?data:x));await audit("SECTION_UPDATED","institutional_section",id);notify("Conteúdo salvo.");
  }
  async function saveStory(id:string,patch:AnyRow){
    const{data,error}=await s.from("story_chapters").update(patch).eq("id",id).select().single();
    if(error){notify(error.message);return}
    setStory(story.map(x=>x.id===id?data:x));await audit("STORY_UPDATED","story_chapter",id);notify("Capítulo atualizado.");
  }
  async function createEvent(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();const fd=new FormData(e.currentTarget);const title=String(fd.get("title")),slug=String(fd.get("slug"));
    const{data,error}=await s.from("events").insert({
      title,slug,summary:String(fd.get("summary")||""),starts_at:String(fd.get("starts_at")||"")||null,
      venue:String(fd.get("venue")||""),city:String(fd.get("city")||""),status:"RASCUNHO",
      created_by:userId,updated_by:userId
    }).select().single();
    if(error){notify(error.message);return}
    setEvents([data,...events]);await audit("EVENT_CREATED","event",data.id,{slug});e.currentTarget.reset();notify("Evento criado como rascunho.");
  }
  async function setEventStatus(id:string,status:string){
    const{data,error}=await s.from("events").update({status,published_at:status==="PUBLICADO"?new Date().toISOString():null,updated_by:userId}).eq("id",id).select().single();
    if(error){notify(error.message);return}
    setEvents(events.map(e=>e.id===id?data:e));await audit("EVENT_STATUS_CHANGED","event",id,{status});notify("Status do evento atualizado.");
  }
  async function moderate(id:string,status:string){
    const{data,error}=await s.from("testimonials").update({status,reviewer_id:userId,reviewed_at:new Date().toISOString()}).eq("id",id).select("id,display_name_original,original_text,publication_consent,status,created_at").single();
    if(error){notify(error.message);return}
    setTestimonials(testimonials.map(t=>t.id===id?data:t));await audit("TESTIMONIAL_STATUS_CHANGED","testimonial",id,{status});notify("Testemunho atualizado.");
  }
  function slugify(v:string){return v.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"").slice(0,60)}
  async function publish(t:AnyRow){
    if(t.publication_consent==="PRIVATE_ONLY"){notify("Este testemunho não autoriza publicação.");return}
    const title=(t.original_text.split(/[.!?\n]/)[0]||"Testemunho").trim().slice(0,90),base=slugify(title)||"testemunho",slug=base+"-"+String(t.id).slice(0,8),display=t.publication_consent==="ANONYMOUS"?"Anônimo":(t.display_name_original||"Anônimo"),excerpt=t.original_text.replace(/\s+/g," ").slice(0,220);
    const{error}=await s.from("testimonial_publications").upsert({testimonial_id:t.id,slug,public_title:title,public_excerpt:excerpt,public_text:t.original_text,public_display_name:display,published_at:new Date().toISOString(),edited_by:userId},{onConflict:"testimonial_id"});
    if(error){notify(error.message);return}
    const{data,error:statusError}=await s.from("testimonials").update({status:"PUBLICADO",reviewer_id:userId,reviewed_at:new Date().toISOString()}).eq("id",t.id).select("id,display_name_original,original_text,publication_consent,status,created_at").single();
    if(statusError){notify(statusError.message);return}
    setTestimonials(testimonials.map(x=>x.id===t.id?data:x));await audit("TESTIMONIAL_PUBLISHED","testimonial",t.id,{slug,display});notify("Testemunho publicado.");
  }
  async function createAlbum(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();const fd=new FormData(e.currentTarget);const title=String(fd.get("title")),slug=slugify(String(fd.get("slug")||title));
    const{data,error}=await s.from("photo_albums").insert({title,slug,description:String(fd.get("description")||""),visible:true}).select().single();
    if(error){notify(error.message);return}
    setAlbums([data,...albums]);await audit("ALBUM_CREATED","photo_album",data.id,{slug});e.currentTarget.reset();notify("Álbum criado.");
  }
  async function uploadPhoto(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();const form=e.currentTarget;const fd=new FormData(form);fd.set("featured",String(fd.get("featured")==="on"));
    notify("Enviando imagem...");
    const res=await fetch("/api/admin/photos",{method:"POST",body:fd});const payload=await res.json();
    if(!res.ok){notify(payload.error||"Não foi possível enviar a imagem.");return}
    setPhotos([payload.photo,...photos]);form.reset();notify("Foto enviada para a galeria.");
  }
  async function addScripture(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();const fd=new FormData(e.currentTarget);
    const{data,error}=await s.from("scripture_spotlights").insert({
      location:String(fd.get("location")),reference:String(fd.get("reference")),verse_text:String(fd.get("verse_text")),
      reflection:String(fd.get("reflection")||""),visible:true,sort_order:scriptures.length*10+10
    }).select().single();
    if(error){notify(error.message);return}
    setScriptures([...scriptures,data]);e.currentTarget.reset();notify("Palavra adicionada.");
  }
  async function saveScripture(id:string,patch:AnyRow){
    const{data,error}=await s.from("scripture_spotlights").update(patch).eq("id",id).select().single();
    if(error){notify(error.message);return}
    setScriptures(scriptures.map(x=>x.id===id?data:x));notify("Palavra atualizada.");
  }
  async function addInstagram(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();const fd=new FormData(e.currentTarget);
    const{data,error}=await s.from("instagram_highlights").insert({
      post_url:String(fd.get("post_url")),title:String(fd.get("title")||""),caption:String(fd.get("caption")||""),
      cover_url:String(fd.get("cover_url")||"")||null,location:String(fd.get("location")),visible:true,sort_order:instagram.length*10+10
    }).select().single();
    if(error){notify(error.message);return}
    setInstagram([...instagram,data]);e.currentTarget.reset();notify("Post do Instagram adicionado.");
  }
  async function toggleInstagram(id:string,visible:boolean){
    const{data,error}=await s.from("instagram_highlights").update({visible}).eq("id",id).select().single();
    if(error){notify(error.message);return}
    setInstagram(instagram.map(x=>x.id===id?data:x));notify(visible?"Post ativado.":"Post ocultado.");
  }
  async function saveSocial(id:string,url:string){
    const{data,error}=await s.from("social_links").update({url}).eq("id",id).select().single();
    if(error){notify(error.message);return}
    setSocial(social.map(x=>x.id===id?data:x));notify("Rede social atualizada.");
  }

  const section=(key:string)=>sections.find(x=>x.section_key===key);
  const homeHero=section("home_hero"),homeIntro=section("home_intro"),homeCta=section("home_cta"),aboutCta=section("about_cta");
  const newCount=testimonials.filter(t=>t.status==="RECEBIDO").length;

  return <main className="admin-shell admin-editorial">
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand"><span className="brand-dot"/><div><strong>Café com Testemunho</strong><small>Central editorial</small></div></div>
        <nav className="admin-nav">{tabItems.map(([key,label,Icon])=><button key={key} onClick={()=>setTab(key)} className={tab===key?"active":""}><Icon size={18}/><span>{label}</span></button>)}</nav>
        <div className="admin-account"><small>{userEmail}</small><span>{roles.join(" · ")}</span><button onClick={logout}><LogOut size={16}/>Sair</button></div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div><div className="eyebrow">Administração</div><h1>{tabItems.find(x=>x[0]===tab)?.[1]}</h1></div>
          <a className="btn btn-secondary" href="/" target="_blank">Ver site</a>
        </header>
        {message&&<div className="admin-toast">{message}</div>}

        {tab==="dashboard"&&<div className="admin-content">
          <div className="admin-grid">
            <div className="card stat"><span>Eventos</span><strong>{events.length}</strong></div>
            <div className="card stat"><span>Novos testemunhos</span><strong>{newCount}</strong></div>
            <div className="card stat"><span>Fotos</span><strong>{photos.length}</strong></div>
            <div className="card stat"><span>Posts selecionados</span><strong>{instagram.filter(x=>x.visible).length}</strong></div>
          </div>
          <div className="editor-overview">
            <button onClick={()=>setTab("home")} className="editor-shortcut"><Home/><div><strong>Página inicial</strong><span>Hero, história, CTA e destaques</span></div></button>
            <button onClick={()=>setTab("about")} className="editor-shortcut"><BookOpen/><div><strong>Sobre</strong><span>Capítulos da história e chamada final</span></div></button>
            <button onClick={()=>setTab("photos")} className="editor-shortcut"><Images/><div><strong>Fotos</strong><span>Galeria, álbuns e destaques</span></div></button>
            <button onClick={()=>setTab("bible")} className="editor-shortcut"><BookHeart/><div><strong>Palavra</strong><span>Versículos e reflexões</span></div></button>
          </div>
        </div>}

        {tab==="home"&&<div className="admin-content">
          <Intro title="Página inicial" text="Edite os blocos que formam a Home sem precisar lidar com nomes técnicos ou código."/>
          <div className="editor-stack">
            {homeHero&&<SectionEditor title="Hero principal" description="Primeira mensagem que a visitante vê." section={homeHero} onSave={saveSection}/>}
            {homeIntro&&<SectionEditor title="Introdução do projeto" description="Resumo que apresenta a origem do Café." section={homeIntro} onSave={saveSection}/>}
            {homeCta&&<SectionEditor title="Chamada final" description="Convite para participar do próximo capítulo." section={homeCta} onSave={saveSection}/>}
          </div>
        </div>}

        {tab==="about"&&<div className="admin-content">
          <Intro title="História do projeto" text="A página Sobre é organizada como uma narrativa em capítulos. Você pode ajustar título, texto, destaque e ordem visual."/>
          <div className="editor-stack">
            {story.map(ch=><StoryEditor key={ch.id} chapter={ch} onSave={saveStory}/>)}
            {aboutCta&&<SectionEditor title="Encerramento da página Sobre" description="Chamada depois da história e das memórias." section={aboutCta} onSave={saveSection}/>}
          </div>
        </div>}

        {tab==="events"&&<div className="admin-content">
          <Intro title="Agenda e encontros" text="Cadastre os próximos encontros e publique somente quando as informações estiverem prontas."/>
          <div className="split">
            <section className="card editor-card"><h2>Novo evento</h2><form className="form" onSubmit={createEvent}>
              <Field label="Título"><input name="title" required/></Field>
              <Field label="Slug"><input name="slug" required placeholder="cafe-outubro-2026"/></Field>
              <Field label="Resumo"><textarea name="summary"/></Field>
              <Field label="Data e hora"><input name="starts_at" type="datetime-local"/></Field>
              <Field label="Local"><input name="venue"/></Field>
              <Field label="Cidade"><input name="city"/></Field>
              <button className="btn btn-dark"><Plus size={17}/>Criar rascunho</button>
            </form></section>
            <section className="editor-stack">{events.map(e=><article key={e.id} className="card editor-card"><div className="editor-card-head"><span className="pill">{e.status}</span><small>{e.slug}</small></div><h3>{e.title}</h3><p>{e.summary}</p><div className="actions"><button className="btn btn-secondary" onClick={()=>setEventStatus(e.id,"RASCUNHO")}>Rascunho</button><button className="btn btn-dark" onClick={()=>setEventStatus(e.id,"PUBLICADO")}>Publicar</button></div></article>)}</section>
          </div>
        </div>}

        {tab==="testimonials"&&<div className="admin-content">
          <Intro title="Testemunhos" text="O texto original permanece preservado. A publicação pública é uma ação separada e respeita a autorização informada."/>
          <section className="editor-stack">{testimonials.map(t=><article className="card editor-card" key={t.id}><div className="editor-card-head"><div className="meta"><span className="pill">{t.status}</span><span>{new Date(t.created_at).toLocaleDateString("pt-BR")}</span><span>{t.publication_consent}</span></div></div><h3>{t.display_name_original||"Sem identificação"}</h3><p className="long-copy">{t.original_text}</p><div className="actions"><button className="btn btn-secondary" onClick={()=>moderate(t.id,"EM_ANALISE")}>Em análise</button><button className="btn btn-secondary" onClick={()=>moderate(t.id,"APROVADO")}>Aprovar</button>{t.publication_consent!=="PRIVATE_ONLY"&&<button className="btn btn-dark" onClick={()=>publish(t)}>Publicar</button>}<button className="btn btn-danger" onClick={()=>moderate(t.id,"ARQUIVADO")}>Arquivar</button></div></article>)}</section>
        </div>}

        {tab==="photos"&&<div className="admin-content">
          <Intro title="Fotos e memórias" text="Crie álbuns por encontro e envie fotos para alimentar a Home, a página Sobre e a galeria completa."/>
          <div className="split">
            <section className="card editor-card"><h2>Enviar foto</h2><form className="form" onSubmit={uploadPhoto}>
              <Field label="Imagem"><input type="file" name="file" accept="image/*" required/></Field>
              <Field label="Descrição"><input name="alt" placeholder="Ex.: Mulheres reunidas no Café de outubro"/></Field>
              <Field label="Álbum"><select name="album_id" defaultValue=""><option value="">Galeria geral</option>{albums.map(a=><option key={a.id} value={a.id}>{a.title}</option>)}</select></Field>
              <label className="check-row"><input type="checkbox" name="featured"/> Destacar na Home</label>
              <button className="btn btn-dark"><Upload size={17}/>Enviar foto</button>
            </form></section>
            <section className="card editor-card"><h2>Novo álbum</h2><form className="form" onSubmit={createAlbum}>
              <Field label="Nome do álbum"><input name="title" required/></Field>
              <Field label="Slug"><input name="slug" placeholder="gerado automaticamente se vazio"/></Field>
              <Field label="Descrição"><textarea name="description"/></Field>
              <button className="btn btn-secondary"><Plus size={17}/>Criar álbum</button>
            </form></section>
          </div>
          <div className="admin-photo-grid">{photos.map(p=><figure key={p.id} className="admin-photo-card"><img src={p.url} alt={p.alt_text||""}/><figcaption><strong>{p.alt_text||"Sem descrição"}</strong>{p.featured&&<span className="pill">Destaque</span>}</figcaption></figure>)}{!photos.length&&<div className="card empty">Nenhuma foto enviada ainda.</div>}</div>
        </div>}

        {tab==="bible"&&<div className="admin-content">
          <Intro title="Palavra e versículos" text="Escolha as passagens que acompanham cada momento do projeto. O conteúdo pode aparecer na Home ou na página Sobre."/>
          <div className="split">
            <section className="card editor-card"><h2>Adicionar palavra</h2><form className="form" onSubmit={addScripture}>
              <Field label="Onde aparece"><select name="location"><option value="home">Página inicial</option><option value="about">Sobre</option></select></Field>
              <Field label="Referência"><input name="reference" required placeholder="Ex.: Salmos 126:5"/></Field>
              <Field label="Texto"><textarea name="verse_text" required/></Field>
              <Field label="Reflexão opcional"><textarea name="reflection"/></Field>
              <button className="btn btn-dark"><Plus size={17}/>Adicionar</button>
            </form></section>
            <section className="editor-stack">{scriptures.map(v=><ScriptureEditor key={v.id} item={v} onSave={saveScripture}/>)}</section>
          </div>
        </div>}

        {tab==="instagram"&&<div className="admin-content">
          <Intro title="Instagram em destaque" text="Escolha manualmente quais publicações do @cafe_testemunho devem aparecer no site."/>
          <div className="split">
            <section className="card editor-card"><h2>Adicionar post</h2><form className="form" onSubmit={addInstagram}>
              <Field label="Link do post"><input name="post_url" type="url" required placeholder="https://www.instagram.com/p/..."/></Field>
              <Field label="Título"><input name="title" placeholder="Título interno ou chamada"/></Field>
              <Field label="Legenda curta"><textarea name="caption"/></Field>
              <Field label="Imagem de capa (URL)"><input name="cover_url" type="url" placeholder="Opcional"/></Field>
              <Field label="Onde aparece"><select name="location"><option value="home">Página inicial</option><option value="about">Sobre</option><option value="both">Home e Sobre</option></select></Field>
              <button className="btn btn-dark"><Plus size={17}/>Adicionar post</button>
            </form></section>
            <section className="editor-stack">{instagram.map(p=><article key={p.id} className="card editor-card instagram-editor-card">{p.cover_url&&<img src={p.cover_url} alt=""/>}<div><div className="editor-card-head"><span className="pill">{p.location}</span><button className="icon-button" onClick={()=>toggleInstagram(p.id,!p.visible)} title={p.visible?"Ocultar":"Exibir"}>{p.visible?<Eye size={17}/>:<EyeOff size={17}/>}</button></div><h3>{p.title||"Post do Instagram"}</h3><p>{p.caption}</p><a href={p.post_url} target="_blank" rel="noreferrer">Abrir publicação</a></div></article>)}</section>
          </div>
        </div>}

        {tab==="settings"&&<div className="admin-content">
          <Intro title="Configurações do projeto" text="Dados permanentes de contato, redes sociais e identidade do Café com Testemunho."/>
          <div className="editor-stack">{social.map(item=><SocialEditor key={item.id} item={item} onSave={saveSocial}/>)}</div>
          <div className="card editor-card"><h2>Identidade visual</h2><p>A marca do projeto será usada na navegação, hero e encerramentos. A estrutura está preparada para receber a logotipo original e suas variações sem precisar alterar as páginas.</p></div>
        </div>}
      </section>
    </div>
  </main>
}

function Intro({title,text}:{title:string;text:string}){return <div className="editor-intro"><div className="eyebrow">Conteúdo</div><h2>{title}</h2><p>{text}</p></div>}
function Field({label,children}:{label:string;children:React.ReactNode}){return <div className="field"><label>{label}</label>{children}</div>}

function SectionEditor({title,description,section,onSave}:{title:string;description:string;section:AnyRow;onSave:(id:string,patch:AnyRow)=>void}){
  const[t,setT]=useState(section.title||""),[sub,setSub]=useState(section.subtitle||""),[body,setBody]=useState(section.body||"");
  return <article className="card editor-card"><div className="editor-card-head"><div><h3>{title}</h3><p>{description}</p></div></div><div className="editor-form-grid"><Field label="Título"><input value={t} onChange={e=>setT(e.target.value)}/></Field><Field label="Subtítulo"><input value={sub} onChange={e=>setSub(e.target.value)}/></Field></div><Field label="Texto"><textarea value={body} onChange={e=>setBody(e.target.value)}/></Field><button className="btn btn-dark" onClick={()=>onSave(section.id,{title:t,subtitle:sub||null,body})}><Save size={17}/>Salvar bloco</button></article>
}
function StoryEditor({chapter,onSave}:{chapter:AnyRow;onSave:(id:string,patch:AnyRow)=>void}){
  const[e,setE]=useState(chapter.eyebrow||""),[t,setT]=useState(chapter.title||""),[body,setBody]=useState(chapter.body||""),[q,setQ]=useState(chapter.quote||"");
  return <article className="card editor-card"><div className="editor-card-head"><div><span className="pill">Capítulo {chapter.sort_order}</span><h3>{chapter.title}</h3></div></div><div className="editor-form-grid"><Field label="Marcador"><input value={e} onChange={x=>setE(x.target.value)}/></Field><Field label="Título"><input value={t} onChange={x=>setT(x.target.value)}/></Field></div><Field label="Narrativa"><textarea value={body} onChange={x=>setBody(x.target.value)}/></Field><Field label="Frase em destaque"><textarea value={q} onChange={x=>setQ(x.target.value)} placeholder="Opcional"/></Field><button className="btn btn-dark" onClick={()=>onSave(chapter.id,{eyebrow:e,title:t,body,quote:q||null})}><Save size={17}/>Salvar capítulo</button></article>
}
function ScriptureEditor({item,onSave}:{item:AnyRow;onSave:(id:string,patch:AnyRow)=>void}){
  const[r,setR]=useState(item.reference||""),[v,setV]=useState(item.verse_text||""),[f,setF]=useState(item.reflection||"");
  return <article className="card editor-card scripture-editor"><div className="editor-card-head"><span className="pill">{item.location==="home"?"Home":"Sobre"}</span><button className="icon-button" onClick={()=>onSave(item.id,{visible:!item.visible})}>{item.visible?<Eye size={17}/>:<EyeOff size={17}/>}</button></div><Field label="Referência"><input value={r} onChange={e=>setR(e.target.value)}/></Field><Field label="Versículo"><textarea value={v} onChange={e=>setV(e.target.value)}/></Field><Field label="Reflexão"><textarea value={f} onChange={e=>setF(e.target.value)}/></Field><button className="btn btn-dark" onClick={()=>onSave(item.id,{reference:r,verse_text:v,reflection:f})}><Save size={17}/>Salvar</button></article>
}
function SocialEditor({item,onSave}:{item:AnyRow;onSave:(id:string,url:string)=>void}){
  const[url,setUrl]=useState(item.url||"");return <article className="card editor-card"><h3>{item.label}</h3><Field label="URL"><input value={url} onChange={e=>setUrl(e.target.value)}/></Field><button className="btn btn-dark" onClick={()=>onSave(item.id,url)}><Save size={17}/>Salvar</button></article>
}
