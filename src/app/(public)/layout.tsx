
// AppLogo is removed from here as it's now in GlobalHeader
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // w-full and flex-grow ensure this layout takes available space from <main>
    // items-center will center children like KioskPage's section (which has max-width)
    // p-4 provides padding around the content area
    // min-h-full ensures it tries to take at least the full height of its container
    <div className="w-full flex-grow flex flex-col items-center bg-gradient-to-br from-background to-secondary/20 p-4">
      {children}
    </div>
  );
}
