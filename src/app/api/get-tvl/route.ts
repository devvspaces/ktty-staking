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
      .select('amount.sum()')
      .eq('has_withdrawn', false)
      .eq('has_claimed_rewards', false);
    if (activeStakesCountError) {
      console.error('Error fetching activeStakesCount:', activeStakesCountError);
      return Response.json({ error: "Failed to fetch activeStakesCount" }, { status: 500 });
    };
    return Response.json({
      tvl: activeStakesCount[0].sum ?? 0,
    });
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return Response.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
