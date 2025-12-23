import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Transition } from '@headlessui/react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export function ToastContainer() {
    const { toasts, removeToast } = useToast();

    const icons = {
        success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
        error: <AlertCircle className="h-5 w-5 text-rose-500" />,
        info: <Info className="h-5 w-5 text-blue-500" />,
    };

    const styles = {
        success: 'border-emerald-200 bg-emerald-50/95 dark:border-emerald-900/30 dark:bg-emerald-950/95',
        error: 'border-rose-200 bg-rose-50/95 dark:border-rose-900/30 dark:bg-rose-950/95',
        info: 'border-blue-200 bg-blue-50/95 dark:border-blue-900/30 dark:bg-blue-950/95',
    };

    return (
        <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 sm:right-6">
            {toasts.map((toast) => (
                <Transition
                    key={toast.id}
                    appear
                    show={true}
                    enter="transform ease-out duration-300 transition"
                    enterFrom="translate-x-full opacity-0"
                    enterTo="translate-x-0 opacity-100"
                    leave="transition ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0 translate-x-full"
                >
                    <div
                        className={cn(
                            'flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm min-w-[280px] max-w-md',
                            styles[toast.type]
                        )}
                    >
                        <div className="flex-shrink-0">
                            {icons[toast.type]}
                        </div>
                        <p className="flex-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                            {toast.message}
                        </p>
                        <button
                            type="button"
                            className="flex-shrink-0 rounded-lg p-1 text-zinc-500 hover:bg-black/5 dark:text-zinc-400 dark:hover:bg-white/10 transition-colors"
                            onClick={() => removeToast(toast.id)}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </Transition>
            ))}
        </div>
    );
}
