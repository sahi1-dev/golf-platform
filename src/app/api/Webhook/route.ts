export const dynamic = 'force-dynamic';

import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripeSecret = process.env.STRIPE_SECRET_KEY || ''
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

// Fix: Version ko exact type mein cast kiya hai bina 'any' use kiye
const stripe = new Stripe(stripeSecret, {
  apiVersion: '2026-03-25.dahlia' as Stripe.LatestApiVersion,
})

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(req: Request) {
  if (!stripeSecret || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: "Configuration missing" }, { status: 500 })
  }

  const body = await req.text()
  const headerList = await headers()
  const signature = headerList.get('stripe-signature') as string

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: `Webhook Error: ${msg}` }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.userId

    if (userId) {
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ subscription_status: 'active' })
        .eq('id', userId)

      if (error) {
        console.error('Supabase Update Error:', error)
      }
    }
  }

  return NextResponse.json({ received: true })
}