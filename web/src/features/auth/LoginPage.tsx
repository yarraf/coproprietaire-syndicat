import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useAuthStore } from '@/store/auth'
import { login } from '@/api/auth'

const schema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(8, 'Le mot de passe doit comporter au moins 8 caractères'),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const { login: storeLogin, accessToken } = useAuthStore()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: ({ email, password }: FormValues) => login(email, password),
    onSuccess: (res) => {
      storeLogin(res.data)
      // La redirection est gérée par le render ci-dessous (accessToken change → re-render → Navigate)
    },
    onError: (err: unknown) => {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 401) {
        toast.error('Email ou mot de passe incorrect')
      } else {
        toast.error('Impossible de contacter le serveur. Vérifiez que l\'API est démarrée.')
      }
    },
  })

  // Dès que le token est présent (login réussi), redirection déclarative vers /dashboard
  if (accessToken) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((v) => mutate(v))} className="space-y-5">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-neutral-900">Connexion</h2>
          <p className="text-sm text-neutral-500 mt-1">Accédez à votre espace agent</p>
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse email</FormLabel>
              <FormControl>
                <Input placeholder="agent@syndic.ma" type="email" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mot de passe</FormLabel>
              <FormControl>
                <Input placeholder="••••••••" type="password" autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Se connecter
        </Button>
      </form>
    </Form>
  )
}
