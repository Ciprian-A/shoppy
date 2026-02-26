'use client'

import {useFavoritesStore} from '@/store/favorites-store'

export default function FavoritesClient({products}) {
	const favoriteIds = useFavoritesStore(s => s.favoriteIds)

	const favoriteProducts = products.filter(p => favoriteIds.includes(p.id))

	if (!favoriteProducts.length) {
		return <p>No favorites yet</p>
	}

	return (
		<>
			{favoriteProducts.map(product => (
				<ProductCard key={product.id} product={product} />
			))}
		</>
	)
}
