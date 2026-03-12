'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface ProductImage {
    id: string;
    url: string;
    alt: string | null;
}

interface ProductItem {
    id: string;
    name: string;
    slug: string;
    oldName: string | null;
    newName: string;
    description: string | null;
    active: boolean;
    images: ProductImage[];
    category?: { name: string; slug: string; parent?: { name: string; slug: string } | null };
}

interface SubCategoryData {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    parent?: { name: string; slug: string } | null;
}

export default function SubcategoryPage() {
    const params = useParams();
    const categorySlug = params.category as string;
    const subcategorySlug = params.product as string; // still named [product] in filesystem
    const [products, setProducts] = useState<ProductItem[]>([]);
    const [subCategory, setSubCategory] = useState<SubCategoryData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!categorySlug || !subcategorySlug) { setLoading(false); return; }

        // Fetch subcategory info
        fetch(`/api/db/categories?slug=${subcategorySlug}`, { cache: 'no-store' })
            .then(r => r.json())
            .then(data => { if (!data.error) setSubCategory(data); })
            .catch(() => { });

        // Fetch products for this subcategory
        fetch(`/api/db/products?categorySlug=${subcategorySlug}`, { cache: 'no-store' })
            .then(r => r.json())
            .then((data: ProductItem[]) => {
                if (Array.isArray(data)) {
                    setProducts(data.filter(p => p.active));
                }
            })
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, [categorySlug, subcategorySlug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const parentName = subCategory?.parent?.name || categorySlug;
    const subName = subCategory?.name || subcategorySlug;

    return (
        <>
            {/* Breadcrumb */}
            <div className="bg-neutral-50 border-b border-neutral-200">
                <div className="max-w-6xl mx-auto px-6 py-3">
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <Link href="/" className="hover:text-black transition-colors">Ana Sayfa</Link>
                        <span>/</span>
                        <Link href={`/urunler/${categorySlug}`} className="hover:text-black transition-colors">{parentName}</Link>
                        <span>/</span>
                        <span className="text-black font-semibold">{subName}</span>
                    </div>
                </div>
            </div>

            {/* Hero */}
            <section className="relative py-20 md:py-28 bg-neutral-900 text-white overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-black" />
                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                    <p className="text-[10px] uppercase tracking-[4px] text-neutral-500 mb-4">{parentName}</p>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">{subName}</h1>
                    {subCategory?.description && <p className="text-lg text-white/60">{subCategory.description}</p>}
                    <p className="mt-4 text-sm text-white/40">{products.length} ürün</p>
                </div>
            </section>

            {/* Products Grid */}
            <section className="py-20 md:py-28 bg-white">
                <div className="max-w-6xl mx-auto px-6">
                    {products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product) => {
                                const mainImage = product.images?.[0]?.url || null;
                                return (
                                    <Link
                                        key={product.id}
                                        href={`/urunler/${categorySlug}/${subcategorySlug}/${product.slug}`}
                                        className="group border border-neutral-200 bg-white hover:shadow-lg transition-all duration-300"
                                    >
                                        <div className="aspect-square bg-neutral-100 overflow-hidden">
                                            {mainImage ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={mainImage} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
                                                    <span className="text-2xl font-black text-neutral-300 uppercase">{product.name}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5">
                                            <h3 className="text-lg font-bold uppercase tracking-wider">{product.name}</h3>
                                            {product.oldName && (
                                                <p className="text-xs text-neutral-400 mt-1">Eski: {product.oldName}</p>
                                            )}
                                            {product.description && (
                                                <p className="text-sm text-neutral-500 mt-2 line-clamp-2">{product.description}</p>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-neutral-500">
                            <p className="text-lg mb-4">Bu alt kategoride henüz ürün bulunmuyor.</p>
                            <p className="text-sm">Admin panelinden ürün ekleyebilirsiniz.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 bg-black text-white">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">Teklif Almak İster Misiniz?</h2>
                    <p className="text-neutral-400 mb-8">{subName} serisi hakkında detaylı bilgi ve fiyat teklifi için bizimle iletişime geçin.</p>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <Link href="/iletisim" className="inline-block bg-white text-black text-xs uppercase tracking-[2px] font-semibold px-8 py-4 hover:bg-neutral-200 transition-colors">
                            Teklif Al
                        </Link>
                        <Link href={`/urunler/${categorySlug}`} className="inline-block border border-white text-white text-xs uppercase tracking-[2px] font-semibold px-8 py-4 hover:bg-white hover:text-black transition-colors">
                            ← {parentName}
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
