import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const city = body.city;

    if (!city) {
      return NextResponse.json({ success: false, error: "City is required" }, { status: 400 });
    }

    const apiKey = process.env.GEOLOCATION_KEY; // store your key in .env.local
    const url = `https://api.opencagedata.com/geocode/v1/json`;

    const geoRes = await axios.get(url, {
      params: {
        q: city,
        key: apiKey,
      },
    });

    const results = geoRes.data.results;
    if (results.length === 0) {
      return NextResponse.json({ success: false, error: "Location not found" }, { status: 404 });
    }

    const { lat, lng } = results[0].geometry;

    return NextResponse.json({
      success: true,
      location: {
        city,
        lat,
        lon: lng,
      },
    });
  } catch (error) {
    console.error("Geolocation error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
