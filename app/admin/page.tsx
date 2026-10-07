import{redirect}from"next/navigation";
import{createServerSupabaseClient}from"@/lib/supabase/server";
import{AdminClient}from"./ui";

export default async function AdminPage(){
  const s=await createServerSupabaseClient();
  const{data:{user}}=await s.auth.getUser();
  if(!user)redirect("/admin/login");

  const{data:profile}=await s.from("profiles").select("*").eq("user_id",user.id).maybeSingle();
  if(!profile)return <main className="admin-shell"><div className="container" style={{maxWidth:720}}><div className="card"><div className="eyebrow">Acesso pendente</div><h1 className="section-title" style={{fontSize:"2.4rem"}}>Esta conta ainda não tem permissão administrativa.</h1><p>O login foi reconhecido, mas o perfil precisa receber um papel interno antes de acessar conteúdo privado ou editar o sistema.</p></div></div></main>;

  const[
    {data:events},{data:eventGuests},{data:eventSchedule},{data:eventFaqs},{data:eventRsvps},
    {data:testimonials},{data:publications},{data:sections},{data:story},{data:scriptures},
    {data:instagram},{data:photos},{data:albums},{data:social},{data:settings},{count:photoCount},{count:publicPhotoCount}
  ]=await Promise.all([
    s.from("events").select("*").order("created_at",{ascending:false}),
    s.from("event_guests").select("*").order("sort_order"),
    s.from("event_schedule").select("*").order("sort_order"),
    s.from("event_faqs").select("*").order("sort_order"),
    s.from("event_rsvps").select("*").order("created_at",{ascending:false}),
    s.from("testimonials").select("id,display_name_original,original_text,publication_consent,status,created_at").order("created_at",{ascending:false}).limit(100),
    s.from("testimonial_publications").select("*").order("created_at",{ascending:false}),
    s.from("institutional_sections").select("*").order("sort_order"),
    s.from("story_chapters").select("*").order("sort_order"),
    s.from("scripture_spotlights").select("*").order("location").order("sort_order"),
    s.from("instagram_highlights").select("*").order("sort_order"),
    s.from("media_assets").select("*").eq("media_type","image").order("created_at",{ascending:false}).limit(160),
    s.from("photo_albums").select("*").order("sort_order").order("created_at",{ascending:false}),
    s.from("social_links").select("*").order("sort_order"),
    s.from("site_settings").select("*").order("setting_key"),
    s.from("media_assets").select("id",{count:"exact",head:true}).eq("media_type","image"),
    s.from("media_assets").select("id",{count:"exact",head:true}).eq("media_type","image").eq("is_private",false)
  ]);

  return <AdminClient
    userId={user.id}
    userEmail={user.email||""}
    roles={profile.roles||[]}
    initialEvents={events||[]}
    initialEventGuests={eventGuests||[]}
    initialEventSchedule={eventSchedule||[]}
    initialEventFaqs={eventFaqs||[]}
    initialEventRsvps={eventRsvps||[]}
    initialTestimonials={testimonials||[]}
    initialPublications={publications||[]}
    initialSections={sections||[]}
    initialStory={story||[]}
    initialScriptures={scriptures||[]}
    initialInstagram={instagram||[]}
    initialPhotos={photos||[]}
    initialAlbums={albums||[]}
    initialSocial={social||[]}
    initialSettings={settings||[]}
    initialPhotoCount={photoCount||0}
    initialPublicPhotoCount={publicPhotoCount||0}
  />
}