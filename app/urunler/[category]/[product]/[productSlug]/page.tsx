'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

interface ProductImage {
    id: string;
    url: string;
    alt: string | null;
}

interface ProductData {
    id: string;
    name: string;
    slug: string;
    oldName: string | null;
    newName: string;
    description: string | null;
    specifications: string | null;
    active: boolean;
    images: ProductImage[];
    category: {
        id: string;
        name: string;
        slug: string;
        parent?: { id: string; name: string; slug: string } | null;
    };
}

export default function ProductDetailPage() {
    const params = useParams();
    const categorySlug = params.category as string;
    const subcategorySlug = params.product as string;
    const productSlug = params.productSlug as string;
    const [product, setProduct] = useState<ProductData | null>(null);
    const [siblings, setSiblings] = useState<ProductData[]>([]);
    const [loading, setLoading] = useState(true);
    const [added, setAdded] = useState(false);
    const [qty, setQty] = useState(1);
    const [activeImage, setActiveImage] = useState(0);
    const { addItem } = useCart();

    useEffect(() => {
        if (!productSlug) { setLoading(false); return; }

        // Fetch single product
        fetch(`/api/db/products?slug=${productSlug}`, { cache: 'no-store' })
            .then(r => r.json())
            .then(data => {
                if (!data.error) {
                    setProduct(data);
                    // Fetch siblings
                    fetch(`/api/db/products?categorySlug=${subcategorySlug}`, { cache: 'no-store' })
                        .then(r2 => r2.json())
                        .then((sibs: ProductData[]) => {
                            if (Array.isArray(sibs)) {
                                setSiblings(sibs.filter(s => s.slug !== productSlug && s.active));
                            }
                        })
                        .catch(() => { });
                } else {
                    setProduct(null);
                }
            })
            .catch(() => setProduct(null))
            .finally(() => setLoading(false));
    }, [productSlug, subcategorySlug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <p className="text-neutral-500 text-lg">Ürün bulunamadı</p>
                <Link href={`/urunler/${categorySlug}/${subcategorySlug}`} className="text-sm uppercase tracking-wider border border-black px-6 py-2 hover:bg-black hover:text-white transition-colors">
                    Geri Dön
                </Link>
            </div>
        );
    }

    const parentName = product.category?.parent?.name || categorySlug;
    const subName = product.category?.name || subcategorySlug;
    const mainImage = product.images?.[activeImage]?.url || product.images?.[0]?.url || null;

    return (
        <>
            {/* Breadcrumb */}
            <div className="bg-neutral-50 border-b border-neutral-200">
                <div className="max-w-6xl mx-auto px-6 py-3">
                    <div className="flex items-center gap-2 text-xs text-neutral-400 flex-wrap">
                        <Link href="/" className="hover:text-black transition-colors">Ana Sayfa</Link>
                        <span>/</span>
                        <Link href={`/urunler/${categorySlug}`} className="hover:text-black transition-colors">{parentName}</Link>
                        <span>/</span>
                        <Link href={`/urunler/${categorySlug}/${subcategorySlug}`} className="hover:text-black transition-colors">{subName}</Link>
                        <span>/</span>
                        <span className="text-black font-semibold">{product.name}</span>
                    </div>
                </div>
            </div>

            {/* Product Detail */}
            <section className="py-16 md:py-24 bg-white">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                        {/* Images */}
                        <div>
                            <div className="bg-neutral-100 overflow-hidden flex items-center justify-center" style={{ maxHeight: '70vh', minHeight: '350px' }}>
                                {mainImage ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={mainImage} alt={product.name} className="w-full h-full object-contain" />
                                ) : (
                                    <div className="w-full flex items-center justify-center text-neutral-300" style={{ minHeight: '350px' }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5"><rect width="18" height="18" x="3" y="3" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                                    </div>
                                )}
                            </div>
                            {/* Thumbnail strip */}
                            {product.images.length > 1 && (
                                <div className="flex gap-2 mt-3">
                                    {product.images.map((img, i) => (
                                        <button
                                            key={img.id}
                                            onClick={() => setActiveImage(i)}
                                            className={`w-20 h-20 border-2 overflow-hidden transition-colors ${activeImage === i ? 'border-black' : 'border-neutral-200 hover:border-neutral-400'}`}
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={img.url} alt={img.alt || ''} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex flex-col justify-center">
                            <p className="text-xs uppercase tracking-[3px] text-neutral-400 mb-1">{parentName}</p>
                            <p className="text-xs uppercase tracking-[2px] text-neutral-500 mb-3">{subName} Serisi</p>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{product.name}</h1>
                            {product.oldName && (
                                <p className="text-sm text-neutral-400 mb-4">Eski Kod: <span className="font-medium text-neutral-600">{product.oldName}</span></p>
                            )}
                            {product.description && (
                                <p className="text-base text-neutral-600 leading-relaxed mb-8">{product.description}</p>
                            )}

                            {/* Quantity Selector */}
                            <div className="mb-6">
                                <label className="block text-xs uppercase tracking-[2px] font-semibold text-neutral-500 mb-2">Adet</label>
                                <div className="flex items-center gap-0 w-fit">
                                    <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-11 h-11 border border-neutral-300 flex items-center justify-center text-neutral-500 hover:border-black hover:text-black transition-colors text-lg font-light">−</button>
                                    <input
                                        type="number"
                                        min={1}
                                        value={qty}
                                        onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="w-16 h-11 border-t border-b border-neutral-300 text-center text-sm font-semibold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <button onClick={() => setQty(q => q + 1)} className="w-11 h-11 border border-neutral-300 flex items-center justify-center text-neutral-500 hover:border-black hover:text-black transition-colors text-lg font-light">+</button>
                                </div>
                            </div>

                            {/* CTA */}
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => {
                                        addItem({
                                            id: product.slug,
                                            name: product.name,
                                            category: categorySlug,
                                            categoryName: parentName,
                                            image: mainImage || '',
                                        }, qty);
                                        setAdded(true);
                                        setQty(1);
                                        setTimeout(() => setAdded(false), 2000);
                                    }}
                                    className={`text-xs uppercase tracking-[2px] font-semibold px-8 py-4 transition-all flex items-center gap-2 ${added ? 'bg-green-600 text-white' : 'bg-black text-white hover:bg-neutral-800'}`}
                                >
                                    {added ? (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                                            Eklendi!
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
                                            Sepete Ekle ({qty} Adet)
                                        </>
                                    )}
                                </button>
                                <Link href="/sepet" className="border border-black text-xs uppercase tracking-[2px] font-semibold px-8 py-4 hover:bg-black hover:text-white transition-colors flex items-center gap-2">
                                    Sepete Git
                                </Link>
                            </div>

                            {/* Specs */}
                            <div className="mt-12 border-t border-neutral-200 pt-8">
                                <h3 className="text-xs uppercase tracking-[2px] font-bold mb-4">Özellikler</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="py-3 border-b border-neutral-100">
                                        <p className="text-neutral-400 text-xs uppercase tracking-wider">Seri</p>
                                        <p className="font-semibold mt-1">{subName}</p>
                                    </div>
                                    <div className="py-3 border-b border-neutral-100">
                                        <p className="text-neutral-400 text-xs uppercase tracking-wider">Kategori</p>
                                        <p className="font-semibold mt-1">{parentName}</p>
                                    </div>
                                    {product.oldName && (
                                        <div className="py-3 border-b border-neutral-100">
                                            <p className="text-neutral-400 text-xs uppercase tracking-wider">Eski Kod</p>
                                            <p className="font-semibold mt-1">{product.oldName}</p>
                                        </div>
                                    )}
                                    <div className="py-3 border-b border-neutral-100">
                                        <p className="text-neutral-400 text-xs uppercase tracking-wider">Durum</p>
                                        <p className="font-semibold mt-1 text-green-600">Aktif</p>
                                    </div>
                                </div>
                                {product.specifications && (
                                    <div className="mt-6 text-sm text-neutral-600 whitespace-pre-wrap">{product.specifications}</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Other Products in Same Subcategory */}
            {siblings.length > 0 && (
                <section className="py-16 bg-neutral-50 border-t border-neutral-200">
                    <div className="max-w-6xl mx-auto px-6">
                        <h2 className="text-xl font-bold mb-8">Diğer {subName} Ürünleri</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                            {siblings.map(item => {
                                const img = item.images?.[0]?.url || null;
                                return (
                                    <Link key={item.id} href={`/urunler/${categorySlug}/${subcategorySlug}/${item.slug}`} className="group border border-neutral-200 bg-white hover:shadow-md transition-all">
                                        <div className="aspect-square bg-neutral-100 overflow-hidden">
                                            {img ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-neutral-300 bg-gradient-to-br from-neutral-100 to-neutral-200">
                                                    <span className="text-sm font-bold text-neutral-300">{item.name}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-3 text-center">
                                            <p className="text-sm font-bold uppercase tracking-wider">{item.name}</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA Banner */}
            <section className="py-16 bg-black text-white">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">Bu Ürün Hakkında Bilgi Alın</h2>
                    <p className="text-neutral-400 mb-8">Detaylı bilgi ve fiyat teklifi için bizimle iletişime geçin.</p>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <Link href="/iletisim" className="inline-block bg-white text-black text-xs uppercase tracking-[2px] font-semibold px-8 py-4 hover:bg-neutral-200 transition-colors">
                            Teklif Al
                        </Link>
                        <Link href="/sepet" className="inline-block border border-white text-white text-xs uppercase tracking-[2px] font-semibold px-8 py-4 hover:bg-white hover:text-black transition-colors">
                            Sepeti Görüntüle
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
