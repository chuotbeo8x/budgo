import { NextResponse } from 'next/server';
import { getAppSettings, updateAppSettings } from '@/lib/actions/settings';

export async function GET() {
  try {
    const data = await getAppSettings();
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Không lấy được cài đặt' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { maintenanceEnabled, logoUrl, siteName, copyright, updatedBy } = body || {};
    await updateAppSettings({ maintenanceEnabled, logoUrl, siteName, copyright, updatedBy });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Không lưu được cài đặt' }, { status: 500 });
  }
}


