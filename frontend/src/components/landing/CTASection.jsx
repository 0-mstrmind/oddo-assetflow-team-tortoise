import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section id="enterprise" className="py-20 md:py-28">
      <div className="af-container">
        <div className="relative overflow-hidden bg-[#1E2022] rounded-3xl px-8 py-16 md:px-16 md:py-20 text-center">
          {/* Background decorations */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#D97736]/[0.06] rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#2D3135] rounded-full blur-[80px] -translate-x-1/4 translate-y-1/4" />
            {/* Subtle grid pattern */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
              }}
            />
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 mb-6 bg-white/[0.06] rounded-full border border-white/[0.08]">
              <div className="w-1.5 h-1.5 bg-[#D97736] rounded-full" />
              <span className="text-xs font-medium text-white/60 tracking-wider uppercase">
                Enterprise Ready
              </span>
            </div>

            <h2 className="text-3xl md:text-[2.75rem] font-bold text-white tracking-[-0.03em] mb-4 max-w-[600px] mx-auto leading-[1.1]">
              Ready to transform how your team manages assets?
            </h2>
            <p className="text-base md:text-lg text-white/50 max-w-[480px] mx-auto mb-10 leading-relaxed">
              Join 500+ enterprises who've already made the switch to a
              human-friendly asset management experience.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#workspace"
                id="cta-enterprise-launch"
                className="group inline-flex items-center gap-2.5 px-8 py-3.5 bg-[#D97736] text-white text-[15px] font-semibold rounded-full transition-all duration-300 hover:bg-[#C85C27] hover:shadow-[0_8px_30px_rgba(217,119,54,0.25)]"
              >
                Get Started Free
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <a
                href="#contact"
                id="cta-enterprise-contact"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/[0.06] text-white/80 text-[15px] font-medium rounded-full border border-white/[0.08] transition-all duration-300 hover:bg-white/[0.1] hover:text-white"
              >
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
