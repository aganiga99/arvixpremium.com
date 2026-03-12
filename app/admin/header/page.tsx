'use client';

import { useState, useEffect, useRef } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HeaderData = any;

const colorPresets = [
    { label: 'Beyaz', value: '#ffffff' },
    { label: 'Açık Gri', value: '#d4d4d4' },
    { label: 'Altın', value: '#f5c542' },
    { label: 'Kırmızı', value: '#ef4444' },
    { label: 'Mavi', value: '#60a5fa' },
    { label: 'Yeşil', value: '#4ade80' },
];

const fontWeightOptions = [
    { label: 'Normal', value: 'normal' },
    { label: 'Orta', value: '500' },
    { label: 'Kalın', value: '600' },
    { label: 'Çok Kalın', value: '700' },
    { label: 'Extra Kalın', value: '800' },
];

const fontSizeOptions = [
    { label: '10px', value: '10px' },
    { label: '11px', value: '11px' },
    { label: '12px (Varsayılan)', value: '12px' },
    { label: '13px', value: '13px' },
    { label: '14px', value: '14px' },
    { label: '15px', value: '15px' },
    { label: '16px', value: '16px' },
];

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
                if (d && Object.keys(d).length > 0) {
                    // Ensure navStyle exists
                    if (!d.navStyle) d.navStyle = {};
                    setData(d);
                } else {
                    fetch('/api/header', { cache: 'no-store' }).then(r => r.json()).then(old => {
                        if (!old.navStyle) old.navStyle = {};
                        setData(old);
                        fetch('/api/db/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'header', value: old }) });
                    }).catch(() => setData({ navStyle: {} }));
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

    const updateNavStyle = (field: string, value: string | boolean) => {
        setData({ ...data, navStyle: { ...(data.navStyle || {}), [field]: value } });
    };

    const updateLinkStyle = (index: number, field: string, value: string) => {
        const n = [...data.navLinks];
        n[index] = { ...n[index], [field]: value };
        setData({ ...data, navLinks: n });
    };

    if (!data) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" /></div>;

    const navStyle = data.navStyle || {};

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Header Yönetimi</h1>
                    <p className="text-xs text-green-600 mt-1">● Veritabanı bağlantılı</p>
                </div>
                <button onClick={save} className="bg-black text-white text-xs uppercase tracking-wider px-5 py-2.5 hover:bg-neutral-800 rounded">Kaydet</button>
            </div>
            {msg && <div className="fixed top-6 right-6 z-50 bg-black text-white px-5 py-3 text-sm font-medium shadow-lg rounded" style={{ animation: 'slideIn .3s ease-out' }}>{msg}</div>}

            <div className="space-y-6">

                {/* ═══════════ GENEL BAŞLIK STİLİ ═══════════ */}
                <div className="bg-white border border-neutral-200 p-6 space-y-4 rounded-lg">
                    <h2 className="font-bold text-lg border-b pb-2">🎨 Genel Başlık Stili</h2>
                    <p className="text-xs text-neutral-400">Tüm navigasyon linklerine uygulanır. Bireysel link renkleri bu ayarların üzerine yazabilir.</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Font Size */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Yazı Boyutu</label>
                            <select
                                value={navStyle.fontSize || '12px'}
                                onChange={e => updateNavStyle('fontSize', e.target.value)}
                                className="w-full border border-neutral-200 px-3 py-2 text-sm rounded focus:outline-none focus:border-black bg-white"
                            >
                                {fontSizeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>

                        {/* Font Weight */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Kalınlık</label>
                            <select
                                value={navStyle.fontWeight || 'normal'}
                                onChange={e => updateNavStyle('fontWeight', e.target.value)}
                                className="w-full border border-neutral-200 px-3 py-2 text-sm rounded focus:outline-none focus:border-black bg-white"
                            >
                                {fontWeightOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>

                        {/* Color */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Renk</label>
                            <div className="flex gap-2 items-center">
                                <input
                                    type="color"
                                    value={navStyle.color || '#d4d4d4'}
                                    onChange={e => updateNavStyle('color', e.target.value)}
                                    className="w-10 h-9 border border-neutral-200 rounded cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={navStyle.color || '#d4d4d4'}
                                    onChange={e => updateNavStyle('color', e.target.value)}
                                    className="flex-1 border border-neutral-200 px-2 py-2 text-sm rounded focus:outline-none focus:border-black font-mono"
                                    placeholder="#d4d4d4"
                                />
                            </div>
                        </div>

                        {/* Uppercase Toggle */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Büyük Harf</label>
                            <label className="flex items-center gap-2 mt-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={navStyle.uppercase !== false}
                                    onChange={e => updateNavStyle('uppercase', e.target.checked)}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm">{navStyle.uppercase !== false ? 'BÜYÜK HARF AKTİF' : 'Normal yazım'}</span>
                            </label>
                        </div>
                    </div>

                    {/* Color Presets */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">Hızlı Renk Seçimi</label>
                        <div className="flex gap-2 flex-wrap">
                            {colorPresets.map(cp => (
                                <button
                                    key={cp.value}
                                    onClick={() => updateNavStyle('color', cp.value)}
                                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border transition-all ${navStyle.color === cp.value ? 'border-black bg-neutral-100 font-bold' : 'border-neutral-200 hover:border-neutral-400'}`}
                                >
                                    <span className="w-3 h-3 rounded-full border border-neutral-300" style={{ background: cp.value }} />
                                    {cp.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="bg-neutral-900 rounded-lg p-4 mt-2">
                        <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-2">Önizleme</p>
                        <div className="flex items-center gap-5">
                            {(data.navLinks || []).filter((l: { active: boolean }) => l.active).map((link: { name: string; color?: string; fontWeight?: string }, i: number) => (
                                <span
                                    key={i}
                                    className={navStyle.uppercase !== false ? 'uppercase' : ''}
                                    style={{
                                        fontSize: navStyle.fontSize || '12px',
                                        color: link.color || navStyle.color || '#d4d4d4',
                                        fontWeight: link.fontWeight || navStyle.fontWeight || 'normal',
                                        letterSpacing: '2px',
                                    }}
                                >
                                    {link.name}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ═══════════ NAVİGASYON LİNKLERİ ═══════════ */}
                <div className="bg-white border border-neutral-200 p-6 space-y-4 rounded-lg">
                    <div className="flex items-center justify-between border-b pb-3">
                        <h2 className="font-bold text-lg">Navigasyon Linkleri</h2>
                        <p className="text-xs text-neutral-400">Sıralamak için sürükleyin veya ok butonlarını kullanın</p>
                    </div>
                    {(data.navLinks || []).map((link: { name: string; href: string; active: boolean; color?: string; fontWeight?: string }, i: number) => (
                        <div
                            key={i}
                            draggable
                            onDragStart={() => handleDragStart(i)}
                            onDragEnter={() => handleDragEnter(i)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => e.preventDefault()}
                            className={`border rounded-lg p-3 transition-all ${draggingIndex === i ? 'opacity-50 border-blue-400 bg-blue-50' : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100'}`}
                            style={{ cursor: 'grab' }}
                        >
                            <div className="flex items-center gap-3">
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

                                {/* Name & Href */}
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

                            {/* Per-link style overrides */}
                            <div className="flex items-center gap-3 mt-2 ml-12 pl-1">
                                <div className="flex items-center gap-1.5">
                                    <label className="text-[10px] text-neutral-400 uppercase tracking-wider">Renk:</label>
                                    <input
                                        type="color"
                                        value={link.color || navStyle.color || '#d4d4d4'}
                                        onChange={e => updateLinkStyle(i, 'color', e.target.value)}
                                        className="w-6 h-6 border border-neutral-200 rounded cursor-pointer"
                                    />
                                    {link.color && (
                                        <button onClick={() => updateLinkStyle(i, 'color', '')} className="text-[10px] text-neutral-400 hover:text-red-500" title="Genel ayara dön">✕</button>
                                    )}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <label className="text-[10px] text-neutral-400 uppercase tracking-wider">Kalınlık:</label>
                                    <select
                                        value={link.fontWeight || ''}
                                        onChange={e => updateLinkStyle(i, 'fontWeight', e.target.value)}
                                        className="border border-neutral-200 px-2 py-1 text-xs rounded focus:outline-none focus:border-black bg-white"
                                    >
                                        <option value="">Genel Ayar</option>
                                        {fontWeightOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))}
                    <button onClick={() => setData({ ...data, navLinks: [...(data.navLinks || []), { name: '', href: '/', active: true }] })} className="text-xs bg-neutral-100 hover:bg-neutral-200 px-4 py-2 rounded font-semibold mt-2">+ Yeni Link Ekle</button>
                </div>

                {/* ═══════════ CTA BUTONU ═══════════ */}
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
