import { AppLogo } from "@/components/common/AppLogo";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-background to-secondary/20 p-4 pt-24 md:pt-28">
       <div className="absolute top-8 left-8">
        <AppLogo />
      </div>
      {children}
    </div>
  );
}
