import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import { MantineProvider } from '@mantine/core'
import { rtlCache } from '../rtl-cache'

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <div dir="ltr">
        <MantineProvider
          withGlobalStyles
          withNormalizeCSS
          theme={{
            colorScheme: 'dark',
            fontFamily: 'Open Sans, sans serif',
            spacing: { xs: 15, sm: 20, md: 25, lg: 30, xl: 40 },
          }}
        >
          <Component {...pageProps} />
        </MantineProvider>
      </div>
    </SessionProvider>
  )
}
