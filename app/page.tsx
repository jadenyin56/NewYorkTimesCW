import { AppHeader } from "@/components/layout/AppHeader";
import { HomeContent } from "@/components/home/HomeContent";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <AppHeader />
      <HomeContent />
    </main>
  );
}
