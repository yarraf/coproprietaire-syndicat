import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/PageHeader'
import { useAuthStore } from '@/store/auth'
import { User, Mail, Shield } from 'lucide-react'

export function ParametresPage() {
  const { user } = useAuthStore()

  return (
    <div>
      <PageHeader title="Paramètres" description="Informations de votre compte agent" />

      <div className="max-w-xl">
        <Card>
          <CardHeader><CardTitle>Profil agent</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                <User className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-neutral-400">Identifiant</p>
                <p className="text-sm font-medium text-neutral-900 font-mono">{user?.id?.slice(0, 8)}...</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-neutral-400">Adresse email</p>
                <p className="text-sm font-medium text-neutral-900">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-neutral-400">Rôle</p>
                <p className="text-sm font-medium text-neutral-900 capitalize">{user?.role}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
