import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Redirect root to hub page
    if (pathname === '/') {
        return NextResponse.redirect(new URL('/hub', request.url));
    }

    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // Public routes that don't require authentication
    // Add any other public routes here
    const isPublicRoute =
        pathname.startsWith('/auth') ||
        pathname === '/login' ||
        pathname === '/signup';

    // 1. Enforce Authentication
    // If user is not logged in and tries to access protected route (anything not public)
    // Note: We avoid redirecting for static files due to matcher config, but extra safety check could be added

    // Check for mock session (Development only)
    const hasMockSession = request.cookies.get('mock-session')?.value === 'true';

    if (!user && !isPublicRoute && !hasMockSession) {
        const url = request.nextUrl.clone()
        url.pathname = '/auth/login'
        url.searchParams.set('next', pathname)
        return NextResponse.redirect(url)
    }

    // 2. Enforce RBAC (Role Based Access Control)
    if (user) {
        // Protect Admin Routes
        if (pathname.startsWith('/admin')) {
            const { data: merchant } = await supabase
                .from('merchants')
                .select('role')
                .eq('id', user.id)
                .single();

            // Default to 'viewer' or similar safe role if not found
            const role = merchant?.role || 'viewer';

            if (role !== 'admin') {
                // User is logged in but not an admin
                return NextResponse.redirect(new URL('/hub', request.url));
            }
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
