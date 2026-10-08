import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/config";
import { doc, setDoc, getDoc } from "firebase/firestore";

// GET: El Frontend de LabVault pide el estado de todas las PCs
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get("tenantId");

    if (!tenantId) {
      return NextResponse.json({});
    }

    const snap = await getDoc(doc(db, "telemetry", tenantId));
    if (snap.exists()) {
      return NextResponse.json(snap.data());
    }

    return NextResponse.json({});
  } catch (error) {
    return NextResponse.json({}, { status: 500 });
  }
}

// POST: El Agente instalado en cada PC envía su estado en vivo
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tenantId, hostname, mice, keyboards } = body;

    if (!tenantId || !hostname) {
      return NextResponse.json({ error: "Faltan datos de la institucion" }, { status: 400 });
    }

    const telemetryRef = doc(db, "telemetry", tenantId);
    
    // 1. Obtener estado anterior para comparar (ALERTA ANTIRROBO)
    const snap = await getDoc(telemetryRef);
    if (snap.exists()) {
      const pastData = snap.data()[hostname.toLowerCase()];
      if (pastData) {
        // ¿Tenía más mouses antes que ahora? ¡Alarma!
        if (pastData.mice > mice) {
          console.warn(`[🚨 ALERTA ANTIRROBO] Host ${hostname} en Escuela ${tenantId} perdió un Mouse!`);
          // Aquí puedes meter código para enviar un mensaje a Telegram / WhatsApp / Email
          // await fetch("https://api.telegram.org/bot<TOKEN>/sendMessage?chat_id=<ID>&text=ROBO_DETECTADO")
        }
        if (pastData.keyboards > keyboards) {
          console.warn(`[🚨 ALERTA ANTIRROBO] Host ${hostname} en Escuela ${tenantId} perdió un Teclado!`);
        }
      }
    }

    // 2. Actualizar la PC en la nube
    await setDoc(telemetryRef, {
      [hostname.toLowerCase()]: {
        lastSeen: new Date().toISOString(),
        mice,
        keyboards,
        status: "online"
      }
    }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Telemetry Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
