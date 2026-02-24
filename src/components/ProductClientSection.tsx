'use client'

import FavoritesRefresher from '@/components/FavoritesRefresher'

export default function ProductClientSection({
	children
}: {
	children: React.ReactNode
}) {
	return (
		<>
			<FavoritesRefresher />
			{children}
		</>
	)
}
