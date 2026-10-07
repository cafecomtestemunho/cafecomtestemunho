import type{Metadata}from"next";
import"./globals.css";
import{BottomNav}from"@/components/bottom-nav";
import{PwaRegister}from"@/components/pwa-register";
import{createServerSupabaseClient}from"@/lib/supabase/server";

export const metadata:Metadata={
  metadataBase:new URL("https://cafecomtestemunho.vercel.app"),
  title:{default:"Café com Testemunho",template:"%s | Café com Testemunho"},
  description:"Um espaço de fé, acolhimento, testemunhos e encontros entre mulheres.",
  manifest:"/manifest.webmanifest",
  icons:{icon:"/favicon",shortcut:"/favicon",apple:"/favicon"},
  openGraph:{siteName:"Café com Testemunho",type:"website",locale:"pt_BR"},
  robots:{index:true,follow:true}
};

export default async function RootLayout({children}:{children:React.ReactNode}){
  const s=await createServerSupabaseClient();
  const{count}=await s.from("media_assets").select("id",{count:"exact",head:true}).eq("media_type","image").eq("is_private",false);
  return <html lang="pt-BR"><body><PwaRegister/><div className="page-shell">{children}</div><BottomNav showPhotos={(count||0)>0}/></body></html>
}
