import {getItemBySlug} from '@/lib/items/items'
import type {Metadata} from 'next'

export async function generateMetadata({
	params
}: {
	params: Promise<{slug: string}>
}): Promise<Metadata> {
	const {slug} = await params
	const product = await getItemBySlug(slug)

	return {
		title: `Shoppy - ${product?.name}`,
		description: `Shoppy - Details about ${product?.name}`
	}
}

export default async function ProductLayout({
	children
}: Readonly<{
	children: React.ReactNode
}>) {
	return <>{children}</>
}
