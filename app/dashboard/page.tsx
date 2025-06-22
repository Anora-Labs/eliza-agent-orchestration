import { LayoutClient } from "./layout-client";
import HomePage from "./home";

export default function DashboardPage() {

  return (
    <>
      {/* CSRF token protection */}
      <LayoutClient />
      
      {/* Dashboard */}
      <HomePage />
    </>
  );
}