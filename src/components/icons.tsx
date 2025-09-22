import { Soup } from 'lucide-react';

export const LutongBahayLogo = ({ className }: { className?: string }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <Soup className="h-8 w-8 text-primary" />
    <span className="font-headline text-2xl font-bold text-foreground">
      Lutong Bahay Ni Mama
    </span>
  </div>
);
