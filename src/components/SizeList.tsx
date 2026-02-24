'use client'

import {ItemSize} from '@/app/(store)/store/storeSlice'
import {getDefaultSizeIndex} from '@/lib/getDefaultSizeIndex'
import useStore from '@/store'
import {useState} from 'react'
import {Button} from './ui/button'

function SizeList({sizes, productId}: {sizes: string[]; productId: string}) {
	const {setSelectedSize} = useStore()
	const [hoverSize, setHoverSize] = useState<string | null>(null)
	const selectedSize = useStore(state => state.getSelectedSize(productId))
	const defaultSizeIndex = getDefaultSizeIndex(sizes.length)
	const defaultSize = sizes[defaultSizeIndex] as ItemSize

	if (!selectedSize && sizes.length > 0) {
		setSelectedSize(productId, defaultSize)
	}

	const handleSelectSize = (size: string) => {
		setSelectedSize(productId, size as ItemSize)
	}
	if (!sizes.length) return null
	return (
		<>
			<p className='text-base mb-2'>
				Size Name:
				<span className='font-bold text-lg text-black ml-1'>
					{hoverSize ?? selectedSize}
				</span>
			</p>
			<div className='flex gap-2 flex-wrap'>
				{sizes.map(s => (
					<Button
						variant='outline'
						key={s}
						onMouseEnter={() => setHoverSize(s)}
						onMouseLeave={() => setHoverSize(null)}
						onClick={() => handleSelectSize(s)}
						className={`min-w-14 px-2 py-1 rounded-sm  font-semibold text-lg text-[#555555] border ${selectedSize === s ? 'border-[#1f5e96] shadow-[inset_0_0_0_2px_#1f5e96] bg-[#1f5e96]/8 hover:shadow-[inset_0_0_0_1px_#1f5e96]' : 'border-[#555555] hover:border-[#1f5e96]'}`}>
						{s.toUpperCase()}
					</Button>
				))}
			</div>
		</>
	)
}

export default SizeList
