import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {

  // ── UI state ──────────────────────────────────────────────────────────────
  isScrolled  = false;
  navHidden   = false;
  mobileOpen  = false;
  ctaEmail    = '';
  ctaSuccess  = false;

  private lastScrollY = 0;

  // ── Features data ─────────────────────────────────────────────────────────
  features = [
    {
      icon: '⚖️',
      title: 'Case Management',
      description:
        'Centralise every matter in one place. Track deadlines, assign tasks, log time, and follow case progress from first instruction to final resolution.'
    },
    {
      icon: '👥',
      title: 'Client Portal',
      description:
        'Give clients a secure, branded window into their matters — documents, invoices, messages, and milestones accessible 24 / 7 from any device.'
    },
    {
      icon: '💰',
      title: 'Billing & Invoicing',
      description:
        'Automated time capture, trust accounting, LEDES-compliant invoicing, and integrated payment processing keep your revenue moving without administrative drag.'
    },
    {
      icon: '📁',
      title: 'Document Management',
      description:
        'Version-controlled, full-text-searchable, permission-gated document storage with one-click court filing templates and audit trails.'
    },
    {
      icon: '📅',
      title: 'Court Calendar',
      description:
        'Jurisdiction-aware court date tracking with statute-of-limitations calculations, team reminders, and two-way sync with Outlook and Google Calendar.'
    },
    {
      icon: '🤝',
      title: 'Team Collaboration',
      description:
        'Delegate tasks, share notes, co-draft documents, and communicate within matters — keeping every conversation on the record where it belongs.'
    }
  ];

  // ── Showcase pillars ──────────────────────────────────────────────────────
  pillars = [
    {
      icon: '🔒',
      title: 'Bank-Grade Security',
      desc: 'AES-256 encryption, SOC 2 Type II certified, GDPR and HIPAA ready.'
    },
    {
      icon: '⚡',
      title: 'Built for Speed',
      desc: 'Sub-second load times even on the most complex multi-party matters.'
    },
    {
      icon: '🧩',
      title: 'Seamless Integrations',
      desc: 'Connects with Clio, NetSuite, QuickBooks, Outlook, and 40+ legal tools.'
    }
  ];

  // ── Stats ─────────────────────────────────────────────────────────────────
  stats = [
    { value: '500+',   label: 'Law Firms'        },
    { value: '99.9%',  label: 'System Uptime'    },
    { value: '50,000+', label: 'Cases Managed'   },
    { value: '24 / 7', label: 'Expert Support'   }
  ];

  // ── Testimonials ──────────────────────────────────────────────────────────
  testimonials = [
    {
      name:   'James Mitchell',
      role:   'Managing Partner',
      firm:   'Mitchell & Associates',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=88&h=88&q=80&fit=crop&crop=face',
      quote:
        'LexFirma transformed how we run our chambers. We recovered fifteen billable hours per attorney per month in the first quarter alone.'
    },
    {
      name:   'Sarah Chen',
      role:   'Head of Litigation',
      firm:   'Chen Legal Group',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=88&h=88&q=80&fit=crop&crop=face',
      quote:
        'The client portal alone justified the investment. Our clients feel informed and confident, which means fewer status calls and stronger relationships.'
    },
    {
      name:   'Robert Williams',
      role:   'Senior Counsel',
      firm:   'Williams & Partners',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=88&h=88&q=80&fit=crop&crop=face',
      quote:
        'I have evaluated six practice management platforms over twenty years. LexFirma is the first that was designed by people who actually practise law.'
    }
  ];

  // ── Footer columns ────────────────────────────────────────────────────────
  footerCols = [
    {
      title: 'Platform',
      links: ['Case Management', 'Client Portal', 'Billing', 'Documents', 'Integrations']
    },
    {
      title: 'Company',
      links: ['About Us', 'Careers', 'Press', 'Partners', 'Blog']
    },
    {
      title: 'Legal',
      links: ['Privacy Policy', 'Terms of Service', 'Security', 'GDPR', 'Cookies']
    }
  ];

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  constructor(private router: Router) {}

  ngOnInit(): void {}

  // ── Scroll behaviour ──────────────────────────────────────────────────────
  @HostListener('window:scroll')
  onWindowScroll(): void {
    const y = window.scrollY;

    this.isScrolled = y > 40;
    this.navHidden  = y > this.lastScrollY && y > 120;
    this.lastScrollY = y < 0 ? 0 : y;
  }

  // ── Navigation helpers ────────────────────────────────────────────────────
  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.mobileOpen = false;
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  // ── CTA form ──────────────────────────────────────────────────────────────
  handleCta(): void {
    if (!this.ctaEmail?.trim()) return;

    // Replace with your real API call / service injection
    this.ctaSuccess = true;

    setTimeout(() => {
      this.ctaSuccess = false;
      this.ctaEmail   = '';
    }, 4000);
  }
}