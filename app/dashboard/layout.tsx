export default async function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // UserProvider is now handled at the root level in app/layout.tsx
  // No need for redundant user fetching here
  return <>{children}</>;
} 