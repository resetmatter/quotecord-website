'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  User,
  Mail,
  Calendar,
  Shield,
  Palette,
  Sun,
  Moon,
  Layers,
  Sparkles,
  Plus,
  Trash2,
  Check,
  Lock,
  Crown,
  RotateCcw,
  MonitorSmartphone
} from 'lucide-react'
import { getCurrentUser, UserProfile, isPremiumUser } from '@/lib/user'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

// Bot feature options based on the DisQuote bot (from actual repository)
const TEMPLATES = [
  { id: 'classic', name: 'Classic', description: 'Beautiful gradient design', icon: '🎨' },
  { id: 'discord', name: 'Discord', description: 'Pixel-perfect message replica', icon: '💬' },
  { id: 'profile', name: 'Profile', description: 'Avatar as background', icon: '👤' },
]

// Font categories from the bot (23 fonts total)
const FONT_CATEGORIES = {
  'Modern Sans-Serif': [
    { id: 'Inter', name: 'Inter' },
    { id: 'Poppins', name: 'Poppins' },
    { id: 'Lato', name: 'Lato' },
    { id: 'Raleway', name: 'Raleway' },
    { id: 'Roboto', name: 'Roboto' },
    { id: 'Open Sans', name: 'Open Sans' },
    { id: 'Source Sans Pro', name: 'Source Sans Pro' },
    { id: 'Montserrat', name: 'Montserrat' },
  ],
  'Rounded & Friendly': [
    { id: 'Nunito', name: 'Nunito' },
    { id: 'Comfortaa', name: 'Comfortaa' },
  ],
  'Display & Bold': [
    { id: 'Bebas Neue', name: 'Bebas Neue' },
    { id: 'Righteous', name: 'Righteous' },
  ],
  'Monospace': [
    { id: 'JetBrains Mono', name: 'JetBrains Mono' },
  ],
  'Script & Handwriting': [
    { id: 'Pacifico', name: 'Pacifico' },
    { id: 'Patrick Hand', name: 'Patrick Hand' },
    { id: 'Indie Flower', name: 'Indie Flower' },
  ],
  'Serif': [
    { id: 'Playfair Display', name: 'Playfair Display' },
  ],
  'Playful & Fun': [
    { id: 'Bangers', name: 'Bangers' },
    { id: 'Varela Round', name: 'Varela Round' },
    { id: 'Chewy', name: 'Chewy' },
    { id: 'Permanent Marker', name: 'Permanent Marker' },
    { id: 'Comic Neue', name: 'Comic Neue' },
    { id: 'Luckiest Guy', name: 'Luckiest Guy' },
  ],
}

// Flat list of all fonts for dropdowns
const ALL_FONTS = Object.values(FONT_CATEGORIES).flat()

// Popular fonts for quick selection (subset of most commonly used)
const POPULAR_FONTS = [
  { id: 'Raleway', name: 'Raleway' },
  { id: 'Inter', name: 'Inter' },
  { id: 'Poppins', name: 'Poppins' },
  { id: 'Montserrat', name: 'Montserrat' },
  { id: 'Roboto', name: 'Roboto' },
  { id: 'Playfair Display', name: 'Playfair Display' },
]

const THEMES = [
  { id: 'dark', name: 'Dark', icon: Moon },
  { id: 'light', name: 'Light', icon: Sun },
]

const ORIENTATIONS = [
  { id: 'landscape', name: 'Landscape' },
  { id: 'portrait', name: 'Portrait' },
]

interface Preset {
  id: string
  name: string
  template: string
  font: string
  theme: string
  orientation: string | null
  created_at: string
}

interface DefaultSettings {
  template: string
  font: string
  theme: string
  orientation: string
}

const MAX_PRESETS = 10

