import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getNavLinks } from '@/services/landingService';

export default function Navbar() {
  const [navLinks, setNavLinks] = useState([]);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    getNavLinks().then(setNavLinks);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      id="main-nav"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl shadow-[0_1px_3px_rgba(30,32,34,0.06)]'
          : 'bg-transparent'
      }`}
    >
      <div className="af-container">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <a href="/" id="logo" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="w-8 h-8 bg-[#1E2022] rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 18V8l8-5l8 5v10l-8 5L4 18Z" stroke="#D97736" strokeWidth="1.8" strokeLinejoin="round"/>
                  <path d="M12 13v9M4 8l8 5l8-5" stroke="#D97736" strokeWidth="1.8" strokeLinejoin="round"/>
                </svg>
              </div>
              {/* Burnt orange indicator dot */}
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#D97736] rounded-full" />
            </div>
            <span className="text-[#1E2022] text-lg font-semibold tracking-tight">
              Asset<span className="font-bold">Flow</span>
            </span>
          </a>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                id={`nav-${link.label.toLowerCase()}`}
                className="px-4 py-2 text-sm font-medium text-[#6B7280] hover:text-[#1E2022] transition-colors duration-200 rounded-xl hover:bg-[#F4EFEB]/60"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              id="nav-signin"
              className="group inline-flex items-center gap-2 px-5 py-2.5 bg-[#1E2022] text-white text-sm font-medium rounded-full hover:bg-[#2D3135] transition-all duration-300 hover:shadow-[0_4px_16px_rgba(30,32,34,0.2)]"
            >
              Sign In
              <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2 rounded-xl hover:bg-[#F4EFEB] transition-colors"
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-[1.5px] bg-[#1E2022] transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
            <span className={`block w-5 h-[1.5px] bg-[#1E2022] transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-[1.5px] bg-[#1E2022] transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            mobileOpen ? 'max-h-64 pb-6' : 'max-h-0'
          }`}
        >
          <div className="flex flex-col gap-1 pt-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-4 py-3 text-sm font-medium text-[#6B7280] hover:text-[#1E2022] hover:bg-[#F4EFEB] rounded-xl transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/login"
              className="mt-2 mx-4 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1E2022] text-white text-sm font-medium rounded-full"
              onClick={() => setMobileOpen(false)}
            >
              Sign In
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
