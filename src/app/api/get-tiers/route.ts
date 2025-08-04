/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@supabase/supabase-js";
import { ethers } from "ethers";
import ABI from "@/lib/abi.json";

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_KEY as string
);

const RPC_URL = process.env.RPC_URL as string;
const STAKING_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS as string;

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

    console.log('Fetched Tiers =>', tiers);

    // Setup contract provider for sliding APY data
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, ABI, provider);

    // Combine tier data with active stakes statistics and sliding APY data
    const enhancedTiers = await Promise.all(
      tiers.map(async (tier) => {
        console.log(tier)
        const tierStat = tierStatsMap[tier.id] || { count: 0, sum: 0 };
        
        // Fetch sliding APY data from contract
        let isSliding = false;
        let minApy = undefined;
        let maxApy = undefined;
        
        try {
          console.log(`Fetching sliding APY for tier ${tier.id}`);
          isSliding = await contract.tierIsSliding(tier.id);
          console.log(`Tier ${tier.id} isSliding:`, isSliding);
          if (isSliding) {
            minApy = await contract.tierMinApy(tier.id);
            maxApy = await contract.tierMaxApy(tier.id);
          }
        } catch (error) {
          console.warn(`Failed to fetch sliding APY data for tier ${tier.id}:`, error);
          // Default to non-sliding if contract calls fail
        }
        
        return {
          ...tier,
          min_stake: tier.min_stake,
          max_stake: tier.max_stake,
          active_stakes_count: tierStat.count,
          active_stakes_amount: tierStat.sum,
          isSliding,
          minApy: minApy ? Number(minApy) : undefined,
          maxApy: maxApy ? Number(maxApy) : undefined,
          reward_tokens: tier.reward_tokens
            .map((relation: { token: any; }) => relation.token)
            .filter((token: any) => token) // Filter out any nulls
        };
      })
    );

    return Response.json({
      tiers: enhancedTiers
    });
  } catch (error) {
    console.error('Tiers API Error:', error);
    return Response.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}