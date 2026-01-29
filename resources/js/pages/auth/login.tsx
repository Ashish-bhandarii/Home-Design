import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import oauth from '@/routes/oauth';
import { request } from '@/routes/password';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);
    const googleRedirectUrl = oauth.google.redirect().url;

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (isSubmitting || processing) return;
        
        setIsSubmitting(true);
        post('/login', {
            onFinish: () => {
                reset('password');
                setIsSubmitting(false);
            },
            onError: () => {
                setIsSubmitting(false);
            },
        });
    };
    
    return (
        <AuthLayout
            title="Log in to your account"
            description="Enter your email and password below to log in"
        >
            <Head title="Log in" />

            <div className="mb-6 grid gap-4">
                <a
                    href={googleRedirectUrl}
                    className="group relative inline-flex items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium shadow-sm transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:shadow dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20">
                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C33.047,6.053,28.715,4,24,4C12.955,4,4,12.955,4,24 s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657 C33.047,6.053,28.715,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.191-5.238C29.211,35.091,26.715,36,24,36 c-5.202,0-9.619-3.317-11.283-7.946l-6.533,5.034C9.505,39.556,16.227,44,24,44z"/>
                        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.793,2.238-2.231,4.166-3.994,5.571 c0.001-0.001,0.002-0.001,0.003-0.002l6.191,5.238C36.973,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                    </svg>
                    <span className="text-zinc-700 dark:text-zinc-200">Continue with Google</span>
                </a>
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-zinc-200 dark:border-zinc-700" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-3 text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
                            Or continue with email
                        </span>
                    </div>
                </div>
            </div>

            {/* Success status message (e.g., after password reset) */}
            {status && (
                <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-4 text-center text-sm font-medium text-green-600 dark:bg-green-950/30 dark:border-green-800 dark:text-green-400">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-6">
                {/* General error message for failed authentication */}
                {errors.email && (
                    <div className="rounded-lg bg-red-50 border border-red-200 p-4 dark:bg-red-950/30 dark:border-red-800">
                        <p className="text-sm text-red-600 dark:text-red-400">
                            {errors.email}
                        </p>
                    </div>
                )}
                
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            placeholder="email@example.com"
                            className={errors.email ? 'border-red-500' : ''}
                        />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            {canResetPassword && (
                                <TextLink
                                    href={request()}
                                    className="ml-auto text-sm"
                                    tabIndex={5}
                                >
                                    Forgot password?
                                </TextLink>
                            )}
                        </div>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                placeholder="Password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute inset-y-0 right-2 my-auto rounded px-2 text-xs text-muted-foreground hover:bg-muted"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                tabIndex={-1}
                            >
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onCheckedChange={(checked) => setData('remember', checked === true)}
                            tabIndex={3}
                        />
                        <Label htmlFor="remember" className="text-sm text-zinc-600 dark:text-zinc-400">Remember me</Label>
                    </div>

                    <Button
                        type="submit"
                        className="mt-4 w-full h-11 rounded-lg bg-zinc-900 text-white font-semibold hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 transition-colors dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                        tabIndex={4}
                        disabled={processing || isSubmitting}
                        data-test="login-button"
                    >
                        {(processing || isSubmitting) && <Spinner />}
                        {processing || isSubmitting ? 'Logging in...' : 'Log in'}
                    </Button>
                </div>

                {canRegister && (
                    <div className="text-center text-sm text-zinc-600 dark:text-zinc-400">
                        Don't have an account?{' '}
                        <TextLink href={register()} tabIndex={5} className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
                            Sign up
                        </TextLink>
                    </div>
                )}
            </form>
        </AuthLayout>
    );
}
