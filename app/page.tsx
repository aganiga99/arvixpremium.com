'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import HeroSlider from '@/components/HeroSlider';
import CategoryShowcase from '@/components/CategoryShowcase';
import Testimonials from '@/components/Testimonials';
import BlogSection from '@/components/BlogSection';

interface HomeData {
  about: { title: string; paragraphs: string[]; buttonText: string; buttonLink: string };
  branding: { title: string; subtitle: string; buttonText: string; buttonLink: string };
  whyUs: { title: string; items: { title: string; description: string }[] };
  cta: { title: string; subtitle: string; buttonText: string; buttonLink: string };
}

const defaultData: HomeData = {
  about: {
    title: 'ARVIX Nedir?',
    paragraphs: [
      'Arvix ekibi olarak; profesyonel spor salonları, butik stüdyolar ve kurumsal fitness yatırımları için yüksek standartlarda fitness ekipmanlarını tedarik eden, markalayan ve uçtan uca yöneten bir çözüm ortağıyız.',
      'Yurt dışındaki üretici fabrikalarla doğrudan iş birliği içinde çalışarak; aracı marka ve distribütör zincirlerini ortadan kaldırır, fitness ekipmanlarını kendi marka ve logonuzla pazara sunmanıza imkân tanırız.',
    ],
    buttonText: 'Daha Fazla Bilgi',
    buttonLink: '/hakkimizda',
  },
  branding: {
    title: 'Kendi Marka ve Logonuzu Oluşturun',
    subtitle: 'Tüm ekipmanları kendi markanız ve renk paletinizle özelleştirin.',
    buttonText: 'Daha Fazla Bilgi',
    buttonLink: '/marka-logo',
  },
  whyUs: {
    title: 'Neden Arvix?',
    items: [
      { title: 'Direkt Fabrika', description: '%20-40 daha avantajlı fabrika çıkış fiyatları' },
      { title: 'Profesyonel Kalite', description: 'Ticari kullanım için uzun ömürlü ekipmanlar' },
      { title: 'Özelleştirme', description: 'Logo, renk ve tasarımda tam kontrol' },
    ],
  },
  cta: {
    title: 'Profesyonel Spor Salonu Kurmaya Hazır Mısınız?',
    subtitle: 'Proje danışmanlığından ekipman tedariğine uçtan uca çözümler',
    buttonText: 'Teklif Al',
    buttonLink: '/iletisim',
  },
};

export default function HomePage() {
  const [data, setData] = useState<HomeData>(defaultData);

  useEffect(() => {
    fetch('/api/db/settings?key=homepage', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => {
        if (d && Object.keys(d).length > 0) {
          setData({
            about: { ...defaultData.about, ...d.about },
            branding: { ...defaultData.branding, ...d.branding },
            whyUs: { ...defaultData.whyUs, ...d.whyUs },
            cta: { ...defaultData.cta, ...d.cta },
          });
        }
      })
      .catch(() => { /* use defaults */ });
  }, []);

  return (
    <>
      {/* Hero Slider */}
      <HeroSlider />

      {/* Category Showcase Grid */}
      <CategoryShowcase />

      {/* About Section */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-10">{data.about.title}</h2>
          <div className="text-left space-y-6 text-base md:text-lg text-neutral-600 leading-relaxed">
            {data.about.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <div className="mt-10">
            <Link
              href={data.about.buttonLink}
              className="inline-block bg-black text-white text-xs uppercase tracking-[2px] font-semibold px-8 py-4 hover:bg-neutral-800 transition-colors"
            >
              {data.about.buttonText}
            </Link>
          </div>
        </div>
      </section>

      {/* Custom Branding */}
      <section className="py-20 md:py-28 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">{data.branding.title}</h2>
          <p className="text-base md:text-lg text-neutral-600 mb-10 max-w-3xl mx-auto">{data.branding.subtitle}</p>
          <Link
            href={data.branding.buttonLink}
            className="inline-block bg-black text-white text-xs uppercase tracking-[2px] font-semibold px-8 py-4 hover:bg-neutral-800 transition-colors"
          >
            {data.branding.buttonText}
          </Link>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-4xl md:text-6xl font-bold mb-14 text-center">{data.whyUs.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {data.whyUs.items.map((item, i) => (
              <div key={i} className="text-center">
                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                <p className="text-neutral-600 text-base leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* Blog */}
      <BlogSection />

      {/* Final CTA */}
      <section className="py-20 bg-black text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">{data.cta.title}</h2>
          <p className="text-neutral-400 mb-10">{data.cta.subtitle}</p>
          <Link
            href={data.cta.buttonLink}
            className="inline-block border-2 border-white text-white text-xs uppercase tracking-[2px] font-semibold px-8 py-4 hover:bg-white hover:text-black transition-colors"
          >
            {data.cta.buttonText}
          </Link>
        </div>
      </section>
    </>
  );
}
