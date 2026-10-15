import { forwardRef, useId } from 'react';
type Props = { label: string; error?: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>;
/** FormField: label + input + error/hint, accessible by default. */
const Input = forwardRef<HTMLInputElement, Props>(({ label, error, hint, className = '', ...rest }, ref) => {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-deep">{label}</label>
      <input id={id} ref={ref} aria-invalid={!!error} aria-describedby={error ? `${id}-e` : undefined} className={`field ${error ? 'border-coral' : ''} ${className}`} {...rest} />
      {error ? <p id={`${id}-e`} role="alert" className="mt-1 text-xs text-[#C2453A]">{error}</p> : hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
});
Input.displayName = 'Input';
export default Input;
