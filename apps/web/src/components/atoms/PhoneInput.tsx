'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Country {
    name: string;
    code: string;
    flag: string;
    dialCode: string;
}

const countries: Country[] = [
    { name: 'República Dominicana', code: 'DO', flag: '🇩🇴', dialCode: '+1' },
    { name: 'Colombia', code: 'CO', flag: '🇨🇴', dialCode: '+57' },
    { name: 'México', code: 'MX', flag: '🇲🇽', dialCode: '+52' },
    { name: 'España', code: 'ES', flag: '🇪🇸', dialCode: '+34' },
    { name: 'Estados Unidos', code: 'US', flag: '🇺🇸', dialCode: '+1' },
    { name: 'Argentina', code: 'AR', flag: '🇦🇷', dialCode: '+54' },
    { name: 'Chile', code: 'CL', flag: '🇨🇱', dialCode: '+56' },
    { name: 'Perú', code: 'PE', flag: '🇵🇪', dialCode: '+51' },
    { name: 'Ecuador', code: 'EC', flag: '🇪🇨', dialCode: '+593' },
    { name: 'Venezuela', code: 'VE', flag: '🇻🇪', dialCode: '+58' },
    { name: 'Panamá', code: 'PA', flag: '🇵🇦', dialCode: '+507' },
    { name: 'Costa Rica', code: 'CR', flag: '🇨🇷', dialCode: '+506' },
    { name: 'Uruguay', code: 'UY', flag: '🇺🇾', dialCode: '+598' },
    { name: 'Bolivia', code: 'BO', flag: '🇧🇴', dialCode: '+591' },
    { name: 'Paraguay', code: 'PY', flag: '🇵🇾', dialCode: '+595' },
    { name: 'Guatemala', code: 'GT', flag: '🇬🇹', dialCode: '+502' },
    { name: 'Honduras', code: 'HN', flag: '🇭🇳', dialCode: '+504' },
    { name: 'El Salvador', code: 'SV', flag: '🇸🇻', dialCode: '+503' },
    { name: 'Nicaragua', code: 'NI', flag: '🇳🇮', dialCode: '+505' },
    { name: 'Puerto Rico', code: 'PR', flag: '🇵🇷', dialCode: '+1' },
];

interface PhoneInputProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
    required?: boolean;
    error?: string;
    className?: string;
    preferredCountry?: string;
}

