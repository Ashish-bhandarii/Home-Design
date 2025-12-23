import { cn } from '@/lib/utils';
import { SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function FlashMessage() {
    const { flash } = usePage<SharedData>().props;
    const [show, setShow] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [type, setType] = useState<'success' | 'error' | 'message'>('message');
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        if (flash.success) {
            setMessage(flash.success);
            setType('success');
            setShow(true);
            setProgress(100);
        } else if (flash.error) {
            setMessage(flash.error);
            setType('error');
            setShow(true);
            setProgress(100);
        } else if (flash.message) {
            setMessage(flash.message);
            setType('message');
            setShow(true);
            setProgress(100);
        }
    }, [flash]);

    useEffect(() => {
        if (show) {
            // Start progress animation
            const startTime = Date.now();
            const duration = 4000;
            
            const interval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
                setProgress(remaining);
                
                if (remaining === 0) {
                    setShow(false);
                    clearInterval(interval);
                }
            }, 10);

            return () => clearInterval(interval);
        }
    }, [show]);

    const icons = {
        success: <CheckCircle2 className="h-6 w-6 text-emerald-500" />,
        error: <AlertCircle className="h-6 w-6 text-rose-500" />,
        message: <Info className="h-6 w-6 text-blue-500" />,
    };

    const styles = {
        success: 'border-emerald-100 bg-emerald-50/90 dark:border-emerald-900/30 dark:bg-emerald-950/90',
        error: 'border-rose-100 bg-rose-50/90 dark:border-rose-900/30 dark:bg-rose-950/90',
        message: 'border-blue-100 bg-blue-50/90 dark:border-blue-900/30 dark:bg-blue-950/90',
    };

    const progressStyles = {
        success: 'bg-emerald-500',
        error: 'bg-rose-500',
        message: 'bg-blue-500',
    };

    return (
        <div className="fixed top-4 right-4 z-[100] flex w-full max-w-md flex-col gap-2 sm:top-6 sm:right-6">
            <Transition
                show={show}
                enter="transform ease-out duration-300 transition"
                enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
                enterTo="translate-y-0 opacity-100 sm:translate-x-0"
                leave="transition ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0 scale-95"
            >
                <div
                    className={cn(
                        'relative overflow-hidden rounded-2xl border p-4 shadow-2xl backdrop-blur-md transition-all',
                        styles[type]
                    )}
                >
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 pt-0.5">
                            {icons[type]}
                        </div>
                        <div className="flex-1 pt-0.5">
                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                {type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Notification'}
                            </p>
                            <p className="mt-1 text-sm font-medium text-zinc-600 dark:text-zinc-300">
                                {message}
                            </p>
                        </div>
                        <div className="flex-shrink-0">
                            <button
                                type="button"
                                className="inline-flex rounded-lg p-1.5 text-zinc-500 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:text-zinc-400 dark:hover:bg-white/10"
                                onClick={() => setShow(false)}
                            >
                                <span className="sr-only">Close</span>
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="absolute bottom-0 left-0 h-1 w-full bg-black/5 dark:bg-white/5">
                        <div
                            className={cn('h-full transition-all duration-75 ease-linear', progressStyles[type])}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </Transition>
        </div>
    );
}
