import ProductGrid from '@/components/ProductGrid'
// import ProductsView from '@/components/ProductsView'
import {getFavouriteItemsByUser} from '@/lib/items/items'
import {getCurrentUserFromDB} from '@/lib/users/actions/users'

export default async function FavouritesPage() {
	const currentUser = await getCurrentUserFromDB()
	const allFavouriteItems = await getFavouriteItemsByUser(currentUser!.id)
	const mappedProducts = allFavouriteItems.map(product => ({
		...product,
		productDetails: Array.isArray(product.productDetails)
			? (product.productDetails as {key: string; value: string}[])
			: [],
		createdAt: product.createdAt.toISOString(),
		updatedAt: product.updatedAt.toISOString(),
		favourites: product.favourites.map(fav => ({
			...fav,
			createdAt: fav.createdAt.toISOString()
		}))
	}))

	if (allFavouriteItems.length === 0) {
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
					{currentUser?.name}'s Favourites
				</h1>
				<ProductGrid products={mappedProducts} />
			</div>
		</div>
	)
}
