import{put,del}from"@vercel/blob";
import{createServerSupabaseClient}from"@/lib/supabase/server";

export async function POST(request:Request){
  const s=await createServerSupabaseClient();
  const{data:{user}}=await s.auth.getUser();
  if(!user)return Response.json({error:"Não autorizado."},{status:401});
  const{data:profile}=await s.from("profiles").select("roles").eq("user_id",user.id).maybeSingle();
  if(!profile?.roles?.some((r:string)=>["ADMIN","EDITOR"].includes(r)))return Response.json({error:"Sem permissão."},{status:403});

  const form=await request.formData();
  const file=form.get("file");
  const alt=String(form.get("alt")||"").trim();
  const albumId=String(form.get("album_id")||"").trim()||null;
  const featured=String(form.get("featured")||"false")==="true";

  if(!(file instanceof File))return Response.json({error:"Selecione uma imagem."},{status:400});
  if(!file.type.startsWith("image/"))return Response.json({error:"Envie apenas arquivos de imagem."},{status:400});
  if(file.size>8*1024*1024)return Response.json({error:"A imagem deve ter no máximo 8 MB."},{status:400});

  const safe=file.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9._-]+/g,"-");
  const blob=await put("galeria/"+Date.now()+"-"+safe,file,{access:"public",addRandomSuffix:true});

  const{data,error}=await s.from("media_assets").insert({
    url:blob.url,pathname:blob.pathname,alt_text:alt||null,media_type:"image",
    is_private:false,uploaded_by:user.id,album_id:albumId,featured
  }).select("*").single();

  if(error)return Response.json({error:error.message},{status:500});
  await s.from("audit_logs").insert({user_id:user.id,action:"PHOTO_UPLOADED",entity_type:"media_asset",entity_id:data.id,metadata:{pathname:blob.pathname}});
  return Response.json({photo:data});
}


export async function DELETE(request:Request){
  const s=await createServerSupabaseClient();
  const{data:{user}}=await s.auth.getUser();
  if(!user)return Response.json({error:"Não autorizado."},{status:401});
  const{data:profile}=await s.from("profiles").select("roles").eq("user_id",user.id).maybeSingle();
  if(!profile?.roles?.some((r:string)=>["ADMIN","EDITOR"].includes(r)))return Response.json({error:"Sem permissão."},{status:403});
  const{id}=await request.json();
  if(!id)return Response.json({error:"Foto inválida."},{status:400});
  const{data:item,error:readError}=await s.from("media_assets").select("id,pathname").eq("id",id).maybeSingle();
  if(readError||!item)return Response.json({error:readError?.message||"Foto não encontrada."},{status:404});
  if(item.pathname){try{await del(item.pathname)}catch{}}
  const{error}=await s.from("media_assets").delete().eq("id",id);
  if(error)return Response.json({error:error.message},{status:500});
  await s.from("audit_logs").insert({user_id:user.id,action:"PHOTO_DELETED",entity_type:"media_asset",entity_id:id,metadata:{}});
  return Response.json({ok:true});
}