import { html, raw } from "../../helpers/html";
import { ChevronLeft, ChevronRight } from "../icons";
import { getSlots } from "./getSlots";

const DOT_SIZE: Record<"active" | "normal" | "faded", number> = {
  active: 20,
  normal: 8,
  faded: 6,
};

export interface PaginationProps {
  page: number;
  pageCount: number;
  hrefFor: (page: number) => string;
  label?: string;
  className?: string;
}

export function Pagination({
  page,
  pageCount,
  hrefFor,
  label = "Pagination",
  className = "",
}: PaginationProps): string {
  if (pageCount <= 1) return "";

  const prevPage = (page - 1 + pageCount) % pageCount;
  const nextPage = (page + 1) % pageCount;

  const dots = getSlots(page, pageCount)
    .map((slot) => {
      if (slot.kind === "ellipsis") {
        return html`<span
          key="ellipsis-${slot.side}"
          aria-hidden="true"
          class="pagination-ellipsis"
        ></span>`;
      }
      const active = slot.page === page;
      return html`<a
        key="${slot.page}"
        href="${hrefFor(slot.page)}"
        aria-label="Page ${slot.page + 1} of ${pageCount}"
        ${active ? 'aria-current="page"' : ""}
        style="width: ${DOT_SIZE[slot.tone]}px; height: ${DOT_SIZE[slot.tone]}px"
        class="pagination-dot pagination-dot-${slot.tone}"
      ></a>`;
    })
    .join("");

  return html`<nav aria-label="${label}" class="pagination ${className}">
    <a href="${hrefFor(prevPage)}" aria-label="Previous page" class="pagination-arrow"
      >${raw(ChevronLeft("h-4 w-4"))}</a
    >

    <div class="pagination-dots">${raw(dots)}</div>

    <a href="${hrefFor(nextPage)}" aria-label="Next page" class="pagination-arrow"
      >${raw(ChevronRight("h-4 w-4"))}</a
    >
  </nav>`;
}
