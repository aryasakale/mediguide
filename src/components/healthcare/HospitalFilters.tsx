import FilterDropdown from '../ui/FilterDropdown';
import SearchBar from '../ui/SearchBar';
import type { Filters, Hospital } from '@/types/healthcare';

const any = (l: string) => [{ value: '', label: l }];
const uniq = (l: Hospital[], k: 'specialties' | 'languages') => Array.from(new Set(l.flatMap((h) => h[k]))).sort();
export default function HospitalFilters({ filters, onChange, onSearch, hospitals = [] }: { filters: Filters; onChange: (f: Filters) => void; onSearch?: () => void; hospitals?: Hospital[] }) {
  const allSpecialties = uniq(hospitals, 'specialties'), allLanguages = uniq(hospitals, 'languages');
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => onChange({ ...filters, [k]: v });
  return (
    <div className="card space-y-4 p-5">
      <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
        <SearchBar value={filters.q} onChange={(v) => set('q', v)} onSubmit={onSearch} />
        <input aria-label="Location" placeholder="Location (e.g. area or city)" value={filters.location} onChange={(e) => set('location', e.target.value)} className="field rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <FilterDropdown label="Distance" value={String(filters.distance)} onChange={(v) => set('distance', Number(v))} options={[{ value: '2', label: 'Within 2 km' }, { value: '5', label: 'Within 5 km' }, { value: '10', label: 'Within 10 km' }, { value: '50', label: 'Any distance' }]} />
        <FilterDropdown label="Specialty" value={filters.specialty} onChange={(v) => set('specialty', v)} options={[...any('All specialties'), ...allSpecialties.map((s) => ({ value: s, label: s }))]} />
        <FilterDropdown label="Category" value={filters.category} onChange={(v) => set('category', v)} options={[...any('All categories'), ...['Hospital', 'Clinic', 'Doctor', 'Pharmacy'].map((s) => ({ value: s, label: s }))]} />
        <FilterDropdown label="Language" value={filters.language} onChange={(v) => set('language', v)} options={[...any('Any language'), ...allLanguages.map((s) => ({ value: s, label: s }))]} />
        <FilterDropdown label="Availability" value={filters.availability} onChange={(v) => set('availability', v)} options={[...any('Any'), { value: 'open24h', label: 'Open 24 hours' }, { value: 'emergency', label: 'Emergency care' }]} />
      </div>
    </div>
  );
}
