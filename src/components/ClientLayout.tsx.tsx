'use client'

import FavoritesRefresher from '@/components/FavoritesRefresher'

export default function ClientLayout({children}: {children: React.ReactNode}) {
	return (
		<>
			<FavoritesRefresher />
			{children}
		</>
	)
}
