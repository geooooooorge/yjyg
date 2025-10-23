@echo off
git commit -m "Fix settings API: gracefully fallback to memory storage when Vercel KV is not configured"
git push origin main
