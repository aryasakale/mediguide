'use client';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Input from './Input';
export default function PasswordInput(props: Omit<React.ComponentProps<typeof Input>, 'type'>) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={show ? 'text' : 'password'} className="pr-12" />
      <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}
        className="absolute right-1 top-[30px] flex h-10 w-10 items-center justify-center rounded-full text-muted hover:text-primary">
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
