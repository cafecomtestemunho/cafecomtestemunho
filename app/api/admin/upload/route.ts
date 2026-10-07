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
  const allowedByMime=file.type.startsWith("image/");
  const allowedByExtension=/\.(jpe?g|png|webp|gif)$/i.test(file.name);
  if(!allowedByMime&&!allowedByExtension)return Response.json({error:"Envie uma imagem JPG, JPEG, PNG, WebP ou GIF."},{status:400});
  if(file.size>4*1024*1024)return Response.json({error:"A imagem ficou grande demais após a otimização. Tente novamente."},{status:413});
  const safe=file.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9._-]+/g,"-");
  const uploadFile=allowedByMime?file:new File([file],file.name,{type:guessMime(file.name),lastModified:file.lastModified});
  let blob;
  try{
    blob=await put(folder+"/"+Date.now()+"-"+safe,uploadFile,{access:"public",addRandomSuffix:true});
  }catch(error){
    console.error("Content image blob upload failed",error);
    return Response.json({error:"Não foi possível enviar a imagem para o armazenamento."},{status:500});
  }
  await s.from("audit_logs").insert({user_id:user.id,action:"CONTENT_IMAGE_UPLOADED",entity_type:"media",entity_id:blob.pathname,metadata:{url:blob.url}});
  return Response.json({url:blob.url,pathname:blob.pathname});
}

function guessMime(name:string){
  const ext=name.toLowerCase().split(".").pop();
  if(ext==="png")return"image/png";
  if(ext==="webp")return"image/webp";
  if(ext==="gif")return"image/gif";
  return"image/jpeg";
}
