import{redirect}from"next/navigation";import{createServerSupabaseClient}from"@/lib/supabase/server";import{AdminClient}from"./ui";

export default async function AdminPage(){
  const s=await createServerSupabaseClient();
  const{data:{user}}=await s.auth.getUser();
  if(!user)redirect("/admin/login");

  const{data:profile}=await s.from("profiles").select("*").eq("user_id",user.id).maybeSingle();
  if(!profile)return <main className="admin-shell"><div className="container" style={{maxWidth:720}}><div className="card"><div className="eyebrow">Acesso pendente</div><h1 className="section-title" style={{fontSize:"2.4rem"}}>Esta conta ainda não tem permissão administrativa.</h1><p>O login foi reconhecido, mas o perfil precisa receber um papel interno antes de acessar conteúdo privado ou editar o sistema.</p></div></div></main>;

  const[
    {data:events},{data:testimonials},{data:sections},{data:story},{data:scriptures},
    {data:instagram},{data:photos},{data:albums},{data:social}
  ]=await Promise.all([
    s.from("events").select("*").order("created_at",{ascending:false}),
    s.from("testimonials").select("id,display_name_original,original_text,publication_consent,status,created_at").order("created_at",{ascending:false}).limit(80),
    s.from("institutional_sections").select("*").order("sort_order"),
    s.from("story_chapters").select("*").order("sort_order"),
    s.from("scripture_spotlights").select("*").order("location").order("sort_order"),
    s.from("instagram_highlights").select("*").order("sort_order"),
    s.from("media_assets").select("id,url,alt_text,created_at,album_id,featured").eq("media_type","image").order("created_at",{ascending:false}).limit(120),
    s.from("photo_albums").select("*").order("sort_order").order("created_at",{ascending:false}),
    s.from("social_links").select("*").order("sort_order")
  ]);

  return <AdminClient
    userId={user.id}
    userEmail={user.email||""}
    roles={profile.roles||[]}
    initialEvents={events||[]}
    initialTestimonials={testimonials||[]}
    initialSections={sections||[]}
    initialStory={story||[]}
    initialScriptures={scriptures||[]}
    initialInstagram={instagram||[]}
    initialPhotos={photos||[]}
    initialAlbums={albums||[]}
    initialSocial={social||[]}
  />
}