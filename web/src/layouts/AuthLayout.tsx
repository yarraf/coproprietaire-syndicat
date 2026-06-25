import { Outlet } from 'react-router-dom'
import { Building } from 'lucide-react'

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-primary-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-500 shadow-lg mb-4">
            <Building className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Syndic Manager</h1>
          <p className="text-sm text-primary-300 mt-1">Espace Agent Syndic</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
