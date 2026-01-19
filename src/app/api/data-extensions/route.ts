import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

interface DataExtension {
  id: string;
  key: string;
  name: string;
  description?: string;
  isSendable: boolean;
  isTestable: boolean;
  rowCount?: number;
  createdDate?: string;
  modifiedDate?: string;
}

// Response from /hub/v1/dataevents (sendable DEs)
interface MCDataEventsResponse {
  count: number;
  page: number;
  pageSize: number;
  items: Array<{
    eventDefinitionKey: string;
    name: string;
    description?: string;
    createdDate: string;
    modifiedDate?: string;
  }>;
}

export async function GET(request: Request) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.accessToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if token is expired
    if (session.tokenExpiresAt && Date.now() > session.tokenExpiresAt) {
      return NextResponse.json(
        { error: "Token expired", code: "TOKEN_EXPIRED" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "50", 10);

    // Marketing Cloud REST API - use /hub/v1/dataevents for sendable Data Extensions
    // Note: This only returns sendable DEs. For all DEs, SOAP API would be needed.
    const deApiUrl = `${session.restInstanceUrl}hub/v1/dataevents`;

    const response = await fetch(`${deApiUrl}?$page=${page}&$pageSize=${pageSize}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("MC API Error:", response.status, errorText);

      return NextResponse.json(
        {
          error: "Failed to fetch Data Extensions",
          details: errorText,
          status: response.status
        },
        { status: response.status }
      );
    }

    const data: MCDataEventsResponse = await response.json();

    // Transform the response
    const dataExtensions: DataExtension[] = data.items?.map((item) => ({
      id: item.eventDefinitionKey,
      key: item.eventDefinitionKey,
      name: item.name,
      description: item.description,
      isSendable: true, // All items from dataevents are sendable
      isTestable: false,
      createdDate: item.createdDate,
      modifiedDate: item.modifiedDate,
    })) || [];

    return NextResponse.json({
      dataExtensions,
      pagination: {
        page: data.page || page,
        pageSize: data.pageSize || pageSize,
        total: data.count || dataExtensions.length,
      },
    });
  } catch (error) {
    console.error("Error fetching Data Extensions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
