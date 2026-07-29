import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { patientsAPI, adminsAPI, categoriesAPI, servicesAPI, specialsAPI, citiesAPI, bannersAPI, transactionsAPI } from "@/lib/api"
import { Users, UserCog, FolderTree, Briefcase, Star, MapPin, Megaphone, ArrowLeftRight } from "lucide-react"

export function Dashboard() {
  const { t } = useTranslation()
  const [stats, setStats] = useState({
    patients: 0,
    admins: 0,
    categories: 0,
    services: 0,
    specials: 0,
    cities: 0,
    banners: 0,
    transactions: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [patients, admins, categories, services, specials, cities, banners, transactions] = await Promise.all([
          patientsAPI.getAll().catch(() => ({ data: { data: [] } })),
          adminsAPI.getAll().catch(() => ({ data: { data: [] } })),
          categoriesAPI.getAll().catch(() => ({ data: { data: [] } })),
          servicesAPI.getAll().catch(() => ({ data: { data: [] } })),
          specialsAPI.getAll().catch(() => ({ data: { data: [] } })),
          citiesAPI.getAll().catch(() => ({ data: { data: [] } })),
          bannersAPI.getAll().catch(() => ({ data: { data: [] } })),
          transactionsAPI.getAll().catch(() => ({ data: { data: [] } })),
        ])

        setStats({
          patients: patients.data?.data?.length || 0,
          admins: admins.data?.data?.length || 0,
          categories: categories.data?.data?.length || 0,
          services: services.data?.data?.length || 0,
          specials: specials.data?.data?.length || 0,
          cities: cities.data?.data?.length || 0,
          banners: banners.data?.data?.length || 0,
          transactions: transactions.data?.data?.length || 0,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    { key: "patients", value: stats.patients, icon: Users, color: "text-blue-500" },
    { key: "admins", value: stats.admins, icon: UserCog, color: "text-purple-500" },
    { key: "categories", value: stats.categories, icon: FolderTree, color: "text-green-500" },
    { key: "services", value: stats.services, icon: Briefcase, color: "text-orange-500" },
    { key: "specials", value: stats.specials, icon: Star, color: "text-yellow-500" },
    { key: "cities", value: stats.cities, icon: MapPin, color: "text-red-500" },
    { key: "banners", value: stats.banners, icon: Megaphone, color: "text-gray-500" },
    { key: "transactions", value: stats.transactions, icon: ArrowLeftRight, color: "text-gray-500" },
  ]

  if (loading) {
    return <div className="text-center">{t("common.loading")}</div>
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">{t("dashboard.title")}</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.key}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t(`dashboard.${stat.key}`)}</CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}





