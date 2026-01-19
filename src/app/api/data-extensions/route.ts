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

interface MCDataExtensionResponse {
  count: number;
  page: number;
  pageSize: number;
  items: Array<{
    id: string;
    key: string;
    name: string;
    description?: string;
    isSendable: boolean;
    isTestable: boolean;
    rowBasedRetention?: boolean;
    rowCount?: number;
    createdDate?: string;
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

    // Marketing Cloud REST API endpoint for Data Extensions
    const apiUrl = `${session.restInstanceUrl}data/v1/customobjectdata/query`;

    // Use the Data Extension query endpoint with SOAP-style query
    // Alternative: Use the asset API for metadata
    const assetApiUrl = `${session.restInstanceUrl}asset/v1/content/assets`;

    // First, try the Data Extension specific endpoint
    const deApiUrl = `${session.restInstanceUrl}data/v1/customobjectdefinitions`;

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

      // If the endpoint doesn't work, return a helpful error
      return NextResponse.json(
        {
          error: "Failed to fetch Data Extensions",
          details: errorText,
          status: response.status
        },
        { status: response.status }
      );
    }

    const data: MCDataExtensionResponse = await response.json();

    // Transform the response
    const dataExtensions: DataExtension[] = data.items?.map((item) => ({
      id: item.id,
      key: item.key,
      name: item.name,
      description: item.description,
      isSendable: item.isSendable,
      isTestable: item.isTestable,
      rowCount: item.rowCount,
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
