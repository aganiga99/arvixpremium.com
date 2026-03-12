'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Category {
    id: string;
    name: string;
    image: string | null;
    slug: string;
    active: boolean;
    children?: Category[];
    _count?: { products: number };
}

export default function CategoryShowcase() {
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        fetch('/api/db/categories?tree=true', { cache: 'no-store' })
            .then((res) => res.json())
            .then((data: Category[]) => {
                if (Array.isArray(data)) {
                    // Show top-level active categories
                    setCategories(data.filter((c) => c.active));
                }
            })
            .catch(() => setCategories([]));
    }, []);

    if (categories.length === 0) return null;

    return (
        <section className="py-20 md:py-28 bg-white">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-14">
                    <h2 className="text-4xl md:text-6xl font-bold mb-4">Ürün Kategorileri</h2>
                    <p className="text-neutral-500 text-base md:text-lg">
                        Profesyonel fitness ekipmanlarımızı keşfedin
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {categories.map((cat) => (
                        <Link
                            key={cat.id}
                            href={`/urunler/${cat.slug}`}
                            className="group relative aspect-square bg-neutral-900 overflow-hidden"
                        >
                            {/* Image */}
                            {cat.image && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={cat.image}
                                    alt={cat.name}
                                    className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-40 group-hover:scale-110 transition-all duration-500"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            )}

                            {/* Overlay gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                            {/* Category Name */}
                            <div className="absolute inset-0 flex items-end p-5">
                                <div>
                                    <h3 className="text-white text-base md:text-lg font-bold uppercase tracking-wider">
                                        {cat.name}
                                    </h3>
                                    <div className="mt-2 w-0 group-hover:w-8 h-0.5 bg-white transition-all duration-300" />
                                </div>
                            </div>

                            {/* Arrow icon on hover */}
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M7 17 17 7" /><path d="M7 7h10v10" />
                                </svg>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
