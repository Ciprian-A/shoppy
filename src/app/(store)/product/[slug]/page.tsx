import BuyBox from '@/components/BuyBox'
import {ClientOnly} from '@/components/ClientOnly'
import ImageCarousel from '@/components/ImageCarousel'
import ProductClientSection from '@/components/ProductClientSection'
import SizeList from '@/components/SizeList'
import {Separator} from '@/components/ui/separator'
import {getItemBySlug} from '@/lib/items/items'
import {ItemDTO} from '@/types/item'

import {notFound} from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const ProductPage = async ({params}: {params: Promise<{slug: string}>}) => {
	const {slug} = await params
	const product = await getItemBySlug(slug)

	const mappedProduct: ItemDTO = {
		...product,
		productDetails: Array.isArray(product.productDetails)
			? (product.productDetails as {key: string; value: string}[])
			: [],

		createdAt: product.createdAt.toISOString(),
		updatedAt: product.updatedAt.toISOString(),
		favourites: product.favourites.map(fav => ({
			...fav
		}))
	}
	const sizeList = (mappedProduct.variants ?? []).map(p => p.size)

	console.log(
		`${crypto.randomUUID().slice(0, 5)} >>> Rendered the product page chache for ${slug}`
	)
	if (!mappedProduct) {
		return notFound()
	}
	return (
		<div className='container mx-auto px-4 py-8'>
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
				<div className='overflow-hidden '>
					<ProductClientSection>
						{mappedProduct.imageUrl && (
							<ClientOnly>
								<ImageCarousel
									sideNav
									gallery={mappedProduct.imageGallery}
									id={mappedProduct.id}
									slug={mappedProduct.slug}
									name={`Image of ${mappedProduct.name}`}
									product={mappedProduct}
								/>
							</ClientOnly>
						)}
					</ProductClientSection>
				</div>
				<div className='flex flex-col w-full'>
					<div className=' flex flex-col lg:flex-row space-x-8'>
						<div className='w-full lg:w-[65%]'>
							<h1 className='text-3xl font-bold mb-4'>{product.name}</h1>
							<div className='text-3xl font-bold mb-4'>
								£{product.price?.toFixed(2)}
							</div>
							<Separator className='my-4 w-full' />
							<ProductClientSection>
								<ClientOnly>
									<SizeList sizes={sizeList} productId={mappedProduct.id} />
								</ClientOnly>
							</ProductClientSection>
							<div className='mt-8 w-full'>
								<h3 className='text-xl font-bold'>Product details</h3>
								{mappedProduct?.productDetails?.map(p => (
									<div key={p.key} className='flex w-full space-x-8'>
										<p className='font-bold w-[30%]'>{p.key}</p>
										<p className='text-left w-[50%]'>{p.value}</p>
									</div>
								))}
							</div>
						</div>
						<ProductClientSection>
							<ClientOnly>
								<BuyBox
									id={mappedProduct.id}
									price={mappedProduct.price}
									variants={mappedProduct.variants || []}
									name={mappedProduct.name}
									slug={mappedProduct.slug}
									image={mappedProduct.imageUrl}
								/>
							</ClientOnly>
						</ProductClientSection>
					</div>
					<Separator className='my-4' />
					<div className='prose mb-6'>
						<h3 className='text-xl font-bold'>About this item</h3>
						{mappedProduct.description && mappedProduct.description}
					</div>
					<Separator className='my-4' />
				</div>
			</div>
		</div>
	)
}

export default ProductPage
