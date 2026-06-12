# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a high-fidelity static HTML prototype for a **内容中台系统 (Content Management Platform)** — a government/enterprise-grade content management system with CMS, review workflows, portal publishing, and analytics.

- **Type**: Static HTML prototype (no build system, no framework)
- **Entry point**: `index.html` redirects to `dashboard.html`
- **~30 HTML pages** covering Dashboard, Content, Portal, News, Data, Resource, and System management modules

## Architecture

### Layout Structure
All pages share a common shell:
- **Top navbar**: 64px height, contains logo, search, notifications, user menu
- **Left sidebar**: 220px width, collapsible menu with two-level navigation (section headers + menu items with badge counts for pending items like review queue)
- **Content area**: `flex-1`, scrollable, with consistent page padding (24px)

### Design System
Defined in [SPEC.md](SPEC.md):
- **Colors**: Dark blue-black background (#030714), accent blue (#3b82f6), semantic colors for success/warning/error
- **Typography**: PingFang SC / Microsoft YaHei, JetBrains Mono for code
- **Spacing**: 4px base unit, 12/16/24px common gaps
- **Components**: Cards (12px radius), buttons (8px), modals (16px)

### Module Structure
Pages follow a naming convention: `{module}-{page}.html`
- `content-*`: Content management (list, category, tag, review, publish)
- `portal-*`: Portal operations (home decoration, banner, column, topic)
- `news-*`: News/announcements/policy
- `data-*`: Analytics (overview, content analysis)
- `resource-*`: Media management (image, file, video)
- `system-*`: System settings (user, role, permission, config, log)
- `help-*`: Help center (FAQ, docs)
- `resource-picker.html`: Standalone resource picker modal (not part of sidebar nav)

### Planning Documents
- `/plan/*.md` — Feature planning (role permissions, publish management)
- `/docs/*.md` — Module analysis and optimization plans

## Development

Since this is a static prototype:
- **No build step** — open HTML files directly in browser or serve via any static server
- **No tests** — prototype validation via browser preview
- **Tailwind CDN** — Pages load Tailwind via CDN with per-page `tailwind.config` for color tokens; custom CSS in `<style>` blocks
- **Shared components** — common HTML/CSS patterns duplicated across files; extract to shared stylesheets if making structural changes
- To serve locally: `npx serve .` or any static file server

> **Note:** SPEC.md describes a dark theme (#030714 background), but the actual HTML pages implement a light theme (white/slate backgrounds). The light theme in the HTML files is the current implementation.

## Working with This Prototype

When modifying pages:
1. Follow the design system in SPEC.md for spacing, component shapes, and naming conventions — but note the actual color values are defined via Tailwind config in each HTML file
2. Maintain the shared layout structure (navbar + sidebar + content)
3. FontAwesome 6.x is used for icons (CDN loaded in pages)
4. Keep page-level JavaScript inline for prototype interactivity
5. When adding new color tokens, update both the Tailwind `extend.colors` config and the corresponding CSS variable/class