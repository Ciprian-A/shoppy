import {useUser} from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React, {useTransition} from 'react'

import {useAuthModal} from '@/app/(store)/authModalStore'
import {favoritesChannel} from '@/favoritesChannel'
import {toggleFavoriteItem} from '@/lib/items/actions/items'
import useStore from '@/store'
import {ItemDTO} from '@/types/item'
import {Heart} from 'lucide-react'

const ProductThumb = ({product}: {product: ItemDTO}) => {
	const {user} = useUser()
	const {open: openAuthModal} = useAuthModal()
	const [isPending, startTransition] = useTransition()

	const addFavoriteItem = useStore(state => state.addFavoriteItem)
	const removeFavoriteItem = useStore(state => state.removeFavoriteItem)
	const favorites = useStore(state => state.favoriteItems)

	const isOutOfStock = !product?.variants?.some(p => (p?.stock ?? 0) > 0)
	const isFavorite = favorites.some(fav => fav.id === product.id)

	const handleFavouriteToggle = async (
		e: React.MouseEvent<SVGSVGElement, MouseEvent>
	) => {
		e.preventDefault()
		e.stopPropagation()

		if (!user) {
			openAuthModal()
			return
		}

		if (isFavorite) {
			removeFavoriteItem(product.id)
		} else {
			addFavoriteItem(product)
		}

		favoritesChannel?.postMessage({
			type: 'favorite-toggled',
			item: product,
			action: isFavorite ? 'removed' : 'added'
		})
		startTransition(async () => {
			await toggleFavoriteItem(user?.id!, product.id)
		})
	}
	return (
		<Link
			href={`/product/${product?.slug}`}
			className='group flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden'>
			<div className='group relative aspect-4/3 w-full h-full overflow-hidden '>
				{product.imageUrl && (
					<div className=''>
						<Image
							className='object-cover '
							src={product.imageUrl}
							alt={product.name || 'Product image'}
							fill
							sizes='(max-width: 768px 100vw, (max-width: 1200px) 50vw, 33vw'
						/>
						<Heart
							className={`child w-10 h-10 p-1 absolute top-2 right-2 transition-all bg-white shadow hover:shadow-md rounded-full ${isFavorite ? 'text-red-500 fill-current' : ''}`}
							onClick={handleFavouriteToggle}
						/>
					</div>
				)}
			</div>
			<div className='p-4'>
				<h2 className='text=lg font-semibold text-gray-800 truncate'>
					{product.name}
				</h2>
				<p className='mt-2 text-sm text-gray-600 line-clamp-2'>
					{(product.description && product.description) ||
						'No description available'}
				</p>
				<p className='mt-2 text=lg font-bold text-gray-900'>
					£{product.price?.toFixed(2)}
				</p>
				{isOutOfStock && <p className='text-red-500'> Out of stock</p>}
			</div>
		</Link>
	)
}

export default ProductThumb
