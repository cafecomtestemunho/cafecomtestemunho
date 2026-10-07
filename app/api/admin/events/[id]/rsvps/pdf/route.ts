import{PDFDocument,StandardFonts,rgb}from"pdf-lib";
import type{PDFFont,PDFPage}from"pdf-lib";
import{createServerSupabaseClient}from"@/lib/supabase/server";

export const runtime="nodejs";

const W=595.28,H=841.89,M=40;
const bodyColor=rgb(.20,.13,.09);
const muted=rgb(.43,.36,.31);
const line=rgb(.87,.82,.76);
const soft=rgb(.97,.94,.90);

export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
  const{id}=await params;
  const s=await createServerSupabaseClient();
  const{data:{user}}=await s.auth.getUser();
  if(!user)return Response.json({error:"Não autorizado."},{status:401});
  const{data:profile}=await s.from("profiles").select("roles").eq("user_id",user.id).maybeSingle();
  if(!profile?.roles?.some((role:string)=>["ADMIN","EDITOR","MODERATOR"].includes(role)))return Response.json({error:"Sem permissão."},{status:403});

  const[{data:event},{data:rsvps,error}]=await Promise.all([
    s.from("events").select("id,title,slug,starts_at,venue,city").eq("id",id).maybeSingle(),
    s.from("event_rsvps").select("id,full_name,city,created_at").eq("event_id",id).order("full_name")
  ]);
  if(!event)return Response.json({error:"Evento não encontrado."},{status:404});
  if(error)return Response.json({error:"Não foi possível carregar as confirmações."},{status:500});
  const currentEvent=event;

  const pdf=await PDFDocument.create();
  pdf.setTitle("Confirmações de presença - "+safe(currentEvent.title));
  pdf.setAuthor("Café com Testemunho");
  const regular=await pdf.embedFont(StandardFonts.Helvetica);
  const bold=await pdf.embedFont(StandardFonts.HelveticaBold);
  const rows=rsvps||[];
  let page:PDFPage;
  let y=0;
  let pageNumber=0;

  function newPage(){
    page=pdf.addPage([W,H]);pageNumber++;
    page.drawText("CAFÉ COM TESTEMUNHO",{x:M,y:H-52,size:10,font:bold,color:muted});
    page.drawText("Lista de confirmações de presença",{x:M,y:H-82,size:20,font:bold,color:bodyColor});
    const titleLines=wrap(safe(currentEvent.title),W-M*2,bold,13);
    let ty=H-106;
    for(const t of titleLines){page.drawText(t,{x:M,y:ty,size:13,font:bold,color:bodyColor});ty-=16}
    const details=[
      currentEvent.starts_at?new Intl.DateTimeFormat("pt-BR",{dateStyle:"long",timeStyle:"short",timeZone:"America/Sao_Paulo"}).format(new Date(currentEvent.starts_at)):"",
      [currentEvent.venue,currentEvent.city].filter(Boolean).join(" · ")
    ].filter(Boolean).join("  |  ");
    if(details)page.drawText(safe(details),{x:M,y:ty-4,size:9,font:regular,color:muted,maxWidth:W-M*2});
    page.drawText("Total: "+rows.length+" confirmação"+(rows.length===1?"":"ões"),{x:M,y:ty-24,size:10,font:bold,color:bodyColor});
    page.drawText("Gerado em "+new Intl.DateTimeFormat("pt-BR",{dateStyle:"short",timeStyle:"short",timeZone:"America/Sao_Paulo"}).format(new Date()),{x:W-M-170,y:ty-24,size:8,font:regular,color:muted});
    y=ty-52;
    drawTableHeader(page,y,bold);
    y-=26;
  }

  newPage();
  if(!rows.length){
    page.drawText("Nenhuma confirmação recebida até o momento.",{x:M,y:y-10,size:11,font:regular,color:muted});
  }else{
    for(let i=0;i<rows.length;i++){
      const row=rows[i];
      const nameLines=wrap(safe(row.full_name),235,regular,9);
      const cityLines=wrap(safe(row.city),135,regular,9);
      const lines=Math.max(nameLines.length,cityLines.length,1);
      const rowH=Math.max(30,12+lines*12);
      if(y-rowH<56){drawFooter(page,pageNumber,regular);newPage()}
      if(i%2===0)page.drawRectangle({x:M,y:y-rowH+5,width:W-M*2,height:rowH, color:soft});
      page.drawText(String(i+1),{x:M+6,y:y-10,size:9,font:bold,color:bodyColor});
      drawLines(page,nameLines,M+35,y-10,regular,9);
      drawLines(page,cityLines,M+278,y-10,regular,9);
      const when=new Intl.DateTimeFormat("pt-BR",{dateStyle:"short",timeStyle:"short",timeZone:"America/Sao_Paulo"}).format(new Date(row.created_at));
      page.drawText(safe(when),{x:M+418,y:y-10,size:8,font:regular,color:muted});
      y-=rowH;
      page.drawLine({start:{x:M,y:y+5},end:{x:W-M,y:y+5},thickness:.5,color:line});
    }
  }
  drawFooter(page,pageNumber,regular);

  await s.from("audit_logs").insert({user_id:user.id,action:"EVENT_RSVP_PDF_DOWNLOADED",entity_type:"event",entity_id:id,metadata:{count:rows.length}});
  const bytes=await pdf.save();
  const filename="confirmacoes-"+String(currentEvent.slug||currentEvent.id).replace(/[^a-z0-9-_]/gi,"-")+".pdf";
  return new Response(Buffer.from(bytes),{headers:{"Content-Type":"application/pdf","Content-Disposition":'attachment; filename="'+filename+'"',"Cache-Control":"no-store"}});
}

