import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ArrowRightLeft, Calculator, Globe, Info, Mountain, Wheat } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Measurements',
        href: '/tools/measurements',
    },
];

// =============================================================================
// MEASUREMENT CONVERSION CONSTANTS
// =============================================================================

// Nepal Hill Region: Ropani System
const ROPANI_TO_SQM = 508.72;
const ANNA_TO_SQM = 31.795;
const PAISA_TO_SQM = 7.94875;
const DAM_TO_SQM = 1.9871875;

// Nepal Terai Region: Bigha System
const BIGHA_TO_SQM = 6772.63;
const KATTHA_TO_SQM = 338.63;
const DHUR_TO_SQM = 16.93;

// International
const SQM_TO_SQFT = 10.7639;
const SQM_TO_ACRES = 0.000247105;
const SQFT_TO_SQM = 0.092903;
const ACRES_TO_SQM = 4046.86;

type ConversionType = 'ropani' | 'bigha' | 'international';

interface ConversionResult {
    ropani: { ropani: number; anna: number; paisa: number; dam: number };
    bigha: { bigha: number; kattha: number; dhur: number };
    international: { sqm: number; sqft: number; acres: number };
}

function convertToAllUnits(sqm: number): ConversionResult {
    // Convert to Ropani system
    const totalRopani = sqm / ROPANI_TO_SQM;
    const ropani = Math.floor(totalRopani);
    const remainingAfterRopani = sqm - (ropani * ROPANI_TO_SQM);
    const anna = Math.floor(remainingAfterRopani / ANNA_TO_SQM);
    const remainingAfterAnna = remainingAfterRopani - (anna * ANNA_TO_SQM);
    const paisa = Math.floor(remainingAfterAnna / PAISA_TO_SQM);
    const remainingAfterPaisa = remainingAfterAnna - (paisa * PAISA_TO_SQM);
    const dam = Math.round(remainingAfterPaisa / DAM_TO_SQM * 100) / 100;

    // Convert to Bigha system
    const totalBigha = sqm / BIGHA_TO_SQM;
    const bigha = Math.floor(totalBigha);
    const remainingAfterBigha = sqm - (bigha * BIGHA_TO_SQM);
    const kattha = Math.floor(remainingAfterBigha / KATTHA_TO_SQM);
    const remainingAfterKattha = remainingAfterBigha - (kattha * KATTHA_TO_SQM);
    const dhur = Math.round(remainingAfterKattha / DHUR_TO_SQM * 100) / 100;

    // International
    const sqft = sqm * SQM_TO_SQFT;
    const acres = sqm * SQM_TO_ACRES;

    return {
        ropani: { ropani, anna, paisa, dam },
        bigha: { bigha, kattha, dhur },
        international: { sqm, sqft, acres },
    };
}

