import AuthLayout from "@/components/common/AuthLayout";

export default function AuthenticatedPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayout>{children}</AuthLayout>;
}
