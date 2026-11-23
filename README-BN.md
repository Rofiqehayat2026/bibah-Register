# রফিকে হায়াত — ফোন নম্বর ও পাসওয়ার্ড সহায়তা আপডেট

## এই প্যাকেজে কী পরিবর্তন আছে

- রেজিস্ট্রেশন, সদস্য লগইন ও পাসওয়ার্ড সহায়তা ফর্মে বাংলাদেশি মোবাইল নম্বরকে `01XXXXXXXXX` (১১ ডিজিট) ফরম্যাটে normalize করা হয়।
- `01XXXXXXXXX`, `8801XXXXXXXXX`, `+8801XXXXXXXXX`, `008801XXXXXXXXX` এবং বাংলা অঙ্ক দেওয়া হলে সেগুলো স্থানীয় ১১ ডিজিটে রূপান্তর করা হয়।
- `supabase/functions/admin-reset-password/index.ts` আপডেট করা হয়েছে। এটি লগইন করা `admin` বা `super_admin`-এর অনুমতি যাচাই করে এবং সদস্যের `profiles.phone`-এ canonical ১১ ডিজিট নম্বর খোঁজে।
- `member-dashboard (2).html`-এর নাম বদলে `member-dashboard.html` করা হয়েছে। প্যাকেজের অন্যান্য ফাইলে পুরোনো নামের কোনো রেফারেন্স পাওয়া যায়নি।

## ইনস্টল করার ধাপ

1. ZIP Extract করুন।
2. Supabase SQL Editor-এ `supabase/normalize-profile-phones.sql` চালান। এটি পুরোনো `profiles.phone` এবং পাসওয়ার্ড রিসেট অনুরোধের নম্বরকে ১১ ডিজিটে রূপান্তর করবে। যদি একাধিক প্রোফাইলে একই normalized নম্বর পাওয়া যায়, স্ক্রিপ্ট কোনো পরিবর্তন না করে error দেবে; আগে duplicate ঠিক করতে হবে। যেসব পুরোনো নম্বর বাংলাদেশি মোবাইল নম্বর হিসেবে চেনা যাবে না, সেগুলো অপরিবর্তিত থাকবে।
3. Supabase Dashboard → Edge Functions → `admin-reset-password` → Code Editor-এ যান। `supabase/functions/admin-reset-password/index.ts`-এর সম্পূর্ণ কোড বসিয়ে **Deploy/Redeploy** করুন। আগের deployed code এই আপডেটের পরে আর ব্যবহার করবেন না।
4. GitHub repository-তে প্যাকেজের ওয়েবসাইট ফাইলগুলো তাদের বর্তমান অবস্থানে আপলোড/replace করুন। `member-dashboard.html`-কে নতুন নাম হিসেবে রাখুন; পুরোনো `member-dashboard (2).html` সরিয়ে দিন।
5. GitHub-এ Commit করুন। Vercel-এর Git integration থাকলে নতুন Deployment স্বয়ংক্রিয়ভাবে শুরু হবে। Deployment `Ready` হলে পরীক্ষা করুন।

## গুরুত্বপূর্ণ

- `profiles` টেবিলে `id`, `phone`, `role` কলাম থাকতে হবে। অ্যাডমিনের `role` হবে `admin` অথবা `super_admin`।
- `bright-api` Edge Function আগের মতোই থাকতে হবে এবং `identifier` হিসেবে ১১ ডিজিটের ফোন নম্বর গ্রহণ করতে হবে। আপডেট করা login page এখন ফোন নম্বরকে ওই ফরম্যাটে পাঠায়।
- `SUPABASE_SERVICE_ROLE_KEY` কখনো HTML/JavaScript বা GitHub-এর client-side ফাইলে রাখবেন না।
- ZIP-এর `supabase/password-reset-setup.sql` হলো আগের টেবিল/RPC setup; সেটি ইতিমধ্যে চালানো থাকলে আবার চালানোর দরকার নেই। শুধু `normalize-profile-phones.sql` চালাতে হবে।
