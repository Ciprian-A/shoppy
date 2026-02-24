import {prisma} from '../../../config/db'

export const getItems = async () => {
	const data = await prisma.item.findMany({
		orderBy: {
			createdAt: 'desc'
		},
		include: {
			categories: true,
			variants: true,
			favourites: true
		}
	})
	return data
}

export const getItem = async (id: string) => {
	const data = await prisma.item.findUniqueOrThrow({
		where: {
			id
		},
		include: {
			categories: true,
			variants: true
		}
	})
	return data
}
export const getItemBySlug = async (slug: string) => {
	const data = await prisma.item.findUniqueOrThrow({
		where: {
			slug
		},
		include: {
			categories: true,
			variants: true,
			favourites: true
		}
	})
	const productDetails = Array.isArray(data.productDetails)
		? (data.productDetails as {key: string; value: string}[])
		: []
	const favourites = data.favourites.map(f => ({
		...f,
		createdAt: f.createdAt.toISOString()
	}))

	return {
		...data,
		productDetails,
		favourites
	}
}

export const getItemsByCategory = async (categorySlug: string) => {
	const data = await prisma.item.findMany({
		where: {
			categories: {
				some: {
					slug: categorySlug
				}
			}
		},
		include: {
			variants: true
		},
		orderBy: {
			name: 'asc'
		}
	})
	return data
}

export const getFavouriteItemsByUser = async (userId: string) => {
	try {
		const data = await prisma.item.findMany({
			where: {
				favourites: {
					some: {
						userId
					}
				}
			},
			include: {
				categories: true,
				variants: true,
				favourites: true
			},
			orderBy: {
				createdAt: 'desc'
			}
		})
		return data
	} catch (error) {
		console.log('Error fetching favourite items for user:', error)
		throw new Error('Failed to fetch favourite items for user.')
	}
}
export const searchItemsByName = async (query: string) => {
	const data = await prisma.item.findMany({
		where: {
			name: {
				contains: query,
				mode: 'insensitive'
			}
		},
		include: {
			categories: true,
			variants: true,
			favourites: true
		},
		orderBy: {
			name: 'asc'
		}
	})
	return data
}
