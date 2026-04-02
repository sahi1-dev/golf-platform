export const dynamic = 'force-dynamic';

import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  // Runtime Initialization: Build-time pe crash nahi hoga
  const stripeSecret = process.env.STRIPE_SECRET_KEY || ''
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

  // Stripe Setup with Exact Version Type-Casting
  const stripe = new Stripe(stripeSecret, {
    apiVersion: '2026-03-25.dahlia' as Stripe.LatestApiVersion,
  })

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

  // Safety Check
  if (!stripeSecret || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Environment Variables");
    return NextResponse.json({ error: "Configuration missing" }, { status: 500 })
  }

  const body = await req.text()
  const headerList = await headers()
  const signature = headerList.get('stripe-signature') as string

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  try {
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId

      if (userId) {
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({ subscription_status: 'active' })
          .eq('id', userId)

        if (updateError) {
          console.error('Supabase Update Error:', updateError)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    // ESLint fix: 'err' is now used in console
    console.error("Webhook Error Details:", err)
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 })
  }
}