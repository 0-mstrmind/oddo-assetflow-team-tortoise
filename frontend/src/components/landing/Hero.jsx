import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';

export default function Hero() {
  return (
    <section id="hero" className="relative pt-[120px] pb-8 md:pt-[160px] md:pb-16 overflow-hidden">
      {/* Subtle background warmth */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#D97736]/[0.03] rounded-full blur-[120px] translate-x-1/3 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#D49B28]/[0.03] rounded-full blur-[100px] -translate-x-1/3 translate-y-1/4" />
      </div>

      <div className="af-container relative z-10">
        {/* Tag Line Badge */}
        <div className="af-animate-fade-up flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full shadow-[0_1px_6px_rgba(30,32,34,0.06)] border border-[#F0EBE6]">
            <div className="w-1.5 h-1.5 bg-[#1E4620] rounded-full animate-pulse" />
            <span className="text-xs font-medium text-[#6B7280] tracking-wide uppercase">
              Now in Public Beta
            </span>
          </div>
        </div>

        {/* Headline */}
        <div className="max-w-[800px] mx-auto text-center">
          <h1
            className="af-animate-fade-up af-delay-100 text-[clamp(2.25rem,5vw,4rem)] font-bold leading-[1.08] tracking-[-0.035em] text-[#1E2022] mb-6"
          >
            Enterprise Asset Management,{' '}
            <span className="relative inline-block">
              Reimagined
              <svg className="absolute -bottom-1 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none" preserveAspectRatio="none">
                <path d="M0 6 C50 0, 150 0, 200 6" stroke="#D97736" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6"/>
              </svg>
            </span>{' '}
            for People.
          </h1>

          <p className="af-animate-fade-up af-delay-200 text-lg md:text-xl text-[#6B7280] leading-relaxed max-w-[620px] mx-auto mb-10">
            Stop chasing spreadsheets. Track, allocate, audit, and maintain your
            physical equipment in one beautifully centralized, human-friendly workspace.
          </p>

          {/* CTAs */}
          <div className="af-animate-fade-up af-delay-300 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              id="cta-launch"
              className="group relative inline-flex items-center gap-2.5 px-8 py-3.5 bg-[#D97736] text-white text-[15px] font-semibold rounded-full transition-all duration-300 hover:bg-[#C85C27] hover:shadow-[0_8px_30px_rgba(217,119,54,0.3)] active:scale-[0.98]"
            >
              Launch Workspace
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              {/* Glow ring */}
              <div className="absolute inset-0 rounded-full ring-2 ring-[#D97736]/20 ring-offset-2 ring-offset-[#FAF7F5] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
            <a
              href="#demo"
              id="cta-demo"
              className="group inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#F4EFEB] text-[#1E2022] text-[15px] font-medium rounded-full transition-all duration-300 hover:bg-[#EDE7E1] hover:shadow-[0_4px_16px_rgba(30,32,34,0.06)]"
            >
              <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-[0_1px_4px_rgba(30,32,34,0.08)] transition-shadow duration-300 group-hover:shadow-[0_2px_8px_rgba(30,32,34,0.12)]">
                <Play size={11} fill="#1E2022" className="ml-0.5" />
              </div>
              Watch Demo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
