'use client'

import {zodResolver} from '@hookform/resolvers/zod'
import {useEffect, useRef, useState} from 'react'
import {Controller, useFieldArray, useForm} from 'react-hook-form'
import * as z from 'zod'

import {Button} from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '@/components/ui/card'
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSeparator
} from '@/components/ui/field'
import {Loader2, Plus, X} from 'lucide-react'
import Image from 'next/image'
import {useRouter} from 'next/navigation'
import {MultiSelect} from '../MultiSelect'
import {Input} from '../ui/input'
import {
	InputGroup,
	InputGroupAddon,
	InputGroupText,
	InputGroupTextarea
} from '../ui/input-group'
import {UploadFile} from './UploadFile'
const MAX_TOTAL_SIZE = 5 * 1024 * 1024
export const formSchema = z.object({
	name: z
		.string()
		.regex(
			/^[a-zA-Z0-9\s&]+$/,
			'Category name must contain only letters and numbers. Special characters (e.g., ! @ # $ %) are not permitted.'
		)
		.min(3, 'Category name must be at least 3 characters.')
		.max(32, 'Category name must be at most 32 characters.'),
	description: z
		.string()
		.max(500, 'Description must be at most 500 characters.')
		.refine(val => {
			return val === '' || /^[a-zA-Z0-9,.&' -]+$/.test(val)
		}, 'Description must contain only letters and numbers. Special characters (e.g ! @ # $ %) are not permitted.')
		.optional(),
	price: z.coerce.number().positive('Price must be greater than 0'),
	productDetails: z
		.array(
			z.object({
				key: z.string().min(1, 'Key is required'),
				value: z.string().min(1, 'Value is required')
			})
		)
		.optional(),
	imageGallery: z
		.array(z.any())
		.refine(
			files => files.every(f => f instanceof File || typeof f === 'string'),
			'All gallery items must be files or valid URLs'
		)
		.refine(
			files => {
				const total = files
					.filter(f => f instanceof File)
					.reduce((sum, file) => sum + file.size, 0)
				return total <= MAX_TOTAL_SIZE
			},
			`Total gallery size must be under ${MAX_TOTAL_SIZE / 1024 / 1024}MB`
		)
		.max(5, 'You can upload up to 5 images')
		.optional(),
	categories: z.array(z.uuid()).optional(),
	variants: z
		.array(
			z.object({
				size: z.string().min(1, 'Size is required'),
				stock: z.coerce.number().int().nonnegative('Stock must be >= 0')
			})
		)
		.optional()
})

type ItemFormType = {
	formTitle?: string
	formDescription?: string
	categories: {
		id: string
		name: string
	}[]
	initialName?: string
	initialDescription?: string
	initialPrice?: number
	initialProductDetails?: {key: string; value: string}[]
	initialImageUrl?: File | string | null
	initialImageGallery?: (File | string)[]
	initialCategories?: {id: string; name: string}[]
	initialVariants?: {size: string; stock: number}[]
	onSubmit: (formData: FormData) => Promise<void>
}

export type ItemDataType = z.infer<typeof formSchema>
export type ItemDataOutputType = z.output<typeof formSchema>
export type ItemDataInputType = z.input<typeof formSchema>

export default function ItemForm({
	formTitle,
	formDescription,
	categories,
	onSubmit,
	initialName = '',
	initialDescription = '',
	initialPrice = 0,
	initialProductDetails = [],
	initialImageGallery = [],
	initialCategories = [],
	initialVariants = []
}: ItemFormType) {
	const [localError, setLocalError] = useState<string | null>(null)
	const [showProductDetails, setShowProductDetails] = useState(
		initialProductDetails.length > 0
	)
	const [showVariants, setShowVariants] = useState(initialVariants.length > 0)
	const galleryPhotoRef = useRef<HTMLInputElement>(null)

	const form = useForm<ItemDataInputType, ItemDataType, ItemDataOutputType>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: initialName,
			description: initialDescription,
			price: initialPrice,
			productDetails: initialProductDetails,
			imageGallery: initialImageGallery,
			categories: initialCategories.map(cat => cat.id) || [],
			variants: initialVariants
		}
	})

	const MAX_IMAGES = 5
	const {
		fields: productDetailFields,
		append: appendProductDetail,
		remove: removeProductDetail
	} = useFieldArray({
		control: form.control,
		name: 'productDetails'
	})

	const {
		fields: variantFields,
		append: appendVariant,
		remove: removeVariant
	} = useFieldArray({
		control: form.control,
		name: 'variants'
	})

	const router = useRouter()
	const handleCancel = () => {
		form.reset()
		router.back()
	}

	const {isSubmitting} = form.formState
	const descriptionValue = form.watch('description') || ''
	const charCount = descriptionValue.length
	const charRemaining = 500 - charCount

	useEffect(() => {
		if (productDetailFields.length === 0) {
			setShowProductDetails(false)
		}
	}, [productDetailFields.length])

	useEffect(() => {
		if (variantFields.length === 0) {
			setShowVariants(false)
		}
	}, [variantFields.length])

	// Initialize product details section
	const handleAddProductDetails = () => {
		setShowProductDetails(true)
		if (productDetailFields.length === 0) {
			appendProductDetail({key: '', value: ''})
		}
	}

	// Initialize variants section
	const handleAddVariants = () => {
		setShowVariants(true)
		if (variantFields.length === 0) {
			appendVariant({size: '', stock: 0})
		}
	}
	return (
		<Card className='w-2xs sm:w-sm md:w-md lg:w-2xl xl:w-3xl'>
			<CardHeader>
				<CardTitle className='text-2xl'>{formTitle}</CardTitle>
				<CardDescription>{formDescription}</CardDescription>
			</CardHeader>
			<FieldSeparator className='mb-3' />
			<CardContent>
				<form
					id='form-item'
					onSubmit={form.handleSubmit(async (data: ItemDataType) => {
						const formData = new FormData()

						formData.append('name', data.name)
						formData.append('description', data.description ?? '')
						formData.append('price', String(data.price))
						formData.append(
							'product-details',
							JSON.stringify(data.productDetails ?? [])
						)
						formData.append('categories', JSON.stringify(data.categories ?? []))
						formData.append('variants', JSON.stringify(data.variants ?? []))

						if (data.imageGallery && data.imageGallery.length > 0) {
							data.imageGallery.forEach(file => {
								formData.append('gallery', file)
							})
						}
						await onSubmit(formData)
					})}>
					<FieldGroup>
						<Controller
							name='name'
							control={form.control}
							render={({field, fieldState}) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel className='text-md' htmlFor='form-item-name'>
										Item Name <span className='text-red-500'>*</span>
									</FieldLabel>
									<Input
										{...field}
										id='form-item-name'
										aria-invalid={fieldState.invalid}
										placeholder='e.g., Blue Winter Jacket'
										autoComplete='off'
									/>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>

						{/* Description */}
						<Controller
							name='description'
							control={form.control}
							render={({field, fieldState}) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel
										htmlFor='form-item-description'
										className='text-md'>
										Description
									</FieldLabel>
									<InputGroup>
										<InputGroupTextarea
											{...field}
											id='form-item-description'
											placeholder='Include a short description about the newly created item'
											rows={3}
											className='min-h-24 resize-none'
											aria-invalid={fieldState.invalid}
										/>
										<InputGroupAddon align='block-end'>
											<InputGroupText
												className={`tabular-nums text-xs ${charRemaining < 20 ? 'text-orange-600 font-semibold' : ''}`}>
												{charCount}/500
											</InputGroupText>
										</InputGroupAddon>
									</InputGroup>
									<FieldDescription>
										Include a short description about the newly created item.
									</FieldDescription>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>

						{/* Price */}
						<Controller
							name='price'
							control={form.control}
							render={({field: {onChange, value, ...field}, fieldState}) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor='form-item-price' className='text-md'>
										Price <span className='text-red-500'>*</span>
									</FieldLabel>
									<div className='flex gap-2'>
										<div className='flex items-center px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm font-medium text-gray-700'>
											£
										</div>
										<Input
											{...field}
											type='number'
											step='0.01'
											id='form-item-price'
											aria-invalid={fieldState.invalid}
											placeholder='0.00'
											className='flex-1'
											value={
												(value as number) === 0 || Number.isNaN(value as number)
													? ''
													: (value as number)
											}
											onChange={e => {
												const val = e.target.value
												onChange(val === '' ? 0 : parseFloat(val))
											}}
										/>
									</div>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>

						{/* Product Details Section */}
						<div className='border border-gray-200 rounded-lg p-4 space-y-3'>
							<div className='flex flex-col space-y-3 sm:flex-row justify-between items-center'>
								<div>
									<h3 className='text-md font-semibold text-gray-900'>
										Product Details
										{showProductDetails && productDetailFields.length > 0 && (
											<span className='ml-2 text-xs font-normal text-gray-500'>
												({productDetailFields.length})
											</span>
										)}
									</h3>
									<p className='text-xs text-gray-500 mt-0.5'>
										Add custom properties like material, color, or brand
									</p>
								</div>
								{!showProductDetails && (
									<Button
										className='w-full sm:w-min sm:self-start'
										type='button'
										variant='outline'
										size='sm'
										onClick={handleAddProductDetails}>
										<Plus className='h-4 w-4 mr-1' />
										Add Details
									</Button>
								)}
							</div>

							{showProductDetails && (
								<FieldGroup className='space-y-3'>
									{productDetailFields.map((field, index) => (
										<div
											key={field.id}
											className='flex flex-col sm:flex-row gap-2'>
											<Controller
												name={`productDetails.${index}.key`}
												control={form.control}
												render={({field, fieldState}) => (
													<Field
														data-invalid={fieldState.invalid}
														className='w-full'>
														<Input
															{...field}
															id={`form-product-details-key-${index}`}
															aria-invalid={fieldState.invalid}
															aria-label='Property name'
															placeholder='Property (e.g., Material)'
															autoComplete='off'
														/>
														{fieldState.invalid && (
															<FieldError errors={[fieldState.error]} />
														)}
													</Field>
												)}
											/>
											<Controller
												name={`productDetails.${index}.value`}
												control={form.control}
												render={({field, fieldState}) => (
													<Field
														data-invalid={fieldState.invalid}
														className='w-full'>
														<Input
															{...field}
															id={`form-product-details-value-${index}`}
															aria-invalid={fieldState.invalid}
															aria-label='Property value'
															placeholder='Value (e.g., Cotton)'
															autoComplete='off'
														/>
														{fieldState.invalid && (
															<FieldError errors={[fieldState.error]} />
														)}
													</Field>
												)}
											/>
											<Button
												type='button'
												variant='outline'
												size='icon'
												className='shrink-0 w-full h-9 sm:w-9 px-4 py-2'
												aria-label='Remove property'
												onClick={() => removeProductDetail(index)}>
												<X className='h-4 w-4' />
												<span className='sm:hidden'>Remove Field</span>{' '}
											</Button>
										</div>
									))}
									<Button
										type='button'
										variant='ghost'
										size='sm'
										className='w-full'
										onClick={() => appendProductDetail({key: '', value: ''})}>
										<Plus className='h-4 w-4 mr-1' />
										Add Another Property
									</Button>
								</FieldGroup>
							)}
						</div>

						{/* Product Variants Section */}
						<div className='border border-gray-200 rounded-lg p-4 space-y-3'>
							<div className='flex flex-col space-y-3 sm:flex-row justify-between items-center'>
								<div>
									<h3 className='text-md font-semibold text-gray-900'>
										Product Variants
										{showVariants && variantFields.length > 0 && (
											<span className='ml-2 text-xs font-normal text-gray-500'>
												({variantFields.length})
											</span>
										)}
									</h3>
									<p className='text-xs text-gray-500 mt-0.5'>
										Add different sizes or versions with stock quantities
									</p>
								</div>
								{!showVariants && (
									<Button
										className='w-full sm:w-min sm:self-start'
										type='button'
										variant='outline'
										size='sm'
										onClick={handleAddVariants}>
										<Plus className='h-4 w-4 mr-1' />
										Add Variants
									</Button>
								)}
							</div>

							{showVariants && (
								<FieldGroup className='space-y-3'>
									{variantFields.map((field, index) => (
										<div
											key={field.id}
											className='flex flex-col sm:flex-row gap-2'>
											<Controller
												name={`variants.${index}.size`}
												control={form.control}
												render={({field, fieldState}) => (
													<Field
														data-invalid={fieldState.invalid}
														className='w-full'>
														<Input
															{...field}
															id={`form-variant-size-${index}`}
															aria-invalid={fieldState.invalid}
															aria-label='Variant size'
															placeholder='Size (e.g., Medium, XL)'
															autoComplete='off'
														/>
														{fieldState.invalid && (
															<FieldError errors={[fieldState.error]} />
														)}
													</Field>
												)}
											/>
											<Controller
												name={`variants.${index}.stock`}
												control={form.control}
												render={({
													field: {onChange, value, ...field},
													fieldState
												}) => (
													<Field
														data-invalid={fieldState.invalid}
														className='w-full'>
														<Input
															{...field}
															type='number'
															id={`form-variant-stock-${index}`}
															aria-invalid={fieldState.invalid}
															aria-label='Stock quantity'
															placeholder='Stock'
															autoComplete='off'
															value={
																(value as number) === 0 ||
																Number.isNaN(value as number)
																	? ''
																	: (value as number)
															}
															onChange={e => {
																const val = e.target.value
																onChange(val === '' ? 0 : parseInt(val, 10))
															}}
														/>
														{fieldState.invalid && (
															<FieldError errors={[fieldState.error]} />
														)}
													</Field>
												)}
											/>
											<Button
												type='button'
												variant='outline'
												className='shrink-0 w-full h-9 sm:w-9 px-4 py-2'
												aria-label='Remove variant'
												onClick={() => removeVariant(index)}>
												<X className='h-4 w-4' />
												<span className='sm:hidden'>Remove Field</span>
											</Button>
										</div>
									))}
									<Button
										type='button'
										variant='ghost'
										size='sm'
										className='w-full'
										onClick={() => appendVariant({size: '', stock: 0})}>
										<Plus className='h-4 w-4 mr-1' />
										Add Another Variant
									</Button>
								</FieldGroup>
							)}
						</div>

						{/* Image Gallery */}
						<Controller
							name='imageGallery'
							control={form.control}
							render={({field, fieldState}) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor='form-image-gallery' className='text-md'>
										Image Gallery
									</FieldLabel>
									<Input
										ref={galleryPhotoRef}
										hidden
										type='file'
										accept='image/*'
										multiple
										id='form-image-gallery'
										aria-invalid={fieldState.invalid}
										onChange={e => {
											const newFiles = Array.from(e.target.files ?? [])
											const currentFiles = field.value ?? []
											const combined = [...currentFiles, ...newFiles]

											if (combined.length > MAX_IMAGES) {
												setLocalError(
													`You can only upload up to ${MAX_IMAGES} images.`
												)
												field.onChange(combined.slice(0, MAX_IMAGES))
											} else {
												setLocalError(null)
												field.onChange(combined)
											}
										}}
									/>

									{!field.value?.length ? (
										<UploadFile
											type='gallery'
											onClick={() => galleryPhotoRef.current?.click()}
											css='border-2 border-dashed hover:border-gray-400 transition-colors'
											title='Upload Images'
											description={`Upload up to ${MAX_IMAGES} images. First image will be the cover.`}
										/>
									) : (
										<div className='mt-2 flex gap-3 flex-wrap'>
											{field.value.map((file: File | string, idx: number) => {
												const isString = typeof file === 'string'
												const src = isString ? file : URL.createObjectURL(file)
												return (
													<div key={idx} className='relative group'>
														{idx === 0 && (
															<span className='absolute bottom-2 left-2 bg-blue-600 text-white text-xs font-medium px-2 py-0.5 rounded z-10'>
																Cover
															</span>
														)}
														<Image
															src={src}
															alt={`Gallery preview ${idx + 1}`}
															width={300}
															height={300}
															className='h-24 w-24 object-cover rounded-lg border-2 border-gray-200'
														/>
														<Button
															variant='secondary'
															size='icon'
															type='button'
															className='absolute top-1 right-1 h-6 w-6 rounded-full shadow-md bg-white/70'
															aria-label={`Remove image ${idx + 1}`}
															onClick={() => {
																if (!isString) URL.revokeObjectURL(src)
																const newFiles = field.value?.filter(
																	(_, i) => i !== idx
																)
																field.onChange(newFiles)
																if (galleryPhotoRef.current)
																	galleryPhotoRef.current.value = ''
															}}>
															<X className='h-4 w-4' />
														</Button>
													</div>
												)
											})}
											{field.value.length < MAX_IMAGES && (
												<UploadFile
													css='h-24 w-24  max-w-24  max-h-24 border-2 border-dashed hover:border-gray-400 transition-colors'
													type='image'
													onClick={() => galleryPhotoRef.current?.click()}
													title='Add'
												/>
											)}
										</div>
									)}

									<FieldDescription>
										Upload up to {MAX_IMAGES} images. The first image will be
										used as the cover image.
									</FieldDescription>

									{localError && (
										<p className='text-red-500 text-sm mt-1'>{localError}</p>
									)}
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>

						{/* Categories */}
						<Controller
							name='categories'
							control={form.control}
							render={({field, fieldState}) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor='form-categories' className='text-md'>
										Categories
									</FieldLabel>
									<MultiSelect
										style={{background: 'red'}}
										options={(categories ?? []).map(cat => ({
											label: cat.name,
											value: cat.id
										}))}
										defaultValue={field.value || []}
										onValueChange={field.onChange}
										placeholder='Select categories'
									/>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>
					</FieldGroup>
				</form>
			</CardContent>
			<FieldSeparator className='mb-3' />
			<CardFooter>
				<Field orientation='horizontal' className='flex sm:justify-end'>
					<Button
						className='w-full sm:w-min'
						type='button'
						variant='outline'
						onClick={handleCancel}
						disabled={isSubmitting}>
						Cancel
					</Button>
					<Button
						className='w-full sm:w-min'
						type='submit'
						form='form-item'
						disabled={isSubmitting}>
						{isSubmitting ? (
							<>
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								Submitting...
							</>
						) : (
							'Submit'
						)}
					</Button>
				</Field>
			</CardFooter>
		</Card>
	)
}
