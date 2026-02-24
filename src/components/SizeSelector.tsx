'use client'
import {ItemSize} from '@/app/(store)/store/storeSlice'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select'
import useStore from '@/store'
import {ItemDTO} from '@/types/item'

interface SizeSelectorProps {
	product: ItemDTO
}

function SizeSelector({product}: SizeSelectorProps) {
	const availableSizeList = product?.variants?.map(p => p.size) as string[]
	const getSelectedSize = useStore(state => state.getSelectedSize)
	const setSelectedSize = useStore(state => state.setSelectedSize)
	const selectedSize = getSelectedSize(product.id)

	const handleValueChange = (value: string) => {
		setSelectedSize(product.id, value as ItemSize)
	}
	return (
		<div className=''>
			<Select
				value={selectedSize}
				onValueChange={value => handleValueChange(value)}>
				<SelectTrigger className='w-full'>
					<SelectValue placeholder='Select a size' />
				</SelectTrigger>
				<SelectContent>
					{availableSizeList.map((size: string) => (
						<SelectItem
							key={size}
							value={size}
							disabled={!availableSizeList?.includes(size)}>
							{size}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	)
}

export default SizeSelector
