import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q =
      searchParams.get("q") ||
      "Glioblastoma Multiforme treatment protocols guidelines";
    const apiKey =
      process.env.SERPAPI_API_KEY ||
      process.env.NEXT_PUBLIC_SERPAPI_KEY ||
      "43b998c9292cc532f31d2cdd0bab4fba76118da240a1a38ee16cd1b6f891f179";

    const serpApiUrl = `https://serpapi.com/search.json?engine=google_scholar&q=${encodeURIComponent(
      q
    )}&api_key=${apiKey}`;

    const res = await fetch(serpApiUrl);
    const data = await res.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("[SerpApi Proxy] Error querying Google Scholar:", error);
    return NextResponse.json(
      { error: "Failed to fetch SerpApi clinical literature", details: String(error) },
      { status: 500 }
    );
  }
}
