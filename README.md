# ⛳ Impact_Dashboard (v1.0.6)

### **Real-time Performance Tracking & Social Impact Engine**
Impact_Dashboard is a high-performance web application built with **Next.js 14** and **Supabase**. It allows users to log their performance scores in real-time, with a built-in "Impact Factor" that contributes to social causes.

---

## 🚀 Core Features

* **⚡ Real-time Data Sync:** Uses Supabase's `postgres_changes` to reflect score updates instantly across the dashboard without page refreshes.
* **🛡️ Smart Submission Logic:** Integrated 5-minute cooldown timer to prevent spam and ensure data integrity.
* **💳 Pro Tier Integration:** Seamless **Stripe Checkout** for users to upgrade and unlock advanced scoring features.
* **🌍 Social Impact Engine:** Automated calculation of charity contributions based on user performance.
* **🌑 Cyber-Dark UI:** A high-contrast, modern aesthetic built with **Tailwind CSS** and **Lucide React** icons.

---

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| **Backend** | Supabase (Auth, Database, Realtime) |
| **Payments** | Stripe API |
| **Icons** | Lucide React |
| **Deployment** | Vercel |

---

## ⚙️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/sahi1-dev/golf-platform.git](https://github.com/sahi1-dev/golf-platform.git)
   cd golf-platform
   Install dependencies:

Bash
npm install
Set up Environment Variables:
Create a .env.local file and add your credentials:

Code snippet
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_pk
STRIPE_SECRET_KEY=your_stripe_sk
Run the development server:

Bash
npm run dev
📂 Project Structure
Plaintext
├── app/                # Next.js App Router (Pages & API)
├── components/         # Reusable UI Components
├── lib/               # Supabase & Stripe configurations
├── public/            # Static assets
└── types/             # TypeScript Interfaces
👨‍💻 System Architect
Md Sahil Specialization: AI / ML & Web Engineering Galgotias University


### Ab Jaldi se ye Commands terminal mein chala:

```bash
# 1. README file ko add karo
git add README.md

# 2. Commit karo
git commit -m "Added professional README for submission"

# 3. GitHub par push maaro
git push origin main
