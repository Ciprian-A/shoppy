// 'use server'

// import { prisma,Prisma } from '../../../../config/db';

// export const createOrder = async (userId: string, items: Array<{itemId: string; quantity: number; size?: string}>) => {
//   if (!userId) {
//     throw new Error('User ID is required')
//   }
//   const order = await prisma.order.create({
//     data: {
//       storeUserId: userId,
//       stripeCheckoutSessionId: '',
//       stripeCustomerID: '',
//       customerName: '',
//       customerEmail: '',
//       orderItems: {
//         create: items.map(item => ({
//           itemId: item.itemId,
//           quantity: item.quantity,
//           size: item.size,
//           unitPrice: 0 // Placeholder, should be set to actual item price
//         }))
//       }
//     },
//     include: {
//       orderItems: {
//         include: {
//           item: {
//             select: {
//               id: true,
//               name: true,
//               slug: true,
//               imageUrl: true,
//               price: true,
//               variants: true
//             }
//           }
//         }
//       }
//     }
//   })
//   return order
// }

'use server'

import {normalizeStripeCurrency} from '@/lib/constants/currency'
import stripe from '@/lib/stripe'
// import { OrderStatus } from '@prisma/client'
import {revalidatePath} from 'next/cache'
import Stripe from 'stripe'
import {prisma} from '../../../../config/db'

export async function createOrder(session: Stripe.Checkout.Session) {
	const {
		id: checkoutSessionId,
		amount_total,
		currency,
		customer,
		payment_intent,
		metadata,
		total_details
	} = session

	const existingOrder = await prisma.order.findUnique({
		where: {stripeCheckoutSessionId: session.id}
	})
	if (existingOrder) {
		return existingOrder
	}
	if (!metadata?.storeUserId) {
		throw new Error('Missing storeUserId in Stripe metadata')
	}

	const lineItems = await stripe.checkout.sessions.listLineItems(
		checkoutSessionId,
		{
			expand: ['data.price.product']
		}
	)
	return prisma.$transaction(async tx => {
		const order = await tx.order.create({
			data: {
				stripeCheckoutSessionId: checkoutSessionId,
				stripePaymentIntentId: payment_intent as string,
				stripeCustomerID: customer as string,
				storeUserId: metadata.storeUserId,
				customerName: metadata.customerName ?? '',
				customerEmail: metadata.customerEmail ?? '',
				totalPrice: (amount_total ?? 0) / 100,
				amountDiscounted: total_details?.amount_discount
					? total_details.amount_discount / 100
					: 0,
				currency: normalizeStripeCurrency(currency!),
				orderStatus: 'PAID',
				promoCodeId: metadata.promoCodeId ?? null
			}
		})

		for (const item of lineItems.data) {
			const product = item.price?.product as Stripe.Product
			const price = item.price as Stripe.Price

			const itemId = product.metadata.itemId
			const size = product.metadata.size as string
			const quantity = item.quantity ?? 1

			if (!itemId || !size) {
				throw new Error('Stripe product missing itemId or size metadata')
			}

			const updatedVariant = await tx.variant.updateMany({
				where: {
					itemId,
					size,
					stock: {
						gte: quantity
					}
				},
				data: {
					stock: {
						decrement: quantity
					}
				}
			})

			if (updatedVariant.count === 0) {
				throw new Error(
					`Order failed: Insufficient stock for ${product.name} (Size: ${size})`
				)
			}

			await tx.orderItem.create({
				data: {
					orderId: order.orderNumber,
					itemId,
					quantity: item.quantity ?? 1,
					size,
					unitPrice: (price.unit_amount ?? 0) / 100
				}
			})
		}
		return order
	})
}

export const deleteOrderById = async (id: string) => {
	try {
		await prisma.order.delete({
			where: {
				orderNumber: id
			}
		})
		revalidatePath('/admin/orders')
	} catch (error) {
		console.log('Error deleting order:', error)
		throw new Error('Failed to delete order.')
	}
}
