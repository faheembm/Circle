import { NextResponse } from 'next/server';

export function middleware(request) {
  // Replace dashboard redirect with chats
  return NextResponse.redirect(new URL('/chats', request.url));
}