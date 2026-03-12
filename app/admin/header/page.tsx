'use client';

import { useState, useEffect, useRef } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HeaderData = any;

export default function HeaderAdmin() {
    const [data, setData] = useState<HeaderData>(null);
    const [msg, setMsg] = useState('');
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

    useEffect(() => {
        fetch('/api/db/settings?key=header', { cache: 'no-store' })
            .then(r => r.json())
            .then(d => {
                if (d && Object.keys(d).length > 0) setData(d);
                else {
                    fetch('/api/header', { cache: 'no-store' }).then(r => r.json()).then(old => {
                        setData(old);
                        fetch('/api/db/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'header', value: old }) });
                    }).catch(() => setData({}));
                }
            })
            .catch(() => setData(null));
    }, []);

    const save = async () => {
        const res = await fetch('/api/db/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'header', value: data }) });
        if (res.ok) { setMsg('✓ Kaydedildi!'); setTimeout(() => setMsg(''), 2000); }
    };

    // Drag & Drop handlers
    const handleDragStart = (index: number) => {
        dragItem.current = index;
        setDraggingIndex(index);
    };

    const handleDragEnter = (index: number) => {
        dragOverItem.current = index;
    };

    const handleDragEnd = () => {
        if (dragItem.current === null || dragOverItem.current === null) {
            setDraggingIndex(null);
            return;
        }
        const newLinks = [...(data.navLinks || [])];
        const draggedItem = newLinks[dragItem.current];
        newLinks.splice(dragItem.current, 1);
        newLinks.splice(dragOverItem.current, 0, draggedItem);
        setData({ ...data, navLinks: newLinks });
        dragItem.current = null;
        dragOverItem.current = null;
        setDraggingIndex(null);
    };

    const moveItem = (index: number, direction: 'up' | 'down') => {
        const newLinks = [...(data.navLinks || [])];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= newLinks.length) return;
        [newLinks[index], newLinks[newIndex]] = [newLinks[newIndex], newLinks[index]];
        setData({ ...data, navLinks: newLinks });
    };

    const removeLink = (index: number) => {
        const newLinks = [...(data.navLinks || [])];
        newLinks.splice(index, 1);
        setData({ ...data, navLinks: newLinks });
    };

    if (!data) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Header Yönetimi</h1>
                    <p className="text-xs text-green-600 mt-1">● Veritabanı bağlantılı</p>
                </div>
                <button onClick={save} className="bg-black text-white text-xs uppercase tracking-wider px-5 py-2.5 hover:bg-neutral-800">Kaydet</button>
            </div>
            {msg && <div className="fixed top-6 right-6 z-50 bg-black text-white px-5 py-3 text-sm font-medium shadow-lg" style={{ animation: 'slideIn .3s ease-out' }}>{msg}</div>}

            <div className="space-y-6">
                <div className="bg-white border border-neutral-200 p-6 space-y-4 rounded-lg">
                    <div className="flex items-center justify-between border-b pb-3">
                        <h2 className="font-bold text-lg">Navigasyon Linkleri</h2>
                        <p className="text-xs text-neutral-400">Sıralamak için sürükleyin veya ok butonlarını kullanın</p>
                    </div>
                    {(data.navLinks || []).map((link: { name: string; href: string; active: boolean }, i: number) => (
                        <div
                            key={i}
                            draggable
                            onDragStart={() => handleDragStart(i)}
                            onDragEnter={() => handleDragEnter(i)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => e.preventDefault()}
                            className={`flex items-center gap-3 border rounded-lg p-3 transition-all ${draggingIndex === i ? 'opacity-50 border-blue-400 bg-blue-50' : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100'}`}
                            style={{ cursor: 'grab' }}
                        >
                            {/* Drag Handle */}
                            <div className="flex-shrink-0 text-neutral-400 cursor-grab active:cursor-grabbing select-none" title="Sürükle">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <circle cx="8" cy="5" r="1.5" /><circle cx="16" cy="5" r="1.5" />
                                    <circle cx="8" cy="12" r="1.5" /><circle cx="16" cy="12" r="1.5" />
                                    <circle cx="8" cy="19" r="1.5" /><circle cx="16" cy="19" r="1.5" />
                                </svg>
                            </div>

                            {/* Order Number */}
                            <span className="flex-shrink-0 w-6 h-6 bg-black text-white text-[10px] font-bold flex items-center justify-center rounded">{i + 1}</span>

                            {/* Inputs */}
                            <input value={link.name} onChange={e => { const n = [...data.navLinks]; n[i] = { ...n[i], name: e.target.value }; setData({ ...data, navLinks: n }); }} className="flex-1 border border-neutral-200 px-3 py-2 text-sm rounded focus:outline-none focus:border-black" placeholder="Link adı" />
                            <input value={link.href} onChange={e => { const n = [...data.navLinks]; n[i] = { ...n[i], href: e.target.value }; setData({ ...data, navLinks: n }); }} className="flex-1 border border-neutral-200 px-3 py-2 text-sm rounded focus:outline-none focus:border-black" placeholder="/sayfa" />

                            {/* Active Toggle */}
                            <label className="flex items-center gap-1.5 text-xs flex-shrink-0">
                                <input type="checkbox" checked={link.active} onChange={e => { const n = [...data.navLinks]; n[i] = { ...n[i], active: e.target.checked }; setData({ ...data, navLinks: n }); }} />
                                Aktif
                            </label>

                            {/* Up/Down Buttons */}
                            <div className="flex flex-col gap-0.5 flex-shrink-0">
                                <button onClick={() => moveItem(i, 'up')} disabled={i === 0} className="w-6 h-5 flex items-center justify-center text-neutral-400 hover:text-black disabled:opacity-20 disabled:cursor-not-allowed transition-colors" title="Yukarı">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m18 15-6-6-6 6" /></svg>
                                </button>
                                <button onClick={() => moveItem(i, 'down')} disabled={i === (data.navLinks || []).length - 1} className="w-6 h-5 flex items-center justify-center text-neutral-400 hover:text-black disabled:opacity-20 disabled:cursor-not-allowed transition-colors" title="Aşağı">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
                                </button>
                            </div>

                            {/* Delete Button */}
                            <button onClick={() => removeLink(i)} className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Sil">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                        </div>
                    ))}
                    <button onClick={() => setData({ ...data, navLinks: [...(data.navLinks || []), { name: '', href: '/', active: true }] })} className="text-xs bg-neutral-100 hover:bg-neutral-200 px-4 py-2 rounded font-semibold mt-2">+ Yeni Link Ekle</button>
                </div>

                <div className="bg-white border border-neutral-200 p-6 space-y-4 rounded-lg">
                    <h2 className="font-bold text-lg">CTA Butonu</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Buton Metni</label><input value={data.ctaText || ''} onChange={e => setData({ ...data, ctaText: e.target.value })} className="w-full border border-neutral-200 px-3 py-2 text-sm rounded focus:outline-none focus:border-black" /></div>
                        <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Buton Linki</label><input value={data.ctaLink || ''} onChange={e => setData({ ...data, ctaLink: e.target.value })} className="w-full border border-neutral-200 px-3 py-2 text-sm rounded focus:outline-none focus:border-black" /></div>
                    </div>
                </div>
            </div>
            <style jsx>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
        </div>
    );
}
