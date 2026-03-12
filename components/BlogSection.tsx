'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    image: string;
    createdAt: string;
    slug: string;
    published: boolean;
}

export default function BlogSection() {
    const [posts, setPosts] = useState<BlogPost[]>([]);

    useEffect(() => {
        fetch('/api/db/blog', { cache: 'no-store' })
            .then((res) => res.json())
            .then((data: BlogPost[]) => setPosts((Array.isArray(data) ? data : []).filter((p) => p.published).slice(0, 3)))
            .catch(() => setPosts([]));
    }, []);

    if (posts.length === 0) return null;

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <section className="py-20 md:py-28 bg-white">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-14">
                    <h2 className="text-4xl md:text-6xl font-bold mb-4">Blog</h2>
                    <p className="text-neutral-500 text-base md:text-lg">
                        Fitness dünyasından haberler ve rehberler
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {posts.map((post) => (
                        <Link
                            key={post.id}
                            href={`/blog/${post.slug}`}
                            className="group block"
                        >
                            {/* Image */}
                            <div className="aspect-[16/10] bg-neutral-100 rounded-xl overflow-hidden mb-4">
                                {post.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                                            <circle cx="9" cy="9" r="2" />
                                            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <p className="text-xs text-neutral-400 mb-2 uppercase tracking-wider">
                                {formatDate(post.createdAt)}
                            </p>
                            <h3 className="text-xl font-bold mb-2 group-hover:text-neutral-600 transition-colors">
                                {post.title}
                            </h3>
                            <p className="text-sm text-neutral-500 leading-relaxed">
                                {post.excerpt}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
