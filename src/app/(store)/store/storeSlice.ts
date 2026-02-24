import {StateCreator} from 'zustand'

export type Basket = {
	uniqueKey: string
	productId: string
	name: string
	slug: string
	price: number
	size: ItemSize
	quantity: number
	image: string
}

type StoreState = {
	favouriteItemIds: string[]
	selectedSizes: Record<string, ItemSize>
	selectedQuantities: Record<string, number>
	basket: Record<string, Basket>
}
export type ItemSize =
	| '5'
	| '5.5'
	| '6'
	| '6.5'
	| '7'
	| '7.5'
	| '8'
	| '8.5'
	| '9'
	| '9.5'
	| '10'
	| '10.5'
	| '11'
	| '11.5'
	| '12'
	| '12.5'
	| 'XS'
	| 'S'
	| 'M'
	| 'L'
	| 'XL'
	| '2XL'
	| '3XL'
	| ''
type StoreActions = {
	updateFavouriteItem: (itemId: string) => void
	setSelectedSize: (id: string, size: ItemSize) => void
	getSelectedSize: (id: string) => ItemSize
	setSelectedQuantity: (id: string, qty: number) => void
	getSelectedQuantity: (id: string) => number
	addItemToBasket: (item: Basket) => void
	removeItemFromBasket: (key: string) => void
	incrementItemCount: (itemId: string) => void
	decrementItemCount: (itemId: string) => void
	getItemCount: (itemId: string) => number
	getTotalPrice: () => number
	clearBasket: () => void
}

export type StoreSlice = StoreState & StoreActions

export const createStoreSlice: StateCreator<StoreSlice, [], [], StoreSlice> = (
	set,
	get
) => ({
	favouriteItemIds: [],
	selectedSizes: {},
	selectedQuantities: {},
	basket: {},
	setSelectedSize: (id, size) => {
		set(state => ({
			selectedSizes: {
				...state.selectedSizes,
				[id]: size
			}
		}))
	},
	getSelectedSize: productId => get().selectedSizes[productId] ?? '',
	setSelectedQuantity: (productId, qty) =>
		set(state => ({
			selectedQuantities: {
				...state.selectedQuantities,
				[productId]: qty
			}
		})),
	getSelectedQuantity: productId => get().selectedQuantities[productId] ?? 1,
	updateFavouriteItem: itemId =>
		set(state => ({
			favouriteItemIds: state.favouriteItemIds.includes(itemId)
				? state.favouriteItemIds.filter(id => id !== itemId)
				: [...state.favouriteItemIds, itemId]
		})),

	addItemToBasket: item =>
		set(state => {
			const basket = {...state.basket}
			basket[item.uniqueKey] = item
			return {basket}
		}),
	removeItemFromBasket: key =>
		set(state => {
			const basket = {...state.basket}
			delete basket[key]
			return {basket}
		}),
	incrementItemCount: key =>
		set(state => {
			const basket = {...state.basket}
			const item = basket[key]
			if (!item) return {basket}
			basket[key] = {
				...item,
				quantity: item.quantity + 1
			}
			return {
				basket
			}
		}),
	decrementItemCount: key =>
		set(state => {
			const basket = {...state.basket}
			const item = basket[key]
			if (!item) return {basket}

			const newQty = item.quantity - 1
			if (newQty <= 0) {
				delete basket[key]
			} else {
				basket[key] = {
					...item,
					quantity: newQty
				}
			}

			return {
				basket
			}
		}),
	getItemCount: key => {
		const item = get().basket[key]
		return item ? item.quantity : 0
	},
	getTotalPrice: () => {
		const basket = get().basket
		return Object.values(basket).reduce(
			(total, item) => total + item.price * item.quantity,
			0
		)
	},
	clearBasket: () => set({basket: {}})
})
