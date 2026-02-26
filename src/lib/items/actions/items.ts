'use server'

import {generateSlug} from '@/lib/generateSlug'
import {uploadGalleryImages} from '@/lib/storage/storage'
import {revalidatePath} from 'next/cache'
import {prisma} from '../../../../config/db'

export async function createItem(formData: FormData) {
	const name = formData.get('name')?.toString() ?? ''
	const description = formData.get('description')?.toString() ?? ''
	const price = formData.get('price')?.toString() ?? '0'
	const productDetailsRaw = formData.get('product-details')?.toString() ?? '[]'
	let productDetails: {key: string; value: string}[] = []
	try {
		productDetails = JSON.parse(productDetailsRaw)
	} catch {
		productDetails = []
	}

	const categoriesRaw = formData.get('categories')?.toString() ?? '[]'
	let categories: string[] = []
	try {
		categories = JSON.parse(categoriesRaw)
	} catch {
		categories = []
	}
	const variantsRaw = formData.get('variants')?.toString() ?? '[]'
	let variants: {size: string; stock: number}[] = []
	try {
		variants = JSON.parse(variantsRaw)
	} catch {
		variants = []
	}

	const galleryFiles = formData.getAll('gallery') as File[]
	const slug = generateSlug(name)

	// Call the extracted storage functions
	const galleryUrls = await uploadGalleryImages(galleryFiles)

	// Save to database
	const item = await prisma.item.create({
		data: {
			name,
			slug,
			description,
			imageUrl: galleryUrls[0],
			imageGallery: galleryUrls,
			price: Number(price),
			productDetails,
			categories: {
				connect: categories.map(id => ({id}))
			},
			variants: {
				create: variants.map(v => ({
					size: v.size,
					stock: v.stock
				}))
			}
		}
	})

	return {success: true, item}
}

export async function updateItem(id: string, formData: FormData) {
	const name = formData.get('name')?.toString() ?? ''
	const description = formData.get('description')?.toString() ?? ''
	const price = formData.get('price')?.toString() ?? '0'

	const productDetailsRaw = formData.get('product-details')?.toString() ?? '[]'
	let productDetails: {key: string; value: string}[] = []
	try {
		productDetails = JSON.parse(productDetailsRaw)
	} catch {
		productDetails = []
	}

	const categoriesRaw = formData.get('categories')?.toString() ?? '[]'
	let categories: string[] = []
	try {
		categories = JSON.parse(categoriesRaw)
	} catch {
		categories = []
	}

	const variantsRaw = formData.get('variants')?.toString() ?? '[]'
	let variants: {size: string; stock: number}[] = []
	try {
		variants = JSON.parse(variantsRaw)
	} catch {
		variants = []
	}

	const galleryFiles = formData.getAll('gallery') as File[]

	let galleryUrls: string[] | undefined = undefined
	const newGalleryFiles: File[] = []
	const existingGalleryUrls: string[] = []

	for (const entry of galleryFiles) {
		if (typeof entry === 'string') {
			existingGalleryUrls.push(entry)
		} else if (entry instanceof File && entry.size > 0) {
			newGalleryFiles.push(entry)
		}
	}

	let uploadedUrls: string[] = []
	if (newGalleryFiles.length > 0) {
		uploadedUrls = await uploadGalleryImages(newGalleryFiles)
	}

	galleryUrls = [...existingGalleryUrls, ...uploadedUrls]

	const slug = generateSlug(name)

	const item = await prisma.item.update({
		where: {id},
		data: {
			name,
			slug,
			description,
			imageUrl: galleryUrls[0],
			imageGallery: galleryUrls,
			price: Number(price),
			productDetails,
			categories: {
				set: categories.map(id => ({id}))
			},
			variants: {
				deleteMany: {},
				create: variants.map(v => ({
					size: v.size,
					stock: v.stock
				}))
			}
		}
	})

	return {success: true, item}
}

export const deleteItem = async (id: string) => {
	try {
		await prisma.item.delete({where: {id}})
		revalidatePath('/admin/items')
	} catch (error) {
		console.log('Error deleting item:', error)
		throw new Error('Failed to delete item.')
	}
}

export const toggleFavoriteItem = async (userId: string, itemId: string) => {
	try {
		const existingFavorite = await prisma.favorite.findUnique({
			where: {
				userId_itemId: {
					userId,
					itemId
				}
			}
		})

		if (existingFavorite) {
			await prisma.favorite.delete({
				where: {
					userId_itemId: {
						userId,
						itemId
					}
				}
			})

			return {action: 'removed'}
		} else {
			await prisma.favorite.create({
				data: {
					userId,
					itemId
				}
			})

			return {action: 'added'}
		}
	} catch (error) {
		console.error('Error updating favorites:', error)
		throw new Error('Failed to update favorites.')
	}
}
