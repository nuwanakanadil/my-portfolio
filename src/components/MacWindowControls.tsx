type MacWindowControlsProps = {
  readonly className?: string;
};

export function MacWindowControls({ className = '' }: MacWindowControlsProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`} aria-hidden="true">
      <span className="h-3 w-3 rounded-full bg-red-500 shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset]" />
      <span className="h-3 w-3 rounded-full bg-yellow-500 shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset]" />
      <span className="h-3 w-3 rounded-full bg-green-500 shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset]" />
    </div>
  );
}