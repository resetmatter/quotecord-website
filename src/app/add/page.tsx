import { redirect } from 'next/navigation'

// This page redirects to the Discord bot invite link
// Replace the URL with your actual bot invite link

export default function AddBotPage() {
  // Replace with your actual Discord bot invite URL
  // You can get this from the Discord Developer Portal
  const BOT_INVITE_URL = 'https://discord.com/api/oauth2/authorize?client_id=YOUR_BOT_CLIENT_ID&permissions=2147485696&scope=bot%20applications.commands'

  redirect(BOT_INVITE_URL)
}
