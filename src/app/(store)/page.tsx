import ProductsView from '@/components/ProductsView'
import PromoBanner from '@/components/PromoBanner'
import {getItems} from '@/lib/items/items'
import {getCategories} from '../../lib/categories/categories'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Home() {
	const items = await getItems()
	const categories = await getCategories()
	const mappedProducts = items.map(product => ({
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
	console.log(
		`${crypto.randomUUID().slice(0, 5)} >>> Rendered the home page chache with ${items.length} products and ${categories.length} categories`
	)
	return (
		<div className='w-full p-4'>
			<PromoBanner />
			<h2 className='text-2xl font-bold'>New Releases</h2>
			<div className='flex flex-col min-h-screen my-2'>
				<ProductsView products={mappedProducts} />
			</div>
		</div>
	)
}
