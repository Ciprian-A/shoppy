'use client'

import {create} from 'zustand'
import {persist} from 'zustand/middleware'

import {StoreSlice, createStoreSlice} from './app/(store)/store/storeSlice'

const useStore = create<StoreSlice>()(
	persist(
		(...a) => ({
			...createStoreSlice(...a)
		}),
		{
			name: 'shoppy-store'
		}
	)
)

export default useStore
