import { type Locator } from '@playwright/test';

/**
 * Dispatches a native pointerdown/mousedown/pointerup/mouseup/click event
 * sequence on the last action-icon-like element within a grid row, bypassing
 * Playwright's positional actionability engine.
 *
 * Extracted from two independent, near-identical implementations
 * (CandidateRegistrationPage.openCandidateDetail, LetterGenerationPage.clickViewLetter)
 * that both hit the same problem: every locator-driven click (plain, force,
 * hover+click, boundingBox+mouse) hung or timed out against a virtualized
 * grid's scroll/actionability behavior, while a native DOM click() dispatched
 * directly works regardless of scroll/viewport state.
 *
 * Callers keep their own pre/post logic (e.g. asserting a button was found,
 * verifying the resulting navigation) — this helper only does the element
 * resolution + event dispatch, since that's the part that was genuinely
 * identical between the two call sites.
 */
export async function dispatchNativeClickOnRowAction(
  row: Locator,
  opts: { cellSelector?: string; buttonSelector?: string } = {},
): Promise<boolean> {
  const {
    cellSelector = '[role="gridcell"]',
    buttonSelector = 'button, [role="button"], svg, a, [class*="icon" i]',
  } = opts;

  return row.evaluate((rowEl, sels) => {
    const cells = rowEl.querySelectorAll(sels.cellSelector);
    const lastCell = cells[cells.length - 1] ?? rowEl;
    const button = lastCell.querySelector(sels.buttonSelector);
    if (!button) {
      return false;
    }
    const eventOpts = { bubbles: true, cancelable: true, view: window };
    button.dispatchEvent(new PointerEvent('pointerdown', eventOpts));
    button.dispatchEvent(new MouseEvent('mousedown', eventOpts));
    button.dispatchEvent(new PointerEvent('pointerup', eventOpts));
    button.dispatchEvent(new MouseEvent('mouseup', eventOpts));
    button.dispatchEvent(new MouseEvent('click', eventOpts));
    return true;
  }, { cellSelector, buttonSelector });
}
