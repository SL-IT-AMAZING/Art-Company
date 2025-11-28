import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container flex flex-col gap-4 py-10 md:flex-row md:justify-between">
        <div>
          <h3 className="text-lg font-bold mb-2">ART WIZARD</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            AI-powered Digital Curator Service
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div>
            <h4 className="font-semibold mb-3">Services</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/curation" className="text-muted-foreground hover:text-foreground">
                  AI Curator
                </Link>
              </li>
              <li>
                <Link href="/exhibition" className="text-muted-foreground hover:text-foreground">
                  Online Exhibition
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Info</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  About
                </Link>
              </li>
              <li>
                <Link href="/notice" className="text-muted-foreground hover:text-foreground">
                  Notice
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Account</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/login" className="text-muted-foreground hover:text-foreground">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-muted-foreground hover:text-foreground">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link href="/mypage" className="text-muted-foreground hover:text-foreground">
                  My Page
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="container border-t py-6">
        <p className="text-center text-sm text-muted-foreground">
          © 2025 ART WIZARD. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
