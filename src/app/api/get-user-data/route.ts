/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_KEY as string
);
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner");
  if (!owner) {
    return Response.json({ error: "Owner is required" }, { status: 400 });
  }
  const BATCH = 1000;
  const stakes: any[] = [];
  for (let from = 0; ; from += BATCH) {
    const to = from + BATCH - 1;
    const { data, error } = await supabase
      .from("stakes")
      .select()
      .eq("owner", true)
      .range(from, to);
    if (error) throw error;
    stakes.push(...data!);
    // once you get fewer than BATCH, you’re done
    if (data!.length < BATCH) break;
  }

  return Response.json({
    stakes,
  });
}
