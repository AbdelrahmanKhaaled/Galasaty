import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Button } from "./ui/button"
import { Edit, Trash2, Plus, Eye, Power } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useLanguage } from "@/contexts/LanguageContext"

interface Column<T> {
  key: string
  label: string
  render?: (item: T) => React.ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  onToggle?: (item: T) => void
  onView?: (item: T) => void
  onAdd?: () => void
  addLabel?: string
  isLoading?: boolean
  getItemId: (item: T) => string | number
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  onEdit,
  onDelete,
  onToggle,
  onView,
  onAdd,
  addLabel = "Add New",
  isLoading = false,
  getItemId,
}: DataTableProps<T>) {
  const { t } = useTranslation()
  const { isRTL } = useLanguage()
  if (isLoading) {
    return <div className="text-center py-8">{t("common.loading")}</div>
  }

  return (
    <div className="space-y-4">
      {onAdd && (
        <div className="flex justify-end">
          <Button onClick={onAdd}>
            <Plus className="mr-2 h-4 w-4" />
            {addLabel}
          </Button>
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key}>{column.label}</TableHead>
              ))}
              {(onEdit || onDelete || onToggle || onView) && (
                <TableHead className={isRTL ? "text-left" : "text-right"}>
                  {t("common.actions")}
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (onEdit || onDelete || onToggle || onView ? 1 : 0)} className="text-center py-8">
                  {t("common.noDataAvailable")}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={getItemId(item)}>
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {column.render ? column.render(item) : item[column.key]}
                    </TableCell>
                  ))}
                  {(onEdit || onDelete || onToggle || onView) && (
                    <TableCell className={isRTL ? "text-left" : "text-right"}>
                      <div className={`flex gap-2 ${isRTL ? "justify-start" : "justify-end"}`}>
                        {onView && (
                          <Button variant="ghost" size="icon" onClick={() => onView(item)} title="View">
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {onToggle && (
                          <Button variant="ghost" size="icon" onClick={() => onToggle(item)} title="Toggle Status">
                            <Power className="h-4 w-4" />
                          </Button>
                        )}
                        {onEdit && (
                          <Button variant="ghost" size="icon" onClick={() => onEdit(item)} title="Edit">
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(item)}
                            className="text-destructive hover:text-destructive"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}





