"use client";
import Link from"next/link";
import{Home,Heart,CalendarDays,BookHeart,Images}from"lucide-react";
import{usePathname}from"next/navigation";

export function BottomNav({showPhotos=true}:{showPhotos?:boolean}){
  const p=usePathname();
  if(p.startsWith("/admin"))return null;
  const items=[
    ["/","Início",Home],
    ["/sobre","Sobre",Heart],
    ["/agenda","Agenda",CalendarDays],
    ...(showPhotos?[["/fotos","Fotos",Images]as const]:[]),
    ["/testemunhos","Testemunhos",BookHeart]
  ]as const;
  return <nav className="bottom-nav" aria-label="Navegação principal">{items.map(([h,l,I])=>{const a=h==="/"?p==="/":p.startsWith(h);return <Link key={h} href={h} className={a?"active":""}><I size={20}/><span>{l}</span></Link>})}</nav>
}
