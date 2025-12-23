import type { SharedData, SiteSettings } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

export default function Footer() {
  const { siteSettings } = usePage<SharedData>().props;
  const settings: SiteSettings = siteSettings || {};
  const year = new Date().getFullYear();

  const social = [
    { href: settings.facebook_url, label: 'Facebook', icon: Facebook },
    { href: settings.twitter_url, label: 'Twitter / X', icon: Twitter },
    { href: settings.instagram_url, label: 'Instagram', icon: Instagram },
    { href: settings.linkedin_url, label: 'LinkedIn', icon: Linkedin },
  ].filter((s) => !!s.href);

  return (
    <footer className="relative mt-16 border-t border-zinc-200/60 bg-gradient-to-br from-white via-zinc-50 to-zinc-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 dark:border-zinc-800">
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />
      </div>
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3 lg:grid-cols-5">
          {/* Brand */}
          <div className="md:col-span-1 lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 shadow-lg shadow-orange-500/30 flex items-center justify-center text-white font-bold">HD</div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">Home Design</span>
            </Link>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 max-w-sm">
              Craft beautiful floor plans and interiors with intelligent tools. Visualize, iterate, and publish your dream spaces faster.
            </p>
            {settings.contact_email && (
              <p className="text-sm text-zinc-500 dark:text-zinc-500">Support: <a href={`mailto:${settings.contact_email}`} className="text-orange-600 dark:text-orange-400 hover:underline">{settings.contact_email}</a></p>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-xs font-semibold tracking-wider text-zinc-500 uppercase dark:text-zinc-400">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {[
                ['Design Home', '/design-home'],
                ['Interior Design', '/interior-design'],
                ['Floor Planner', '/floor-plan'],
                ['Furniture Library', '/furniture-library'],
                ['Gallery', '/gallery'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-zinc-600 hover:text-orange-600 dark:text-zinc-400 dark:hover:text-orange-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Essentials */}
            <div>
            <h3 className="mb-4 text-xs font-semibold tracking-wider text-zinc-500 uppercase dark:text-zinc-400">Essential Pages</h3>
            <ul className="space-y-2 text-sm">
              {[
                ['About', '/about'],
                ['Help Center', '/help'],
                ['Projects', '/projects'],
                ['Privacy Policy', '/privacy-policy'],
                ['Terms of Service', '/terms'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-zinc-600 hover:text-orange-600 dark:text-zinc-400 dark:hover:text-orange-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Social */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="mb-2 text-xs font-semibold tracking-wider text-zinc-500 uppercase dark:text-zinc-400">Connect</h3>
            <ul className="space-y-2 text-sm">
              {settings.contact_phone && <li className="text-zinc-600 dark:text-zinc-400">Phone: {settings.contact_phone}</li>}
              {settings.contact_address && <li className="text-zinc-600 dark:text-zinc-400">{settings.contact_address}</li>}
            </ul>
            {social.length > 0 && (
              <div className="pt-2">
                <div className="flex gap-3">
                  {social.map(({ href, label, icon: Icon }) => (
                    <a
                      key={href}
                      href={href}
                      aria-label={label}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group rounded-lg bg-zinc-100 p-2 text-zinc-600 transition hover:bg-orange-600 hover:text-white dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-orange-500"
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-zinc-200/70 pt-6 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-500 md:flex-row">
          <p>&copy; {year} Home Design. All rights reserved.</p>
          <p className="flex items-center gap-1">Built with <span className="text-orange-600">Laravel + Inertia + React</span></p>
        </div>
      </div>
    </footer>
  );
}
