import PasswordStrength from '@/components/auth/PasswordStrength';
import { login } from '@/routes';
import { store } from '@/routes/register';
import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [pw, setPw] = useState('');
    return (
        <AuthLayout
            title="Create an account"
            description="Enter your details below to create your account"
        >
            <Head title="Register" />
            <div className="mb-6 grid gap-4">
                <a
                    href="/auth/google/redirect"
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
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Full name"
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        tabIndex={3}
                                        autoComplete="new-password"
                                        name="password"
                                        placeholder="Password"
                                        onChange={(e) => setPw(e.target.value)}
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
                                <PasswordStrength value={pw} />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirm password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password_confirmation"
                                        type={showConfirm ? 'text' : 'password'}
                                        required
                                        tabIndex={4}
                                        autoComplete="new-password"
                                        name="password_confirmation"
                                        placeholder="Confirm password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm((v) => !v)}
                                        className="absolute inset-y-0 right-2 my-auto rounded px-2 text-xs text-muted-foreground hover:bg-muted"
                                        aria-label={showConfirm ? 'Hide password' : 'Show password'}
                                        tabIndex={-1}
                                    >
                                        {showConfirm ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full h-11 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all hover:scale-[1.02]"
                                tabIndex={5}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                Create account
                            </Button>
                            <p className="text-center text-[11px] text-zinc-500 dark:text-zinc-400">
                                By creating an account, you agree to our
                                <a href="#" className="ml-1 text-orange-500 hover:text-orange-600 underline underline-offset-4">Terms</a>
                                <span className="mx-1">and</span>
                                <a href="#" className="text-orange-500 hover:text-orange-600 underline underline-offset-4">Privacy Policy</a>.
                            </p>
                        </div>

                        <div className="text-center text-sm text-zinc-600 dark:text-zinc-400">
                            Already have an account?{' '}
                            <TextLink href={login()} tabIndex={6} className="font-semibold text-orange-500 hover:text-orange-600">
                                Log in
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