export default function Measurements() {
    const [inputValue, setInputValue] = useState<string>('');
    const [inputUnit, setInputUnit] = useState<string>('sqm');
    const [results, setResults] = useState<ConversionResult | null>(null);

    const unitOptions = [
        { value: 'sqm', label: 'Square Meters (m²)', group: 'International' },
        { value: 'sqft', label: 'Square Feet (sq ft)', group: 'International' },
        { value: 'acres', label: 'Acres', group: 'International' },
        { value: 'ropani', label: 'Ropani', group: 'Nepal (Hill)' },
        { value: 'anna', label: 'Anna', group: 'Nepal (Hill)' },
        { value: 'paisa', label: 'Paisa', group: 'Nepal (Hill)' },
        { value: 'dam', label: 'Dam', group: 'Nepal (Hill)' },
        { value: 'bigha', label: 'Bigha', group: 'Nepal (Terai)' },
        { value: 'kattha', label: 'Kattha', group: 'Nepal (Terai)' },
        { value: 'dhur', label: 'Dhur', group: 'Nepal (Terai)' },
    ];

    const handleConvert = () => {
        const value = parseFloat(inputValue);
        if (isNaN(value) || value <= 0) {
            setResults(null);
            return;
        }

        // Convert input to square meters first
        let sqm = 0;
        switch (inputUnit) {
            case 'sqm': sqm = value; break;
            case 'sqft': sqm = value * SQFT_TO_SQM; break;
            case 'acres': sqm = value * ACRES_TO_SQM; break;
            case 'ropani': sqm = value * ROPANI_TO_SQM; break;
            case 'anna': sqm = value * ANNA_TO_SQM; break;
            case 'paisa': sqm = value * PAISA_TO_SQM; break;
            case 'dam': sqm = value * DAM_TO_SQM; break;
            case 'bigha': sqm = value * BIGHA_TO_SQM; break;
            case 'kattha': sqm = value * KATTHA_TO_SQM; break;
            case 'dhur': sqm = value * DHUR_TO_SQM; break;
        }

        setResults(convertToAllUnits(sqm));
    };

    const formatRopani = (r: ConversionResult['ropani']) => {
        const parts = [];
        if (r.ropani > 0) parts.push(`${r.ropani} Ropani`);
        if (r.anna > 0) parts.push(`${r.anna} Anna`);
        if (r.paisa > 0) parts.push(`${r.paisa} Paisa`);
        if (r.dam > 0 || parts.length === 0) parts.push(`${r.dam} Dam`);
        return parts.join(' ');
    };

    const formatBigha = (b: ConversionResult['bigha']) => {
        const parts = [];
        if (b.bigha > 0) parts.push(`${b.bigha} Bigha`);
        if (b.kattha > 0) parts.push(`${b.kattha} Kattha`);
        if (b.dhur > 0 || parts.length === 0) parts.push(`${b.dhur} Dhur`);
        return parts.join(' ');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Measurements Converter" />
            
            <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-orange-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
                <div className="mx-auto max-w-5xl px-6 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="rounded-xl bg-orange-100 p-3 dark:bg-orange-950/50">
                                <Calculator className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                                Land Measurement Converter
                            </h1>
                        </div>
                        <p className="text-zinc-600 dark:text-zinc-400">
                            Convert between Nepal (Ropani/Bigha) and international measurement units
                        </p>
                    </div>

                    {/* Converter Card */}
                    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                    Enter Value
                                </label>
                                <input
                                    type="number"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Enter area value..."
                                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-lg text-zinc-900 placeholder:text-zinc-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                    Unit
                                </label>
                                <select
                                    value={inputUnit}
                                    onChange={(e) => setInputUnit(e.target.value)}
                                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-lg text-zinc-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                >
                                    <optgroup label="International">
                                        <option value="sqm">Square Meters (m²)</option>
                                        <option value="sqft">Square Feet (sq ft)</option>
                                        <option value="acres">Acres</option>
                                    </optgroup>
                                    <optgroup label="Nepal (Hill Region)">
                                        <option value="ropani">Ropani</option>
                                        <option value="anna">Anna</option>
                                        <option value="paisa">Paisa</option>
                                        <option value="dam">Dam</option>
                                    </optgroup>
                                    <optgroup label="Nepal (Terai Region)">
                                        <option value="bigha">Bigha</option>
                                        <option value="kattha">Kattha</option>
                                        <option value="dhur">Dhur</option>
                                    </optgroup>
                                </select>
                            </div>
                            <button
                                onClick={handleConvert}
                                className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-3 text-lg font-semibold text-white shadow-lg shadow-orange-500/30 transition-all hover:scale-105 hover:shadow-xl"
                            >
                                <ArrowRightLeft className="h-5 w-5" />
                                Convert
                            </button>
                        </div>

                        {/* Results */}
                        {results && (
                            <div className="mt-8 grid gap-4 md:grid-cols-3">
                                {/* Ropani System */}
                                <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-5 dark:border-blue-800 dark:bg-blue-950/30">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Mountain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        <h3 className="font-semibold text-blue-900 dark:text-blue-100">Nepal (Hill)</h3>
                                    </div>
                                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                        {formatRopani(results.ropani)}
                                    </p>
                                    <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                                        Ropani-Anna-Paisa-Dam System
                                    </p>
                                </div>

                                {/* Bigha System */}
                                <div className="rounded-xl border-2 border-green-200 bg-green-50 p-5 dark:border-green-800 dark:bg-green-950/30">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Wheat className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        <h3 className="font-semibold text-green-900 dark:text-green-100">Nepal (Terai)</h3>
                                    </div>
                                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                                        {formatBigha(results.bigha)}
                                    </p>
                                    <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                                        Bigha-Kattha-Dhur System
                                    </p>
                                </div>

                                {/* International */}
                                <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-5 dark:border-purple-800 dark:bg-purple-950/30">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Globe className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                        <h3 className="font-semibold text-purple-900 dark:text-purple-100">International</h3>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xl font-bold text-purple-700 dark:text-purple-300">
                                            {results.international.sqm.toLocaleString(undefined, { maximumFractionDigits: 2 })} m²
                                        </p>
                                        <p className="text-lg text-purple-600 dark:text-purple-400">
                                            {results.international.sqft.toLocaleString(undefined, { maximumFractionDigits: 0 })} sq ft
                                        </p>
                                        {results.international.acres >= 0.01 && (
                                            <p className="text-lg text-purple-600 dark:text-purple-400">
                                                {results.international.acres.toLocaleString(undefined, { maximumFractionDigits: 4 })} acres
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Reference Tables */}
                    <div className="mt-8 grid gap-6 lg:grid-cols-2">
                        {/* Ropani Reference */}
                        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                            <div className="flex items-center gap-2 mb-4">
                                <Mountain className="h-5 w-5 text-blue-600" />
                                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                    Ropani System (Hill Region)
                                </h3>
                            </div>
                            <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
                                <table className="w-full text-sm">
                                    <thead className="bg-zinc-50 dark:bg-zinc-800">
                                        <tr>
                                            <th className="px-4 py-2 text-left font-medium text-zinc-700 dark:text-zinc-300">Unit</th>
                                            <th className="px-4 py-2 text-left font-medium text-zinc-700 dark:text-zinc-300">Square Meters</th>
                                            <th className="px-4 py-2 text-left font-medium text-zinc-700 dark:text-zinc-300">Square Feet</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                        <tr>
                                            <td className="px-4 py-2 font-medium text-zinc-900 dark:text-white">1 Ropani</td>
                                            <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">508.72 m²</td>
                                            <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">5,476 sq ft</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-2 font-medium text-zinc-900 dark:text-white">1 Anna</td>
                                            <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">31.80 m²</td>
                                            <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">342 sq ft</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-2 font-medium text-zinc-900 dark:text-white">1 Paisa</td>
                                            <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">7.95 m²</td>
                                            <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">85.6 sq ft</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-2 font-medium text-zinc-900 dark:text-white">1 Dam</td>
                                            <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">1.99 m²</td>
                                            <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">21.4 sq ft</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4 flex items-start gap-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-950/30">
                                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                    <strong>Conversion:</strong> 1 Ropani = 16 Anna = 64 Paisa = 256 Dam
                                </p>
                            </div>
                        </div>

                        {/* Bigha Reference */}
                        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                            <div className="flex items-center gap-2 mb-4">
                                <Wheat className="h-5 w-5 text-green-600" />
                                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                    Bigha System (Terai Region)
                                </h3>
                            </div>
                            <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
                                <table className="w-full text-sm">
                                    <thead className="bg-zinc-50 dark:bg-zinc-800">
                                        <tr>
                                            <th className="px-4 py-2 text-left font-medium text-zinc-700 dark:text-zinc-300">Unit</th>
                                            <th className="px-4 py-2 text-left font-medium text-zinc-700 dark:text-zinc-300">Square Meters</th>
                                            <th className="px-4 py-2 text-left font-medium text-zinc-700 dark:text-zinc-300">Square Feet</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                        <tr>
                                            <td className="px-4 py-2 font-medium text-zinc-900 dark:text-white">1 Bigha</td>
                                            <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">6,772.63 m²</td>
                                            <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">72,900 sq ft</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-2 font-medium text-zinc-900 dark:text-white">1 Kattha</td>
                                            <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">338.63 m²</td>
                                            <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">3,645 sq ft</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-2 font-medium text-zinc-900 dark:text-white">1 Dhur</td>
                                            <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">16.93 m²</td>
                                            <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">182 sq ft</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4 flex items-start gap-2 rounded-lg bg-green-50 p-3 dark:bg-green-950/30">
                                <Info className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-green-700 dark:text-green-300">
                                    <strong>Conversion:</strong> 1 Bigha = 20 Kattha = 400 Dhur ≈ 1.67 acres
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Reference */}
                    <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                            Quick Reference - Common Conversions
                        </h3>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800">
                                <p className="text-sm text-zinc-600 dark:text-zinc-400">1 Ropani</p>
                                <p className="font-semibold text-zinc-900 dark:text-white">≈ 0.13 Bigha</p>
                            </div>
                            <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800">
                                <p className="text-sm text-zinc-600 dark:text-zinc-400">1 Bigha</p>
                                <p className="font-semibold text-zinc-900 dark:text-white">≈ 13.31 Ropani</p>
                            </div>
                            <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800">
                                <p className="text-sm text-zinc-600 dark:text-zinc-400">1 Acre</p>
                                <p className="font-semibold text-zinc-900 dark:text-white">≈ 7.95 Ropani</p>
                            </div>
                            <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800">
                                <p className="text-sm text-zinc-600 dark:text-zinc-400">1 Acre</p>
                                <p className="font-semibold text-zinc-900 dark:text-white">≈ 0.60 Bigha</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
