'use client';

import { useState, useEffect } from 'react';

interface Testimonial {
    id: number;
    name: string;
    company: string;
    text: string;
    avatar: string;
    rating: number;
    active: boolean;
}

export default function Testimonials() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

    useEffect(() => {
        fetch('/api/db/testimonials', { cache: 'no-store' })
            .then((res) => res.json())
            .then((data: Testimonial[]) => setTestimonials(data.filter((t) => t.active)))
            .catch(() => setTestimonials([]));
    }, []);

    if (testimonials.length === 0) return null;

    return (
        <section className="py-20 md:py-28 bg-neutral-950 text-white">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-14">
                    <h2 className="text-4xl md:text-6xl font-bold mb-4">Müşterilerimiz Ne Diyor?</h2>
                    <p className="text-neutral-400 text-lg md:text-xl">
                        İş ortaklarımızdan gelen değerlendirmeler
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {testimonials.map((t) => (
                        <div
                            key={t.id}
                            className="bg-neutral-900 border border-neutral-800 p-8 rounded-xl"
                        >
                            {/* Stars */}
                            <div className="flex gap-1 mb-4">
                                {Array.from({ length: t.rating }, (_, i) => (
                                    <svg key={i} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#facc15" stroke="none">
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                    </svg>
                                ))}
                            </div>

                            {/* Comment */}
                            <p className="text-neutral-300 leading-relaxed mb-6 text-sm">
                                &ldquo;{t.text}&rdquo;
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-3">
                                {t.avatar ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={t.avatar}
                                        alt={t.name}
                                        className="w-10 h-10 rounded-full object-cover bg-neutral-700"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-white font-bold text-sm">
                                        {t.name.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <p className="font-semibold text-sm">{t.name}</p>
                                    <p className="text-neutral-500 text-xs">{t.company}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
