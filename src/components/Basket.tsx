'use client'

import useStore from '@/store'
import {ShoppingCartIcon} from 'lucide-react'
import Link from 'next/link'
import TooltipHeader from './TooltipHeader'

export const Basket = () => {
	const itemCount = useStore(state =>
		Object.values(state.basket).reduce(
			(total, item) => total + item.quantity,
			0
		)
	)
	return (
		<TooltipHeader description='Basket'>
			<Link
				href='/basket'
				className='group flex  relative justify-center sm:justify-start sm:flex-none items-center hover:bg-gray-200 text-black font-bold py-1 px-2 mr-2 rounded'>
				<ShoppingCartIcon className='w-6 h-6' />
				{itemCount > 0 && (
					<span className='child absolute  -top-2 -right-2 bg-red-500 group-hover:bg-red-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs'>
						{itemCount}
					</span>
				)}
			</Link>
		</TooltipHeader>
	)
}
