import { NextResponse } from "next/server";
import { getSession, getValidAccessToken } from "@/lib/session";

interface DataExtension {
  id: string;
  key: string;
  name: string;
  description?: string;
  categoryId?: number;
}

interface MCAttributeSetResponse {
  count: number;
  page: number;
  pageSize: number;
  items: Array<{
    definitionID: string;
    definitionKey: string;
    definitionName: {
      value: string;
    };
    connectingID?: {
      identifierType: string;
    };
    categoryID?: number;
  }>;
}

export async function GET(request: Request) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Not logged in" },
        { status: 401 }
      );
    }

    // Get valid access token (auto-refresh if expired)
    const accessToken = await getValidAccessToken();

    if (!accessToken) {
      return NextResponse.json(
        {
          error: "Token expired",
          code: "TOKEN_EXPIRED",
          message: "Unable to refresh token. Please log in again.",
        },
        { status: 401 }
      );
    }

    // Re-fetch session to get potentially updated restInstanceUrl
    const updatedSession = await getSession();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "50", 10);

    // Ensure restInstanceUrl ends with /
    const baseUrl = updatedSession.restInstanceUrl?.endsWith("/")
      ? updatedSession.restInstanceUrl
      : `${updatedSession.restInstanceUrl}/`;

    // Try Contact Builder API - /contacts/v1/attributeSetDefinitions
    // This lists attribute sets which include Data Extensions linked to contacts
    const apiUrl = `${baseUrl}contacts/v1/attributeSetDefinitions`;

    console.log("Fetching attribute sets from:", apiUrl);

    const response = await fetch(`${apiUrl}?$page=${page}&$pageSize=${pageSize}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("MC API Error:", response.status, errorText);

      // Return helpful info about the API limitation
      return NextResponse.json(
        {
          error: "Unable to list Data Extensions",
          message: "Marketing Cloud REST API doesn't have a direct endpoint to list all Data Extensions. The SOAP API is required for this functionality.",
          debug: {
            endpoint: apiUrl,
            status: response.status,
            restInstanceUrl: updatedSession.restInstanceUrl,
            details: errorText,
          },
          suggestion: "Ensure your API Integration has the required scopes: data_extensions_read, list_and_subscribers_read",
        },
        { status: response.status }
      );
    }

    const data: MCAttributeSetResponse = await response.json();

    // Transform the response
    const dataExtensions: DataExtension[] = data.items?.map((item) => ({
      id: item.definitionID,
      key: item.definitionKey,
      name: item.definitionName?.value || item.definitionKey,
      categoryId: item.categoryID,
    })) || [];

    return NextResponse.json({
      dataExtensions,
      pagination: {
        page: data.page || page,
        pageSize: data.pageSize || pageSize,
        total: data.count || dataExtensions.length,
      },
      note: "This endpoint returns Attribute Sets from Contact Builder, not all Data Extensions.",
    });
  } catch (error) {
    console.error("Error fetching Data Extensions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
