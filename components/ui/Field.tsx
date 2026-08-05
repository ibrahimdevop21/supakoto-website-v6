import { cn } from "@/lib/cn";

const control =
  "w-full rounded-card border border-ink-700 bg-ink-900 px-4 py-3 text-body text-fg placeholder:text-fg-subtle transition-colors focus:border-sk-red focus:outline-none aria-[invalid=true]:border-sk-red";

export function Label({
  className,
  children,
  ...rest
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-2 block text-small font-medium text-fg", className)}
      {...rest}
    >
      {children}
    </label>
  );
}

export function Input({
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(control, className)} {...rest} />;
}

export function Textarea({
  className,
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea rows={5} className={cn(control, "resize-y", className)} {...rest} />
  );
}

export function Select({
  className,
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(control, "appearance-none", className)} {...rest}>
      {children}
    </select>
  );
}

export function FieldError({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p role="alert" className={cn("mt-2 text-small text-sk-red", className)}>
      {children}
    </p>
  );
}

/** Phone numbers are always LTR, both locales. */
export function PhoneInput({
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="tel"
      dir="ltr"
      className={cn(control, "text-start", className)}
      {...rest}
    />
  );
}