export function PhoneInput({
    value,
    onChange,
    label,
    placeholder = '300 123 4567',
    required = false,
    error,
    className,
    preferredCountry = 'CO',
}: PhoneInputProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCountry, setSelectedCountry] = useState<Country>(() => countries.find(country => country.code === preferredCountry) || countries[0]!);
    const [localNumber, setLocalNumber] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const lastEmitted = useRef<string | null>(null);
    const inputId = useId();
    const listId = useId();

    // Reconcile changes from the parent (for example, switching stores) without
    // replacing the country while the user types a number with a shared prefix.
    useEffect(() => {
        if (value === lastEmitted.current) return;
        if (!value) {
            setLocalNumber('');
            setSelectedCountry(countries.find(country => country.code === preferredCountry) || countries[0]!);
            return;
        }
        if (value.startsWith('+')) {
            const matches = [...countries].sort((a, b) => b.dialCode.length - a.dialCode.length).filter(country => value.startsWith(country.dialCode));
            const longest = matches[0]?.dialCode.length;
            const matching = matches.filter(country => country.dialCode.length === longest);
            const country = matching.find(item => item.code === preferredCountry) || matching[0];
            if (country) { setSelectedCountry(country); setLocalNumber(value.slice(country.dialCode.length).replace(/\D/g, '')); return; }
        }
        setLocalNumber(value.replace(/\D/g, ''));
    }, [value, preferredCountry]);

    useEffect(() => {
        const outside = (event: PointerEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false); };
        const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setIsOpen(false); };
        document.addEventListener('pointerdown', outside);
        document.addEventListener('keydown', escape);
        return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
    }, []);

    const filteredCountries = countries.filter(country =>
        country.name.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase()) ||
        country.dialCode.includes(searchTerm) || country.code.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    const emit = (country: Country, number: string) => {
        const next = number ? `${country.dialCode}${number}` : '';
        lastEmitted.current = next;
        onChange(next);
    };
    const handleNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const number = event.target.value.replace(/\D/g, '');
        setLocalNumber(number);
        emit(selectedCountry, number);
    };
    const handleCountrySelect = (country: Country) => {
        setSelectedCountry(country);
        emit(country, localNumber);
        setIsOpen(false);
        setSearchTerm('');
    };

    return <div className={cn('min-w-0 space-y-1.5', className)}>
        {label && <label htmlFor={inputId} className="block text-sm font-bold text-[var(--text)]/65">{label} {required && <span className="text-red-500">*</span>}</label>}
        <div className="flex min-w-0 gap-2">
            <div className="relative shrink-0" ref={dropdownRef}>
                <button type="button" aria-label={`Código de país: ${selectedCountry.name} ${selectedCountry.dialCode}`} aria-expanded={isOpen} aria-haspopup="listbox" aria-controls={isOpen ? listId : undefined} onClick={() => setIsOpen(!isOpen)} className="flex min-h-11 items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-2.5 text-sm font-bold text-[var(--text)] outline-none transition-colors hover:border-[var(--primary)]/50 focus-visible:ring-2 focus-visible:ring-[var(--primary)]/20 sm:px-3"><span aria-hidden="true" className="flex h-6 min-w-7 items-center justify-center rounded-md bg-[var(--secondary)] px-1 text-[10px] font-black text-[var(--text)]/65">{selectedCountry.code}</span><span>{selectedCountry.dialCode}</span><ChevronDown aria-hidden="true" className={cn('h-4 w-4 shrink-0 text-[var(--text)]/45 transition-transform', isOpen && 'rotate-180')} /></button>
                {isOpen && <div className="absolute left-0 top-full z-[150] mt-2 w-[min(280px,calc(100vw-48px))] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-xl"><div className="relative border-b border-[var(--border)] pb-2"><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[var(--text)]/40" /><input type="search" aria-label="Buscar país" autoFocus className="w-full rounded-xl bg-[var(--bg)] py-2.5 pl-9 pr-3 text-sm text-[var(--text)] outline-none focus:ring-2 focus:ring-[var(--primary)]/20" placeholder="Buscar país o código" value={searchTerm} onChange={event => setSearchTerm(event.target.value)} /></div><div id={listId} role="listbox" aria-label="Código de país" className="max-h-56 overflow-y-auto pt-1">{filteredCountries.map(country => <button key={country.code} type="button" role="option" aria-selected={selectedCountry.code === country.code} onClick={() => handleCountrySelect(country)} className={cn('flex min-h-11 w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-sm hover:bg-[var(--primary)]/10', selectedCountry.code === country.code ? 'font-bold text-[var(--primary)]' : 'text-[var(--text)]/75')}><span aria-hidden="true" className="flex h-7 min-w-8 items-center justify-center rounded-md bg-[var(--secondary)] text-[10px] font-black">{country.code}</span><span className="min-w-0 flex-1 break-words">{country.name}</span><span className="text-xs text-[var(--text)]/50">{country.dialCode}</span>{selectedCountry.code === country.code && <Check className="h-4 w-4 shrink-0" />}</button>)}{filteredCountries.length === 0 && <p className="p-4 text-center text-sm text-[var(--text)]/50">No se encontraron países.</p>}</div></div>}
            </div>
            <input id={inputId} type="tel" inputMode="tel" autoComplete="tel-national" value={localNumber} onChange={handleNumberChange} required={required} aria-invalid={!!error} className={cn('min-h-11 w-full min-w-0 flex-1 rounded-xl border bg-[var(--bg)] px-3 py-2.5 text-sm font-semibold text-[var(--text)] outline-none transition-colors placeholder:text-[var(--text)]/35 focus:ring-2', error ? 'border-red-400 focus:ring-red-500/10' : 'border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20')} placeholder={placeholder} />
        </div>
        {error && <p role="alert" className="text-xs font-medium text-red-500">{error}</p>}
    </div>;
}
