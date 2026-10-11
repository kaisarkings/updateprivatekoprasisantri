import React from 'react';
import { useApp } from '../../context/AppContext';

export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export const WebsiteIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.8 14.8 0 0 0 0 20 14.8 14.8 0 0 0 0-20" />
    <path d="M2 12h20" />
  </svg>
);

export const WhatsAppChannelIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    {/* WhatsApp Channel Megaphone */}
    <path d="M13 3.65a1.2 1.2 0 0 0-1.35.25L7.2 8H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h3.2l4.45 4.1a1.2 1.2 0 0 0 2.01-.88V4.53c0-.38-.15-.69-.41-.88z" />
    {/* Megaphone Handle */}
    <path d="M6.2 16.5l.8 3.5a1.5 1.5 0 0 0 1.47 1.17h1.06a1.5 1.5 0 0 0 1.47-1.22l.62-3.45H6.2z" />
    {/* Sound Wave 1 */}
    <path d="M16.5 8.5a5 5 0 0 1 0 7 1 1 0 1 0 1.42 1.42 7 7 0 0 0 0-9.84 1 1 0 1 0-1.42 1.42z" />
    {/* Sound Wave 2 */}
    <path d="M19.5 5.5a9.5 9.5 0 0 1 0 13 1 1 0 1 0 1.42 1.42 11.5 11.5 0 0 0 0-15.84 1 1 0 0 0-1.42 1.42z" />
  </svg>
);

export const DeveloperFooter: React.FC = () => {
  const { settings, uiStyle } = useApp();
  const isNeo = uiStyle === 'neo-brutalism';

  // Fallback links or settings
  const rawWa = settings?.phone || '087856967462';
  const cleanWaNumber = rawWa.replace(/[^0-9]/g, '').replace(/^0/, '62');
  const waUrl = `https://wa.me/${cleanWaNumber}?text=${encodeURIComponent('Halo Developer Koperasi Santri, saya ingin bertanya terkait aplikasi.')}`;
  const websiteUrl = 'https://kingssstore.vercel.app/';
  const waChannelUrl = `https://whatsapp.com/channel/0029VbBgdTY9xVJhMDkmjX0U`;

  return (
    <footer className="w-full mt-10 pt-6 pb-8 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col items-center justify-center gap-4 text-center">
      {/* Label Title */}
      <div className="space-y-0.5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Kontak & Saluran Developer
        </p>
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Layanan Bantuan, Info Update & Saluran Resmi Koperasi Santri
        </p>
      </div>

      {/* 3 Icon Buttons matching user screenshot */}
      <div className="flex items-center justify-center gap-3 sm:gap-4">
        {/* WhatsApp Chat Button */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Hubungi WhatsApp Developer (Chat)"
          className={
            isNeo
              ? "w-12 h-12 rounded-2xl bg-black border-[3px] border-black text-white hover:bg-emerald-500 hover:text-black flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all group"
              : "w-12 h-12 rounded-2xl bg-[#1c1c1e] hover:bg-[#25D366] text-white flex items-center justify-center shadow-md hover:shadow-emerald-500/25 transition-all duration-200 hover:scale-105 active:scale-95 group border border-white/5"
          }
        >
          <WhatsAppIcon className="w-6 h-6 transition-transform group-hover:scale-110" />
        </a>

        {/* Kings Store Website Button */}
        <a
          href={websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Kunjungi Website Resmi Kings Store (kingssstore.vercel.app)"
          className={
            isNeo
              ? "w-12 h-12 rounded-2xl bg-black border-[3px] border-black text-white hover:bg-sky-400 hover:text-black flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all group"
              : "w-12 h-12 rounded-2xl bg-[#1c1c1e] hover:bg-[#0284c7] text-white flex items-center justify-center shadow-md hover:shadow-sky-500/30 transition-all duration-200 hover:scale-105 active:scale-95 group border border-white/5"
          }
        >
          <WebsiteIcon className="w-6 h-6 transition-transform group-hover:scale-110" />
        </a>

        {/* WhatsApp Channel (Saluran WA) Button */}
        <a
          href={waChannelUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Gabung Saluran WhatsApp (WhatsApp Channel) Pengembang"
          className={
            isNeo
              ? "w-12 h-12 rounded-2xl bg-black border-[3px] border-black text-white hover:bg-teal-400 hover:text-black flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all group"
              : "w-12 h-12 rounded-2xl bg-[#1c1c1e] hover:bg-[#128C7E] text-white flex items-center justify-center shadow-md hover:shadow-teal-500/25 transition-all duration-200 hover:scale-105 active:scale-95 group border border-white/5"
          }
        >
          <WhatsAppChannelIcon className="w-6 h-6 transition-transform group-hover:scale-110" />
        </a>
      </div>

      {/* Copyright Notice */}
      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
        © {new Date().getFullYear()} {settings.pesantren_name || 'Pondok Pesantren'}. Seluruh hak cipta dilindungi.
      </p>
    </footer>
  );
};