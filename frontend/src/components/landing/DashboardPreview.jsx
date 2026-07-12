import dashboardImg from '@/assets/dashboard-preview.png';

export default function DashboardPreview() {
  return (
    <section id="preview" className="relative py-8 md:py-16">
      <div className="af-container">
        <div className="af-animate-fade-up af-delay-400 relative max-w-[1040px] mx-auto">
          {/* Outer glow */}
          <div className="absolute -inset-4 md:-inset-8 bg-gradient-to-b from-[#D97736]/[0.04] via-transparent to-transparent rounded-[2rem] blur-xl pointer-events-none" />
          
          {/* Browser chrome wrapper */}
          <div className="relative bg-white rounded-2xl md:rounded-3xl shadow-[0_20px_80px_rgba(30,32,34,0.1),0_8px_24px_rgba(30,32,34,0.06)] overflow-hidden border border-[#E8E2DC]/60">
            {/* Mock browser bar */}
            <div className="flex items-center gap-2 px-5 py-3.5 bg-[#FAFAFA] border-b border-[#F0EBE6]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 bg-[#FF5F57] rounded-full" />
                <div className="w-2.5 h-2.5 bg-[#FFBD2E] rounded-full" />
                <div className="w-2.5 h-2.5 bg-[#28CA42] rounded-full" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-2 px-4 py-1 bg-white rounded-lg border border-[#E8E2DC] text-xs text-[#9CA3AF] min-w-[200px] md:min-w-[320px]">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path d="M8 1a5 5 0 0 0-5 5v0a5 5 0 0 0 5 5v0a5 5 0 0 0 5-5v0a5 5 0 0 0-5-5Z" stroke="#9CA3AF" strokeWidth="1.5"/>
                    <path d="M11.5 11.5 15 15" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  app.assetflow.io/dashboard
                </div>
              </div>
              <div className="w-[52px]" /> {/* Spacer for symmetry */}
            </div>

            {/* Dashboard screenshot */}
            <div className="relative">
              <img
                src={dashboardImg}
                alt="AssetFlow Dashboard — showing asset metrics, navigation sidebar, and data table in a warm sand-tone interface"
                className="w-full h-auto block"
                loading="lazy"
              />
              {/* Subtle gradient overlay at bottom for fade effect */}
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/40 to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Floating accent elements */}
          <div className="hidden md:block absolute -left-6 top-1/4 w-16 h-16 bg-[#1E4620]/[0.07] rounded-2xl rotate-12 af-animate-float" />
          <div className="hidden md:block absolute -right-8 top-1/3 w-12 h-12 bg-[#D97736]/[0.07] rounded-xl -rotate-6 af-animate-float af-delay-300" />
        </div>
      </div>
    </section>
  );
}
