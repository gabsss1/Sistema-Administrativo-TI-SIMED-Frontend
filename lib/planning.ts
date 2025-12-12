import { basicAuthenticatedFetch, basicAuthenticatedFetchRaw } from './auth'

const base = '/planning'

export async function fetchPlannings() {
  const res = await basicAuthenticatedFetch(base)
  if (!res.ok) throw new Error(`Error fetching plannings: ${res.status}`)
  return res.json()
}

export async function fetchPlanning(id: number) {
  const res = await basicAuthenticatedFetch(`${base}/${id}`)
  if (!res.ok) throw new Error(`Error fetching planning ${id}: ${res.status}`)
  return res.json()
}

export async function createPlanning(payload: Record<string, any>) {
  const res = await basicAuthenticatedFetchRaw(base, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Error creating planning: ${res.status} ${text}`)
  }
  return res.json()
}

export async function updatePlanning(id: number, payload: Record<string, any>) {
  const res = await basicAuthenticatedFetchRaw(`${base}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Error updating planning: ${res.status} ${text}`)
  }
  return res.json()
}

export async function deletePlanning(id: number) {
  const res = await basicAuthenticatedFetch(`${base}/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Error deleting planning: ${res.status} ${text}`)
  }
  return res.json()
}

export default {
  fetchPlannings,
  fetchPlanning,
  createPlanning,
  updatePlanning,
  deletePlanning,
}
