import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { transactionsAPI } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trash2, CheckCircle } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Transaction {
  id: number
  amount?: number
  status?: string
  created_at?: string
  updated_at?: string
  user?: {
    id?: number
    name?: string
    email?: string
    phone?: string
  }
  payment_image?: string
}

export function SingleTransaction() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMarkPaidModalOpen, setIsMarkPaidModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [paymentImage, setPaymentImage] = useState<File | null>(null)

  const fetchTransaction = async () => {
    if (!id) return
    try {
      setLoading(true)
      const response = await transactionsAPI.getOne(Number(id))
      setTransaction(response.data?.data || response.data)
    } catch (error) {
      console.error("Error fetching transaction:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransaction()
  }, [id])

  const handleDelete = async () => {
    if (!transaction) return
    try {
      await transactionsAPI.delete(transaction.id)
      navigate("/dashboard/transactions")
    } catch (error) {
      console.error("Error deleting transaction:", error)
      alert(t("transactions.deleteError") || t("common.failed"))
    }
  }

  const handleMarkAsPaid = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!transaction) return
    try {
      await transactionsAPI.markAsPaid(transaction.id, paymentImage || undefined)
      setIsMarkPaidModalOpen(false)
      setPaymentImage(null)
      fetchTransaction()
      alert(t("transactions.markAsPaidSuccess"))
    } catch (error) {
      console.error("Error marking as paid:", error)
      alert(t("transactions.markAsPaidError"))
    }
  }

  if (loading) {
    return <div className="text-center py-8">{t("common.loading")}</div>
  }

  if (!transaction) {
    return (
      <div className="text-center py-8">
        <p>{t("transactions.notFound")}</p>
        <Link to="/dashboard/transactions">
          <Button variant="outline" className="mt-4">
            {t("transactions.backToTransactions")}
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/transactions">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{t("transactions.details")}</h1>
        </div>
        <div className="flex gap-2">
          {transaction.status !== "completed" && (
            <Button variant="outline" onClick={() => setIsMarkPaidModalOpen(true)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              {t("transactions.markAsPaid")}
            </Button>
          )}
          <Button variant="destructive" onClick={() => setIsDeleteModalOpen(true)} className="bg-red-600 hover:bg-red-700 text-white">
            <Trash2 className="mr-2 h-4 w-4" />
            {t("common.delete")}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("transactions.transactionInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">{t("common.id")}</Label>
              <p className="text-lg font-semibold">{transaction.id}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t("transactions.amount")}</Label>
              <p className="text-lg font-semibold">${transaction.amount || 0}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t("transactions.status")}</Label>
              <p>
                <span
                  className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${
                    transaction.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : transaction.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {transaction.status === "completed" ? t("transactions.completed") : transaction.status === "pending" ? t("transactions.pending") : transaction.status || t("transactions.pending")}
                </span>
              </p>
            </div>
            {transaction.created_at && (
              <div>
                <Label className="text-muted-foreground">{t("transactions.createdAt")}</Label>
                <p className="text-muted-foreground">{new Date(transaction.created_at).toLocaleString()}</p>
              </div>
            )}
            {transaction.updated_at && (
              <div>
                <Label className="text-muted-foreground">{t("transactions.updatedAt")}</Label>
                <p className="text-muted-foreground">{new Date(transaction.updated_at).toLocaleString()}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("transactions.userInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {transaction.user ? (
              <>
                {transaction.user.id && (
                  <div>
                    <Label className="text-muted-foreground">{t("transactions.userId")}</Label>
                    <p className="text-lg">{transaction.user.id}</p>
                  </div>
                )}
                {transaction.user.name && (
                  <div>
                    <Label className="text-muted-foreground">{t("patients.name")}</Label>
                    <p className="text-lg">{transaction.user.name}</p>
                  </div>
                )}
                {transaction.user.email && (
                  <div>
                    <Label className="text-muted-foreground">{t("patients.email")}</Label>
                    <p className="text-muted-foreground">{transaction.user.email}</p>
                  </div>
                )}
                {transaction.user.phone && (
                  <div>
                    <Label className="text-muted-foreground">{t("patients.phone")}</Label>
                    <p className="text-muted-foreground">{transaction.user.phone}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">{t("transactions.noUserInfo")}</p>
            )}
          </CardContent>
        </Card>

        {transaction.payment_image && (
          <Card>
            <CardHeader>
              <CardTitle>{t("transactions.paymentReceipt")}</CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={transaction.payment_image.startsWith('http') ? transaction.payment_image : `https://galasaty.teamqeematech.site/storage/${transaction.payment_image}`}
                alt={t("transactions.paymentReceipt")}
                className="h-48 w-full rounded-lg object-cover"
              />
            </CardContent>
          </Card>
        )}
      </div>

      <Modal
        isOpen={isMarkPaidModalOpen}
        onClose={() => {
          setIsMarkPaidModalOpen(false)
          setPaymentImage(null)
        }}
        title={t("transactions.markAsPaidTitle")}
      >
        <form onSubmit={handleMarkAsPaid} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("transactions.transactionInfo")} {t("common.id")}: {transaction.id}</Label>
          </div>
          <div className="space-y-2">
            <Label>{t("transactions.amount")}: ${transaction.amount || 0}</Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="payment_image">{t("transactions.paymentReceiptImage")}</Label>
            <Input
              id="payment_image"
              type="file"
              accept="image/*"
              onChange={(e) => setPaymentImage(e.target.files?.[0] || null)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsMarkPaidModalOpen(false)
                setPaymentImage(null)
              }}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit">{t("transactions.markAsPaid")}</Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={t("common.delete")}
      >
        <div className="space-y-4">
          <p>{t("transactions.deleteConfirm")}</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              {t("common.delete")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

