import { requireRole } from "@/lib/auth";
import { getDict, translate } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { OfficerSettingsForm } from "@/components/officer/settings-form";
import { ThemePicker } from "@/components/citizen/theme-gallery";

export default async function OfficerSettings() {
  const user = await requireRole(["OFFICER"]);
  const dict = getDict(user.language);
  const t = (k: string) => translate(dict, k);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">
          {t("settings.title")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t("settings.languageSub")}
        </p>
      </div>

      <Card>
        <CardContent className="p-5">
          <OfficerSettingsForm initialLanguage={user.language} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-5">
          <div>
            <h2 className="font-display text-lg font-semibold">
              {t("profile.appearance")}
            </h2>
            <p className="text-muted-foreground text-sm">
              {t("profile.appearanceSub")}
            </p>
          </div>
          <ThemePicker />
        </CardContent>
      </Card>
    </div>
  );
}
