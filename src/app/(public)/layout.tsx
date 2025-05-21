
// AppLogo is removed from here as it's now in GlobalHeader
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Adjust top padding to account for the new GlobalHeader (approx h-16)
    // The main content area will be wrapped by <main className="flex-grow"> in RootLayout
    <div className="flex flex-col items-center justify-start bg-gradient-to-br from-background to-secondary/20 p-4 pt-8 md:pt-10">
      {children}
    </div>
  );
}
