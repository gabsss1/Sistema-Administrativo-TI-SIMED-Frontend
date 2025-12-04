import { basicAuthenticatedFetch, basicAuthenticatedFetchRaw } from './auth'

const endpointBase = '/registro-base-ti/pdf'

export async function subirPdf(registroId: number, file: File) {
	const fd = new FormData()
	fd.append('file', file)

	const response = await basicAuthenticatedFetchRaw(`${endpointBase}/${registroId}`, {
		method: 'POST',
		body: fd,
	})

	if (!response.ok) {
		const text = await response.text().catch(() => '')
		throw new Error(`Error subiendo PDF: ${response.status} ${text}`)
	}

	return response.json()
}

// Try to obtain lightweight metadata for a registro by issuing a HEAD to the /ver endpoint.
// The backend controller exposes: GET /by-registro/:registro_base_id/ver (serves PDF with Content-Disposition).
// A HEAD request will let us inspect headers (filename) without downloading the body.
export async function metadataPorRegistro(registro_base_id: number) {
	const url = `${endpointBase}/by-registro/${registro_base_id}/ver`
	// First try HEAD to avoid downloading the PDF body
	let response = await basicAuthenticatedFetch(url, { method: 'HEAD' })
	if (response.ok) {
		const cd = response.headers.get('content-disposition') || ''
		const m = cd.match(/filename\*=UTF-8''(.+)$|filename="?([^";]+)"?/) || []
		const filename = decodeURIComponent((m[1] || m[2] || '').replace(/"/g, '')) || null
		return { exists: true, filename }
	}
	// If HEAD is not allowed or returns non-OK, attempt GET but do not consume the body here.
	response = await basicAuthenticatedFetch(url)
	if (response.ok) {
		const cd = response.headers.get('content-disposition') || ''
		const m = cd.match(/filename\*=UTF-8''(.+)$|filename="?([^";]+)"?/) || []
		const filename = decodeURIComponent((m[1] || m[2] || '').replace(/"/g, '')) || null
		return { exists: true, filename }
	}
	// Not found or other error
	return { exists: false, filename: null }
}

// Download the PDF served by the controller for a registro (reads from /by-registro/:id/ver)
export async function verPdfPorRegistro(registro_base_id: number): Promise<Blob> {
	const url = `${endpointBase}/by-registro/${registro_base_id}/ver`
	const response = await basicAuthenticatedFetch(url)
	if (!response.ok) {
		const text = await response.text().catch(() => '')
		throw new Error(`Error descargando PDF por registro: ${response.status} ${text}`)
	}
	return response.blob()
}

// Delete the PDF associated to a registro (controller: DELETE /by-registro/:registro_base_id)
export async function eliminarPdfPorRegistro(registro_base_id: number) {
	const url = `${endpointBase}/by-registro/${registro_base_id}`
	const response = await basicAuthenticatedFetch(url, { method: 'DELETE' })
	if (!response.ok) {
		const text = await response.text().catch(() => '')
		throw new Error(`Error eliminando PDF por registro: ${response.status} ${text}`)
	}
	return response.json()
}

export function getPdfVerUrlByRegistro(registroId: number) {
	return `${process.env.NEXT_PUBLIC_API_URL || ''}${endpointBase}/by-registro/${registroId}/ver`
}

export default {
	subirPdf,
	metadataPorRegistro,
	verPdfPorRegistro,
	eliminarPdfPorRegistro,
	getPdfVerUrlByRegistro,
}

