import {
  BLOCK_RULE_ID_BASE,
  authAllowRegex,
  blockUrlRegex,
  type Allowances,
  type BlockEnforcement,
  type BlockTarget,
} from "@focus-tower/core";

const REDIRECT_PRIORITY = 1;
const ALLOW_PRIORITY = 2;

function blockedPageBase(): string {
  return chrome.runtime.getURL("/blocked/blocked.html");
}

/**
 * Two rules per blocked domain:
 *  - an `allow` rule (higher priority) that lets sign-in / OAuth hops through
 *    so cross-domain login (e.g. Google → youtube.com) keeps working;
 *  - a `redirect` rule that sends everything else to the tower, carrying the
 *    original URL in `from` (via the `\0` whole-match substitution) so the
 *    user can resume exactly where they were.
 */
export function buildChromeRules(activeBlocks: string[]): chrome.declarativeNetRequest.Rule[] {
  const base = blockedPageBase();
  const rules: chrome.declarativeNetRequest.Rule[] = [];

  activeBlocks.forEach((domain, index) => {
    const redirectId = BLOCK_RULE_ID_BASE + index * 2;
    const allowId = redirectId + 1;

    rules.push({
      id: allowId,
      priority: ALLOW_PRIORITY,
      action: { type: chrome.declarativeNetRequest.RuleActionType.ALLOW },
      condition: {
        regexFilter: authAllowRegex(domain),
        isUrlFilterCaseSensitive: false,
        resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME],
      },
    });

    rules.push({
      id: redirectId,
      priority: REDIRECT_PRIORITY,
      action: {
        type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
        redirect: {
          regexSubstitution: `${base}?domain=${encodeURIComponent(domain)}&from=\\0`,
        },
      },
      condition: {
        regexFilter: blockUrlRegex(domain),
        isUrlFilterCaseSensitive: false,
        resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME],
      },
    });
  });

  return rules;
}

export function createChromeBlockEnforcement(): BlockEnforcement {
  return {
    async syncBlockedTargets(blocked: BlockTarget[], allowances: Allowances) {
      const activeBlocks = blocked
        .filter((target) => target.kind === "domain" && !allowances[target.id])
        .map((target) => target.id);
      const addRules = buildChromeRules(activeBlocks);

      const existing = await chrome.declarativeNetRequest.getDynamicRules();
      const removeRuleIds = existing.map((rule) => rule.id);

      await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds, addRules });
    },
    async grantTemporaryAccess() {
      // DNR sync handles allowance state.
    },
    async revokeAccess() {
      // DNR sync handles allowance state.
    },
  };
}
