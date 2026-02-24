import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select'
import useStore from '@/store'
const QuantitySelector = ({
	qty,
	productId
}: {
	qty: number
	productId: string
}) => {
	const selectedQty = useStore(state => state.getSelectedQuantity(productId))
	const setSelectedQuantity = useStore(state => state.setSelectedQuantity)

	const handleValueChange = (value: string) => {
		setSelectedQuantity(productId, Number(value))
	}
	return (
		<div>
			<Select
				value={`${selectedQty}`}
				onValueChange={value => handleValueChange(value)}>
				<SelectTrigger className='w-full'>
					<SelectValue placeholder='Select quantity' />
				</SelectTrigger>
				<SelectContent>
					{Array.from({length: qty}, (_, idx) => idx + 1).map(n => (
						<SelectItem key={n} value={`${n}`}>
							{n}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	)
}

export default QuantitySelector
