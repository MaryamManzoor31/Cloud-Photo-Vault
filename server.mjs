import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { withSupabase } from '@supabase/server/adapters/hono'

const app = new Hono()

app.get('/api/health', (c) => c.json({ status: 'ok' }))

app.get('/api/me', withSupabase({ auth: 'user' }), async (c) => {
  const { supabase, userClaims } = c.var.supabaseContext

  if (!userClaims) {
    return c.json({ error: 'Authentication required' }, 401)
  }

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    console.error('Failed to retrieve authenticated Supabase user:', error)
    return c.json({ error: 'Unable to retrieve authenticated user' }, 502)
  }

  if (!user) {
    return c.json({ error: 'Authenticated user not found' }, 401)
  }

  return c.json({
    user: {
      id: user.id,
      email: user.email,
    },
  })
})

const port = Number(process.env.PORT ?? 3000)

if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error('PORT must be an integer between 1 and 65535')
}

serve({ fetch: app.fetch, port })
