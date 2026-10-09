import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';

export function BrandMark({ domain }: { domain: 'org' | 'net' }) {
  return <a href="/" aria-label={`Warisan.${domain} home`} className="brand-mark"><span aria-hidden="true">◇</span><span>WARISAN</span><small>.{domain}</small></a>;
}

export function Button({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return <button {...props} className={`button ${props.className ?? ''}`}>{children}</button>;
}

export function Surface({ children, ...props }: HTMLAttributes<HTMLElement> & { children: ReactNode }) {
  return <section {...props} className={`surface ${props.className ?? ''}`}>{children}</section>;
}

export function ConsentCheckbox({ id = 'pdpa-consent' }: { id?: string }) {
  return <label className="consent"><input id={id} name={id} type="checkbox" required /> <span>I agree to the Warisan privacy notice and PDPA processing terms.</span></label>;
}
