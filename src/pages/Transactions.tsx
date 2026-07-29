import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useLanguage } from "@/contexts/LanguageContext"
import { transactionsAPI } from "@/lib/api"
import { DataTable } from "@/components/DataTable"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface Transaction {
  id: number
  amount?: number
  status?: string
  created_at?: string
  user?: {
    name?: string
    email?: string
  }
  payment_image?: string
}

export function Transactions() {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [paymentImage, setPaymentImage] = useState<File | null>(null)

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response = await transactionsAPI.getAll()
      setTransactions(response.data?.data || [])
    } catch (error) {
      console.error("Error fetching transactions:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [language])

  const handleMarkAsPaid = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedTransaction) return

    try {
      await transactionsAPI.markAsPaid(selectedTransaction.id, paymentImage || undefined)
      setIsModalOpen(false)
      setSelectedTransaction(null)
      setPaymentImage(null)
      fetchTransactions()
      alert(t("transactions.markAsPaidSuccess"))
    } catch (error) {
      console.error("Error marking as paid:", error)
      alert(t("transactions.markAsPaidError"))
    }
  }

  const handleDelete = async (transaction: Transaction) => {
    if (window.confirm(t("transactions.deleteConfirm"))) {
      try {
        await transactionsAPI.delete(transaction.id)
        fetchTransactions()
      } catch (error) {
        console.error("Error deleting transaction:", error)
        alert(t("transactions.deleteError"))
      }
    }
  }

  const handleView = (transaction: Transaction) => {
    navigate(`/dashboard/transactions/${transaction.id}`)
  }

  const columns = [
    { key: "id", label: t("common.id") },
    { key: "amount", label: t("transactions.amount"), render: (transaction: Transaction) => `$${transaction.amount || 0}` },
    {
      key: "status",
      label: t("transactions.status"),
      render: (transaction: Transaction) => (
        <span
          className={`rounded px-2 py-1 text-xs ${
            transaction.status === "completed"
              ? "bg-green-100 text-green-800"
              : transaction.status === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {transaction.status === "completed" ? t("transactions.completed") : transaction.status === "pending" ? t("transactions.pending") : transaction.status || t("transactions.pending")}
        </span>
      ),
    },
    {
      key: "user",
      label: t("transactions.user"),
      render: (transaction: Transaction) => transaction.user?.name || transaction.user?.email || t("common.notAvailable"),
    },
    { key: "created_at", label: t("transactions.createdAt") },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("transactions.withdrawRequests")}</h1>
      </div>

      <DataTable
        data={transactions}
        columns={columns}
        onEdit={handleMarkAsPaid}
        onDelete={handleDelete}
        onView={handleView}
        isLoading={loading}
        getItemId={(item) => item.id}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedTransaction(null)
          setPaymentImage(null)
        }}
        title={t("transactions.markAsPaidTitle")}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("transactions.transactionId")}: {selectedTransaction?.id}</Label>
          </div>
          <div className="space-y-2">
            <Label>{t("transactions.amount")}: ${selectedTransaction?.amount || 0}</Label>
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
                setIsModalOpen(false)
                setSelectedTransaction(null)
                setPaymentImage(null)
              }}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit">{t("transactions.markAsPaid")}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

