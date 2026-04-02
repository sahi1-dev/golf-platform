import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // FIXED: Type casting to avoid 'any' error
  apiVersion: '2023-10-16' as Stripe.StripeConfig['apiVersion'], 
})

export async function POST(req: Request) {
  try {
    const { email, userId } = await req.json()

    if (!email || !userId) {
      return NextResponse.json({ error: 'Missing User Data' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Impact Pro Plan',
              description: 'Unlimited Golf Round Tracking & Charity Support',
            },
            unit_amount: 2000, // $20.00
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard?canceled=true`,
      customer_email: email,
      metadata: { userId },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (err: unknown) {
    // FIXED: Proper error handling without 'any'
    const errorMessage = err instanceof Error ? err.message : 'Internal Server Error';
    console.error('STRIPE ERROR:', errorMessage)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}