export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { runAllTests } from "@/lib/__tests__/github-tracker.test";

export async function GET() {
  try {
    const results = await runAllTests();
    const success = results.failed === 0;

    return NextResponse.json({
      success,
      ...results,
      message: success
        ? `All ${results.total} tests passed`
        : `${results.failed} of ${results.total} tests failed`,
    }, { status: success ? 200 : 500 });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : String(err),
    }, { status: 500 });
  }
}