export default function SettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isPremium, setIsPremium] = useState(false)
  const [presets, setPresets] = useState<Preset[]>([])
  const [loadingPresets, setLoadingPresets] = useState(true)
  const [savingPreset, setSavingPreset] = useState(false)
  const [deletingPresetId, setDeletingPresetId] = useState<string | null>(null)

  // New preset form
  const [showNewPreset, setShowNewPreset] = useState(false)
  const [newPresetName, setNewPresetName] = useState('')
  const [newPresetTemplate, setNewPresetTemplate] = useState('classic')
  const [newPresetFont, setNewPresetFont] = useState('Raleway')
  const [newPresetTheme, setNewPresetTheme] = useState('dark')
  const [newPresetOrientation, setNewPresetOrientation] = useState('landscape')

  // Show all fonts toggle
  const [showAllFonts, setShowAllFonts] = useState(false)

  // Default settings (stored locally for now)
  const [defaultSettings, setDefaultSettings] = useState<DefaultSettings>({
    template: 'classic',
    font: 'Raleway',
    theme: 'dark',
    orientation: 'landscape'
  })
  const [savedDefaults, setSavedDefaults] = useState(false)

  useEffect(() => {
    async function loadData() {
      const userData = await getCurrentUser()
      setUser(userData)

      if (userData) {
        const premium = await isPremiumUser()
        setIsPremium(premium)

        // Load presets
        const { data: presetsData } = await supabase
          .from('presets')
          .select('*')
          .eq('user_id', userData.id)
          .order('created_at', { ascending: false })

        if (presetsData) {
          setPresets(presetsData)
        }

        // Load defaults from localStorage
        const savedDefaults = localStorage.getItem('quotecord_defaults')
        if (savedDefaults) {
          setDefaultSettings(JSON.parse(savedDefaults))
        }
      }
      setLoadingPresets(false)
    }
    loadData()
  }, [])

  const savePreset = async () => {
    if (!user || !newPresetName.trim()) return

    setSavingPreset(true)
    const { data, error } = await (supabase as any)
      .from('presets')
      .insert({
        user_id: user.id,
        name: newPresetName.trim(),
        template: newPresetTemplate,
        font: newPresetFont,
        theme: newPresetTheme,
        orientation: newPresetOrientation
      })
      .select()
      .single()

    if (!error && data) {
      setPresets([data, ...presets])
      setNewPresetName('')
      setShowNewPreset(false)
    }
    setSavingPreset(false)
  }

  const deletePreset = async (presetId: string) => {
    setDeletingPresetId(presetId)
    await supabase
      .from('presets')
      .delete()
      .eq('id', presetId)

    setPresets(presets.filter(p => p.id !== presetId))
    setDeletingPresetId(null)
  }

  const saveDefaultSettings = () => {
    localStorage.setItem('quotecord_defaults', JSON.stringify(defaultSettings))
    setSavedDefaults(true)
    setTimeout(() => setSavedDefaults(false), 2000)
  }

  const resetDefaults = () => {
    const defaults = {
      template: 'classic',
      font: 'Raleway',
      theme: 'dark',
      orientation: 'landscape'
    }
    setDefaultSettings(defaults)
    localStorage.setItem('quotecord_defaults', JSON.stringify(defaults))
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Profile Info */}
          <div className="glass rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-brand-400" />
              Profile
            </h2>

            <div className="flex items-center gap-4 mb-6">
              {user.discord_avatar ? (
                <Image
                  src={user.discord_avatar}
                  alt={user.discord_username || 'User'}
                  width={64}
                  height={64}
                  className="rounded-full ring-2 ring-brand-500/30"
                />
              ) : (
                <div className="w-16 h-16 bg-brand-500 rounded-full flex items-center justify-center ring-2 ring-brand-500/30">
                  <span className="text-2xl font-medium">
                    {user.discord_username?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
              <div>
                <p className="font-semibold text-lg">{user.discord_username}</p>
                <p className="text-sm text-gray-400">Connected via Discord</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-400">
                <div className="w-8 h-8 rounded-lg icon-bg flex items-center justify-center">
                  <User className="w-4 h-4 text-brand-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Discord ID</p>
                  <p className="text-sm text-white font-mono">{user.discord_id}</p>
                </div>
              </div>

              {user.email && (
                <div className="flex items-center gap-3 text-gray-400">
                  <div className="w-8 h-8 rounded-lg icon-bg flex items-center justify-center">
                    <Mail className="w-4 h-4 text-brand-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm text-white">{user.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Account Info */}
          <div className="glass rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-brand-400" />
              Account
            </h2>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-400">
                <div className="w-8 h-8 rounded-lg icon-bg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-brand-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Member Since</p>
                  <p className="text-sm text-white">Recently joined</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPremium ? 'icon-bg-pro' : 'icon-bg'}`}>
                  {isPremium ? (
                    <Crown className="w-4 h-4 text-pro-gold" />
                  ) : (
                    <Shield className="w-4 h-4 text-brand-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Subscription</p>
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium ${isPremium ? 'gradient-text-pro' : 'text-white'}`}>
                      {isPremium ? 'Premium' : 'Free'}
                    </p>
                    {!isPremium && (
                      <Link
                        href="/dashboard/billing"
                        className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
                      >
                        Upgrade
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Data & Privacy */}
          <div className="glass rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-brand-400" />
              Data & Privacy
            </h2>

            <p className="text-gray-400 text-sm mb-4">
              Your data is stored securely and is only used to provide the quotecord service.
              We never sell or share your data with third parties.
            </p>

            <div className="flex gap-4">
              <a
                href="/privacy"
                className="text-sm text-brand-400 hover:text-brand-300 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                className="text-sm text-brand-400 hover:text-brand-300 transition-colors"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Default Quote Settings */}
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-400" />
                Default Quote Settings
              </h2>
              <button
                onClick={resetDefaults}
                className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            <p className="text-sm text-gray-400 mb-4">
              Set your preferred defaults for generating quotes with the bot.
            </p>

            {/* Template Selection */}
            <div className="mb-4">
              <label className="text-xs text-gray-500 mb-2 block">Template</label>
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setDefaultSettings({ ...defaultSettings, template: template.id })}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      defaultSettings.template === template.id
                        ? 'border-brand-500 bg-brand-500/10'
                        : 'border-gray-700 hover:border-gray-600 bg-dark-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{template.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-white">{template.name}</p>
                        <p className="text-xs text-gray-500">{template.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Selection */}
            <div className="mb-4">
              <label className="text-xs text-gray-500 mb-2 block">Theme</label>
              <div className="flex gap-2">
                {THEMES.map((theme) => {
                  const Icon = theme.icon
                  return (
                    <button
                      key={theme.id}
                      onClick={() => setDefaultSettings({ ...defaultSettings, theme: theme.id })}
                      className={`flex-1 p-3 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                        defaultSettings.theme === theme.id
                          ? 'border-brand-500 bg-brand-500/10'
                          : 'border-gray-700 hover:border-gray-600 bg-dark-800/50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{theme.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Font Selection */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-gray-500">Font</label>
                <button
                  onClick={() => setShowAllFonts(!showAllFonts)}
                  className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
                >
                  {showAllFonts ? 'Show less' : `Show all 23 fonts`}
                </button>
              </div>

              {!showAllFonts ? (
                <div className="flex flex-wrap gap-2">
                  {POPULAR_FONTS.map((font) => (
                    <button
                      key={font.id}
                      onClick={() => setDefaultSettings({ ...defaultSettings, font: font.id })}
                      className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                        defaultSettings.font === font.id
                          ? 'border-brand-500 bg-brand-500/10 text-white'
                          : 'border-gray-700 hover:border-gray-600 bg-dark-800/50 text-gray-400'
                      }`}
                    >
                      {font.name}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {Object.entries(FONT_CATEGORIES).map(([category, fonts]) => (
                    <div key={category}>
                      <p className="text-xs text-gray-600 mb-1.5">{category}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {fonts.map((font) => (
                          <button
                            key={font.id}
                            onClick={() => setDefaultSettings({ ...defaultSettings, font: font.id })}
                            className={`px-2.5 py-1.5 rounded-md border text-xs transition-all ${
                              defaultSettings.font === font.id
                                ? 'border-brand-500 bg-brand-500/10 text-white'
                                : 'border-gray-700 hover:border-gray-600 bg-dark-800/50 text-gray-400'
                            }`}
                          >
                            {font.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Orientation Selection */}
            <div className="mb-4">
              <label className="text-xs text-gray-500 mb-2 block">Orientation</label>
              <div className="flex gap-2">
                {ORIENTATIONS.map((orientation) => (
                  <button
                    key={orientation.id}
                    onClick={() => setDefaultSettings({ ...defaultSettings, orientation: orientation.id })}
                    className={`flex-1 p-3 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                      defaultSettings.orientation === orientation.id
                        ? 'border-brand-500 bg-brand-500/10'
                        : 'border-gray-700 hover:border-gray-600 bg-dark-800/50'
                    }`}
                  >
                    <MonitorSmartphone className={`w-4 h-4 ${orientation.id === 'landscape' ? 'rotate-90' : ''}`} />
                    <span className="text-sm font-medium">{orientation.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={saveDefaultSettings}
              className={`w-full py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                savedDefaults
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-brand-500 hover:bg-brand-600 text-white'
              }`}
            >
              {savedDefaults ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                'Save Defaults'
              )}
            </button>
          </div>

          {/* Saved Presets */}
          <div className={`rounded-xl p-6 ${isPremium ? 'glass' : 'glass border-dashed border-gray-700'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Layers className="w-5 h-5 text-brand-400" />
                Saved Presets
                {isPremium && (
                  <span className="text-xs bg-pro-gold/20 text-pro-gold px-2 py-0.5 rounded-full">
                    PRO
                  </span>
                )}
              </h2>
              {isPremium && presets.length < MAX_PRESETS && (
                <button
                  onClick={() => setShowNewPreset(!showNewPreset)}
                  className="text-sm text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  New
                </button>
              )}
            </div>

            {!isPremium ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full icon-bg-pro flex items-center justify-center">
                  <Crown className="w-6 h-6 text-pro-gold" />
                </div>
                <p className="text-gray-400 text-sm mb-3">
                  Save up to {MAX_PRESETS} custom presets with Premium
                </p>
                <Link
                  href="/dashboard/billing"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-pro-amber to-pro-gold text-dark-900 font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  <Sparkles className="w-4 h-4" />
                  Upgrade to Premium
                </Link>
              </div>
            ) : (
              <>
                {/* New Preset Form */}
                {showNewPreset && (
                  <div className="mb-4 p-4 bg-dark-800/50 rounded-lg border border-gray-700">
                    <input
                      type="text"
                      placeholder="Preset name..."
                      value={newPresetName}
                      onChange={(e) => setNewPresetName(e.target.value)}
                      className="w-full px-3 py-2 mb-3 rounded-lg bg-dark-900 border border-gray-700 text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none transition-colors"
                      maxLength={30}
                    />

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <select
                        value={newPresetTemplate}
                        onChange={(e) => setNewPresetTemplate(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-dark-900 border border-gray-700 text-white text-sm focus:border-brand-500 focus:outline-none"
                      >
                        {TEMPLATES.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                      <select
                        value={newPresetFont}
                        onChange={(e) => setNewPresetFont(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-dark-900 border border-gray-700 text-white text-sm focus:border-brand-500 focus:outline-none"
                      >
                        {ALL_FONTS.map((f) => (
                          <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                      </select>
                      <select
                        value={newPresetTheme}
                        onChange={(e) => setNewPresetTheme(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-dark-900 border border-gray-700 text-white text-sm focus:border-brand-500 focus:outline-none"
                      >
                        {THEMES.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                      <select
                        value={newPresetOrientation}
                        onChange={(e) => setNewPresetOrientation(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-dark-900 border border-gray-700 text-white text-sm focus:border-brand-500 focus:outline-none"
                      >
                        {ORIENTATIONS.map((o) => (
                          <option key={o.id} value={o.id}>{o.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={savePreset}
                        disabled={!newPresetName.trim() || savingPreset}
                        className="flex-1 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors"
                      >
                        {savingPreset ? 'Saving...' : 'Save Preset'}
                      </button>
                      <button
                        onClick={() => setShowNewPreset(false)}
                        className="px-4 py-2 rounded-lg border border-gray-700 hover:border-gray-600 text-gray-400 text-sm transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Presets List */}
                {loadingPresets ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                  </div>
                ) : presets.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No presets saved yet</p>
                    <p className="text-xs mt-1">Create your first preset to get started</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {presets.map((preset) => (
                      <div
                        key={preset.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-dark-800/50 border border-gray-700/50 hover:border-gray-600 transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg icon-bg flex items-center justify-center flex-shrink-0">
                            <Palette className="w-4 h-4 text-brand-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-white truncate">{preset.name}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span className="capitalize">{preset.template}</span>
                              <span>•</span>
                              <span className="capitalize">{preset.theme}</span>
                              <span>•</span>
                              <span className="capitalize">{preset.font}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => deletePreset(preset.id)}
                          disabled={deletingPresetId === preset.id}
                          className="p-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          {deletingPresetId === preset.id ? (
                            <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    ))}

                    {presets.length >= MAX_PRESETS && (
                      <p className="text-xs text-gray-500 text-center pt-2">
                        Maximum {MAX_PRESETS} presets reached
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
