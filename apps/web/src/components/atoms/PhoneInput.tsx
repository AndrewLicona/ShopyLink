'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Phone } from 'lucide-react';
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
}

export function PhoneInput({
    value,
    onChange,
    label,
    placeholder = '300 123 4567',
    required = false,
    error,
    className,
}: PhoneInputProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0] as Country);
    const [localNumber, setLocalNumber] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const isInitialMount = useRef(true);

    // Initial parse of value
    useEffect(() => {
        if (!isInitialMount.current) return;

        if (value && value.startsWith('+')) {
            // Find matched dial code (longest first to avoid +1 match for +1 809)
            const sortedCountries = [...countries].sort((a, b) => b.dialCode.length - a.dialCode.length);
            const country = sortedCountries.find(c => value.startsWith(c.dialCode));
            if (country) {
                setSelectedCountry(country as Country);
                setLocalNumber(value.slice(country.dialCode.length).trim());
            } else {
                setLocalNumber(value.replace(/^\+/, ''));
            }
        } else if (value) {
            setLocalNumber(value);
        }

        isInitialMount.current = false;
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredCountries = countries.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.dialCode.includes(searchTerm)
    );

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/[^0-9]/g, '');
        setLocalNumber(val);
        onChange(`${selectedCountry.dialCode}${val}`);
    };

    const handleCountrySelect = (country: Country) => {
        setSelectedCountry(country);
        onChange(`${country.dialCode}${localNumber}`);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className={cn("space-y-1.5", className)}>
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div className="flex gap-2">
                {/* Country Selector */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-2 px-3 h-[46px] rounded-xl border border-gray-200 bg-gray-50/30 hover:bg-gray-100/50 transition-all outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 min-w-[100px]"
                    >
                        <span className="text-xl">{selectedCountry.flag}</span>
                        <span className="text-sm font-medium text-gray-700">{selectedCountry.dialCode}</span>
                        <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", isOpen && "rotate-180")} />
                    </button>

                    {isOpen && (
                        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="p-2 border-b border-gray-50">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border-none rounded-lg focus:ring-0 outline-none"
                                        placeholder="Buscar país..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div className="max-h-60 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                                {filteredCountries.map((country) => (
                                    <button
                                        key={`${country.code}-${country.dialCode}`}
                                        type="button"
                                        onClick={() => handleCountrySelect(country)}
                                        className={cn(
                                            "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors",
                                            selectedCountry.code === country.code && selectedCountry.dialCode === country.dialCode
                                                ? "bg-blue-50 text-blue-700"
                                                : "hover:bg-gray-50 text-gray-700"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{country.flag}</span>
                                            <span className="font-medium text-left">{country.name}</span>
                                        </div>
                                        <span className="text-gray-400 font-mono">{country.dialCode}</span>
                                    </button>
                                ))}
                                {filteredCountries.length === 0 && (
                                    <div className="py-8 text-center text-gray-400 text-sm italic">
                                        No se encontraron resultados
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Number Input */}
                <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                    <input
                        type="tel"
                        value={localNumber}
                        onChange={handleNumberChange}
                        required={required}
                        className={cn(
                            "w-full pl-10 pr-4 py-3 rounded-xl border transition-all outline-none placeholder:text-gray-400 text-gray-900 h-[46px]",
                            error
                                ? "border-red-300 bg-red-50/30 focus:ring-red-500/10 focus:border-red-500"
                                : "border-gray-200 bg-gray-50/30 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                        )}
                        placeholder={placeholder}
                    />
                </div>
            </div>

            {error && <p className="text-xs text-red-500 mt-1 ml-1 font-medium">{error}</p>}
        </div>
    );
}




