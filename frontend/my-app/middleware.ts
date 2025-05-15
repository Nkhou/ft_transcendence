// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import Cookies from 'js-cookie' // Import cookies (you might need to adjust this)

export function middleware(req: NextRequest) {
  // Retrieve cookies from the incoming request
  const cookies = req.headers.get('cookie') || ''
  const token = cookies && Cookies.get('refresh' )
  
  
  if (!token) {
    
    return NextResponse.redirect(new URL('/login-signup', req.url))
  }


  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard', '/chat', '/game', '/tournament'],
}
