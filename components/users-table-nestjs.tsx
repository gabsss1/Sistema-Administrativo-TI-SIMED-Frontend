"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MoreHorizontal, Search, Plus, Edit, Trash2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Importar desde el servicio de NestJS cuando esté listo
// import { type User, getUsers, deleteUser } from "@/lib/api-users"

// Por ahora usar el mock, cambiar cuando tengas NestJS listo
import { type User, getUsers, deleteUser } from "@/lib/users"
import { UserDialog } from "./user-dialog"

export function UsersTableNestJS() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getUsers(searchTerm)
      setUsers(data)
    } catch (error) {
      console.error("Error loading users:", error)
      setError("Error al cargar los usuarios. Verifica que el backend esté ejecutándose.")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    await loadUsers()
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      try {
        await deleteUser(id)
        setUsers(users.filter((user) => user.id !== id))
      } catch (error) {
        console.error("Error deleting user:", error)
        setError("Error al eliminar el usuario")
      }
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setDialogOpen(true)
  }

  const handleCreate = () => {
    setEditingUser(null)
    setDialogOpen(true)
  }

  const handleUserSaved = () => {
    loadUsers()
    setDialogOpen(false)
    setEditingUser(null)
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (status: string) => {
    return status === "active" ? (
      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
        Activo
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
        Inactivo
      </Badge>
    )
  }

  const getRoleBadge = (role: string) => {
    return role === "admin" ? (
      <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
        Admin
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
        Usuario
      </Badge>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Cargando usuarios...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {error && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestión de Usuarios</CardTitle>
              <CardDescription>
                Administra los usuarios del sistema
                {process.env.NEXT_PUBLIC_API_URL && (
                  <span className="block text-xs text-muted-foreground mt-1">
                    Conectado a: {process.env.NEXT_PUBLIC_API_URL}
                  </span>
                )}
              </CardDescription>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Usuario
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={handleSearch}>
              Buscar
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha de Creación</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                          <AvatarFallback>
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{user.name}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString("es-ES")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(user)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(user.id)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "No se encontraron usuarios que coincidan con la búsqueda" : "No hay usuarios registrados"}
            </div>
          )}
        </CardContent>
      </Card>

      <UserDialog open={dialogOpen} onOpenChange={setDialogOpen} user={editingUser} onUserSaved={handleUserSaved} />
    </>
  )
}
