/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@supabase/supabase-js";
import moment from "moment";

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_KEY as string
);

type Stake = {
  id: number;
  amount: number;
  lockupPeriod: number;
  startDate: string;
  endDate: string;
  tier: number;
  status: "active" | "ready-to-claim" | "claimed";
  rewards: Record<string, number>;
  progress: number;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = parseInt(searchParams.get("from") || "1");
  const page_count = parseInt(searchParams.get("page_count") || "10");
  const status = searchParams.get("status") || "active";
  const tierId = searchParams.get("tierId") || null;
  const search = searchParams.get("search") || null;

  try {
    // Fetch stakes along with their tier information
    let query = supabase.from("stakes").select(`
      id,
      amount,
      owner,
      start_time,
      end_time,
      has_withdrawn,
      has_claimed_rewards,
      tier_id,
      tiers:tier_id (
        name,
        apy,
        lockup_period,
        reward_tokens:tier_reward_tokens (
          token:token_address (
            address,
            symbol,
            reward_rate
          )
        )
      )
    `);
    let counter = supabase.from("stakes").select(`
      id.count()
    `);

    if (search) {
      query = query.ilike("owner", `%${search}%`);
    }
    if (tierId) {
      query = query.eq("tier_id", tierId);
    }
    const now = Math.floor(Date.now() / 1000);
    switch (status) {
      case "active":
        query = query.eq("has_withdrawn", false);
        counter = counter.eq("has_withdrawn", false);
        break;
      case "ready-to-claim":
        query = query.lt("end_time", now);
        counter = counter.lt("end_time", now);
        break;
      case "claimed":
        query = query.eq("has_withdrawn", true);
        counter = counter.eq("has_withdrawn", true);
        break;
      default:
        break;
    }

    const { data: stakes, error: stakesError } = await query
      .order("created_at", { ascending: true })
      .range(from, from + page_count - 1);

    if (stakesError) {
      console.error("Error fetching stakes:", stakesError);
      return Response.json(
        { error: "Failed to fetch stakes" },
        { status: 500 }
      );
    }

    const { data: stakes_count, error: stakesCountError } = await counter;
    if (stakesCountError) {
      console.error("Error fetching stakes count:", stakesCountError);
      return Response.json(
        { error: "Failed to fetch stakes count" },
        { status: 500 }
      );
    }
    const total_count = stakes_count[0].count;

    // Current timestamp in seconds
    const currentTime = Math.floor(Date.now() / 1000);

    // Transform data to match the required format
    const formattedStakes: Stake[] = stakes.map((stake: any) => {
      // Calculate progress (0-100%)
      const totalDuration = Number(stake.end_time) - Number(stake.start_time);
      const elapsed = currentTime - Number(stake.start_time);
      const progress = Math.min(
        Math.max(Math.floor((elapsed / totalDuration) * 100), 0),
        100
      );

      // Determine stake status
      let status: "active" | "ready-to-claim" | "claimed" = "active";
      if (stake.has_claimed_rewards || stake.has_withdrawn) {
        status = "claimed";
      } else if (currentTime >= Number(stake.end_time)) {
        status = "ready-to-claim";
      }

      // Process rewards
      const rewards: Record<string, number> = {};
      if (stake.tiers && stake.tiers.reward_tokens) {
        const rws = stake.tiers.reward_tokens;
        rws.push({
          token: {
            symbol: "KTTY",
          },
        });
        rws.forEach((tokenRel: any) => {
          if (tokenRel.token) {
            const token = tokenRel.token;
            const rewardAmount =
              stake.amount * (parseFloat(stake.tiers.apy) / 100000 / 100);
            rewards[token.symbol] = rewardAmount;
          }
        });
      }

      return {
        id: Number(stake.id),
        amount: stake.amount,
        lockupPeriod: stake.tiers
          ? Number(stake.tiers.lockup_period) / (24 * 60 * 60)
          : 0,
        startDate: moment(new Date(Number(stake.start_time) * 1000)).format(
          "YYYY-MM-DD HH:mm:ss"
        ),
        endDate: moment(new Date(Number(stake.end_time) * 1000)).format(
          "YYYY-MM-DD HH:mm:ss"
        ),
        tier: Number(stake.tier_id),
        tierName: stake.tiers ? stake.tiers.name : "Unknown",
        status,
        rewards,
        progress,
        owner: stake.owner,
      };
    });

    return Response.json({ stakes: formattedStakes, total: total_count });
  } catch (error) {
    console.error("Error processing stakes:", error);
    return Response.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
