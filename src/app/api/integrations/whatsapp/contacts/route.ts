import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// GET - Get WhatsApp contacts
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get contacts from database
    const contacts = await getWhatsAppContacts(userId);

    return NextResponse.json({
      success: true,
      data: { contacts },
    });
  } catch (error) {
    console.error("Error fetching WhatsApp contacts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch WhatsApp contacts" },
      { status: 500 }
    );
  }
}

// POST - Add new WhatsApp contact
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { name, phone, source = "manual" } = await request.json();

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, error: "Name and phone are required" },
        { status: 400 }
      );
    }

    // Validate phone number format
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    // Create new contact
    const newContact = await createWhatsAppContact({
      userId,
      name,
      phone: cleanPhone,
      source,
    });

    return NextResponse.json({
      success: true,
      data: newContact,
      message: "Contact added successfully",
    });
  } catch (error) {
    console.error("Error creating WhatsApp contact:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create WhatsApp contact" },
      { status: 500 }
    );
  }
}

async function getWhatsAppContacts(userId: string) {
  try {
    // TODO: Replace with actual database query
    // For now, return contacts from leads database that have phone numbers

    // Simulate fetching contacts from leads
    const mockContacts = [
      {
        id: "contact_1",
        name: "John Smith",
        phone: "+15550123456",
        lastMessage: "Thanks for the demo!",
        lastMessageTime: new Date(
          Date.now() - 2 * 60 * 60 * 1000
        ).toISOString(),
        unreadCount: 0,
        status: "active",
        source: "lead_import",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "contact_2",
        name: "Sarah Johnson",
        phone: "+15550123457",
        lastMessage: "When can we schedule a call?",
        lastMessageTime: new Date(
          Date.now() - 1 * 60 * 60 * 1000
        ).toISOString(),
        unreadCount: 2,
        status: "active",
        source: "lead_import",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "contact_3",
        name: "Mike Davis",
        phone: "+15550123458",
        lastMessage: "I'll get back to you next week",
        lastMessageTime: new Date(
          Date.now() - 4 * 60 * 60 * 1000
        ).toISOString(),
        unreadCount: 0,
        status: "inactive",
        source: "manual",
        createdAt: new Date(
          Date.now() - 10 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
    ];

    return mockContacts;
  } catch (error) {
    console.error("Error getting WhatsApp contacts:", error);
    return [];
  }
}

async function createWhatsAppContact(contactData: {
  userId: string;
  name: string;
  phone: string;
  source: string;
}) {
  try {
    // TODO: Implement actual database insertion
    const newContact = {
      id: `contact_${Date.now()}`,
      ...contactData,
      lastMessage: null,
      lastMessageTime: null,
      unreadCount: 0,
      status: "active",
      createdAt: new Date().toISOString(),
    };

    return newContact;
  } catch (error) {
    console.error("Error creating WhatsApp contact:", error);
    throw error;
  }
}
