import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { settingsAPI } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export function Settings() {
  const { t } = useTranslation()
  const [settings, setSettings] = useState({
    minimum_fare_to_book: "",
    profit_type: "percentage",
    profit_value: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await settingsAPI.getSettings()
      if (response.data) {
        setSettings({
          minimum_fare_to_book: response.data[2].setting_value || "",
          profit_type: response.data[0].setting_value || "percentage",
          profit_value: response.data[1].setting_value || "",
        })
      }
      console.log(response.data[2].setting_value)
    } catch (error) {
      console.error("Error fetching settings:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      setSaving(true)
      await settingsAPI.updateSettings(settings)
      alert(t("settings.saveSuccess"))
    } catch (error) {
      console.error("Error saving settings:", error)
      alert(t("settings.saveError"))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center">{t("settings.loadingSettings")}</div>
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">{t("settings.title")}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.generalSettings")}</CardTitle>
          <CardDescription>{t("settings.manageSettings")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="minimum_fare_to_book">{t("settings.minimumFareToBook")}</Label>
              <Input
                id="minimum_fare_to_book"
                type="number"
                value={settings.minimum_fare_to_book}
                onChange={(e) =>
                  setSettings({ ...settings, minimum_fare_to_book: e.target.value })
                }
                placeholder="100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profit_type">{t("settings.profitType")}</Label>
              <select
                id="profit_type"
                value={settings.profit_type}
                onChange={(e) =>
                  setSettings({ ...settings, profit_type: e.target.value })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="percentage">{t("settings.percentage")}</option>
                <option value="fixed">{t("settings.fixed")}</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profit_value">
                {t("settings.profitValue")} {settings.profit_type === "percentage" && t("settings.lessThan100")}
              </Label>
              <Input
                id="profit_value"
                type="number"
                value={settings.profit_value}
                onChange={(e) =>
                  setSettings({ ...settings, profit_value: e.target.value })
                }
                placeholder={settings.profit_type === "percentage" ? "20" : "100"}
                max={settings.profit_type === "percentage" ? 99 : undefined}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? t("settings.saving") : t("settings.saveSettings")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}





