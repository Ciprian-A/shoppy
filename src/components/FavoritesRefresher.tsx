'use client'

import {favoritesChannel} from '@/favoritesChannel'
import {useRouter} from 'next/navigation'
import {useEffect} from 'react'

export default function FavoritesRefresher() {
	const router = useRouter()

	useEffect(() => {
		const handler = (event: MessageEvent) => {
			if (event.data?.type === 'refresh') {
				router.refresh()
			}
		}

		favoritesChannel.addEventListener('message', handler)

		return () => {
			favoritesChannel.removeEventListener('message', handler)
		}
	}, [router])

	return null
}
