'use client'

import useStore from '@/store'
import {VariantDTO} from '@/types/item'
import AddToBasket from './AddToBasket'
import BuyItNow from './BuyItNow'
import QuantitySelector from './QuantitySelector'
import {Separator} from './ui/separator'

interface BuyBoxProps {
	id: string
	price: number
	variants: VariantDTO[]
	name: string
	slug: string
	image: string
}
const BuyBox = ({id, price, variants, name, slug, image}: BuyBoxProps) => {
	const isOutOfStock = !variants?.some(p => (p?.stock ?? 0) > 0)
	const activeSize = useStore(state => state.getSelectedSize(id))
	const availableStock = variants?.find(p => p.size === activeSize)
	const quantity = useStore(state => state.getSelectedQuantity(id))
	return (
		<div className='w-full lg:w-[35%] flex flex-col border rounded-md p-3 mt-4 lg:mt-0 max-h-max'>
			<div className='h-full flex flex-col justify-between'>
				<div>
					<p>£{price}</p>
					<p
						className={`text-xl font-semibold ${isOutOfStock ? 'text-red-500' : 'text-green-600'}`}>
						{isOutOfStock ? 'Out of stock' : 'In stock'}
					</p>
					{!isOutOfStock && (
						<p className='text-sm text-gray-500 mt-2'>
							The delivery is estimated to take 3-5 working days.
						</p>
					)}
				</div>
				<Separator className='my-4' />
				<div className=' space-y-3 '>
					<div>
						<p className='text-base mb-2'>Quantity: {quantity}</p>
						<QuantitySelector qty={availableStock?.stock ?? 0} productId={id} />
					</div>
					<BuyItNow
						productId={id}
						name={name}
						slug={slug}
						price={price}
						image={image}
						variants={variants}
					/>
					<AddToBasket
						productId={id}
						name={name}
						slug={slug}
						price={price}
						image={image}
						variants={variants}
					/>
				</div>
			</div>
		</div>
	)
}

export default BuyBox
