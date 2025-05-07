/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_KEY as string
);
export async function GET() {
  const { data: tiers, error: tierError } = await supabase
    .from('tiers')
    .select(`
      *,
      reward_tokens:tier_reward_tokens(
        token:token_address(
          address,
          symbol
        )
      )
    `)
    .order('id', { ascending: true });
    
  if (tierError) {
    console.error('Error fetching tiers:', tierError);
    return Response.json({ error: "Failed to fetch tiers" }, { status: 500 });
  }

  return Response.json({
    tiers: tiers.map(tier => {
      return {
        ...tier,
        reward_tokens: tier.reward_tokens
          .map((relation: { token: any; }) => relation.token)
          .filter((token: any) => token) // Filter out any nulls
      };
    })
  });
}
