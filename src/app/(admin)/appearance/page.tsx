import { requireRole } from "@/lib/auth";
import { getDict, translate } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { ThemePicker } from "@/components/citizen/theme-gallery";

// Admin appearance page. Lives at /appearance (not /settings) because the
// officer group already owns /settings and route groups share the URL namespace.
export default async function AdminAppearance() {
  const user = await requireRole(["ADMIN"]);
  const dict = getDict(user.language);
  const t = (k: string) => translate(dict, k);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">
          {t("profile.appearance")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t("profile.appearanceSub")}
        </p>
      </div>

      <Card>
        <CardContent className="p-5">
          <ThemePicker />
        </CardContent>
      </Card>
    </div>
  );
}
