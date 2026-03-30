import type { ReactNode } from "react"
import { Providers } from "@/components/providers"
import "./globals.css"

type RootLayoutProps = {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta name="base:app_id" content="69c655f1638fc70642e549df" />
        <meta
          name="talentapp:project_verification"
          content="0967411a6423407b46abd93edd0631dc82361bbb22b281e2f06efc5d9aac21a9cafeaf00561aeae0e9fa1a33bc586de7d5e84c1180084f327a1d041735bd4bb3"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <title>Pomodoro</title>
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
