import { useId } from 'react';
export default function FilterDropdown({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] | string[] }) {
  const id = useId();
  const opts = (options as (string | { value: string; label: string })[]).map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-semibold text-muted">{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="field">
        {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
