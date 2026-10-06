import {Coffee} from "lucide-react";
export function BrandMark({compact=false}:{compact?:boolean}){
  return <div className={"brand-mark "+(compact?"brand-mark-compact":"")} aria-label="Café com Testemunho">
    <div className="brand-copy"><strong>Café</strong><span>com</span><em>Testemunho</em></div>
    <Coffee className="brand-cup" aria-hidden/>
  </div>
}
