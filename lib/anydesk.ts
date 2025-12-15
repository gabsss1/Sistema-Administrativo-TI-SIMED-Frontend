import { authenticatedFetch } from "./auth"

export interface Anydesk {
  anydesk_id: number
  anydesk_nombre: string
  anydesk_numero: string
  servidor: boolean
  hospitales: {
    hospital_id: number
    hospital_nombre: string
  }
}

export interface CreateAnydeskDto {
  anydesk_nombre: string
  anydesk_numero: string
  servidor: boolean
  hospital_id: number
}

export interface UpdateAnydeskDto extends Partial<CreateAnydeskDto> {
  anydesk_id: number
}

// API functions para Anydesk
export async function getAnydeskList(search?: string): Promise<Anydesk[]> {
  const queryParam = search ? `?search=${encodeURIComponent(search)}` : ""
  const response = await authenticatedFetch(`/anydesk${queryParam}`)
  if (!response.ok) throw new Error("Error fetching anydesk list")
  return response.json()
}

export async function getAnydeskById(id: number): Promise<Anydesk> {
  const response = await authenticatedFetch(`/anydesk/${id}`)
  if (!response.ok) throw new Error("Error fetching anydesk by id")
  return response.json()
}

export async function createAnydesk(data: CreateAnydeskDto): Promise<Anydesk> {
  const response = await authenticatedFetch("/anydesk", {
    method: "POST",
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Error creating anydesk")
  return response.json()
}

export async function updateAnydesk(id: number, data: Partial<CreateAnydeskDto>): Promise<Anydesk> {
  const response = await authenticatedFetch(`/anydesk/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Error updating anydesk")
  return response.json()
}

export async function deleteAnydesk(id: number): Promise<void> {
  const response = await authenticatedFetch(`/anydesk/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) throw new Error("Error deleting anydesk")
}
