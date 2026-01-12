'use client';

import {
    Instagram,
    Facebook,
    Twitter,
    Youtube,
    Link as LinkIcon
} from 'lucide-react';

// Social media footer for the public store

export function StoreFooter({ store }: { store: any }) {
    const hasSocial = store.instagramUrl || store.facebookUrl || store.tiktokUrl || store.twitterUrl || store.pinterestUrl || store.youtubeUrl;

    if (!hasSocial) return null;

    const socialLinks = [
        { url: store.instagramUrl, icon: Instagram, color: 'hover:text-pink-600', label: 'Instagram' },
        { url: store.facebookUrl, icon: Facebook, color: 'hover:text-blue-800', label: 'Facebook' },
        { url: store.tiktokUrl, icon: LinkIcon, color: 'hover:text-black', label: 'TikTok' },
        { url: store.twitterUrl, icon: Twitter, color: 'hover:text-gray-900', label: 'X' },
        { url: store.pinterestUrl, icon: LinkIcon, color: 'hover:text-red-600', label: 'Pinterest' },
        { url: store.youtubeUrl, icon: Youtube, color: 'hover:text-red-700', label: 'YouTube' },
    ].filter(link => link.url);

    return (
        <footer className="bg-[var(--bg)] border-t border-[var(--border)] py-12 mt-auto transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 text-center space-y-8">
                <div className="space-y-2">
                    <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text)]/40">Síguenos</h3>
                    <div className="flex items-center justify-center gap-6">
                        {socialLinks.map((link, idx) => (
                            <a
                                key={idx}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`p-3 bg-[var(--secondary)] rounded-2xl text-[var(--text)]/40 transition-all hover:scale-110 active:scale-90 hover:bg-[var(--bg)] hover:shadow-lg ${link.color}`}
                                title={link.label}
                            >
                                <link.icon className="w-6 h-6" />
                            </a>
                        ))}
                    </div>
                </div>
                <div className="pt-8 border-t border-[var(--border)]">
                    <p className="text-[var(--text)]/40 text-xs font-bold uppercase tracking-tighter">
                        © {new Date().getFullYear()} {store.name}. Impulsado por <span className="text-[var(--primary)]">ShopyLink</span>
                    </p>
                </div>
            </div>
        </footer>
    );
}
