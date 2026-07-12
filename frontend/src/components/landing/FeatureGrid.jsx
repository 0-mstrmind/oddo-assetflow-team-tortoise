import { useState, useEffect } from 'react';
import { ShieldCheck, CalendarClock, Wrench, ClipboardCheck } from 'lucide-react';
import { getFeatures } from '@/services/landingService';

const ICON_MAP = {
  'shield-check': ShieldCheck,
  'calendar-clock': CalendarClock,
  'wrench': Wrench,
  'clipboard-check': ClipboardCheck,
};

export default function FeatureGrid() {
  const [features, setFeatures] = useState([]);

  useEffect(() => {
    getFeatures().then(setFeatures);
  }, []);

  return (
    <section id="features" className="relative py-20 md:py-28">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#D97736]/[0.015] rounded-full blur-[100px]" />
      </div>

      <div className="af-container relative z-10">
        {/* Section header */}
        <div className="text-center mb-14 md:mb-20">
          <div className="af-animate-fade-up inline-flex items-center gap-2 px-3.5 py-1 mb-5 bg-[#1E4620]/[0.06] rounded-full">
            <div className="w-1 h-1 bg-[#1E4620] rounded-full" />
            <span className="text-xs font-semibold text-[#1E4620] tracking-wider uppercase">
              Core Platform
            </span>
          </div>
          <h2 className="af-animate-fade-up af-delay-100 text-3xl md:text-[2.75rem] font-bold tracking-[-0.03em] text-[#1E2022] mb-4">
            Built for how teams actually work
          </h2>
          <p className="af-animate-fade-up af-delay-200 text-base md:text-lg text-[#6B7280] max-w-[540px] mx-auto leading-relaxed">
            Four pillars that eliminate friction from your asset lifecycle — from procurement to retirement.
          </p>
        </div>

        {/* Feature cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 max-w-[900px] mx-auto">
          {features.map((feature, index) => {
            const Icon = ICON_MAP[feature.icon] || ShieldCheck;
            return (
              <article
                key={feature.id}
                id={`feature-${feature.id}`}
                className={`af-animate-fade-up af-delay-${(index + 2) * 100} group relative bg-white rounded-2xl p-7 md:p-8 transition-all duration-500 hover:-translate-y-1 cursor-default`}
                style={{
                  boxShadow: '0 1px 4px rgba(30,32,34,0.04), 0 4px 16px rgba(30,32,34,0.03)',
                  animationDelay: `${(index + 2) * 100}ms`,
                }}
              >
                {/* Hover glow */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ boxShadow: '0 8px 40px rgba(30,32,34,0.08), 0 2px 8px rgba(30,32,34,0.04)' }}
                />

                {/* Icon container */}
                <div className={`relative z-10 inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br ${feature.gradient} mb-5 transition-transform duration-300 group-hover:scale-110`}>
                  <Icon size={20} className="text-white" strokeWidth={1.8} />
                </div>

                {/* Content */}
                <h3 className="relative z-10 text-lg font-semibold text-[#1E2022] mb-2.5 tracking-[-0.01em]">
                  {feature.title}
                </h3>
                <p className="relative z-10 text-sm text-[#6B7280] leading-relaxed">
                  {feature.description}
                </p>

                {/* Subtle corner accent */}
                <div className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className={`absolute top-4 right-4 w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-full blur-2xl opacity-[0.07]`} />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
