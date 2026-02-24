'use client'

import IncrementAndDecrementButton from '@/components/IncrementAndDecrementButton'
import Loader from '@/components/Loader'
import {SignInButton, useAuth, useUser} from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'

import {useEffect, useState} from 'react'
import {
	createCheckoutSession,
	Metadata
} from '../../../lib/checkoutSession/actions/createCheckoutSession'
import useStore from '../../../store'

function BasketPage() {
	const basket = useStore(state => state.basket)
	const removeItemFromBasket = useStore(state => state.removeItemFromBasket)
	const clearBasket = useStore(state => state.clearBasket)
	const groupedItems = Object.values(basket).filter(item => item.quantity > 0)
	const totalPrice = Object.values(basket).reduce(
		(total, item) => total + item.price * item.quantity,
		0
	)
	const {isSignedIn} = useAuth()
	const {user} = useUser()

	const [isClient, setIsClient] = useState(false)
	const [isLoading, setIsloading] = useState(false)
	useEffect(() => {
		setIsClient(true)
	}, [])

	if (!isClient) {
		return <Loader />
	}
	if (groupedItems.length === 0) {
		return (
			<div className='container mx-auto p-4 flex flex-col items-center justify-center min-h-[50vh]'>
				<h1 className='text-2xl font-bold mb-6 text-gray-800'>Your Basket</h1>
				<p className='text-gray-600 text-xl'>Your basket is empty</p>
			</div>
		)
	}
	const handleCheckout = async () => {
		if (!isSignedIn) return
		setIsloading(true)
		try {
			const metadata: Metadata = {
				orderNumber: crypto.randomUUID(),
				customerName: user?.fullName ?? 'Unknown',
				customerEmail: user?.emailAddresses[0].emailAddress ?? 'Unknown',
				storeUserId: user?.id ?? 'Unknown'
			}
			const mappedItems = groupedItems.map(item => ({
				...item
			}))
			const checkoutUrl = await createCheckoutSession(mappedItems, metadata)
			if (checkoutUrl) {
				window.location.href = checkoutUrl
			}
		} catch (error) {
			console.error('Error crating checkout session:', error)
		} finally {
			setIsloading(false)
		}
	}
	return (
		<div className='container mx-auto p-4 max-w-6xl'>
			<h1 className='text-2xl font-bold mb-4'>Your Basket</h1>
			<button
				onClick={clearBasket}
				className='mb-4 text-sm text-gray-600 hover:underline hover:cursor-pointer'>
				Clear Basket
			</button>
			<div className='flex flex-col lg:flex-row gap-8'>
				<div className='flex-grow'>
					{groupedItems?.map(item => (
						<div
							key={item.uniqueKey}
							className='mb-4 p-4 border rounded flex items-center justify-between'>
							<div className='flex items-center flex-1 min-w-0'>
								<div className='w-20 h-20 sm:w-h-24 flex-shrink-0 mr-4'>
									{item.image && (
										<Image
											src={item.image}
											alt={item.name ?? 'Product image'}
											className='w-full h-full object-cover rounded'
											width={96}
											height={96}
										/>
									)}
								</div>
								<div className='flex flex-col md:flex-row justify-between w-full  space-y-2'>
									<div className=' space-y-3'>
										<Link href={`/product/${item.slug}`} className=''>
											<h2 className='text-lg sm:text-xl font-semibold truncate text-wrap hover:underline'>
												{item.name}
											</h2>
										</Link>
										<p className='text-sm font-semibold'>
											<span className='font-bold'>Size:</span> {item.size} UK
										</p>
										<div className='flex items-center flex-shrink-0 space-x-4'>
											<IncrementAndDecrementButton
												uniqueKey={item.uniqueKey}
												disabled={item.quantity === 0}
											/>
											<button
												onClick={() => removeItemFromBasket(item.uniqueKey)}
												className='flex space-x-2 hover:cursor-pointer hover:underline decoration-red-500'>
												<span className='hidden md:block text-red-500'>
													Remove
												</span>
											</button>
										</div>
									</div>
									<p className='text-xl font-bold '>
										£
										{item.price &&
											item.quantity &&
											(item.price * item.quantity).toFixed(2)}
									</p>
								</div>
							</div>
						</div>
					))}
				</div>
				<div className='w-full lg:w-80 lg:sticky lg:top-4 h-fit bg-white p-6 border rounded order-first lg:order-last fixed bottom-0 left-0 lg:left-auto'>
					<h3 className='text-xl font-semibold'>Order Summary</h3>
					<div className='mt-4 space-y-2'>
						<p className='flex justify-between'>
							<span>Items:</span>
							<span>
								{groupedItems.reduce(
									(total, item) => total + (item.quantity ?? 0),
									0
								)}
							</span>
						</p>
						<p className='flex justify-between text-2xl font-bold border-t pt-2'>
							<span>Total:</span>
							<span>£{totalPrice.toFixed(2)}</span>
						</p>
					</div>
					{isSignedIn ? (
						<button
							onClick={handleCheckout}
							disabled={isLoading}
							className='mt-4 w-full bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:bg-gray-400'>
							{isLoading ? 'Processing...' : 'Checkout'}
						</button>
					) : (
						<SignInButton mode='modal'>
							<button className='mt-4 w-full bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700'>
								Sign in to Checkout
							</button>
						</SignInButton>
					)}
				</div>
				<div className='h-64 lg:h-0' />
			</div>
		</div>
	)
}

export default BasketPage
