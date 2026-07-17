import { Injectable } from '@nestjs/common';
import type { Position } from '@adjacent/shared';
import { ilAt, short } from './position-facts';

const usd = (value: number | null): string =>
  value === null ? 'an unknown amount' : `$${value.toFixed(2)}`;

/**
 * Deterministic, always-available explainer. Produces grounded plain-English
 * text purely from the position's computed numbers — the $0 base layer and the
 * fallback whenever Groq is unavailable.
 */
@Injectable()
export class TemplateExplainer {
  explain(position: Position): string {
    switch (position.type) {
      case 'staking':
        return this.staking(position);
      case 'lp':
        return this.lp(position);
      default:
        return this.generic(position);
    }
  }

  private staking(position: Position): string {
    const rawMon = position.metrics.underlyingMON;
    const mon = rawMon === undefined ? '' : short(String(rawMon));
    const rate = position.metrics.exchangeRate ?? '';
    return `You're staking ${mon} MON as shMON, currently worth ${usd(position.valueUSD)}. ${rate ? `Each shMON is worth more MON over time (${rate}) as staking rewards accrue, so your balance grows on its own. ` : ''}This is a low-risk position — there's no loan or liquidation to worry about.`;
  }

  private lp(position: Position): string {
    const inRange = position.metrics.range === 'In range';
    const rangeSentence = inRange
      ? `It's in range, so it's actively earning trading fees.`
      : `It's out of range right now, so it isn't earning fees until the price moves back into your band.`;

    const up = ilAt(position, 0.5);
    const ilSentence = up
      ? ` If the two tokens' prices diverge by 50%, you'd be down about ${up} compared with simply holding them.`
      : '';

    const feesSentence =
      position.rewards.length > 0
        ? ` You have uncollected fees waiting to be claimed.`
        : '';

    return `You've provided liquidity to the ${position.label} pool, currently worth ${usd(position.valueUSD)}. ${rangeSentence}${feesSentence}${ilSentence}`;
  }

  private generic(position: Position): string {
    return `Your ${position.label} position is currently worth ${usd(position.valueUSD)}. ${position.risk.reason}`;
  }
}
