import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { Countdown } from "@/components/ui/Countdown";
import { PredictionsProvider } from "@/lib/predictions/store";
import { activeTournament } from "@/lib/mock/data";
import { getCurrentUser } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <PredictionsProvider>
      <div className="flex min-h-full flex-col">
        <Header userEmail={user?.email ?? null} />
        {/* Countdown till turneringsstart + ev. gäst-markering */}
        <div className="border-b border-border/60 bg-surface/40 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 py-2 sm:justify-between sm:px-6">
            <Countdown
              target={activeTournament.startsAt}
              label={`${activeTournament.short} · avspark om`}
            />
            {!user && (
              <p className="text-xs text-faint">
                👀 Du tittar som gäst — tipsen sparas bara i den här webbläsaren.{" "}
                <Link href="/#logga-in" className="font-medium text-brand hover:underline">
                  Logga in
                </Link>
              </p>
            )}
          </div>
        </div>
        {/* pb ger plats åt mobilens bottom-tab-bar */}
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 sm:px-6 lg:pb-12">
          {children}
        </main>
        <MobileTabBar />
      </div>
    </PredictionsProvider>
  );
}
