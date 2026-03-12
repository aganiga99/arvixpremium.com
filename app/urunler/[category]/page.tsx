'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface SubCategory {
    id: string;
    name: string;
    slug: string;
    image: string | null;
    description: string | null;
    active: boolean;
    _count?: { products: number };
}

interface CategoryData {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    children: SubCategory[];
    _count?: { products: number };
}

export default function CategoryPage() {
    const params = useParams();
    const slug = params.category as string;
    const [data, setData] = useState<CategoryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [subImages, setSubImages] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!slug) { setLoading(false); return; }
        fetch(`/api/db/categories?slug=${slug}`, { cache: 'no-store' })
            .then(r => r.json())
            .then(d => { if (d.error) setData(null); else setData(d); })
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    }, [slug]);

    // Fetch first product image for subcategories without their own image
    useEffect(() => {
        if (!data?.children) return;
        const noImageSubs = data.children.filter(c => c.active && !c.image);
        if (noImageSubs.length === 0) return;

        const fetchImages = async () => {
            const imgs: Record<string, string> = {};
            await Promise.all(
                noImageSubs.map(async (sub) => {
                    try {
                        const res = await fetch(`/api/db/products?categorySlug=${sub.slug}&limit=1`, { cache: 'no-store' });
                        const products = await res.json();
                        if (Array.isArray(products) && products.length > 0) {
                            const firstImage = products[0]?.images?.[0]?.url;
                            if (firstImage) imgs[sub.id] = firstImage;
                        }
                    } catch { /* skip */ }
                })
            );
            if (Object.keys(imgs).length > 0) setSubImages(imgs);
        };
        fetchImages();
    }, [data]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-neutral-500">Kategori bulunamadı</p>
            </div>
        );
    }

    const activeChildren = data.children?.filter(c => c.active) || [];

    return (
        <>
            {/* Hero */}
            <section className="relative min-h-[400px] flex items-center justify-center text-white overflow-hidden">
                <div className="absolute inset-0 bg-neutral-900">
                    {data.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={data.image} alt="" className="w-full h-full object-cover opacity-50" />
                    )}
                </div>
                <div className="absolute inset-0 bg-black/60" />
                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">{data.name}</h1>
                    {data.description && <p className="text-lg md:text-xl text-white/70">{data.description}</p>}
                    <p className="mt-4 text-sm text-white/50">
                        {activeChildren.length} alt kategori
                    </p>
                </div>
            </section>

            {/* Subcategories Grid */}
            <section className="py-20 md:py-28 bg-white">
                <div className="max-w-6xl mx-auto px-6">
                    {activeChildren.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {activeChildren.map((sub) => (
                                <Link key={sub.id} href={`/urunler/${slug}/${sub.slug}`} className="group border border-neutral-200 bg-white hover:shadow-lg transition-all duration-300">
                                    <div className="aspect-square bg-neutral-100 overflow-hidden relative">
                                        {(sub.image || subImages[sub.id]) ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={sub.image || subImages[sub.id]} alt={sub.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
                                                <span className="text-3xl font-black text-neutral-300 uppercase tracking-wider">{sub.name}</span>
                                            </div>
                                        )}
                                        {sub._count && sub._count.products > 0 && (
                                            <div className="absolute top-3 right-3 bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded">
                                                {sub._count.products} ürün
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5">
                                        <h3 className="text-base font-bold uppercase tracking-wider">{sub.name}</h3>
                                        {sub.description && (
                                            <p className="text-sm text-neutral-500 mt-1">{sub.description}</p>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-neutral-500">
                            <p className="text-lg mb-4">Bu kategoride henüz alt kategori bulunmuyor.</p>
                            <p className="text-sm">Admin panelinden kategori ekleyebilirsiniz.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 bg-black text-white">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">Teklif Almak İster Misiniz?</h2>
                    <p className="text-neutral-400 mb-8">Bu ürünler hakkında detaylı bilgi ve fiyat teklifi için bizimle iletişime geçin.</p>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <Link href="/iletisim" className="inline-block bg-white text-black text-xs uppercase tracking-[2px] font-semibold px-8 py-4 hover:bg-neutral-200 transition-colors">
                            Teklif Al
                        </Link>
                        <Link href="/marka-logo" className="inline-block border border-white text-white text-xs uppercase tracking-[2px] font-semibold px-8 py-4 hover:bg-white hover:text-black transition-colors">
                            Marka & Logo
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