function drawTableHeader(page:PDFPage,y:number,font:PDFFont){
  page.drawRectangle({x:M,y:y-18,width:W-M*2,height:24,color:bodyColor});
  page.drawText("#",{x:M+6,y:y-9,size:8,font,color:rgb(1,1,1)});
  page.drawText("Nome completo",{x:M+35,y:y-9,size:8,font,color:rgb(1,1,1)});
  page.drawText("Cidade",{x:M+278,y:y-9,size:8,font,color:rgb(1,1,1)});
  page.drawText("Confirmado em",{x:M+418,y:y-9,size:8,font,color:rgb(1,1,1)});
}
function drawFooter(page:PDFPage,pageNumber:number,font:PDFFont){
  page.drawLine({start:{x:M,y:38},end:{x:W-M,y:38},thickness:.5,color:line});
  page.drawText("Café com Testemunho",{x:M,y:24,size:7,font,color:muted});
  page.drawText("Página "+pageNumber,{x:W-M-50,y:24,size:7,font,color:muted});
}
function drawLines(page:PDFPage,lines:string[],x:number,y:number,font:PDFFont,size:number){
  lines.forEach((text,index)=>page.drawText(text,{x,y:y-index*12,size,font,color:bodyColor}));
}
function wrap(value:string,maxWidth:number,font:PDFFont,size:number){
  const text=safe(value).replace(/\s+/g," ").trim();
  if(!text)return[""];
  const words=text.split(" ");
  const lines:string[]=[];let current="";
  for(const word of words){
    const candidate=current?current+" "+word:word;
    if(font.widthOfTextAtSize(candidate,size)<=maxWidth){current=candidate;continue}
    if(current)lines.push(current);
    let chunk="";
    for(const char of word){
      const test=chunk+char;
      if(font.widthOfTextAtSize(test,size)>maxWidth&&chunk){lines.push(chunk);chunk=char}else chunk=test;
    }
    current=chunk;
  }
  if(current)lines.push(current);
  return lines;
}
function safe(value:any){
  return String(value??"").normalize("NFC")
    .replace(/[–—]/g,"-").replace(/[“”]/g,'"').replace(/[‘’]/g,"'").replace(/…/g,"...")
    .split("").map(char=>char.charCodeAt(0)<=255?char:"?").join("");
}
