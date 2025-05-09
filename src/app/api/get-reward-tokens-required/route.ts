/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_KEY as string
);
export async function GET() {
  try {
    const { data: stakes, error: stakesError } = await supabase
      .from('stakes')
      .select(`
        tiers:tier_id (
          id,
          name,
          apy,
          reward_tokens:tier_reward_tokens(
            token:token_address(
              address,
              symbol
            )
          )
        ),
        amount
      `)
      .eq('has_withdrawn', false)
      .eq('has_claimed_rewards', false);
    if (stakesError) {
      console.error('Error fetching rewards:', stakesError);
      return Response.json({ error: "Failed to fetch rewards" }, { status: 500 });
    };

    const { data: tokens, error: tokensError } = await supabase
      .from('reward_tokens')
      .select(`
        address,
        symbol,
        is_active
      `)
      .eq('is_active', true)
    if (tokensError) {
      console.error('Error fetching reward_tokens:', tokensError);
      return Response.json({ error: "Failed to fetch reward_tokens" }, { status: 500 });
    };
    
    tokens.push({
      address: process.env.NEXT_PUBLIC_KTTY_TOKEN_ADDRESS!,
      symbol: "KTTY",
      is_active: true
    })
      
    // Process rewards
    const rewards: Record<string, {
      address: string;
      amount: number;
      stakes: number;
    }> = {};

    // Initialize rewards with tokens
    tokens.forEach((token: any) => {
      if (token.symbol) {
        rewards[token.symbol] = {
          address: token.address,
          amount: 0,
          stakes: 0,
        };
      }
    });

    stakes.forEach((stake: any) => {
      if (stake.tiers && stake.tiers.reward_tokens) {
        const rws = stake.tiers.reward_tokens;
        rws.push({
          token: {
            symbol: "KTTY",
            address: process.env.NEXT_PUBLIC_KTTY_TOKEN_ADDRESS!
          }
        })
        rws.forEach((tokenRel: any) => {
          if (tokenRel.token) {
            const token = tokenRel.token;
            const rewardAmount = (stake.amount * ((parseFloat(stake.tiers.apy) / 100000) / 100))
            if (rewards[token.symbol] === undefined) {
              return;
            }
            rewards[token.symbol].amount += rewardAmount;
            if (token.symbol === "KTTY") {
              rewards[token.symbol].stakes += stake.amount;
            }
          }
        });
      }
    })
    
    
    return Response.json(rewards);
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return Response.json({ error: "Failed to fetch rewards data" }, { status: 500 });
  }
}
