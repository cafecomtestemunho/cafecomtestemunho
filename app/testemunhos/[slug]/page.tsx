import Link from"next/link";
import{ArrowLeft,Quote}from"lucide-react";
import{notFound}from"next/navigation";
import{createServerSupabaseClient}from"@/lib/supabase/server";
import{Reveal}from"@/components/reveal";

export default async function TestemunhoPage({params}:{params:Promise<{slug:string}>}){
  const{slug}=await params;
  const s=await createServerSupabaseClient();
  const{data:item}=await s.from("testimonial_publications").select("*").eq("slug",slug).not("published_at","is",null).maybeSingle();
  if(!item)notFound();
  return <main className="inner-page">
    <section className="inner-hero inner-testimonial-detail"><div className="inner-hero-ornament" aria-hidden/><div className="container inner-hero-content solo"><Reveal className="inner-hero-copy"><Link className="inner-back-link" href="/testemunhos"><ArrowLeft size={15}/> Testemunhos</Link><div className="inner-kicker">Uma história compartilhada</div><h1>{item.public_title}</h1><p>{item.public_display_name}</p></Reveal></div><div className="inner-hero-curve" aria-hidden/></section>
    <section className="inner-section inner-paper"><div className="container inner-reading"><Reveal><article className="testimonial-reading"><Quote size={26}/>{String(item.public_text||"").split(/\n+/).filter(Boolean).map((p:string,i:number)=><p key={i}>{p}</p>)}</article></Reveal></div></section>
  </main>
}