export default function Footer() {
  return (
    <footer className="border-t border-rose-300/20 bg-gradient-to-b from-transparent to-black/40 backdrop-blur-sm">
      <div className="container py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <p className="text-sm text-white/70 font-light">© 2026 LushSecret.</p>
          <p className="text-xs text-white/50 mt-1">Todos los derechos reservados.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 text-xs md:text-sm">
          <span className="text-rose-200/80 hover:text-rose-200 transition cursor-pointer font-light">Pagos seguros</span>
          <span className="text-rose-200/80 hover:text-rose-200 transition cursor-pointer font-light">Envíos discretos</span>
          <span className="text-rose-200/80 hover:text-rose-200 transition cursor-pointer font-light">Soporte 24/7</span>
        </div>
      </div>
    </footer>
  );
}
