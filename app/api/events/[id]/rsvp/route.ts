import{createServerSupabaseClient}from"@/lib/supabase/server";

export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
  const{id}=await params;
  let body:any;
  try{body=await request.json()}catch{return Response.json({error:"Dados inválidos."},{status:400})}

  const website=String(body?.website||"").trim();
  if(website)return Response.json({ok:true},{status:201});

  const fullName=String(body?.full_name||"").replace(/\s+/g," ").trim();
  const city=String(body?.city||"").replace(/\s+/g," ").trim();
  if(fullName.length<3||fullName.length>160)return Response.json({error:"Informe seu nome completo."},{status:400});
  if(city.length<2||city.length>120)return Response.json({error:"Informe a cidade onde você mora."},{status:400});

  const s=await createServerSupabaseClient();
  const{data:event}=await s.from("events").select("id,status,rsvp_enabled").eq("id",id).maybeSingle();
  if(!event||event.status!=="PUBLICADO"||event.rsvp_enabled!==true)return Response.json({error:"A confirmação de presença não está disponível para este evento."},{status:404});

  const{error}=await s.from("event_rsvps").insert({event_id:id,full_name:fullName,city});
  if(error){
    console.error("Event RSVP insert failed",error);
    return Response.json({error:"Não foi possível registrar sua presença agora. Tente novamente."},{status:500});
  }
  return Response.json({ok:true},{status:201});
}
