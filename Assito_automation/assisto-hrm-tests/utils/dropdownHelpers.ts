import { Page, Locator } from '@playwright/test';

export interface SelectComboboxResult {
  clicked: boolean;
  via?: string;
  reason?: string;
  options: string[];
}

export interface SelectComboboxOptions {
  /** Skip typing a filter value (useful for search-style comboboxes) */
  noFilter?: boolean;
  /** Text typed into the combobox to filter options (defaults to value) */
  filterText?: string;
  /** Text used to match the option (defaults to value) */
  matchText?: string;
  /**
   * Skip the opening Escape keypress.
   *
   * The Escape exists to dismiss a stray open dropdown, which is harmless on a
   * full page. Inside a MODAL it is not: Escape closes the dialog, and the
   * combobox is detached before it can be clicked. Modal-hosted comboboxes
   * (e.g. Temporary Registration) must pass this.
   */
  skipEscape?: boolean;
}

/**
 * Select an option from a MUI-style combobox (autocomplete) by visible text.
 *
 * Flow:
 *  1. Close any open dropdown, focus/click the combobox
 *  2. Type a filter (unless noFilter) to narrow the options
 *  3. Find the matching [role="option"] in the aria-controls listbox (or
 *     document-wide fallback) and click it via evaluate (works even when the
 *     option is rendered inside a portal and is not a Playwright-composed locator)
 *  4. Fall back to ArrowDown + Enter if no option matched
 *
 * Returns the result so callers can log the resolved value.
 */
export async function selectComboboxOption(
  page: Page,
  combobox: Locator,
  value: string,
  options: SelectComboboxOptions = {},
): Promise<SelectComboboxResult> {
  const { noFilter = false, filterText, matchText, skipEscape = false } = options;
  const filterInput = filterText ?? value;
  const matchInput = matchText ?? value;

  if (!skipEscape) {
    await page.keyboard.press('Escape');
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  await combobox.click({ force: true });
  await new Promise(resolve => setTimeout(resolve, 500));
  // Not every role="combobox" is editable: Fluent renders some as a BUTTON
  // (a Dropdown) rather than an <input> (a Combobox), and fill() times out
  // against those. Clearing is only meaningful when a filter is about to be
  // typed anyway, so a failure here is not fatal.
  await combobox.fill('').catch(() => {});
  await new Promise(resolve => setTimeout(resolve, 200));
  if (!noFilter) {
    await page.keyboard.type(filterInput, { delay: 30 });
    await new Promise(resolve => setTimeout(resolve, 800));
  } else {
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  const comboId = (await combobox.getAttribute('id')) ?? '';
  const result = await page.evaluate(({ searchValue, comboId: cid }) => {
    const combo = document.getElementById(cid) || document.querySelector('[role="combobox"][aria-expanded="true"]');
    if (!combo) return { clicked: false, options: [], reason: 'no combobox found' };
    const listboxId = combo.getAttribute('aria-controls');
    const listbox = listboxId ? document.getElementById(listboxId) : null;
    const allOptions = listbox
      ? listbox.querySelectorAll('[role="option"]')
      : document.querySelectorAll('[role="option"]');
    const optionTexts: string[] = [];
    const escaped = searchValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const searchRe = new RegExp('\\b' + escaped + '\\b', 'i');
    let fallback: Element | null = null;
    for (let i = 0; i < allOptions.length; i++) {
      const opt = allOptions[i];
      const text = opt.textContent?.trim() || '';
      optionTexts.push(text);
      if (searchRe.test(text)) {
        (opt as HTMLElement).click();
        return { clicked: true, options: optionTexts };
      }
      if (!fallback && text.includes(searchValue)) {
        fallback = opt;
      }
    }
    if (fallback) {
      (fallback as HTMLElement).click();
      return { clicked: true, options: optionTexts, via: 'fallback' };
    }
    return { clicked: false, options: optionTexts, reason: 'no match' };
  }, { searchValue: matchInput, comboId });

  if (result.options.length > 0) {
    console.log(`Dropdown options for "${value}": [${result.options.join(', ')}]`);
  }
  if (result.clicked) {
    console.log(`Clicked option for "${value}" via evaluate`);
  } else {
    console.log(`Option not found via evaluate, trying ArrowDown + Enter`);
    await page.keyboard.press('ArrowDown');
    await new Promise(resolve => setTimeout(resolve, 200));
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  await page.keyboard.press('Escape');
  await new Promise(resolve => setTimeout(resolve, 200));
  return result;
}
