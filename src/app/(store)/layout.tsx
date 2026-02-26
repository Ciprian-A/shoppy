import AuthRequiredModal from '@/components/AuthRequiredModal'
import ClientLayout from '@/components/ClientLayout.tsx'
import Header from '@/components/Header'
import {SidebarProvider} from '@/components/ui/sidebar'
import {ClerkProvider} from '@clerk/nextjs'
import type {Metadata} from 'next'
import '../globals.css'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: 'Shoppy - Home',
		description: 'Shoppy E-Commerce app'
	}
}

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
					</main>
				</body>
			</html>
		</ClerkProvider>
	)
}
