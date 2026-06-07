# Examos — Computer Based Test (CBT) Application
## Development Guide v2.0 — Aligned with Actual Project Setup

> **Stack (actual):** Laravel 13.7 · Inertia.js v3 · React 19 · **TypeScript** · Tailwind CSS v4
> **Auth:** Laravel Fortify (Passkeys + 2FA + Email Verification) · Laravel Chisel · Laravel Wayfinder
> **UI:** shadcn/ui (New York style) · Radix UI · Lucide React · Sonner
> **Database:** MySQL 8 (`DB_CONNECTION=mysql`, `examos` DB) · Queue: `database` driver
> **Date:** June 2026

> [!IMPORTANT]
> This guide is written against the **existing project** at `C:\Users\hp\Herd\examos`.
> All code uses `.tsx`, shadcn/ui components, CSS custom properties, and Wayfinder type-safe routes.
> Do NOT install Vite, React, Tailwind, or Inertia — they are already installed.

---

## Table of Contents

1. [What Is Already Set Up](#1-what-is-already-set-up)
2. [Design System — Adapting to shadcn/ui + OKLCH](#2-design-system--adapting-to-shadcnui--oklch)
3. [Additional Packages to Install](#3-additional-packages-to-install)
4. [Project Architecture](#4-project-architecture)
5. [Database Schema](#5-database-schema)
6. [RBAC — Spatie + Fortify User Model](#6-rbac--spatie--fortify-user-model)
7. [Authentication Strategy](#7-authentication-strategy)
8. [Backend — Laravel Implementation](#8-backend--laravel-implementation)
9. [Frontend — TypeScript/React Implementation](#9-frontend--typescriptreact-implementation)
10. [Exam Engine](#10-exam-engine)
11. [Admin Module](#11-admin-module)
12. [Audit & Activity Logging](#12-audit--activity-logging)
13. [Build Phases & Milestones](#13-build-phases--milestones)
14. [Environment Updates](#14-environment-updates)
15. [Testing Strategy](#15-testing-strategy)

---

## 1. What Is Already Set Up

The following are already installed and configured — **do not re-install**:

### Composer (PHP) — Already Installed
| Package | Version | Purpose |
|---|---|---|
| `inertiajs/inertia-laravel` | ^3.0 | Inertia server adapter |
| `laravel/fortify` | ^1.37 | Admin authentication (login, 2FA, passkeys, password reset) |
| `laravel/framework` | ^13.7 | Core Laravel |
| `laravel/chisel` | ^0.1 | Feature toggling for auth scaffold |
| `laravel/wayfinder` | ^0.1 | Type-safe route generation |

### NPM (Frontend) — Already Installed
| Package | Purpose |
|---|---|
| `@inertiajs/react` ^3.0 | Inertia React adapter |
| `@inertiajs/vite` ^3.0 | Vite plugin |
| `tailwindcss` ^4.0 | CSS framework (CSS-variable based, no `tailwind.config.js`) |
| `@tailwindcss/vite` ^4.1 | Vite integration |
| `shadcn/ui` (New York) | Component library via Radix UI |
| `@radix-ui/*` | Accessible UI primitives |
| `lucide-react` ^0.475 | Icon library (use this, NOT Heroicons) |
| `sonner` ^2.0 | Toast notifications (use this, NOT react-hot-toast) |
| `clsx`, `class-variance-authority`, `tailwind-merge` | Utility classes |
| `tw-animate-css` | Animation utilities |
| `typescript` ^5.7 | Type safety |
| `@laravel/passkeys` | Passkey auth support |
| `input-otp` | OTP input for 2FA |

### Existing Auth Features (Fortify)
The admin (`User` model) already has:
- Email/password login with rate limiting (5/min)
- Two-Factor Authentication (TOTP)
- Passkey authentication
- Email verification
- Password reset
- Password confirmation middleware

### Existing Frontend Structure
```
resources/js/
├── app.tsx                        # createInertiaApp with layout routing
├── components/
│   ├── ui/                        # shadcn/ui components (Button, Input, etc.)
│   └── [auth, settings components]
├── layouts/
│   ├── app-layout.tsx             # Main app shell with sidebar
│   ├── auth-layout.tsx            # Auth wrapper (login, register pages)
│   └── settings/                  # Settings layout
├── pages/
│   ├── auth/                      # login, register, 2FA, passkey pages
│   ├── settings/                  # profile, security, appearance
│   ├── dashboard.tsx
│   └── welcome.tsx
├── hooks/                         # use-appearance, use-flash-toast, etc.
└── types/
    ├── auth.ts                    # User, Auth, Passkey types
    └── ...
```

---

## 2. Design System — Adapting to shadcn/ui + OKLCH

The project uses **CSS custom properties** (shadcn/ui convention) with **OKLCH color space** instead of a `tailwind.config.js`. Apply the brand colours from the design image by overriding the CSS variables in `resources/css/app.css`.

### 2.1 Brand Colour Mapping

| Design Token | Hex | OKLCH Equivalent | CSS Variable to Override |
|---|---|---|---|
| Primary `#0F4C81` | Navy Blue | `oklch(0.38 0.12 240)` | `--primary` |
| Secondary `#334155` | Dark Slate | `oklch(0.34 0.03 240)` | `--secondary-foreground` |
| Tertiary `#007A78` | Teal | `oklch(0.52 0.10 185)` | `--ring`, `--chart-2` |
| Neutral `#1E2938` | Charcoal | `oklch(0.22 0.03 240)` | `--sidebar` |

### 2.2 Update `resources/css/app.css`

Add the brand overrides inside the existing `:root` block. Do **not** replace the whole file:

```css
/* Add AFTER line 89 (--radius: 0.625rem;) in the :root block */

/* === EXAMOS BRAND THEME === */
--primary: oklch(0.38 0.12 240);           /* #0F4C81 navy  */
--primary-foreground: oklch(0.98 0 0);     /* white text on primary */

--sidebar: oklch(0.22 0.03 240);           /* #1E2938 charcoal sidebar */
--sidebar-foreground: oklch(0.92 0 0);
--sidebar-primary: oklch(0.38 0.12 240);
--sidebar-primary-foreground: oklch(0.98 0 0);
--sidebar-accent: oklch(0.30 0.04 240);
--sidebar-accent-foreground: oklch(0.92 0 0);
--sidebar-border: oklch(0.28 0.03 240);

--ring: oklch(0.52 0.10 185);              /* #007A78 teal focus ring */

/* Exam-specific custom tokens */
--exam-answered: oklch(0.52 0.10 185);     /* teal — answered question */
--exam-flagged: oklch(0.72 0.16 60);       /* amber — flagged question  */
--exam-unanswered: oklch(0.92 0 0);        /* light grey — unanswered  */
--exam-timer-warning: oklch(0.58 0.22 25); /* red — < 5 min remaining  */
```

### 2.3 Typography

Add Google Fonts to `resources/views/app.blade.php` inside `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
```

Then override in `app.css` `@theme` block:
```css
/* Replace Instrument Sans with Inter */
--font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
--font-mono: 'JetBrains Mono', ui-monospace, monospace;
```

### 2.4 Using shadcn/ui Components (not raw Tailwind classes)

All UI in this project uses **shadcn/ui** primitives. Match component patterns from existing pages:

```tsx
// ✅ Correct — use shadcn/ui
import { Button }   from '@/components/ui/button';
import { Input }    from '@/components/ui/input';
import { Label }    from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge }    from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// ✅ Correct — use Lucide React icons
import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

// ✅ Correct — use Sonner for toasts
import { toast } from 'sonner';

// ❌ Wrong — do not use react-hot-toast, Heroicons, or hand-rolled Tailwind components
```

### 2.5 Adding New shadcn Components

```bash
# Add components not yet in the project (run from project root)
npx shadcn@latest add table       # For admin data tables
npx shadcn@latest add tabs        # For subject tabs in exam room
npx shadcn@latest add progress    # For progress bars
npx shadcn@latest add switch      # For toggle settings
npx shadcn@latest add scroll-area # For scrollable question navigator
```

---

## 3. Additional Packages to Install

These are **not yet installed** and are required for the CBT features:

### 3.1 Composer Packages

```bash
# RBAC
composer require spatie/laravel-permission

# Bulk file import (CSV/Excel)
composer require maatwebsite/excel

# Audit logging
composer require owen-it/laravel-auditing

# Activity log (admin actions)
composer require spatie/laravel-activitylog

# PDF generation (credential printing)
composer require barryvdh/laravel-dompdf

# Real-time WebSockets (exam monitoring, device release signal)
composer require laravel/reverb

# Publish configs
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
php artisan vendor:publish --provider="OwenIt\Auditing\AuditingServiceProvider"
php artisan reverb:install
```

### 3.2 NPM Packages

```bash
# State management (exam store)
npm install zustand

# Type-safe server-driven data (for exam typing)
npm install @tanstack/react-table

# WebSocket client for Reverb
npm install laravel-echo pusher-js

# Date utilities
npm install date-fns
```

> [!NOTE]
> Do NOT install `axios` — it is already bundled with Laravel. Do NOT install `clsx` — already installed.
> Do NOT install `@heroicons/react` — use `lucide-react` which is already installed.

---

## 4. Project Architecture

### 4.1 Extending the Directory Structure

The following directories and files need to be **created** (on top of what already exists):

```
app/
├── Actions/
│   └── Fortify/                   # ✅ Already exists
│       ├── CreateNewUser.php      # ✅ Already exists
│       └── ResetUserPassword.php  # ✅ Already exists
│
├── Console/Commands/
│   └── AutoExpireExamSessions.php # 🆕 NEW — Cron auto-submit expired exams
│
├── Events/                        # 🆕 NEW directory
│   ├── AdminReleasedDevice.php
│   └── ExamTimerExpired.php
│
├── Http/Controllers/
│   ├── Controller.php             # ✅ Already exists
│   ├── Settings/                  # ✅ Already exists (ProfileController, SecurityController)
│   ├── Admin/                     # 🆕 NEW namespace
│   │   ├── DashboardController.php
│   │   ├── ExamSeasonController.php
│   │   ├── SubjectController.php
│   │   ├── QuestionBankController.php
│   │   ├── CandidateController.php
│   │   ├── ExamMonitorController.php
│   │   ├── ResultController.php
│   │   └── AuditController.php
│   └── Candidate/                 # 🆕 NEW namespace
│       ├── AuthController.php
│       ├── ExamController.php
│       └── ProfileController.php
│
├── Http/Middleware/               # ✅ Already exists
│   ├── HandleInertiaRequests.php  # ✅ Already exists — needs modification
│   ├── EnsureDeviceNotLocked.php  # 🆕 NEW
│   └── EnsureExamTimeNotExpired.php # 🆕 NEW
│
├── Imports/                       # 🆕 NEW directory
│   ├── CandidatesImport.php
│   └── QuestionBankImport.php
│
├── Models/
│   ├── User.php                   # ✅ Already exists — needs HasRoles added
│   ├── Candidate.php              # 🆕 NEW
│   ├── ExamSeason.php             # 🆕 NEW
│   ├── Subject.php                # 🆕 NEW
│   ├── Question.php               # 🆕 NEW
│   ├── QuestionOption.php         # 🆕 NEW
│   ├── CandidateExamSession.php   # 🆕 NEW
│   ├── CandidateAnswer.php        # 🆕 NEW
│   ├── CandidateSubjectAllocation.php # 🆕 NEW
│   └── DeviceSession.php          # 🆕 NEW
│
├── Providers/
│   ├── AppServiceProvider.php     # ✅ Already exists
│   └── FortifyServiceProvider.php # ✅ Already exists — no changes needed
│
└── Services/                      # 🆕 NEW directory
    ├── ExamSessionService.php
    ├── CredentialGeneratorService.php
    ├── DeviceFingerprintService.php
    ├── SubjectAllocationService.php
    └── ScoreCalculatorService.php

routes/
├── web.php                        # ✅ Already exists — needs routes added
├── settings.php                   # ✅ Already exists — no changes needed
├── console.php                    # ✅ Already exists
└── candidate.php                  # 🆕 NEW route file for candidate portal

resources/js/
├── app.tsx                        # ✅ Already exists — needs layout routing update
├── components/
│   ├── ui/                        # ✅ Already exists (shadcn/ui)
│   ├── exam/                      # 🆕 NEW exam components
│   │   ├── question-card.tsx
│   │   ├── question-navigator.tsx
│   │   ├── subject-tab-bar.tsx
│   │   └── exam-timer.tsx
│   └── admin/                     # 🆕 NEW admin components
│       ├── candidate-monitor-card.tsx
│       └── exam-status-badge.tsx
├── hooks/
│   ├── use-appearance.tsx         # ✅ Already exists
│   ├── use-flash-toast.ts         # ✅ Already exists
│   ├── use-exam-timer.ts          # 🆕 NEW
│   └── use-permission.ts          # 🆕 NEW
├── layouts/
│   ├── app-layout.tsx             # ✅ Already exists
│   ├── auth-layout.tsx            # ✅ Already exists
│   └── exam-layout.tsx            # 🆕 NEW — stripped, locked exam UI
├── pages/
│   ├── auth/                      # ✅ Already exists (admin auth)
│   ├── dashboard.tsx              # ✅ Already exists
│   ├── admin/                     # 🆕 NEW admin pages
│   │   ├── dashboard.tsx
│   │   ├── seasons/
│   │   ├── subjects/
│   │   ├── questions/
│   │   ├── candidates/
│   │   └── monitor/
│   └── candidate/                 # 🆕 NEW candidate portal pages
│       ├── login.tsx
│       ├── profile.tsx
│       ├── instructions.tsx
│       └── exam/
│           ├── room.tsx
│           └── results.tsx
├── stores/                        # 🆕 NEW
│   └── exam-store.ts
└── types/
    ├── auth.ts                    # ✅ Already exists (User, Auth, Passkey)
    ├── index.ts                   # ✅ Already exists
    └── exam.ts                    # 🆕 NEW — Candidate, Subject, Question types
```

---

## 5. Database Schema

> [!NOTE]
> The project already has these migration files (do not recreate):
> - `0001_01_01_000000_create_users_table.php` — users + sessions + password_reset_tokens
> - `0001_01_01_000001_create_cache_table.php`
> - `0001_01_01_000002_create_jobs_table.php`
> - `2024_01_01_000000_create_passkeys_table.php`
> - `2025_08_14_170933_add_two_factor_columns_to_users_table.php`

Create new migrations with `php artisan make:migration`:

### 5.1 `candidates` table
```php
Schema::create('candidates', function (Blueprint $table) {
    $table->id();
    $table->string('file_no')->unique();          // Login username
    $table->string('name');
    $table->string('telephone')->nullable();
    $table->string('email')->nullable()->unique();
    $table->string('gender')->nullable();
    $table->string('department')->nullable();
    $table->string('level')->nullable();
    $table->string('photo')->nullable();
    $table->string('password');                   // Hashed
    $table->string('raw_password')->nullable();   // Plain text for credential printing only
    $table->foreignId('exam_season_id')->constrained()->onDelete('cascade');
    $table->boolean('is_active')->default(true);
    $table->timestamps();
    $table->softDeletes();
    $table->index(['file_no', 'exam_season_id']);
});
```

### 5.2 `exam_seasons` table
```php
Schema::create('exam_seasons', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('code')->unique();             // e.g., "2425S1"
    $table->text('description')->nullable();
    $table->timestamp('starts_at')->nullable();
    $table->timestamp('ends_at')->nullable();
    $table->integer('logout_grace_minutes')->default(30);
    $table->boolean('is_active')->default(false);
    $table->boolean('allow_result_review')->default(false);
    $table->foreignId('created_by')->constrained('users');
    $table->timestamps();
});
```

### 5.3 `subjects` table
```php
Schema::create('subjects', function (Blueprint $table) {
    $table->id();
    $table->foreignId('exam_season_id')->constrained()->onDelete('cascade');
    $table->string('name');
    $table->string('code');
    $table->integer('duration_minutes');
    $table->integer('questions_per_page')->default(1);      // 1, 2, 3, or 4
    $table->integer('total_questions_to_display');          // Shown from pool
    $table->integer('pass_mark')->default(50);
    $table->text('instructions')->nullable();
    $table->json('allocation_criteria')->nullable();        // {"department":"CS","level":"300"}
    $table->boolean('is_active')->default(true);
    $table->timestamps();
    $table->unique(['exam_season_id', 'code']);
});
```

### 5.4 `questions` table
```php
Schema::create('questions', function (Blueprint $table) {
    $table->id();
    $table->foreignId('subject_id')->constrained()->onDelete('cascade');
    $table->text('question_text');
    $table->enum('question_type', ['single_choice', 'multi_choice', 'true_false'])
          ->default('single_choice');
    $table->string('image_path')->nullable();
    $table->integer('marks')->default(1);
    $table->boolean('is_active')->default(true);
    $table->foreignId('created_by')->constrained('users');
    $table->timestamps();
    $table->softDeletes();
});
```

### 5.5 `question_options` table
```php
Schema::create('question_options', function (Blueprint $table) {
    $table->id();
    $table->foreignId('question_id')->constrained()->onDelete('cascade');
    $table->text('option_text');
    $table->string('image_path')->nullable();
    $table->boolean('is_correct')->default(false);
    $table->char('option_label', 1);            // A, B, C, D
    $table->integer('sort_order')->default(0);
    $table->timestamps();
});
```

### 5.6 `candidate_exam_sessions` table
```php
Schema::create('candidate_exam_sessions', function (Blueprint $table) {
    $table->id();
    $table->foreignId('candidate_id')->constrained()->onDelete('cascade');
    $table->foreignId('subject_id')->constrained()->onDelete('cascade');
    $table->foreignId('exam_season_id')->constrained()->onDelete('cascade');
    $table->enum('status', ['pending','active','paused','completed','expired'])->default('pending');
    $table->timestamp('started_at')->nullable();
    $table->timestamp('submitted_at')->nullable();
    $table->timestamp('expires_at')->nullable();    // started_at + duration_minutes
    $table->integer('score')->nullable();
    $table->integer('total_marks')->nullable();
    $table->json('question_order')->nullable();     // Persisted shuffled question IDs
    $table->string('device_fingerprint')->nullable();
    $table->boolean('device_released')->default(false);
    $table->timestamps();
    $table->unique(['candidate_id', 'subject_id']);
    $table->index(['status', 'expires_at']);
});
```

### 5.7 `candidate_answers` table
```php
Schema::create('candidate_answers', function (Blueprint $table) {
    $table->id();
    $table->foreignId('session_id')
          ->constrained('candidate_exam_sessions')->onDelete('cascade');
    $table->foreignId('question_id')->constrained()->onDelete('cascade');
    $table->foreignId('selected_option_id')
          ->nullable()->constrained('question_options')->onDelete('set null');
    $table->boolean('is_correct')->nullable();      // Computed on save
    $table->timestamp('answered_at')->nullable();
    $table->timestamps();
    $table->unique(['session_id', 'question_id']);
});
```

### 5.8 `candidate_subject_allocations` table
```php
Schema::create('candidate_subject_allocations', function (Blueprint $table) {
    $table->id();
    $table->foreignId('candidate_id')->constrained()->onDelete('cascade');
    $table->foreignId('subject_id')->constrained()->onDelete('cascade');
    $table->foreignId('exam_season_id')->constrained()->onDelete('cascade');
    $table->timestamps();
    $table->unique(['candidate_id', 'subject_id']);
});
```

### 5.9 `device_sessions` table
```php
Schema::create('device_sessions', function (Blueprint $table) {
    $table->id();
    $table->foreignId('candidate_id')->constrained()->onDelete('cascade');
    $table->string('fingerprint');                  // SHA-256 of browser characteristics
    $table->string('ip_address')->nullable();
    $table->string('user_agent')->nullable();
    $table->boolean('is_locked')->default(true);
    $table->timestamp('locked_at')->nullable();
    $table->timestamp('released_at')->nullable();
    $table->foreignId('released_by')->nullable()->constrained('users');
    $table->timestamps();
    $table->index(['candidate_id', 'fingerprint', 'is_locked']);
});
```

---

## 6. RBAC — Spatie + Fortify User Model

### 6.1 Extend Existing User Model

The `User` model already uses `PasskeyAuthenticatable`, `TwoFactorAuthenticatable`. Add `HasRoles` from Spatie:

```php
// app/Models/User.php — MODIFY (do not replace, add the trait)
namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;            // ADD THIS

#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable, HasRoles; // ADD HasRoles
    // ... rest unchanged
}
```

### 6.2 Roles and Permissions

```php
// database/seeders/RolesAndPermissionsSeeder.php
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

$permissions = [
    'season.view', 'season.create', 'season.edit', 'season.delete', 'season.activate',
    'subject.view', 'subject.create', 'subject.edit', 'subject.delete',
    'question.view', 'question.create', 'question.edit', 'question.delete', 'question.import',
    'candidate.view', 'candidate.create', 'candidate.edit', 'candidate.delete',
    'candidate.import', 'candidate.export', 'candidate.reset-password',
    'exam.monitor', 'exam.release-device', 'exam.force-submit', 'exam.extend-time',
    'result.view', 'result.release', 'result.export',
    'user.view', 'user.create', 'user.edit', 'user.delete',
    'audit.view',
];

foreach ($permissions as $name) {
    Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
}

$superAdmin  = Role::firstOrCreate(['name' => 'super-admin',  'guard_name' => 'web']);
$admin       = Role::firstOrCreate(['name' => 'admin',        'guard_name' => 'web']);
$invigilator = Role::firstOrCreate(['name' => 'invigilator',  'guard_name' => 'web']);

$superAdmin->syncPermissions(Permission::all());
$admin->syncPermissions(Permission::where('name', 'NOT LIKE', 'user.%')->get());
$invigilator->syncPermissions(['exam.monitor', 'exam.release-device', 'candidate.view']);
```

### 6.3 Share Permissions via Inertia (Update HandleInertiaRequests)

```php
// app/Http/Middleware/HandleInertiaRequests.php
// Find the share() method and update it:

public function share(Request $request): array
{
    return [
        ...parent::share($request),
        'auth' => [
            'user'        => $request->user(),
            'roles'       => $request->user()?->getRoleNames(),
            'permissions' => $request->user()?->getAllPermissions()->pluck('name'),
            // Share the candidate (from custom guard) if they are logged in:
            'candidate'   => auth('candidate')->user(),
        ],
        'flash' => [
            'success' => fn () => $request->session()->get('success'),
            'error'   => fn () => $request->session()->get('error'),
        ],
    ];
}
```

### 6.4 usePermission Hook (TypeScript)

```ts
// resources/js/hooks/use-permission.ts
import { usePage } from '@inertiajs/react';

interface PageProps {
    auth: {
        permissions?: string[];
        roles?: string[];
    };
}

export function usePermission() {
    const { auth } = usePage<PageProps>().props;
    const can     = (permission: string): boolean => auth.permissions?.includes(permission) ?? false;
    const hasRole = (role: string): boolean       => auth.roles?.includes(role) ?? false;
    return { can, hasRole };
}
```

---

## 7. Authentication Strategy

### 7.1 Two Guards — Fortify for Admins, Custom for Candidates

The project uses **Laravel Fortify** for admin/user authentication. The candidate authentication is a **separate custom guard** that does NOT go through Fortify (candidates login by File No + password, not email).

```
Admin Portal  → Fortify → web guard   → users table     (email + password + 2FA + Passkeys)
Candidate Portal → Custom → candidate guard → candidates table (file_no + password, no Fortify)
```

### 7.2 Add Candidate Guard to `config/auth.php`

```php
// config/auth.php
'guards' => [
    'web' => [                         // ✅ Already exists — Fortify uses this
        'driver'   => 'session',
        'provider' => 'users',
    ],
    'candidate' => [                   // 🆕 ADD THIS
        'driver'   => 'session',
        'provider' => 'candidates',
    ],
],

'providers' => [
    'users' => [                       // ✅ Already exists
        'driver' => 'eloquent',
        'model'  => App\Models\User::class,
    ],
    'candidates' => [                  // 🆕 ADD THIS
        'driver' => 'eloquent',
        'model'  => App\Models\Candidate::class,
    ],
],
```

### 7.3 Candidate Login Flow

```
1. Candidate navigates to /candidate/login (separate from Fortify's /login)
2. Enters File No + Password → POST /candidate/login
3. DeviceFingerprintService::generate($request) → SHA-256 hash of browser characteristics
4. Check DeviceSession: Is this fingerprint locked to a DIFFERENT candidate?
       YES → Return error: "Another exam is active on this device"
       NO  → Is THIS candidate locked to a DIFFERENT device?
                 YES → Return error: "Session active on another device. Contact invigilator."
                 NO  → Authenticate via candidate guard → Lock device fingerprint
5. Redirect → /candidate/profile (shows allocated subjects + instructions link)
```

### 7.4 Keeping Fortify Routes and Admin Login Intact

Do NOT modify `FortifyServiceProvider.php`. Fortify handles:
- `POST /login` → Admin login
- `GET /two-factor-challenge` → 2FA
- `GET /settings/security` → Passkeys management

The candidate login is entirely separate at `/candidate/login`.

### 7.5 Route Files

Add `routes/candidate.php` and require it from `bootstrap/app.php`:

```php
// bootstrap/app.php
->withRouting(
    web: __DIR__.'/../routes/web.php',
    commands: __DIR__.'/../routes/console.php',
    health: '/up',
)
```

Update to:
```php
->withRouting(
    web: [
        __DIR__.'/../routes/web.php',
        __DIR__.'/../routes/candidate.php',   // ADD
    ],
    commands: __DIR__.'/../routes/console.php',
    health: '/up',
)
```

```php
// routes/candidate.php
<?php

use App\Http\Controllers\Candidate\AuthController as CandidateAuthController;
use App\Http\Controllers\Candidate\ExamController;
use Illuminate\Support\Facades\Route;

Route::prefix('candidate')->name('candidate.')->group(function () {
    Route::get('/login',  [CandidateAuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [CandidateAuthController::class, 'login'])
         ->middleware('throttle:5,1')->name('login.post');
    Route::post('/logout', [CandidateAuthController::class, 'logout'])->name('logout');

    Route::middleware(['auth:candidate', 'exam.device'])->group(function () {
        Route::get('/profile',      [ExamController::class, 'profile'])->name('profile');
        Route::get('/instructions/{subject}', [ExamController::class, 'instructions'])->name('instructions');

        Route::middleware(['exam.time'])->group(function () {
            Route::get('/room/{subject}',      [ExamController::class, 'room'])->name('room');
            Route::post('/start/{subject}',    [ExamController::class, 'start'])->name('start');
            Route::post('/answer/{session}',   [ExamController::class, 'saveAnswer'])->name('answer');
            Route::post('/submit/{session}',   [ExamController::class, 'submit'])->name('submit');
            Route::get('/sync-time/{session}', [ExamController::class, 'syncTime'])->name('sync-time');
        });

        Route::get('/results', [ExamController::class, 'results'])->name('results');
    });
});
```

```php
// routes/web.php — add admin routes (keep existing routes intact)
<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

// Admin CBT Routes
Route::prefix('admin')->name('admin.')->middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [Admin\DashboardController::class, 'index'])->name('dashboard');
    Route::resource('seasons',    Admin\ExamSeasonController::class);
    Route::patch('seasons/{season}/activate',       [Admin\ExamSeasonController::class, 'activate'])->name('seasons.activate');
    Route::patch('seasons/{season}/release-results',[Admin\ResultController::class, 'release'])->name('results.release');
    Route::resource('subjects',   Admin\SubjectController::class);
    Route::post('subjects/{subject}/allocate',      [Admin\SubjectController::class, 'allocate'])->name('subjects.allocate');
    Route::resource('questions',  Admin\QuestionBankController::class);
    Route::post('questions/import/{subject}',       [Admin\QuestionBankController::class, 'import'])->name('questions.import');
    Route::resource('candidates', Admin\CandidateController::class);
    Route::post('candidates/import/{season}',       [Admin\CandidateController::class, 'import'])->name('candidates.import');
    Route::get('candidates/export/{season}',        [Admin\CandidateController::class, 'export'])->name('candidates.export');
    Route::post('candidates/{candidate}/reset',     [Admin\CandidateController::class, 'resetPassword'])->name('candidates.reset-password');
    Route::get('monitor',                           [Admin\ExamMonitorController::class, 'index'])->name('monitor');
    Route::post('monitor/{candidate}/release',      [Admin\ExamMonitorController::class, 'releaseDevice'])->name('monitor.release-device');
    Route::post('monitor/{session}/force-submit',   [Admin\ExamMonitorController::class, 'forceSubmit'])->name('monitor.force-submit');
    Route::post('monitor/{session}/extend',         [Admin\ExamMonitorController::class, 'extendTime'])->name('monitor.extend-time');
    Route::get('results',  [Admin\ResultController::class, 'index'])->name('results.index');
    Route::get('audit',    [Admin\AuditController::class, 'index'])->name('audit.index');
});

require __DIR__.'/settings.php';    // ✅ Already there — keep
```

### 7.6 Update `app.tsx` Layout Routing

```tsx
// resources/js/app.tsx — update layout switch to include candidate pages
createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
                return null;
            case name.startsWith('auth/'):
                return AuthLayout;           // ✅ Already exists — admin Fortify auth
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            case name.startsWith('candidate/'):
                return null;                 // 🆕 Candidate pages handle their own layout
            case name.startsWith('admin/'):
                return AppLayout;            // 🆕 Admin CBT pages use existing AppLayout
            default:
                return AppLayout;
        }
    },
    // ... rest unchanged
});
```

---

## 8. Backend — Laravel Implementation

### 8.1 Candidate Model

```php
// app/Models/Candidate.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Candidate extends Authenticatable
{
    use HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'file_no', 'name', 'telephone', 'email', 'gender',
        'department', 'level', 'photo', 'password', 'raw_password',
        'exam_season_id', 'is_active',
    ];

    protected $hidden = ['password', 'raw_password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'password'     => 'hashed',
            'is_active'    => 'boolean',
        ];
    }

    public function examSeason()
    {
        return $this->belongsTo(ExamSeason::class);
    }

    public function subjectAllocations()
    {
        return $this->hasMany(CandidateSubjectAllocation::class);
    }

    public function allocatedSubjects()
    {
        return $this->belongsToMany(Subject::class, 'candidate_subject_allocations')
                    ->with('examSeason');
    }

    public function examSessions()
    {
        return $this->hasMany(CandidateExamSession::class);
    }

    public function deviceSessions()
    {
        return $this->hasMany(DeviceSession::class);
    }
}
```

### 8.2 TypeScript Types for Exam

```ts
// resources/js/types/exam.ts
export type Candidate = {
    id: number;
    file_no: string;
    name: string;
    department: string | null;
    level: string | null;
    gender: string | null;
    exam_season_id: number;
    is_active: boolean;
};

export type ExamSeason = {
    id: number;
    name: string;
    code: string;
    is_active: boolean;
    allow_result_review: boolean;
    starts_at: string | null;
    ends_at: string | null;
    logout_grace_minutes: number;
};

export type Subject = {
    id: number;
    name: string;
    code: string;
    duration_minutes: number;
    questions_per_page: 1 | 2 | 3 | 4;
    total_questions_to_display: number;
    pass_mark: number;
    instructions: string | null;
    exam_season_id: number;
};

export type QuestionOption = {
    id: number;
    option_text: string;
    option_label: 'A' | 'B' | 'C' | 'D';
    image_path: string | null;
};

export type Question = {
    id: number;
    question_text: string;
    question_type: 'single_choice' | 'multi_choice' | 'true_false';
    image_path: string | null;
    marks: number;
    options: QuestionOption[];
};

export type ExamSession = {
    id: number;
    candidate_id: number;
    subject_id: number;
    status: 'pending' | 'active' | 'paused' | 'completed' | 'expired';
    started_at: string | null;
    expires_at: string | null;
    score: number | null;
    total_marks: number | null;
    question_order: number[] | null;
};
```

### 8.3 Credential Generator Service

```php
// app/Services/CredentialGeneratorService.php
namespace App\Services;

class CredentialGeneratorService
{
    /**
     * Password: FirstName@last4digits  e.g. "John@5678"
     */
    public function generatePassword(string $name, string $telephone): string
    {
        $firstName = strtolower(explode(' ', trim($name))[0]);
        $lastFour  = substr(preg_replace('/\D/', '', $telephone), -4);
        return ucfirst($firstName) . '@' . $lastFour;
    }

    public function generateUsername(string $fileNo): string
    {
        return strtoupper(trim($fileNo));
    }
}
```

### 8.4 Device Fingerprint Service

```php
// app/Services/DeviceFingerprintService.php
namespace App\Services;

use App\Models\DeviceSession;
use Illuminate\Http\Request;

class DeviceFingerprintService
{
    /**
     * SHA-256 fingerprint from stable browser characteristics.
     * Web apps cannot access MAC addresses via HTTP — this is the correct alternative.
     */
    public function generate(Request $request): string
    {
        $components = implode('|', [
            $request->userAgent(),
            $request->header('Accept-Language', ''),
            $request->header('Accept-Encoding', ''),
            $request->ip(),
        ]);
        return hash('sha256', $components);
    }

    public function isLockedToOther(string $fingerprint, int $candidateId): bool
    {
        return DeviceSession::where('fingerprint', $fingerprint)
            ->where('candidate_id', '!=', $candidateId)
            ->where('is_locked', true)
            ->exists();
    }

    public function candidateLockedToDifferentDevice(int $candidateId, string $fingerprint): bool
    {
        return DeviceSession::where('candidate_id', $candidateId)
            ->where('fingerprint', '!=', $fingerprint)
            ->where('is_locked', true)
            ->exists();
    }

    public function lockDevice(int $candidateId, string $fingerprint, Request $request): void
    {
        DeviceSession::updateOrCreate(
            ['candidate_id' => $candidateId, 'fingerprint' => $fingerprint],
            [
                'ip_address'  => $request->ip(),
                'user_agent'  => $request->userAgent(),
                'is_locked'   => true,
                'locked_at'   => now(),
                'released_at' => null,
                'released_by' => null,
            ]
        );
    }

    public function releaseDevice(int $candidateId, int $releasedBy): void
    {
        DeviceSession::where('candidate_id', $candidateId)
            ->where('is_locked', true)
            ->update([
                'is_locked'   => false,
                'released_at' => now(),
                'released_by' => $releasedBy,
            ]);
    }
}
```

### 8.5 Candidate Auth Controller

```php
// app/Http/Controllers/Candidate/AuthController.php
namespace App\Http\Controllers\Candidate;

use App\Http\Controllers\Controller;
use App\Models\Candidate;
use App\Services\DeviceFingerprintService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function __construct(private DeviceFingerprintService $deviceService) {}

    public function showLogin()
    {
        // If already authenticated as candidate, skip to profile
        if (auth('candidate')->check()) {
            return redirect()->route('candidate.profile');
        }
        return Inertia::render('candidate/login');
    }

    public function login(Request $request)
    {
        $request->validate([
            'file_no'  => 'required|string',
            'password' => 'required|string',
        ]);

        $candidate = Candidate::where('file_no', strtoupper($request->file_no))
            ->where('is_active', true)
            ->first();

        if (!$candidate || !Hash::check($request->password, $candidate->password)) {
            return back()->withErrors(['credentials' => 'Invalid file number or password.']);
        }

        $fingerprint = $this->deviceService->generate($request);

        // Device already locked to a different candidate
        if ($this->deviceService->isLockedToOther($fingerprint, $candidate->id)) {
            return back()->withErrors(['device' => 'Another exam is in progress on this device. Please use a different computer.']);
        }

        // This candidate is locked to a different device
        if ($this->deviceService->candidateLockedToDifferentDevice($candidate->id, $fingerprint)) {
            return back()->withErrors(['device' => 'Your session is active on another device. Contact your invigilator to release it.']);
        }

        auth('candidate')->login($candidate, false);
        $this->deviceService->lockDevice($candidate->id, $fingerprint, $request);

        $request->session()->regenerate();

        return redirect()->route('candidate.profile');
    }

    public function logout(Request $request)
    {
        // Note: device remains locked — candidate cannot re-login until admin releases
        auth('candidate')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect()->route('candidate.login');
    }
}
```

### 8.6 Candidates Import (Maatwebsite Excel)

```php
// app/Imports/CandidatesImport.php
namespace App\Imports;

use App\Models\Candidate;
use App\Services\CredentialGeneratorService;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\{ToModel, WithHeadingRow, WithValidation, WithBatchInserts, WithChunkReading};

class CandidatesImport implements ToModel, WithHeadingRow, WithValidation, WithBatchInserts, WithChunkReading
{
    public function __construct(
        private int $examSeasonId,
        private CredentialGeneratorService $credentialService
    ) {}

    public function model(array $row): Candidate
    {
        $rawPassword = $this->credentialService->generatePassword(
            $row['name'],
            $row['telephone'] ?? '0000'
        );

        return new Candidate([
            'file_no'        => $this->credentialService->generateUsername($row['file_no']),
            'name'           => $row['name'],
            'email'          => $row['email'] ?? null,
            'telephone'      => $row['telephone'] ?? null,
            'gender'         => $row['gender'] ?? null,
            'department'     => $row['department'] ?? null,
            'level'          => $row['level'] ?? null,
            'password'       => Hash::make($rawPassword),
            'raw_password'   => $rawPassword,
            'exam_season_id' => $this->examSeasonId,
        ]);
    }

    public function rules(): array
    {
        return [
            'file_no'   => 'required|string',
            'name'      => 'required|string|max:255',
            'telephone' => 'nullable|string|max:20',
        ];
    }

    public function batchSize(): int { return 500; }
    public function chunkSize(): int { return 500; }
}
```

---

## 9. Frontend — TypeScript/React Implementation

### 9.1 Exam Store (Zustand + TypeScript)

```ts
// resources/js/stores/exam-store.ts
import { create } from 'zustand';
import type { Question } from '@/types/exam';

type QuestionStatus = 'answered' | 'flagged' | 'unanswered';

interface ExamStore {
    questions: Question[];
    currentIndex: number;
    answers: Record<number, number>;     // { questionId: optionId }
    flagged: Set<number>;

    setQuestions: (questions: Question[]) => void;
    setAnswer: (questionId: number, optionId: number) => void;
    toggleFlag: (questionId: number) => void;
    goTo: (index: number) => void;
    goNext: () => void;
    goPrev: () => void;
    answeredCount: () => number;
    unansweredCount: () => number;
    getQuestionStatus: (questionId: number) => QuestionStatus;
}

export const useExamStore = create<ExamStore>((set, get) => ({
    questions:    [],
    currentIndex: 0,
    answers:      {},
    flagged:      new Set<number>(),

    setQuestions: (questions) => set({ questions }),

    setAnswer: (questionId, optionId) =>
        set((state) => ({ answers: { ...state.answers, [questionId]: optionId } })),

    toggleFlag: (questionId) =>
        set((state) => {
            const flagged = new Set(state.flagged);
            flagged.has(questionId) ? flagged.delete(questionId) : flagged.add(questionId);
            return { flagged };
        }),

    goTo:   (index) => set({ currentIndex: index }),
    goNext: () => set((s) => ({ currentIndex: Math.min(s.currentIndex + 1, s.questions.length - 1) })),
    goPrev: () => set((s) => ({ currentIndex: Math.max(s.currentIndex - 1, 0) })),

    answeredCount:   () => Object.keys(get().answers).length,
    unansweredCount: () => get().questions.length - get().answeredCount(),

    getQuestionStatus: (questionId): QuestionStatus => {
        if (get().flagged.has(questionId)) return 'flagged';
        if (get().answers[questionId])     return 'answered';
        return 'unanswered';
    },
}));
```

### 9.2 Exam Timer Hook

```ts
// resources/js/hooks/use-exam-timer.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';

interface UseExamTimerOptions {
    sessionId: number;
    initialSeconds: number;
    onExpire: () => void;
}

export function useExamTimer({ sessionId, initialSeconds, onExpire }: UseExamTimerOptions) {
    const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const syncRef     = useRef<ReturnType<typeof setInterval> | null>(null);

    const syncWithServer = useCallback(async () => {
        try {
            // Uses Wayfinder generated route
            const { data } = await axios.get<{ seconds_remaining: number }>(
                `/candidate/sync-time/${sessionId}`
            );
            setSecondsLeft(data.seconds_remaining);
        } catch {
            // Network blip — keep local countdown going
        }
    }, [sessionId]);

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setSecondsLeft((s) => {
                if (s <= 1) {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    onExpire();
                    return 0;
                }
                return s - 1;
            });
        }, 1000);

        syncRef.current = setInterval(syncWithServer, 60_000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (syncRef.current)     clearInterval(syncRef.current);
        };
    }, [onExpire, syncWithServer]);

    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;

    return {
        secondsLeft,
        display: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
        isLow: secondsLeft <= 300,
        isUrgent: secondsLeft <= 60,
    };
}
```

### 9.3 Question Navigator (shadcn/ui + CSS variables)

```tsx
// resources/js/components/exam/question-navigator.tsx
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useExamStore } from '@/stores/exam-store';

export function QuestionNavigator({ questionsPerPage = 1 }: { questionsPerPage: 1 | 2 | 3 | 4 }) {
    const { questions, currentIndex, goTo, getQuestionStatus } = useExamStore();

    const answered   = questions.filter((q) => getQuestionStatus(q.id) === 'answered').length;
    const flagged    = questions.filter((q) => getQuestionStatus(q.id) === 'flagged').length;
    const unanswered = questions.length - answered - flagged;

    const handleClick = (index: number) => {
        const pageStart = Math.floor(index / questionsPerPage) * questionsPerPage;
        goTo(pageStart);
    };

    return (
        <aside className="bg-card border-border w-64 shrink-0 rounded-2xl border p-4 shadow-sm">
            {/* Stats */}
            <div className="mb-3 space-y-1.5 text-xs font-mono">
                <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-sm" style={{ background: 'var(--exam-answered)' }} />
                    <span className="text-muted-foreground">Answered: <strong className="text-foreground">{answered}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-sm" style={{ background: 'var(--exam-flagged)' }} />
                    <span className="text-muted-foreground">Flagged: <strong className="text-foreground">{flagged}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="border-border h-3 w-3 rounded-sm border" style={{ background: 'var(--exam-unanswered)' }} />
                    <span className="text-muted-foreground">Remaining: <strong className="text-foreground">{unanswered}</strong></span>
                </div>
            </div>

            <div className="border-border mb-3 border-t" />

            {/* Question grid */}
            <ScrollArea className="h-80">
                <div className="grid grid-cols-5 gap-1.5 pr-3">
                    {questions.map((q, i) => {
                        const status    = getQuestionStatus(q.id);
                        const isCurrent = Math.floor(i / questionsPerPage) === Math.floor(currentIndex / questionsPerPage);

                        return (
                            <button
                                key={q.id}
                                onClick={() => handleClick(i)}
                                title={`Q${i + 1}: ${status}`}
                                className={cn(
                                    'border-border h-8 w-8 rounded-md border text-xs font-mono font-semibold transition-all',
                                    status === 'answered'   && 'border-transparent text-white',
                                    status === 'flagged'    && 'border-transparent text-white',
                                    status === 'unanswered' && 'bg-card text-secondary-foreground',
                                    isCurrent && 'ring-primary ring-2 ring-offset-1'
                                )}
                                style={
                                    status === 'answered'   ? { background: 'var(--exam-answered)' } :
                                    status === 'flagged'    ? { background: 'var(--exam-flagged)'  } :
                                    undefined
                                }
                            >
                                {i + 1}
                            </button>
                        );
                    })}
                </div>
            </ScrollArea>

            <p className="text-muted-foreground mt-3 border-t pt-3 text-[11px]">
                🔵 Ring = current page
            </p>
        </aside>
    );
}
```

### 9.4 Question Card (shadcn/ui)

```tsx
// resources/js/components/exam/question-card.tsx
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Question } from '@/types/exam';

interface QuestionCardProps {
    question: Question;
    questionNumber: number;
    totalQuestions: number;
    selectedOptionId?: number;
    onSelect: (optionId: number) => void;
}

export function QuestionCard({
    question, questionNumber, totalQuestions, selectedOptionId, onSelect
}: QuestionCardProps) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-mono text-xs">
                        Question {questionNumber} of {totalQuestions}
                    </span>
                    <span className="font-mono text-xs" style={{ color: 'var(--exam-answered)' }}>
                        {question.marks} mark{question.marks !== 1 ? 's' : ''}
                    </span>
                </div>
                <p className="text-foreground mt-2 text-base font-medium leading-relaxed">
                    {question.question_text}
                </p>
                {question.image_path && (
                    <img
                        src={`/storage/${question.image_path}`}
                        alt="Question"
                        className="mt-3 max-h-64 rounded-xl object-contain"
                    />
                )}
            </CardHeader>
            <CardContent className="space-y-2.5">
                {question.options.map((option) => {
                    const isSelected = selectedOptionId === option.id;
                    return (
                        <button
                            key={option.id}
                            onClick={() => onSelect(option.id)}
                            className={cn(
                                'flex w-full items-center gap-4 rounded-xl border-2 px-5 py-3.5 text-left transition-all duration-150',
                                isSelected
                                    ? 'border-transparent text-white'
                                    : 'border-border text-foreground hover:border-primary/40 hover:bg-primary/5'
                            )}
                            style={isSelected ? { background: 'var(--exam-answered)', borderColor: 'var(--exam-answered)' } : undefined}
                        >
                            <span className={cn(
                                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-bold',
                                isSelected ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                            )}>
                                {option.option_label}
                            </span>
                            <span className="text-sm leading-relaxed">{option.option_text}</span>
                        </button>
                    );
                })}
            </CardContent>
        </Card>
    );
}
```

### 9.5 Exam Room Page (TSX)

```tsx
// resources/js/pages/candidate/exam/room.tsx
import { useCallback, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { QuestionCard } from '@/components/exam/question-card';
import { QuestionNavigator } from '@/components/exam/question-navigator';
import { useExamStore } from '@/stores/exam-store';
import { useExamTimer } from '@/hooks/use-exam-timer';
import { toast } from 'sonner';
import axios from 'axios';
import type { Subject, Question, ExamSession } from '@/types/exam';
import { cn } from '@/lib/utils';

interface Props {
    session: ExamSession;
    subject: Subject;
    questions: Question[];
    secondsRemaining: number;
    questionsPerPage: 1 | 2 | 3 | 4;
}

export default function ExamRoom({ session, subject, questions, secondsRemaining, questionsPerPage }: Props) {
    const { setQuestions, setAnswer, answers, currentIndex, goNext, goPrev } = useExamStore();

    useEffect(() => { setQuestions(questions); }, [questions]);

    const handleExpire = useCallback(async () => {
        toast.error('Time is up! Submitting your exam…');
        try {
            await axios.post(`/candidate/submit/${session.id}`, { auto: true });
        } finally {
            router.visit('/candidate/results');
        }
    }, [session.id]);

    const { display, isLow, isUrgent } = useExamTimer({
        sessionId:      session.id,
        initialSeconds: secondsRemaining,
        onExpire:       handleExpire,
    });

    const handleAnswer = async (questionId: number, optionId: number) => {
        setAnswer(questionId, optionId);
        await axios.post(`/candidate/answer/${session.id}`, {
            question_id: questionId,
            option_id:   optionId,
        });
    };

    const start           = Math.floor(currentIndex / questionsPerPage) * questionsPerPage;
    const visibleQuestions = questions.slice(start, start + questionsPerPage);

    return (
        <div className="bg-background min-h-screen">
            {/* Fixed header bar */}
            <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-3 shadow-lg"
                    style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                <div>
                    <p className="font-mono text-xs uppercase tracking-widest opacity-70">Exam In Progress</p>
                    <h1 className="text-lg font-bold">{subject.name}</h1>
                </div>

                <div className={cn(
                    'font-mono text-4xl font-bold tracking-wider transition-colors',
                    isUrgent && 'animate-pulse',
                )}
                style={isLow ? { color: 'var(--exam-timer-warning)' } : undefined}>
                    {display}
                </div>

                <Button
                    variant="secondary"
                    onClick={() => {
                        if (confirm('Submit and end this subject exam?')) {
                            router.post(`/candidate/submit/${session.id}`);
                        }
                    }}
                    className="font-bold"
                >
                    Submit
                </Button>
            </header>

            {/* Content */}
            <div className="mx-auto flex max-w-7xl gap-6 px-6 pb-10 pt-20">
                <main className="flex-1 space-y-6">
                    {visibleQuestions.map((question, idx) => (
                        <QuestionCard
                            key={question.id}
                            question={question}
                            questionNumber={start + idx + 1}
                            totalQuestions={questions.length}
                            selectedOptionId={answers[question.id]}
                            onSelect={(optionId) => handleAnswer(question.id, optionId)}
                        />
                    ))}

                    <div className="flex justify-between">
                        <Button variant="outline" onClick={goPrev} disabled={currentIndex === 0}>
                            ← Previous
                        </Button>
                        <Button onClick={goNext} disabled={start + questionsPerPage >= questions.length}>
                            Next →
                        </Button>
                    </div>
                </main>

                <QuestionNavigator questionsPerPage={questionsPerPage} />
            </div>
        </div>
    );
}
```

### 9.6 Candidate Login Page (TSX)

The candidate login is a **separate page** from the Fortify admin login at `/login`. It renders using a custom layout:

```tsx
// resources/js/pages/candidate/login.tsx
import { Head } from '@inertiajs/react';
import { Form } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CandidateLogin() {
    return (
        <div className="bg-background flex min-h-screen items-center justify-center p-4"
             style={{ background: 'var(--sidebar)' }}>
            <Head title="Candidate Login" />

            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
                         style={{ background: 'var(--primary)' }}>
                        <span className="font-mono text-2xl font-bold text-white">E</span>
                    </div>
                    <CardTitle className="text-2xl">Examos CBT</CardTitle>
                    <CardDescription>Enter your exam credentials to continue</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form
                        action="/candidate/login"
                        method="post"
                        resetOnSuccess={['password']}
                        className="grid gap-4"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="file_no">File Number</Label>
                                    <Input
                                        id="file_no"
                                        name="file_no"
                                        type="text"
                                        required
                                        autoFocus
                                        placeholder="e.g. CS/001"
                                        className="font-mono uppercase"
                                    />
                                    <InputError message={errors.credentials ?? errors.device} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        placeholder="Your generated password"
                                    />
                                </div>

                                <Button type="submit" className="mt-2 w-full" disabled={processing}>
                                    {processing && <Spinner />}
                                    Enter Exam Portal
                                </Button>
                            </>
                        )}
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
```

---

## 10. Exam Engine

### 10.1 Exam Session Service

```php
// app/Services/ExamSessionService.php
namespace App\Services;

use App\Models\{Candidate, Subject, CandidateExamSession, CandidateAnswer, Question};

class ExamSessionService
{
    /**
     * Start fresh or resume an existing session.
     * Timer is always based on expires_at — never resets on re-login.
     */
    public function startOrResume(Candidate $candidate, Subject $subject): array
    {
        $session = CandidateExamSession::firstOrNew([
            'candidate_id' => $candidate->id,
            'subject_id'   => $subject->id,
        ]);

        if ($session->exists && $session->status === 'completed') {
            throw new \Exception('This exam has already been submitted.');
        }

        if (!$session->exists) {
            $questionOrder = $this->randomiseQuestions($subject);
            $session->fill([
                'exam_season_id' => $subject->exam_season_id,
                'status'         => 'active',
                'started_at'     => now(),
                'expires_at'     => now()->addMinutes($subject->duration_minutes),
                'question_order' => $questionOrder,
            ])->save();
        } else {
            $session->update(['status' => 'active', 'device_released' => false]);
        }

        return [
            'session'          => $session->fresh(),
            'secondsRemaining' => $this->getRemainingSeconds($session->fresh()),
            'questions'        => $this->getOrderedQuestions($session->fresh()),
        ];
    }

    private function randomiseQuestions(Subject $subject): array
    {
        return Question::where('subject_id', $subject->id)
            ->where('is_active', true)
            ->inRandomOrder()
            ->limit($subject->total_questions_to_display)
            ->pluck('id')
            ->toArray();
    }

    public function getOrderedQuestions(CandidateExamSession $session): array
    {
        $orderedIds = $session->question_order;

        // Options randomised per page load (harder to share answers)
        $questions = Question::with(['options' => fn($q) => $q->inRandomOrder()])
            ->whereIn('id', $orderedIds)
            ->get()
            ->keyBy('id');

        return collect($orderedIds)
            ->map(fn($id) => $questions[$id] ?? null)
            ->filter()
            ->values()
            ->toArray();
    }

    public function saveAnswer(CandidateExamSession $session, int $questionId, int $optionId): void
    {
        abort_if(!in_array($questionId, $session->question_order), 422, 'Invalid question.');

        $isCorrect = \App\Models\QuestionOption::where('id', $optionId)
            ->where('question_id', $questionId)
            ->where('is_correct', true)
            ->exists();

        CandidateAnswer::updateOrCreate(
            ['session_id' => $session->id, 'question_id' => $questionId],
            ['selected_option_id' => $optionId, 'is_correct' => $isCorrect, 'answered_at' => now()]
        );
    }

    public function submit(CandidateExamSession $session): void
    {
        $score = CandidateAnswer::where('session_id', $session->id)
            ->join('questions', 'candidate_answers.question_id', '=', 'questions.id')
            ->where('candidate_answers.is_correct', true)
            ->sum('questions.marks');

        $totalMarks = Question::whereIn('id', $session->question_order)->sum('marks');

        $session->update([
            'status'       => 'completed',
            'submitted_at' => now(),
            'score'        => $score,
            'total_marks'  => $totalMarks,
        ]);
    }

    public function getRemainingSeconds(CandidateExamSession $session): int
    {
        if ($session->status === 'completed') return 0;
        return max(0, now()->diffInSeconds($session->expires_at, false));
    }
}
```

### 10.2 Auto-Expire Cron Command

```php
// app/Console/Commands/AutoExpireExamSessions.php
namespace App\Console\Commands;

use App\Models\CandidateExamSession;
use App\Services\ExamSessionService;
use Illuminate\Console\Command;

class AutoExpireExamSessions extends Command
{
    protected $signature   = 'exam:expire-sessions';
    protected $description = 'Auto-submit exam sessions whose time has expired.';

    public function handle(ExamSessionService $examService): void
    {
        $expired = CandidateExamSession::where('status', 'active')
            ->where('expires_at', '<=', now())->get();

        foreach ($expired as $session) {
            $examService->submit($session);
        }

        $this->info("{$expired->count()} session(s) auto-submitted.");
    }
}
```

Register in `routes/console.php`:
```php
// routes/console.php
use Illuminate\Support\Facades\Schedule;

Schedule::command('exam:expire-sessions')->everyMinute();
```

---

## 11. Admin Module

### 11.1 Admin Dashboard uses existing AppLayout

```tsx
// resources/js/pages/admin/dashboard.tsx
import AppLayout from '@/layouts/app-layout';  // ✅ Already exists
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Clock, CheckCircle2, BookOpen } from 'lucide-react';

// Page uses AppLayout automatically (from app.tsx routing for admin/* pages)
export default function AdminDashboard({ stats }: { stats: Record<string, number> }) {
    return (
        <>
            <Head title="Admin Dashboard" />
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                        <Clock className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.active_sessions}</div>
                    </CardContent>
                </Card>
                {/* ... more stat cards */}
            </div>
        </>
    );
}
```

### 11.2 Admin Navigation

Extend the existing sidebar navigation in `app/components/nav-main.tsx` with CBT-specific links. Use the existing `NavMain` component pattern:

```tsx
// Add to the navItems array in your admin layout configuration:
const cbtNavItems = [
    { title: 'Dashboard',   url: '/admin/dashboard',  icon: LayoutDashboard },
    { title: 'Exam Seasons', url: '/admin/seasons',   icon: Calendar },
    { title: 'Subjects',    url: '/admin/subjects',   icon: BookOpen },
    { title: 'Questions',   url: '/admin/questions',  icon: FileQuestion },
    { title: 'Candidates',  url: '/admin/candidates', icon: Users },
    { title: 'Monitor',     url: '/admin/monitor',    icon: Monitor },
    { title: 'Results',     url: '/admin/results',    icon: BarChart3 },
    { title: 'Audit Log',   url: '/admin/audit',      icon: Shield },
];
```

---

## 12. Audit & Activity Logging

```php
// Add to all critical models (ExamSeason, Subject, Question, Candidate, CandidateExamSession):
use OwenIt\Auditing\Contracts\Auditable;
use OwenIt\Auditing\Auditable as AuditableTrait;

class ExamSeason extends Model implements Auditable
{
    use AuditableTrait;
    protected $auditEvents  = ['created', 'updated', 'deleted'];
    protected $auditExclude = ['updated_at'];
}
```

```php
// In all admin controller mutations, add activity log:
activity()
    ->causedBy(auth()->user())
    ->performedOn($candidate)
    ->log('Device released for candidate re-login');
```

---

## 13. Build Phases & Milestones

### Phase 1 — Foundation (Week 1)
- [ ] Install new Composer packages (spatie/permission, maatwebsite/excel, owen-it/auditing, dompdf, reverb)
- [ ] Add `HasRoles` to existing `User` model
- [ ] Add `candidate` guard to `config/auth.php`
- [ ] Create all 9 new migrations
- [ ] Run `php artisan migrate`
- [ ] Create `RolesAndPermissionsSeeder` + `SuperAdminSeeder`
- [ ] Update `HandleInertiaRequests` to share roles/permissions/candidate
- [ ] Create `routes/candidate.php` + update `bootstrap/app.php`
- [ ] Update brand CSS tokens in `resources/css/app.css`

### Phase 2 — Admin CRUD (Week 2–3)
- [ ] ExamSeason CRUD + activate/deactivate
- [ ] Subject CRUD with criteria builder
- [ ] Question CRUD + image upload (Storage::disk('public'))
- [ ] Bulk question import (CSV/XLSX)
- [ ] Candidate CRUD + CSV/XLSX import
- [ ] Credential PDF (DomPDF) — print File No + password
- [ ] Subject allocation engine
- [ ] Admin sidebar navigation updated with CBT links

### Phase 3 — Candidate Portal (Week 4–5)
- [ ] Candidate login page (TSX, shadcn/ui Card)
- [ ] `CandidateAuthController` with device fingerprinting
- [ ] `EnsureDeviceNotLocked` middleware
- [ ] Candidate profile page (allocated subjects)
- [ ] Instructions page per subject
- [ ] Exam room layout (fixed header + sidebar)
- [ ] `QuestionCard` + `QuestionNavigator` components
- [ ] Auto-save answer on selection (axios.post)

### Phase 4 — Exam Engine (Week 6)
- [ ] `ExamSessionService` (start/resume/submit/syncTime)
- [ ] Question order persisted in `question_order` JSON column
- [ ] Option randomisation per page load
- [ ] Server-side timer (expires_at) + 60s client sync
- [ ] `exam:expire-sessions` cron + schedule registration
- [ ] `EnsureExamTimeNotExpired` middleware on submit route

### Phase 5 — Admin Monitoring (Week 7)
- [ ] Live monitor dashboard (active sessions list)
- [ ] Device release action + Reverb WebSocket broadcast
- [ ] Force-submit action
- [ ] Extend time action
- [ ] Results release toggle per season
- [ ] Candidate results page (gated by `allow_result_review`)

### Phase 6 — Audit & Polish (Week 8–9)
- [ ] Audit trait on all critical models
- [ ] Activity log on all admin mutations
- [ ] Audit log viewer page
- [ ] Brand token final pass (all pages)
- [ ] Generate Wayfinder routes: `php artisan wayfinder:generate --with-form`
- [ ] PHPUnit/Pest feature tests
- [ ] TypeScript strict mode check: `npm run types:check`
- [ ] Code style: `composer lint` + `npm run format`

---

## 14. Environment Updates

The existing `.env` is mostly correct. Make these changes:

```dotenv
# Update these from defaults:
APP_NAME="Examos CBT"
APP_URL=http://localhost  # or your Herd URL

# Already correctly set:
DB_CONNECTION=mysql
DB_DATABASE=examos

SESSION_DRIVER=database   # ✅ Already set
QUEUE_CONNECTION=database # ✅ Already set — switch to redis when deploying

# Add when Reverb is installed:
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=examos
REVERB_APP_KEY=examos_key
REVERB_APP_SECRET=examos_secret
REVERB_HOST="localhost"
REVERB_PORT=8080
REVERB_SCHEME=http

VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"
```

> [!NOTE]
> The project already has `SESSION_DRIVER=database` and the sessions table is created by the existing users migration. Queue uses the `database` driver — this is fine for development.
> For production: switch `QUEUE_CONNECTION=redis` and `CACHE_STORE=redis`.

---

## 15. Testing Strategy

The project uses **PHPUnit 12** (already in `require-dev`). Run tests with:

```bash
# Full test suite (also runs lint + type checks)
composer test

# Just PHPUnit
php artisan test

# Type checks
npm run types:check

# Code format check
npm run format:check
```

### Feature Tests

```php
// tests/Feature/Candidate/CandidateLoginTest.php
use App\Models\Candidate;
use App\Models\ExamSeason;

it('candidate can login with correct file_no and password', function () {
    $season    = ExamSeason::factory()->active()->create();
    $candidate = Candidate::factory()->for($season)->create([
        'file_no'  => 'CS/001',
        'password' => bcrypt('John@5678'),
    ]);

    $this->post('/candidate/login', [
        'file_no'  => 'CS/001',
        'password' => 'John@5678',
    ])->assertRedirect(route('candidate.profile'));
});

it('prevents login on a second device while session is active', function () {
    $candidate = Candidate::factory()->create();

    // Login from Device A
    $this->post('/candidate/login', [
        'file_no'  => $candidate->file_no,
        'password' => 'Test@1234',
    ], ['User-Agent' => 'DeviceA']);

    // Attempt from Device B
    $this->post('/candidate/login', [
        'file_no'  => $candidate->file_no,
        'password' => 'Test@1234',
    ], ['User-Agent' => 'DeviceB'])
        ->assertSessionHasErrors('device');
});

it('exam timer is server-authoritative', function () {
    $session = CandidateExamSession::factory()->active()->create([
        'expires_at' => now()->addMinutes(30),
    ]);

    $this->actingAs($session->candidate, 'candidate')
        ->getJson("/candidate/sync-time/{$session->id}")
        ->assertOk()
        ->assertJsonStructure(['seconds_remaining']);
});

it('admin can login via fortify with 2fa', function () {
    // Fortify's existing tests cover this — see tests/Feature/Auth/
});
```

---

## Appendix A — Running the Dev Server

```bash
# Uses the existing composer dev script (already configured):
composer dev

# This runs concurrently:
# - php artisan serve
# - php artisan queue:listen
# - php artisan pail (log viewer)
# - npm run dev (Vite)
```

---

## Appendix B — CSV Import Templates

### Candidates CSV
```
file_no,name,email,telephone,gender,department,level
CS/001,John Doe,john@example.com,08012345678,Male,Computer Science,300
```
> Password auto-generated: **John@5678**

### Question Bank CSV
```
question_text,option_a,option_b,option_c,option_d,correct_option,marks
"What is 2 + 2?","3","4","5","6","B",1
```

---

## Appendix C — Security Checklist

| Item | Status |
|---|---|
| Fortify CSRF + rate limiting on admin login | ✅ Built-in |
| 2FA + Passkeys on admin accounts | ✅ Already configured |
| Candidate login rate limiting (5/min) | ✅ throttle:5,1 |
| Device fingerprinting (prevent concurrent sessions) | 🔲 Implement |
| Server-authoritative timer (expires_at, not client) | 🔲 Implement |
| Persisted question order (no re-shuffle on reload) | 🔲 Implement |
| Answer correctness verified on each save | 🔲 Implement |
| Permissions enforced on backend (authorize()) | 🔲 Implement |
| Soft deletes on questions and candidates | 🔲 Implement |
| DB transactions on imports | 🔲 Implement |
| Audit trail on all admin CRUD | 🔲 Implement |
| Raw password purged after credential printing | 🔲 Implement |

---

*End of Development Guide v2.0 — Examos CBT Platform*
*Aligned with actual project: Laravel 13.7 + Fortify + Inertia v3 + React 19 + TypeScript + shadcn/ui*
