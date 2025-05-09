/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_KEY as string
);
export async function GET() {
  try {
    // Calculate totals and active stakes
    const { data: activeStakesCount, error: activeStakesCountError } = await supabase
      .from('stakes')
      .select('id.count(), amount.sum()')
      .eq('has_withdrawn', false)
      .eq('has_claimed_rewards', false);
    if (activeStakesCountError) {
      console.error('Error fetching activeStakesCount:', activeStakesCountError);
      return Response.json({ error: "Failed to fetch activeStakesCount" }, { status: 500 });
    };
    const activeStakes = activeStakesCount[0].count;
    const totalStaked = activeStakesCount[0].sum;

    const { data: completedStakesCount, error: completedStakesCountError } = await supabase
      .from('stakes')
      .select('id.count()')
      .eq('has_withdrawn', true);
    if (completedStakesCountError) {
      console.error('Error fetching completedStakesCount:', completedStakesCountError);
      return Response.json({ error: "Failed to fetch completedStakesCount" }, { status: 500 });
    };
    const completedStakes = completedStakesCount[0].count;
    
    const { data: stakesCount, error: stakesCountError } = await supabase
      .from('stakes')
      .select('id.count()');
    if (stakesCountError) {
      console.error('Error fetching stakesCount:', stakesCountError);
      return Response.json({ error: "Failed to fetch stakesCount" }, { status: 500 });
    };
    const totalStakes = stakesCount[0].count;
    
    // Fetch rewards distributed
    const { data: rewardsData, error: rewardsError } = await supabase
      .from('reward_claims')
      .select('amount, token_address');
    
    if (rewardsError) throw rewardsError;
    
    // Calculate rewards by token
    const rewardsByToken: Record<string, number> = {};
    let totalKttyRewards = 0;
    let otherTokenRewards = 0;
    
    for (const reward of rewardsData) {
      if (!rewardsByToken[reward.token_address]) {
        rewardsByToken[reward.token_address] = 0;
      }
      rewardsByToken[reward.token_address] += parseFloat(reward.amount);
    }
    
    // Assuming KTTY token address is known
    const kttyTokenAddress = process.env.NEXT_PUBLIC_KTTY_TOKEN_ADDRESS!;
    totalKttyRewards = rewardsByToken[kttyTokenAddress] || 0;
    
    // Sum other token rewards
    for (const [address, amount] of Object.entries(rewardsByToken)) {
      if (address !== kttyTokenAddress) {
        otherTokenRewards += amount;
      }
    }
    
    // Fetch recent stakes with details
    const { data: recentStakes, error: recentStakesError } = await supabase
      .from('stakes')
      .select(`
        id,
        owner,
        amount,
        tier_id,
        start_time,
        end_time,
        has_withdrawn,
        has_claimed_rewards,
        tiers:tier_id (
          name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (recentStakesError) throw recentStakesError;
    
    // Format recent stakes
    const formattedRecentStakes = recentStakes.map(stake => {
      // Current timestamp in seconds
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Determine stake status
      let status = "active";
      if (stake.has_withdrawn) {
        status = "completed";
      } else if (currentTime >= Number(stake.end_time)) {
        status = "ready";
      }
      
      // Format the start date
      const startDate = new Date(Number(stake.start_time) * 1000).toISOString().split('T')[0];
      
      return {
        wallet: stake.owner,
        amount: stake.amount,
        tier: (stake as any).tiers?.name || `Tier ${stake.tier_id}`,
        tierRaw: stake.tier_id,
        startDate,
        status
      };
    });
    
    // Calculate stakes distribution by tier
    const tierDistribution: Record<string, {
      name: string;
      amount: number;
      percentage: number;
    }> = {};
    
    // First, fetch all tiers to get their names
    const { data: allTiers, error: tiersError } = await supabase
      .from('tiers')
      .select('id, name');
    if (tiersError) {
      console.error('Error fetching allTiers:', tiersError);
      return Response.json({ error: "Failed to fetch tiers" }, { status: 500 });
    };

    const { data: tierGroup, error: tierGroupError } = await supabase
      .from('stakes')
      .select(`
        tier_id,
        amount.sum()
      `)
      .eq('has_withdrawn', false)
      .eq('has_claimed_rewards', false);
    if (tierGroupError) {
      console.error('Error fetching tierGroup:', tierGroupError);
      return Response.json({ error: "Failed to fetch tierGroup" }, { status: 500 });
    };
    
    // Initialize distribution with 0 for all tiers
    allTiers.forEach(tier => {
      tierDistribution[tier.id] = {
        name: tier.name,
        amount: 0,
        percentage: 0
      };
    });

    // Calculate distribution
    tierGroup.forEach(stake => {
      const tierId = stake.tier_id;
      if (tierDistribution[tierId]) {
        tierDistribution[tierId].amount = stake.sum;
      }
    });
    
    // Calculate percentages
    Object.keys(tierDistribution).forEach(tierId => {
      if (totalStaked > 0) {
        tierDistribution[tierId].percentage = 
          (tierDistribution[tierId].amount / totalStaked) * 100;
      }
    });
    
    // Return dashboard data
    const resData = {
      overview: {
        totalStaked,
        activeStakes,
        completedStakes,
        totalStakes,
        totalRewards: {
          ktty: totalKttyRewards,
          other: otherTokenRewards
        }
      },
      recentStakes: formattedRecentStakes,
      stakesDistribution: tierDistribution // Sort by tier name
    };
    
    return Response.json(resData);
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return Response.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
