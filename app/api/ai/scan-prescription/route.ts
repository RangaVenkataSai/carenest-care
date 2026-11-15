import { NextRequest, NextResponse } from 'next/server';
import { analyzePrescriptionImage } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType = 'image/jpeg', existingMedications = [] } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: 'Image base64 data required' }, { status: 400 });
    }

    // Clean data URL prefix if present
    const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

    const result = await analyzePrescriptionImage(cleanBase64, mimeType, existingMedications);

    return NextResponse.json({
      success: true,
      data: result,
      source: process.env.GEMINI_API_KEY ? 'gemini-2.0-flash' : 'clinical-intelligence-engine',
    });
  } catch (error: unknown) {
    console.error('Scan error:', error);
    const message = error instanceof Error ? error.message : 'Failed to scan medication';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
