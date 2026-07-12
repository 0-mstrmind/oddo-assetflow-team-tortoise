import { useState, useEffect, useRef } from 'react';
import { getStats } from '@/services/landingService';

function AnimatedNumber({ value, suffix = '' }) {
  const [display, setDisplay] = useState('0');
  const ref = useRef(null);
  const animated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          animateValue(value);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  function animateValue(target) {
    // Extract numeric part
    const numericMatch = target.match(/[\d.]+/);
    if (!numericMatch) {
      setDisplay(target);
      return;
    }

    const numericTarget = parseFloat(numericMatch[0]);
    const prefix = target.slice(0, target.indexOf(numericMatch[0]));
    const suffixPart = target.slice(target.indexOf(numericMatch[0]) + numericMatch[0].length);
    const hasDecimal = numericMatch[0].includes('.');
    const duration = 1500;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = numericTarget * eased;

      if (hasDecimal) {
        setDisplay(`${prefix}${current.toFixed(1)}${suffixPart}`);
      } else {
        setDisplay(`${prefix}${Math.round(current)}${suffixPart}`);
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        setDisplay(target);
      }
    }

    requestAnimationFrame(update);
  }

  return <span ref={ref}>{display}</span>;
}

export default function StatsBar() {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    getStats().then(setStats);
  }, []);

  if (stats.length === 0) return null;

  return (
    <section id="stats" className="py-16 md:py-20">
      <div className="af-container">
        <div className="bg-white rounded-2xl md:rounded-3xl p-8 md:p-12 shadow-[0_2px_8px_rgba(30,32,34,0.04)] border border-[#F0EBE6]/80">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`text-center ${
                  index < stats.length - 1
                    ? 'md:border-r md:border-[#F0EBE6]'
                    : ''
                }`}
              >
                <div className="text-3xl md:text-4xl font-bold text-[#1E2022] tracking-tight mb-1">
                  <AnimatedNumber value={stat.value} />
                </div>
                <div className="text-sm font-semibold text-[#1E2022] mb-0.5">
                  {stat.label}
                </div>
                <div className="text-xs text-[#9CA3AF]">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
