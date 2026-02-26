'use client'

import ProductsView from '@/components/ProductsView'

import useStore from '@/store'
import {useUser} from '@clerk/nextjs'

export default function FavouritesPage() {
	const {user} = useUser()
	const favoriteProducts = useStore(state => state.favoriteItems)

	if (!favoriteProducts.length) {
		return (
			<div className='container mx-auto p-4 flex flex-col items-center justify-center min-h-[50vh]'>
				<h1 className='text-2xl font-bold mb-6 text-gray-800'>
					Nothing to see here yet...
				</h1>
				<p className='text-gray-600 text-xl flex flex-col justify-center items-center'>
					<span>Save your favourite items by tapping the ❤️ icon.</span>
					<span>They will show up here for easy access anytime.</span>
				</p>
			</div>
		)
	}
	return (
		<div className='flex flex-col items-center justify-top w-full min-h-screen bg-gray-100 '>
			<div className='bg-white p-8 rounded-lg shadow-md w-full min-h-screen '>
				<h1 className='text-2xl font-bold mb-6 '>
					{user?.fullName}'s Favourites
				</h1>
				<ProductsView products={favoriteProducts} />
			</div>
		</div>
	)
}
