"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="bottom-nav">
      <Link href="/" className={pathname === "/" ? "nav-link active" : "nav-link"}>
        Timer
      </Link>
      <Link href="/profile" className={pathname === "/profile" ? "nav-link active" : "nav-link"}>
        Profile
      </Link>
    </nav>
  )
}
