/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_KEY as string
);

export async function GET() {
  try {
    // Get active stakes counts and amounts by tier using aggregation
    const { data: tierStats, error: tierStatsError } = await supabase
      .from('stakes')
      .select('tier_id, id.count(), amount.sum()')
      .eq('has_withdrawn', false);
      
    if (tierStatsError) {
      console.error('Error fetching tier statistics:', tierStatsError);
      return Response.json({ error: "Failed to fetch tier statistics" }, { status: 500 });
    }
    
    // Create a map of tier stats for easy lookup
    const tierStatsMap: Record<string, { count: number; sum: number }> = {};
    tierStats.forEach(stat => {
      tierStatsMap[stat.tier_id] = {
        count: stat.count,
        sum: stat.sum
      };
    });
    
    // Fetch tiers with their reward tokens
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

    // Combine tier data with active stakes statistics
    return Response.json({
      tiers: tiers.map(tier => {
        console.log(tier)
        const tierStat = tierStatsMap[tier.id] || { count: 0, sum: 0 };
        
        return {
          ...tier,
          min_stake: tier.min_stake,
          max_stake: tier.max_stake,
          active_stakes_count: tierStat.count,
          active_stakes_amount: tierStat.sum,
          reward_tokens: tier.reward_tokens
            .map((relation: { token: any; }) => relation.token)
            .filter((token: any) => token) // Filter out any nulls
        };
      })
    });
  } catch (error) {
    console.error('Tiers API Error:', error);
    return Response.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}