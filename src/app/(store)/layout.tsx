export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

import AuthRequiredModal from '@/components/AuthRequiredModal'
import ClientLayout from '@/components/ClientLayout.tsx'
import Header from '@/components/Header'
import {SidebarProvider} from '@/components/ui/sidebar'
// Ensure the BroadcastChannel listener is set up
import {ClerkProvider} from '@clerk/nextjs'
// import type {Metadata} from 'next'
import '../globals.css'
// import { favoritesChannel } from '@/lib/favoritesChannel'
// export const metadata: Metadata = {
// 	title: 'Shoppy - Home',
// 	description: 'Shoppy E-Commerce app'
// }

export default async function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<ClerkProvider dynamic>
			<html lang='en'>
				<body className={` antialiased`}>
					<main>
						<Header />
						<SidebarProvider>
							<ClientLayout>{children}</ClientLayout>
						</SidebarProvider>
						<AuthRequiredModal />
						{/* <StoreSync /> */}
					</main>
				</body>
			</html>
		</ClerkProvider>
	)
}
