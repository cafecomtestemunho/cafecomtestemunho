import type{Metadata}from"next";
import"./globals.css";
import{BottomNav}from"@/components/bottom-nav";
import{PwaRegister}from"@/components/pwa-register";

export const metadata:Metadata={
  metadataBase:new URL("https://cafecomtestemunho.vercel.app"),
  title:{default:"Café com Testemunho",template:"%s | Café com Testemunho"},
  description:"Um espaço de fé, acolhimento, testemunhos e encontros entre mulheres.",
  manifest:"/manifest.webmanifest",
  icons:{icon:"/favicon",shortcut:"/favicon",apple:"/favicon"},
  openGraph:{siteName:"Café com Testemunho",type:"website",locale:"pt_BR"},
  robots:{index:true,follow:true}
};

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="pt-BR"><body><PwaRegister/><div className="page-shell">{children}</div><BottomNav/></body></html>
}