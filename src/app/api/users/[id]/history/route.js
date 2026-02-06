import { db, schema } from "@/db";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
        return NextResponse.json({ error: "Invalid User ID" }, { status: 400 });
    }

    try {
        const history = await db.query.videoHistory.findMany({
            where: eq(schema.videoHistory.userId, userId),
            orderBy: [desc(schema.videoHistory.timestamp)],
            with: {
                project: {
                    columns: {
                        title: true,
                    }
                }
            }
        });

        // Format the response
        const formattedHistory = history.map(item => ({
            id: item.id,
            videoTitle: item.project?.title || "Unknown Video",
            department: item.department,
            timestamp: item.timestamp,
            action: item.action
        }));

        return NextResponse.json(formattedHistory);
    } catch (error) {
        console.error("Failed to fetch user history:", error);
        return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
    }
}
