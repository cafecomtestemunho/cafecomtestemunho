import{put}from"@vercel/blob";
import{createServerSupabaseClient}from"@/lib/supabase/server";

export async function POST(request:Request){
  const s=await createServerSupabaseClient();
  const{data:{user}}=await s.auth.getUser();
  if(!user)return Response.json({error:"Não autorizado."},{status:401});
  const{data:profile}=await s.from("profiles").select("roles").eq("user_id",user.id).maybeSingle();
  if(!profile?.roles?.some((r:string)=>["ADMIN","EDITOR"].includes(r)))return Response.json({error:"Sem permissão."},{status:403});

  const form=await request.formData();
  const file=form.get("file");
  const folder=String(form.get("folder")||"conteudo").replace(/[^a-z0-9/_-]/gi,"-").toLowerCase();
  if(!(file instanceof File))return Response.json({error:"Selecione um arquivo."},{status:400});
  if(!file.type.startsWith("image/"))return Response.json({error:"Envie apenas imagens."},{status:400});
  if(file.size>8*1024*1024)return Response.json({error:"A imagem deve ter no máximo 8 MB."},{status:400});
  const safe=file.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9._-]+/g,"-");
  const blob=await put(folder+"/"+Date.now()+"-"+safe,file,{access:"public",addRandomSuffix:true});
  await s.from("audit_logs").insert({user_id:user.id,action:"CONTENT_IMAGE_UPLOADED",entity_type:"media",entity_id:blob.pathname,metadata:{url:blob.url}});
  return Response.json({url:blob.url,pathname:blob.pathname});
}