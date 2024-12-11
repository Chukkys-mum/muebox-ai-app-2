'use client';

/*eslint-disable*/

export default function Footer() {
  return (
    <div className="flex w-full flex-col items-center justify-between px-1 pb-4 pt-2 h-[30px] xl:flex-row">
      <p className="mb-2 text-center text-sm font-medium text-zinc-500 dark:text-zinc-400 sm:!mb-0 md:text-lg">
        <span className="mb-2 text-center text-xs text-zinc-500 dark:text-zinc-400 sm:!mb-0 md:text-xs">
          ©{new Date().getFullYear()} Muebox Ai. All Rights Reserved.
        </span>
      </p>
      <div>
        <ul className="flex flex-wrap items-center gap-3 sm:flex-nowrap md:gap-10">
          <li>
            <a
              target="blank"
              href="mailto:hello@simmmple.com"
              className="text-xs font-medium text-zinc-500 hover:text-foreground dark:text-zinc-400"
            >
              FAQs
            </a>
          </li>
          <li>
            <a
              target="blank"
              href="https://horizon-ui.com/"
              className="text-xs font-medium text-zinc-500 hover:text-foreground dark:text-zinc-400"
            >
              Privacy Policy
            </a>
          </li>
          <li>
            <a
              target="blank"
              href="https://horizon-ui.com/boilerplate"
              className="text-xs font-medium text-zinc-500 hover:text-foreground dark:text-zinc-400"
            >
              Terms & Conditions
            </a>
          </li>
          <li>
            <a
              target="blank"
              href="https://blog.horizon-ui.com/"
              className="text-xs font-medium text-zinc-500 hover:text-foreground dark:text-zinc-400"
            >
              Refund Policy
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}  