'use client'

import {useRouter} from 'next/navigation'
import {useEffect} from 'react'

export default function FavoritesPageClient({
	children
}: {
	children: React.ReactNode
}) {
	const router = useRouter()

	useEffect(() => {
		const handler = () => router.refresh()
		window.addEventListener('focus', handler)
		return () => window.removeEventListener('focus', handler)
	}, [router])

	return children
}
