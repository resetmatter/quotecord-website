import Link from 'next/link'

const CLIENT_ID = '1439621877285785711'

// Server install: bot with slash commands
const SERVER_INSTALL_URL = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&permissions=2147485696&integration_type=0&scope=bot+applications.commands`

// User install: user app with slash commands
const USER_INSTALL_URL = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&integration_type=1&scope=applications.commands`

export default function AddBotPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Add Quotecord</h1>
          <p className="text-gray-400">Choose how you want to use Quotecord</p>
        </div>

        <div className="space-y-4">
          {/* User App Install */}
          <a
            href={USER_INSTALL_URL}
            className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg p-6 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="bg-indigo-500 rounded-full p-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <div className="text-left">
                <h2 className="text-lg font-semibold">Install as User App</h2>
                <p className="text-indigo-200 text-sm">Use Quotecord anywhere on Discord, even in servers where it&apos;s not installed</p>
              </div>
            </div>
          </a>

          {/* Server Install */}
          <a
            href={SERVER_INSTALL_URL}
            className="block w-full bg-gray-700 hover:bg-gray-600 text-white rounded-lg p-6 transition-colors border border-gray-600"
          >
            <div className="flex items-center gap-4">
              <div className="bg-gray-600 rounded-full p-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div className="text-left">
                <h2 className="text-lg font-semibold">Add to Server</h2>
                <p className="text-gray-400 text-sm">Install Quotecord to your server for all members to use</p>
              </div>
            </div>
          </a>
        </div>

        <div className="text-center">
          <Link href="/" className="text-gray-500 hover:text-gray-400 text-sm">
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  )
}
