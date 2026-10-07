export function SectionWaveDivider({tone,lightSurface="paper",hero=false}:{tone:"light-dark"|"dark-light";lightSurface?:"paper"|"founder"|"memory";hero?:boolean}){
  const nextColor=tone==="light-dark"
    ?"#32180d"
    :lightSurface==="memory"
      ?"#f3e3d2"
      :lightSurface==="founder"
        ?"#fbf4ec"
        :"#fffaf4";

  return <div className={"about-wave about-wave-"+tone+" about-wave-light-"+lightSurface+(hero?" about-wave-hero":"")} aria-hidden="true">
    <svg className="about-wave-svg" viewBox="0 0 1200 84" preserveAspectRatio="none">
      <path
        className="about-wave-next-fill"
        fill={nextColor}
        d="M0 24C185 7 332 12 505 31C703 54 887 54 1200 18V84H0Z"
      />
      <path className="about-wave-gold-band" d="M0 24C185 7 332 12 505 31C703 54 887 54 1200 18"/>
      <path className="about-wave-gold-soft" d="M0 19C185 2 332 7 505 26C703 49 887 49 1200 13"/>
      <path className="about-wave-gold-line" d="M0 24C185 7 332 12 505 31C703 54 887 54 1200 18"/>
    </svg>
  </div>;
}
