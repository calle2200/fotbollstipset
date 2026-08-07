import { PageHeader } from "@/components/ui/PageHeader";
import { StubNotice } from "@/components/ui/StubNotice";
import { SaveStatus } from "@/components/tips/SaveStatus";
import { TipsTabs } from "@/components/tips/TipsTabs";

type TabId = "gruppmatcher" | "placeringar" | "specialval" | "slutspel";
const validTabs: TabId[] = ["gruppmatcher", "placeringar", "specialval", "slutspel"];

export default async function MittTipsPage({
  searchParams,
}: {
  searchParams: Promise<{ del?: string }>;
}) {
  const { del } = await searchParams;
  const initialTab: TabId = validTabs.includes(del as TabId) ? (del as TabId) : "gruppmatcher";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mitt tips"
        subtitle="Alla dina tips för turneringen — en del i taget. Låses vid respektive deadline."
        action={<SaveStatus />}
      />

      <StubNotice>
        Alla dina tips — matcher, gruppplaceringar och specialval — sparas på
        ditt konto när du är inloggad, och följer med mellan enheter. Som gäst
        sparas de bara i den här webbläsaren. Låsning vid deadline och
        poängberäkning byggs i ett senare steg.
      </StubNotice>

      <TipsTabs initialTab={initialTab} />
    </div>
  );
}
