'use client'

export const favoritesChannel =
	typeof window !== 'undefined' ? new BroadcastChannel('favorites-sync') : null
