import { readFileSync } from "node:fs";

import { html, raw } from "../helpers/html";
import { CHANGELOG_PATH } from "../../config";
import { PageSidebarLayout } from "../components/PageSidebarLayout";
import { PageTabs, type PageTabGroup } from "../components/PageTabs";
import {
  BookOpen,
  Bug,
  Code2,
  Copy,
  GitPullRequest,
  Globe,
  Heart,
  HeartHandshake,
  HelpCircle,
  History,
  Info,
  Languages,
  Mail,
  Megaphone,
  MessageSquare,
  Scale,
  Server,
  Shield,
  ShieldAlert,
} from "../components/icons";

import {
  Callout,
  CONTACT_EMAIL,
  CRYPTO_WALLET_ADDRESS,
  ExternalLinkButton,
  FactList,
  FactRow,
  FAQItem,
  InfoCard,
  Lead,
  LICENSE_NAME,
  MailButton,
  REPO_CHANGELOG_URL,
  REPO_COMMITS_URL,
  REPO_CONTRIBUTING_URL,
  REPO_DISCUSSIONS_URL,
  REPO_DOCS_URL,
  REPO_ISSUES_URL,
  REPO_LICENSE_URL,
  REPO_URL,
  SectionHeading,
} from "./parts/about-parts";
import { type ChangelogYear, parseChangelog } from "./parts/parseChangelog";

// ===== Tab groups — ported from master AboutPage.tsx =====
const groups: readonly PageTabGroup[] = [
  {
    label: "Project",
    items: [
      { id: "about", label: "About ChessViewer", icon: Info },
      { id: "changelog", label: "Changelog", icon: History },
      { id: "privacy", label: "Privacy", icon: Shield },
    ],
  },
  {
    label: "Help",
    items: [
      { id: "faq", label: "FAQ", icon: HelpCircle },
      { id: "contact", label: "Contact", icon: Mail },
    ],
  },
  {
    label: "Community",
    items: [
      { id: "contribute", label: "Contribute", icon: Code2 },
      { id: "donate", label: "Donate", icon: Heart },
      { id: "thanks", label: "Thanks", icon: HeartHandshake },
    ],
  },
];

export const VALID_TAB_IDS = groups.flatMap((g) => g.items).map((t) => t.id);
export const DEFAULT_TAB = "about";

const CATEGORY_LABELS: Record<string, string> = {
  Features: "Features",
  "Bug Fixes": "Bug fixes",
  "Performance Improvements": "Performance",
  Reverts: "Reverts",
};

// ===== Changelog data (parsed once at server start) =====
let changelogYears: ChangelogYear[] | null = null;

function getChangelogYears(): ChangelogYear[] {
  if (changelogYears === null) {
    try {
      const source = readFileSync(CHANGELOG_PATH, "utf8");
      changelogYears = parseChangelog(source);
    } catch {
      changelogYears = [];
    }
  }
  return changelogYears;
}

