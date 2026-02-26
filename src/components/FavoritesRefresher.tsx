'use client'

import {favoritesChannel} from '@/favoritesChannel'
import useStore from '@/store'
import {useEffect} from 'react'

export default function FavoritesRefresher() {
	const addFavoriteItem = useStore(state => state.addFavoriteItem)
	const removeFavoriteItem = useStore(state => state.removeFavoriteItem)

	useEffect(() => {
		if (!favoritesChannel) return

		const handler = (event: MessageEvent) => {
			console.log('BROADCAST RECEIVED', event.data)
			if (event.data?.type === 'favorite-toggled') {
				const {action, item} = event.data
				if (action === 'added') {
					addFavoriteItem(item)
				} else if (action === 'removed') {
					removeFavoriteItem(item.id)
				}
			}
		}

		favoritesChannel.addEventListener('message', handler)

		return () => {
			favoritesChannel?.removeEventListener('message', handler)
		}
	}, [addFavoriteItem, removeFavoriteItem])

	return null
}
