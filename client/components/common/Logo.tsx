import { cn } from "@/lib/utils";

export default function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img
        src="/darul-umah-logo.svg"
        alt="Darul Ummah School"
        className="h-8 w-8"
      />
      <span className="text-lg font-extrabold tracking-tight">Darul Ummah School</span>
    </div>
  );
}
