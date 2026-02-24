'use client'
import useStore from '@/store'
import {Button} from './ui/button'

interface AddToBasketProps {
	productId: string
	name: string
	slug: string
	price: number
	image: string
	variants: {size: string; stock: number}[]
	disabled?: boolean
}

const AddToBasket = ({
	productId,
	name,
	slug,
	price,
	image,
	variants,
	disabled
}: AddToBasketProps) => {
	const activeSize = useStore(state => state.getSelectedSize(productId))
	const quantity = useStore(state => state.getSelectedQuantity(productId))
	const addToBasket = useStore(state => state.addItemToBasket)

	const selectedVariant = variants.find(v => v.size === activeSize)
	const availableStock = selectedVariant?.stock ?? 0

	const isDisabled =
		disabled || !activeSize || quantity < 1 || quantity > availableStock

	const handleAddToBasket = () => {
		if (isDisabled) return

		const basketItem = {
			uniqueKey: `${productId}-${activeSize}`,
			productId,
			name,
			slug,
			price,
			size: activeSize,
			quantity,
			image
		}
		addToBasket(basketItem)
	}

	return (
		<Button
			className={`${disabled ? 'cursor-not-allowed' : ' disabled:bg-gray-900 w-full rounded-md bg-gray-900 text-white text-base border-black border-2 hover:bg-gray-700 py-5'}`}
			onClick={handleAddToBasket}>
			Add to basket
		</Button>
	)
}
export default AddToBasket
