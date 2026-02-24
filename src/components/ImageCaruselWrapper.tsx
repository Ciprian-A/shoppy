'use client'

import {useEffect, useState} from 'react'
import ImageCarousel from './ImageCarousel'

export default function ImageCarouselWrapper(
	props: React.ComponentProps<typeof ImageCarousel>
) {
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	if (!mounted) {
		return (
			<div className='w-full h-[400px] md:h-[500px] bg-[#f7f7f7] rounded-lg' />
		)
	}

	return <ImageCarousel {...props} />
}