// ===== Inline markdown (code + italics) — ported from ChangelogSection =====
function renderInlineMarkdown(text: string): string {
  return text
    .split(/(`[^`]+`|_[^_]+_)/g)
    .filter(Boolean)
    .map((part) => {
      if (part.startsWith("`") && part.endsWith("`")) {
        return html`<code class="changelog-code">${part.slice(1, -1)}</code>`;
      }
      if (part.startsWith("_") && part.endsWith("_")) {
        return `<em>${part.slice(1, -1)}</em>`;
      }
      return part;
    })
    .join("");
}

function escapeHtmlValue(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ===== Changelog entry row =====
function ChangelogEntryRow(entry: {
  scope: string | null;
  text: string;
  hash: string | null;
  commitUrl: string | null;
  issueNumber: string | null;
  issueUrl: string | null;
}): string {
  return html`<li class="changelog-entry">
    <span class="changelog-entry-bullet"></span>
    <span class="changelog-entry-text">
      ${entry.scope ? html`<span class="changelog-scope">${entry.scope}:</span>` : ""}
      ${renderInlineMarkdown(entry.text)}
      ${entry.hash && entry.commitUrl
        ? html` <a
            href="${entry.commitUrl}"
            target="_blank"
            rel="noopener noreferrer"
            class="changelog-link"
            >#${entry.hash}</a
          >`
        : ""}
      ${entry.issueNumber && entry.issueUrl
        ? html` (closes
            <a
              href="${entry.issueUrl}"
              target="_blank"
              rel="noopener noreferrer"
              class="changelog-link-warning"
              >#${entry.issueNumber}</a
            >)`
        : ""}
    </span>
  </li>`;
}

// ===== Sections =====
function AboutSection(): string {
  return html` <div class="about-section">
    <div class="about-block">
      ${SectionHeading({ icon: Info, title: "About ChessViewer" })}
      ${Lead({
        children: `Simply put, ChessViewer is a free tool that lets you build chess positions and turn them into high-quality images for print or screen. Drag the pieces onto the board however you want, pick a style, and download. Nothing to install, no sign-up — it all runs right in your browser, fast.`,
      })}
    </div>

    ${InfoCard({
      title: "Why does this exist?",
      children: `
          <p>Say you need a clean chess board image for a book, an article, a YouTube video, or a worksheet for your students. That&apos;s exactly what ChessViewer is for. It is not an engine — it will not suggest moves or play against you. It has one job: turn the position you build into the sharpest, cleanest image possible.</p>
          <p>And it is completely free — no annoying ads, no code tracking you in the background, no &quot;upgrade to Premium&quot; popups.</p>
        `,
    })}
    ${InfoCard({
      title: "Who is it for?",
      children: `
          <ul class="list-disc pl-5 space-y-2">
            <li><strong class="text-text-primary">Teachers and coaches:</strong> putting together worksheets or slides for students.</li>
            <li><strong class="text-text-primary">Writers and bloggers:</strong> adding crisp, print-quality (high-DPI) images to articles or books.</li>
            <li><strong class="text-text-primary">YouTubers and streamers:</strong> making custom board images for video thumbnails.</li>
            <li><strong class="text-text-primary">Developers:</strong> turning a FEN string straight into an image without any hassle.</li>
          </ul>
        `,
    })}
    ${InfoCard({
      title: "What can you do with it?",
      children: `
          <ul class="list-disc pl-5 space-y-3">
            <li><strong class="text-text-primary">Simple controls.</strong> Just grab a piece and drop it where you want on the board. Flip the board, hide or show coordinates — it all works the way you&apos;d expect.</li>
            <li><strong class="text-text-primary">FEN support.</strong> Got a FEN string handy? Paste it in and watch the board update instantly. If something is off, ChessViewer flags it before you export.</li>
            <li><strong class="text-text-primary">Real quality.</strong> Export as PNG, JPEG, or SVG. You can push the quality up to 1200 DPI — print-shop level.</li>
            <li><strong class="text-text-primary">Batch export.</strong> Writing a book and need 30 different positions exported at once? Don&apos;t do them one by one. Paste all the FEN strings in and download them as a single ZIP.</li>
            <li><strong class="text-text-primary">Your look, your call.</strong> Change the board colors and piece style to match whatever you&apos;re working on.</li>
            <li><strong class="text-text-primary">Auto-save.</strong> Nothing you are working on gets lost — it stays saved on your device. Search back through it and pick up where you left off any time.</li>
            <li><strong class="text-text-primary">Database lookup.</strong> Wondering if a position has ever been played before? Check it against Lichess, ChessDB, PDB, and YACPDB in one click.</li>
          </ul>
        `,
    })}
    ${InfoCard({
      title: "Do I have to sign up?",
      children: `
          <p>Not at all. Open the site and start working — everything stays in your browser. If you do create an account, you get one extra perk: your positions and settings sync across your devices, phone and computer alike. Your data is protected by row-level security in the database — only your account can read your rows, nobody else&apos;s. You can also turn on two-factor authentication for extra peace of mind.</p>
        `,
    })}
    ${InfoCard({
      title: "The idea behind it",
      children: `
          <p>ChessViewer started as something built just for one person — a fast way to put together a decent chess diagram without wrestling with image editors or paying for software that does too much. Turns out other people needed the same thing, so it was made open source and put out there for everyone.</p>
          <p>There is no company or investor behind it. Your data isn&apos;t sold to anyone, nothing tracks you in the background, and nothing here is paid. The code is all on GitHub — read it, run it locally, or send in a contribution whenever you want.</p>
        `,
    })}

    <div class="about-block">
      <h3 class="text-sm font-bold uppercase tracking-wider text-text-secondary">At a glance</h3>
      ${FactList({
        children: `
            ${FactRow({ icon: Scale, label: "License", value: escapeHtmlValue(LICENSE_NAME) })}
            ${FactRow({
              icon: Globe,
              label: "Source code",
              value: `<a href="${REPO_URL}" target="_blank" rel="noopener noreferrer" class="about-text-link">GitHub</a>`,
            })}
            ${FactRow({
              icon: Server,
              label: "Account &amp; sync",
              value: "Optional — your data, your browser",
            })}
          `,
      })}
    </div>
  </div>`;
}

function ChangelogSection(year?: string): string {
  const years = getChangelogYears();
  const totalEntries = years.reduce(
    (n, y) =>
      n + y.months.reduce((mn, m) => mn + m.groups.reduce((gn, g) => gn + g.entries.length, 0), 0),
    0,
  );

  const currentYear = year ? years.find((y) => y.year === Number(year)) : years[0];
  const page = currentYear ?? years[0];

  const yearLinks = (y: ChangelogYear): string => {
    const isActive = page !== undefined && y.year === page.year;
    return html`<a
      href="?tab=changelog&year=${y.year}"
      aria-current="${isActive ? "page" : undefined}"
      class="changelog-year-btn ${isActive ? "changelog-year-active" : "changelog-year-inactive"}"
      >${y.year}</a
    >`;
  };

  const newerLink = (index: number): string => {
    if (index === 0) return html`<span class="changelog-nav-btn" aria-disabled="true">Newer</span>`;
    const prev = years[index - 1];
    return html`<a href="?tab=changelog&year=${prev?.year}" class="changelog-nav-btn">Newer</a>`;
  };

  const olderLink = (index: number): string => {
    if (index === years.length - 1) {
      return html`<span class="changelog-nav-btn" aria-disabled="true">Older</span>`;
    }
    const next = years[index + 1];
    return html`<a href="?tab=changelog&year=${next?.year}" class="changelog-nav-btn">Older</a>`;
  };

  return html` <div class="about-section">
    <div class="about-block">
      ${SectionHeading({ icon: History, title: "Changelog" })}
      ${Lead({
        children: `Every notable change to ChessViewer, grouped by month, taken directly from
            <a href="${REPO_CHANGELOG_URL}" target="_blank" rel="noopener noreferrer" class="about-text-link">CHANGELOG.md</a>
            — ${totalEntries} changes so far. There are no version tags; every complete month is a rolling release. Browse every
            <a href="${REPO_COMMITS_URL}" target="_blank" rel="noopener noreferrer" class="about-text-link">commit on GitHub</a>.`,
      })}
    </div>

    ${page
      ? html`<ol>
            ${page.months
              .map(
                (month) =>
                  html`<li class="mb-8 list-none">
                    <h3 class="changelog-month-title">${month.title}</h3>
                    <hr class="changelog-rule" />
                    ${month.note
                      ? html`<p class="mb-4 text-base leading-relaxed text-text-secondary">
                          ${renderInlineMarkdown(month.note)}
                        </p>`
                      : ""}
                    ${month.groups
                      .map(
                        (group) =>
                          html`<div class="mb-6">
                            <h4 class="changelog-category-title">
                              ${CATEGORY_LABELS[group.category] ?? group.category}
                            </h4>
                            <ul>
                              ${group.entries.map(ChangelogEntryRow).join("")}
                            </ul>
                          </div>`,
                      )
                      .join("")}
                  </li>`,
              )
              .join("")}
          </ol>

          <nav aria-label="Changelog years" class="flex items-center justify-between gap-4 pt-2">
            ${newerLink(years.findIndex((y) => y.year === page.year))}
            <div class="flex items-center gap-2">${years.map(yearLinks).join("")}</div>
            ${olderLink(years.findIndex((y) => y.year === page.year))}
          </nav>`
      : ""}
  </div>`;
}

function FaqSection(): string {
  const faqs: Array<{ q: string; a: string }> = [
    {
      q: "What does ChessViewer actually do?",
      a: "It's simply a diagram editor. You build a chess position, style it how you like, and download it as a high-quality image for print or screen. That means there's no opponent to play against, no AI suggesting moves, no analysis engine inside. It's purely built to turn chess positions into clean, sharp images.",
    },
    {
      q: "Do I need to sign up to use it?",
      a: "Not at all. Every feature works perfectly without an account. The positions you build, your search history, and your style settings are saved right on your own device (in your browser). You only need an account if you want that same data to follow you across devices — say, both your computer and your phone.",
    },
    {
      q: "Is it really completely free?",
      a: 'Yes, all the way through. No "trial version", no "Premium feature", no ads cluttering the screen. Every single feature is completely free for everyone. ChessViewer is open source and all the code is on GitHub.',
    },
    {
      q: "What formats and sizes can I download images in?",
      a: "PNG, JPEG, and SVG. For PNG and JPEG you can even set the physical size in centimeters and push the quality up to 1200 DPI, print-shop level. That way your diagram looks sharp as glass whether it&rsquo;s on screen or printed on paper. You can also copy it straight to the clipboard instead of downloading.",
    },
    {
      q: "How do I add a position to the board?",
      a: "Two really easy ways: either grab pieces from the palette and drag them onto the board, or paste a FEN string you already have into the box on screen. The moment you paste it, ChessViewer checks it and places it on the board without any errors.",
    },
    {
      q: "Can I download several different positions at once (bulk export)?",
      a: "Yes! Head to the Advanced FEN page for that. Paste in a bunch of different FEN strings, hit the button, and the system neatly names each one and hands you back a single ZIP file. A must-have if you're writing a book or a course.",
    },
    {
      q: "Can I use the images I make for commercial work?",
      a: "Of course. Those images are entirely yours. Use them freely in your book, your article, a paid course, YouTube videos, or client work. We place no license or copyright restriction on the output whatsoever.",
    },
    {
      q: "Why does the site slow down on very large images?",
      a: "Producing an A4-size image at 1200 DPI is a heavy computation that demands a lot from your computer's memory (RAM) and processor. We run that heavy work in the background so the site doesn't freeze, but computations that big still take a bit of time regardless. If your browser is struggling, try dropping the DPI or the size a notch.",
    },
    {
      q: "Which browsers does it support?",
      a: "It works flawlessly on Chrome, Edge, Firefox, and Safari. There's one small exception: because of Safari's own internal limits, exporting very large (high-DPI) images can sometimes be an issue there. So for heavy print jobs, using Chrome or Edge will give you more headroom.",
    },
    {
      q: "Can I install ChessViewer as an app on my computer or phone?",
      a: 'Yes, because ChessViewer is also a PWA (Progressive Web App). Your browser will automatically offer you an "Install" or "Add to home screen" option. Do that, and it opens as a fully standalone app — and it&rsquo;ll keep working perfectly even offline.',
    },
    {
      q: "What is a FEN string?",
      a: 'FEN (Forsyth-Edwards Notation) is the standard format that packs any chess position into a single short line of text that computers and programs can understand. It records where every piece sits, whose turn it is, and a few other small details. A move looks something like this: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1". Every chess site and database out there supports the FEN format.',
    },
  ];

  return html` <div class="about-section">
    <div class="about-block">
      ${SectionHeading({
        icon: HelpCircle,
        title: "Frequently Asked Questions",
      })}
      ${Lead({
        children: `Answers to the most common questions about ChessViewer. If your question is not here, ask in
            <a href="${REPO_ISSUES_URL}" target="_blank" rel="noopener noreferrer" class="about-text-link">GitHub issues</a>
            or email
            <a href="mailto:${CONTACT_EMAIL}" class="about-text-link">${CONTACT_EMAIL}</a>.`,
      })}
    </div>

    <div class="space-y-3">${faqs.map((item) => FAQItem(item)).join("")}</div>
  </div>`;
}

function ContactSection(): string {
  return html` <div class="about-section">
    <div class="about-block">
      ${SectionHeading({ icon: Mail, title: "Contact" })}
      ${Lead({
        children: `When you want to tell us something about the project, picking the right channel makes life easier for both of us. Short version: use GitHub for anything technical that other people could benefit from reading, and email for things that are just about you personally.`,
      })}
    </div>

    ${InfoCard({
      title: "Found a bug or have a new idea?",
      children: `
          <p>Something not working, or a nice idea popped into your head like &quot;it&apos;d be great if it also did X&quot;? The best place for that is opening a GitHub issue. If you&apos;re reporting a bug, please write down which browser you&apos;re using and walk through how the bug happened. The more detail you give us, the faster we can fix it.</p>
          ${ExternalLinkButton({
            href: REPO_ISSUES_URL,
            icon: Bug,
            variant: "primary",
            className: "mt-1",
            children: "Open a GitHub issue",
          })}
        `,
    })}
    ${InfoCard({
      title: "Got a question or want to discuss something?",
      children: `
          <p>For general questions and thoughts that aren&apos;t really bugs — things like &quot;how do I do this?&quot; or &quot;what if we added a feature like that?&quot; — GitHub Discussions is the better fit. Think of it as an open forum: the question you ask and the answer you get will help someone else running into the same thing later.</p>
          ${ExternalLinkButton({
            href: REPO_DISCUSSIONS_URL,
            icon: MessageSquare,
            className: "mt-1",
            children: "Start a discussion",
          })}
        `,
    })}
    ${InfoCard({
      title: "For personal matters (email)",
      children: `
          <p>If something only concerns you — an account issue, a deletion request, or anything personal you would rather not post publicly — you can email us directly. We try to read and reply as quickly as we can.</p>
          <div class="flex flex-wrap items-center gap-3 pt-1">
            ${MailButton({
              email: CONTACT_EMAIL,
              icon: Mail,
              children: CONTACT_EMAIL,
            })}
          </div>
        `,
    })}
    ${InfoCard({
      title: "Found a serious security issue?",
      children: `
          <p>If you have found a serious security vulnerability, please do not post it publicly anywhere, GitHub included. We need to fix the problem before anyone can take advantage of it. Send security reports straight to our email — we take these very seriously and will act on them as fast as possible.</p>
          <div class="flex flex-wrap items-center gap-3 pt-1">
            ${MailButton({
              email: CONTACT_EMAIL,
              subject: "Security report",
              icon: ShieldAlert,
              children: "Report privately by email",
            })}
          </div>
        `,
    })}
  </div>`;
}

function ContributeSection(): string {
  return html` <div class="about-section">
    <div class="about-block">
      ${SectionHeading({ icon: Code2, title: "Contribute" })}
      ${Lead({
        children: `ChessViewer is fully open source and develops out in the open. The code lives on GitHub — anyone can read it, run it on their own machine, and make it better. If you have ever wanted to contribute to a real, working project that people actually use, this is a great place to start.`,
      })}
    </div>

    ${InfoCard({
      title: "The tech (source code)",
      children: `
          <p>The project&apos;s architecture is simple and modern: it is built with Preact and TypeScript, bundled with Vite, and styled with Tailwind CSS. Backend work like auth and sync is handled by Supabase. The codebase is documented clearly enough that finding your way around should not take long.</p>
          <p>You can clone it and run it locally with a single command. None of the core features, like the chess board itself, need any hidden API key. Supabase keys are only needed for auth and cloud features — and even those are optional anyway.</p>
          <div class="flex flex-wrap items-center gap-3 pt-1">
            ${ExternalLinkButton({
              href: REPO_URL,
              icon: Code2,
              variant: "primary",
              children: "View source on GitHub",
            })}
            ${ExternalLinkButton({
              href: REPO_DOCS_URL,
              icon: BookOpen,
              children: "Read the docs",
            })}
          </div>
        `,
    })}
    ${InfoCard({
      title: "License",
      children: `
          <p>ChessViewer is licensed under the <strong class="text-text-primary">${LICENSE_NAME}</strong>. In short, you are free to use, study, modify, and share it — but if you run a modified version, you must make your source available under the same license.</p>
          ${ExternalLinkButton({
            href: REPO_LICENSE_URL,
            icon: Scale,
            className: "mt-1",
            children: "Read the license",
          })}
        `,
    })}
    ${InfoCard({
      title: "Ways to help",
      children: `
          <ul class="space-y-3">
            <li class="flex gap-3">
              ${raw(GitPullRequest("mt-0-5 h-4 w-4 shrink-0 text-text-muted"))}
              <span><strong class="text-text-primary">Write code.</strong> Browse the open issues, pick something that interests you, and open a pull request. The contributing guide covers how to set up the project locally and the conventions the codebase follows. First contributions are welcome — there are issues labeled accordingly.</span>
            </li>
            <li class="flex gap-3">
              ${raw(Bug("mt-0-5 h-4 w-4 shrink-0 text-text-muted"))}
              <span><strong class="text-text-primary">Report bugs.</strong> A clear, reproducible bug report is genuinely one of the most useful things you can do. Include your browser, what you were doing, and what happened versus what you expected. Screenshots help.</span>
            </li>
            <li class="flex gap-3">
              ${raw(BookOpen("mt-0-5 h-4 w-4 shrink-0 text-text-muted"))}
              <span><strong class="text-text-primary">Improve the docs.</strong> If something in the documentation is unclear, missing, or just wrong — fix it. Small improvements add up and help everyone who comes after you.</span>
            </li>
            <li class="flex gap-3">
              ${raw(Languages("mt-0-5 h-4 w-4 shrink-0 text-text-muted"))}
              <span><strong class="text-text-primary">Tell people about it.</strong> If ChessViewer has saved you time, mention it. Share it with a coach, a chess blogger, a teacher who makes worksheets. Word of mouth is how small open-source tools grow.</span>
            </li>
          </ul>
          <div class="flex flex-wrap items-center gap-3 pt-2">
            ${ExternalLinkButton({
              href: REPO_CONTRIBUTING_URL,
              icon: GitPullRequest,
              children: "Contributing guide",
            })}
            ${ExternalLinkButton({
              href: REPO_ISSUES_URL,
              icon: Bug,
              children: "Browse open issues",
            })}
          </div>
        `,
    })}
  </div>`;
}

function DonateSection(): string {
  return html` <div class="about-section" data-donate-section>
    <div class="about-block">
      ${SectionHeading({ icon: Heart, title: "Donate" })}
      ${Lead({
        children: `First, the important part: ChessViewer is completely free and will always stay that way. No ads on the site, no &quot;Premium&quot; subscription, no hidden feature locked behind a paywall. If this tool has saved you time and you would like to support the project, we would genuinely appreciate it. But it is never required or expected.`,
      })}
    </div>

    ${InfoCard({
      title: "Why do we take donations?",
      children: `
          <p>To be upfront, right now we are only paying the domain cost out of pocket, and running everything else on free tiers. But as the project grows and more people use it, our database&apos;s free tier is bound to fill up eventually and we will have to move to a paid plan. Any small donation you make helps cover both our current domain cost and those database and server costs that are coming down the road.</p>
        `,
    })}
    ${InfoCard({
      title: "Sponsor badge",
      children: `
          <p>Supporting us financially does not unlock some hidden premium feature — every feature is already completely free for everyone. If you donate, it is simply because you find the project useful.</p>
          <p>That said, to not leave your support unacknowledged, we add a 1-month Sponsor Badge to your account. There are 4 different badge tiers depending on how much you give. Keep in mind this is not a social platform, so no one but you will ever see this badge — it is just our personal, visual way of saying &quot;thank you&quot; when you log in, for helping keep the project running.</p>
        `,
    })}
    ${InfoCard({
      title: "Crypto (USDT / USDC / ETH)",
      children: `
          <p>If you would rather support us with crypto, you can send USDT, USDC, or ETH to the single EVM wallet address below — the same address works for all three. Just double-check the address before you send anything.</p>
          ${Callout({
            children: `
              <div class="flex items-stretch gap-2">
                <code data-wallet="${CRYPTO_WALLET_ADDRESS}" class="min-w-0 flex-1 select-all break-all rounded-xl border border-border bg-surface px-4 py-3 font-mono text-base text-text-primary">${CRYPTO_WALLET_ADDRESS}</code>
                <button
                  type="button"
                  data-copy-wallet
                  class="inline-flex shrink-0 items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-hover"
                  aria-label="Copy crypto wallet address to clipboard"
                  title="Copy wallet address"
                >
                  ${raw(Copy("h-4 w-4"))}
                  <span class="hidden sm-inline">Copy</span>
                </button>
              </div>
              <p data-copied-msg hidden class="mt-2 text-sm text-success"
                >Wallet address copied</p
              >
            `,
          })}
        `,
    })}
    ${InfoCard({
      title: "Other ways to support, for free",
      children: `
          <p>Money is not the only way to help. Contributing code, writing good bug reports, improving the documentation, and simply telling other chess players about the tool all make a real difference.</p>
          <ul class="space-y-3 pt-1">
            <li class="flex gap-3">
              ${raw(Code2("mt-0-5 h-4 w-4 shrink-0 text-text-muted"))}
              <span>Contribute on GitHub.</span>
            </li>
            <li class="flex gap-3">
              ${raw(Megaphone("mt-0-5 h-4 w-4 shrink-0 text-text-muted"))}
              <span>Share ChessViewer with people who make chess diagrams.</span>
            </li>
          </ul>
          ${ExternalLinkButton({
            href: REPO_URL,
            icon: Code2,
            className: "mt-1",
            children: "View the project on GitHub",
          })}
        `,
    })}
  </div>`;
}

function PrivacySection(): string {
  return html` <div class="about-section">
    <div class="about-block">
      ${SectionHeading({ icon: Shield, title: "Privacy" })}
      ${Lead({
        children: `ChessViewer is built on a simple, transparent idea: your personal information and what you do here is absolutely none of our business. Everything happens right in your browser. There is no tracking code, no analytics, no ads on the site. If you never sign up for an account, not a single scrap of data about the positions you build ever leaves your device.`,
      })}
    </div>

    ${InfoCard({
      title: "What stays on your device (local)?",
      children: `
          <p>The positions you build, your FEN history, your favorites, the board colors you pick, and all your style settings are stored entirely in your browser&apos;s local storage. When you change something on the board or export an image, that happens using your own computer&apos;s memory and processor. No image or data gets sent to an outside server to be rendered.</p>
          <p>In short, as long as you do not create an account, nothing you do ever leaves your browser.</p>
        `,
    })}
    ${InfoCard({
      title: "No tracking, no ads, no analytics, period",
      children: `
          <p>There is no third-party analytics script, no advertising cookies, no tracking pixels running in the background. We do not know which positions you are working on, how much time you spend on the site, or what you export. The only kind of storage ChessViewer uses in your browser is functional — it just remembers your history so you do not start from zero every time you come back.</p>
        `,
    })}
    ${InfoCard({
      title: "Optional accounts and cloud sync",
      children: `
          <p>To say it again: you do not need an account to use the project. Creating one only makes sense if you want your settings and history to sync across devices — say, from your phone to your computer. That is the one and only reason accounts exist.</p>
          <p>When you sign in, your data syncs to the cloud through Supabase. Every table in Supabase is protected by row-level security. That means only you can read your own data — not other users, and not us either. The architecture is built so nobody can reach anyone else&apos;s data.</p>
          <p>Remember, the copy in your browser is always the primary one. The cloud is just a convenience layered on top. Even if your internet drops, your local data stays intact and you keep working offline.</p>
        `,
    })}
    ${InfoCard({
      title: "How is your account protected?",
      children: `
          <p>Sign-in and data storage run directly through Supabase. You can turn on Two-Factor Authentication (2FA) on your account for extra protection — we strongly recommend it.</p>
        `,
    })}
    ${InfoCard({
      title: "External database searches",
      children: `
          <p>If you use the &quot;database search&quot; feature on the site, only the FEN code of the position you are looking up gets sent, on your behalf, to external databases like Lichess and ChessDB. The ONLY thing that leaves your device is that short FEN code — not your history, not your account details, nothing else. And this only ever happens when you press the search button yourself. The site never searches those databases on its own in the background.</p>
        `,
    })}
    ${InfoCard({
      title: "Your data, your call",
      children: `
          <p>You can download a full backup of all your local data from the &quot;Data Management&quot; section in Settings, restore it whenever you want, or wipe it completely with one click. If you want your account and all your cloud data deleted for good, email us at
            <a href="mailto:${CONTACT_EMAIL}" class="about-text-link">${CONTACT_EMAIL}</a>
            and we will remove everything right away.</p>
        `,
    })}
  </div>`;
}

function ThanksSection(): string {
  const ext = (href: string, children: string): string =>
    html`<a href="${href}" target="_blank" rel="noopener noreferrer" class="about-text-link"
      >${children}</a
    >`;

  return html` <div class="about-section">
    <div class="about-block">
      ${SectionHeading({ icon: HeartHandshake, title: "Thanks" })}
      ${Lead({
        children: `ChessViewer is built with open source, and it tries to support open source in return. None of it would exist without the projects, tools, and communities below — thank you to everyone who builds and maintains them.`,
      })}
    </div>

    <div class="space-y-5 text-base leading-relaxed text-text-secondary">
      <p>
        The interface is a ${ext("https://preactjs.com", "Preact")} app written in
        ${ext("https://www.typescriptlang.org", "TypeScript")}, built with
        ${ext("https://vitejs.dev", "Vite")}, and styled with
        ${ext("https://tailwindcss.com", "Tailwind CSS")}. Fast navigation between pages is handled
        by ${ext("https://github.com/molefrog/wouter", "wouter")}, and the page transitions are
        hand-written in plain CSS. The board&apos;s interactivity — grabbing a piece and dropping it
        wherever you want — runs on our own custom drag-and-drop system built on the
        ${ext(
          "https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events",
          "Pointer Events API",
        )}.
      </p>
      <p>
        For long lists (like your FEN history) to scroll smoothly without freezing the browser, we
        use our own custom system built on
        ${ext(
          "https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API",
          "IntersectionObserver",
        )},
        the icons around the site come from ${ext("https://lucide.dev", "Lucide")}, and the QR codes
        for Two-Factor Authentication (2FA) are rendered with
        ${ext("https://github.com/nuintun/uqr", "uqr")}. All account handling, auth, and cloud sync
        are entrusted to ${ext("https://supabase.com", "Supabase")}.
      </p>
      <p>
        The app is packaged with ${ext("https://www.docker.com", "Docker")} and served by
        ${ext("https://nginx.org", "nginx")}. The position-database search would not be possible
        without the open chess data published by ${ext("https://lichess.org", "Lichess")} and
        ${ext("https://chessdb.cn/queryc_en/", "ChessDB")}, together with the problem collections at
        ${ext("https://pdb.dieschwalbe.de", "PDB (Problemdatenbank)")} and
        ${ext("https://www.yacpdb.org", "YACPDB")}.
      </p>

      <p>
        A special thanks goes to the open-source contributors who have helped shape the project at
        ${ext("https://github.com/chessviewer-org/chess-viewer", "chessviewer-org/chess-viewer")},
        including ${ext("https://github.com/vektorhub", "vektorhub")},
        ${ext("https://github.com/yu102118", "yu102118")}, and
        ${ext("https://github.com/iccccccccccccc", "iccccccccccccc")}, whose efforts have directly
        improved the codebase and the community.
      </p>

      <p>
        Finally, thank you to everyone who reports bugs, suggests improvements, contributes code,
        and simply uses ChessViewer. The project is better because of the community around it.
      </p>
    </div>
  </div>`;
}

// ===== Page =====
export function AboutPage(activeTab: string, year?: string): string {
  const validTab = VALID_TAB_IDS.includes(activeTab) ? activeTab : DEFAULT_TAB;

  const sectionMarkup = (() => {
    switch (validTab) {
      case "changelog":
        return ChangelogSection(year);
      case "faq":
        return FaqSection();
      case "contact":
        return ContactSection();
      case "privacy":
        return PrivacySection();
      case "contribute":
        return ContributeSection();
      case "donate":
        return DonateSection();
      case "thanks":
        return ThanksSection();
      case "about":
      default:
        return AboutSection();
    }
  })();

  return html`
    <div class="min-h-full bg-bg">
      <h1 class="sr-only">About ChessViewer</h1>
      ${PageSidebarLayout({
                                contentLabel: 'About content',
                                sidebar: PageTabs({
                                  groups,
                                  activeId: validTab,
                                  ariaLabel: 'About sections'
                                }),
                                children: sectionMarkup
                              })}
    </div>

    <script src="/donate-state.js"></script>
  `;
}
