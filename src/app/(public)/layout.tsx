
import { AppLogo } from "@/components/common/AppLogo";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-background to-secondary/20 p-4 pt-24 md:pt-28">
       <div className="absolute top-8 left-8 z-50"> {/* Engadido z-50 para asegurar que estea por riba */}
        <AppLogo />
      </div>
      {children}
    </div>
  );
}
