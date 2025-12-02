'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Users,
  Plus,
  Search,
  Trash2,
  Shield,
  Crown,
  CheckCircle,
  AlertTriangle,
  X,
  RefreshCw,
  User
} from 'lucide-react'

interface AdminUser {
  id: string
  discordId: string
  role: 'admin' | 'super_admin'
  name: string | null
  createdBy: string | null
  createdAt: string
}

export default function AdminUsersPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    discordId: '',
    role: 'admin' as 'admin' | 'super_admin',
    name: '',
    createdBy: ''
  })

  const getApiKey = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminApiKey') || ''
    }
    return ''
  }

  const setApiKey = (key: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminApiKey', key)
    }
  }

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${getApiKey()}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch admin users')
      }

      const data = await response.json()
      setAdmins(data.admins || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch admin users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAdmins()
  }, [fetchAdmins])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [success])

  const handleOpenModal = () => {
    setFormData({
      discordId: '',
      role: 'admin',
      name: '',
      createdBy: ''
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.discordId.trim()) {
      setError('Discord ID is required')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getApiKey()}`
        },
        body: JSON.stringify({
          discordId: formData.discordId.trim(),
          role: formData.role,
          name: formData.name.trim() || null,
          createdBy: formData.createdBy.trim() || null
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add admin user')
      }

      setSuccess('Admin user added successfully')
      setShowModal(false)
      fetchAdmins()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add admin user')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (discordId: string, name: string | null) => {
    if (!confirm(`Are you sure you want to remove admin access for ${name || discordId}?`)) {
      return
    }

    try {
      setDeleting(discordId)
      setError(null)

      const response = await fetch(`/api/admin/users?discordId=${discordId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getApiKey()}`
        }
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to remove admin user')
      }

      setSuccess('Admin user removed successfully')
      fetchAdmins()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove admin user')
    } finally {
      setDeleting(null)
    }
  }

  const filteredAdmins = admins.filter(admin =>
    admin.discordId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.createdBy?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="max-w-4xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Admin Users</h1>
            <p className="text-sm text-dark-400">Manage who can access the admin dashboard</p>
          </div>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-medium py-2.5 px-4 rounded-xl transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Admin
        </button>
      </div>

      {/* API Key Input */}
      <div className="glass rounded-xl p-4 mb-6">
        <label className="block text-xs text-dark-500 mb-2">Admin API Key</label>
        <input
          type="password"
          placeholder="Enter your BOT_API_KEY or ADMIN_API_KEY"
          defaultValue={getApiKey()}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500 transition-colors"
        />
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-success/10 border border-success/50 rounded-xl p-4 mb-6 flex items-center gap-3 animate-slide-down">
          <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
          <p className="text-sm text-success">{success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-error/10 border border-error/50 rounded-xl p-4 mb-6 flex items-center gap-3 animate-slide-down">
          <AlertTriangle className="w-5 h-5 text-error flex-shrink-0" />
          <p className="text-sm text-error">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-dark-800 rounded-lg transition-colors">
            <X className="w-4 h-4 text-dark-400" />
          </button>
        </div>
      )}

      {/* Search and Refresh */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
          <input
            type="text"
            placeholder="Search by Discord ID, name, or creator..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-dark-800/50 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
        <button
          onClick={fetchAdmins}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-dark-800 hover:bg-dark-700 rounded-xl border border-dark-700 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Admins List */}
      <div className="glass rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-dark-600 mx-auto mb-3" />
            <p className="text-dark-400">
              {searchQuery ? 'No admins match your search' : 'No admin users configured'}
            </p>
            <p className="text-sm text-dark-500 mt-1">
              {searchQuery ? 'Try a different search term' : 'Add your first admin to get started'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-dark-800">
            {filteredAdmins.map((admin) => (
              <div
                key={admin.discordId}
                className="p-4 sm:p-6 hover:bg-dark-800/30 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Admin Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      admin.role === 'super_admin' ? 'bg-pro-gold/20' : 'bg-brand-500/20'
                    }`}>
                      {admin.role === 'super_admin' ? (
                        <Crown className="w-5 h-5 text-pro-gold" />
                      ) : (
                        <Shield className="w-5 h-5 text-brand-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {admin.name && (
                          <span className="font-medium">{admin.name}</span>
                        )}
                        <code className="text-sm font-mono bg-dark-800 px-2 py-0.5 rounded">
                          {admin.discordId}
                        </code>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          admin.role === 'super_admin'
                            ? 'bg-pro-gold/20 text-pro-gold'
                            : 'bg-brand-500/20 text-brand-400'
                        }`}>
                          {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-dark-500">
                        {admin.createdBy && (
                          <span>Added by {admin.createdBy}</span>
                        )}
                        <span>Added {formatDate(admin.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => handleDelete(admin.discordId, admin.name)}
                    disabled={deleting === admin.discordId}
                    className="p-2 hover:bg-error/20 rounded-lg transition-colors text-dark-400 hover:text-error disabled:opacity-50"
                    title="Remove admin"
                  >
                    {deleting === admin.discordId ? (
                      <div className="w-4 h-4 border-2 border-error/30 border-t-error rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      {!loading && admins.length > 0 && (
        <div className="flex items-center justify-between mt-4 text-sm text-dark-500">
          <span>{filteredAdmins.length} of {admins.length} admins shown</span>
          <span>{admins.filter(a => a.role === 'super_admin').length} super admins</span>
        </div>
      )}

      {/* Add Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => !saving && setShowModal(false)}
          />

          {/* Modal Content */}
          <div className="relative glass rounded-2xl max-w-md w-full animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-dark-800">
              <h2 className="text-lg font-semibold">Add Admin User</h2>
              <button
                onClick={() => !saving && setShowModal(false)}
                className="p-2 hover:bg-dark-800 rounded-lg transition-colors text-dark-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              {/* Discord ID */}
              <div>
                <label className="block text-sm font-medium mb-2">Discord ID *</label>
                <input
                  type="text"
                  placeholder="e.g., 123456789012345678"
                  value={formData.discordId}
                  onChange={(e) => setFormData(prev => ({ ...prev, discordId: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500 transition-colors font-mono"
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Display Name</label>
                <input
                  type="text"
                  placeholder="e.g., John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'admin', label: 'Admin', icon: Shield },
                    { value: 'super_admin', label: 'Super Admin', icon: Crown },
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setFormData(prev => ({ ...prev, role: option.value as 'admin' | 'super_admin' }))}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                        formData.role === option.value
                          ? option.value === 'super_admin'
                            ? 'border-pro-gold bg-pro-gold/20 text-pro-gold'
                            : 'border-brand-500 bg-brand-500/20 text-brand-400'
                          : 'border-dark-700 hover:border-dark-600 text-dark-400'
                      }`}
                    >
                      <option.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Created By */}
              <div>
                <label className="block text-sm font-medium mb-2">Added By</label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={formData.createdBy}
                  onChange={(e) => setFormData(prev => ({ ...prev, createdBy: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-dark-800">
              <button
                onClick={() => setShowModal(false)}
                disabled={saving}
                className="px-4 py-2.5 bg-dark-800 hover:bg-dark-700 rounded-xl border border-dark-700 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.discordId.trim()}
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-medium py-2.5 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add Admin
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
