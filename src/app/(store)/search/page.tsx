import ProductGrid from '@/components/ProductGrid'
import {searchItemsByName} from '@/lib/items/items'

const SearchPage = async ({
	searchParams
}: {
	searchParams: Promise<{query: string}>
}) => {
	const {query} = await searchParams
	const products = await searchItemsByName(query)
	const mappedProducts = products.map(product => ({
		...product,
		createdAt: product.createdAt.toISOString(),
		updatedAt: product.updatedAt.toISOString(),
		productDetails: Array.isArray(product.productDetails)
			? (product.productDetails as {key: string; value: string}[])
			: [],
		favourites: product.favourites.map(fav => ({
			...fav,
			createdAt: fav.createdAt.toISOString()
		}))
	}))
	if (!products.length) {
		return (
			<div className='flex flex-col items-center justify-top min-h-screen bg-gray-100 p-4'>
				<div className='bg-white p-8 rounded-lg shadow-md w-full max-w-4xl'>
					<h1 className='text-3-xl font-bold mb-6 text-center'>
						No products found for: {query}
					</h1>
					<p className='text-gray-600 text-center'>
						Try searching with different keywords
					</p>
				</div>
			</div>
		)
	}
	return (
		<div className='flex flex-col items-center justify-top w-full min-h-screen bg-gray-100 '>
			<div className='bg-white p-8 rounded-lg shadow-md w-full min-h-screen '>
				<h1 className='text-2xl font-bold mb-6 '>
					Search results for: {query}
				</h1>
				<ProductGrid products={mappedProducts} />
			</div>
		</div>
	)
}

export default SearchPage
