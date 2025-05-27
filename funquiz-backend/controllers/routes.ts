import loginRouter from './Login/routes.js'

export const routes = [loginRouter] as const

export type AppRoutes = typeof routes[number];