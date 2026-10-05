"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const cities = ["Cape Town", "Johannesburg", "Stellenbosch", "Pretoria", "Durban"];
const BUCKET = "property-images";
const COMPRESSION_TIMEOUT = 15_000;
const UPLOAD_TIMEOUT = 30_000;

type UploadState = "idle" | "uploading" | "done" | "error";

function withTimeout<T>(promise: Promise<T>, milliseconds: number, message: string) {
  let timeoutId: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), milliseconds);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

async function compressImage(file: File) {
  const imageUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = imageUrl;
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("The image could not be read."));
    });

    const maxDimension = 2_000;
    const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => (result ? resolve(result) : reject(new Error("Image compression failed."))), "image/jpeg", 0.82);
    });
    return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.jpg`, { type: "image/jpeg" });
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

async function uploadWithProgress(file: File, path: string, onProgress: (value: number) => void) {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) throw new Error("Your session has expired. Please sign in again.");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !publishableKey) throw new Error("Supabase upload configuration is missing.");

  await withTimeout(new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", `${supabaseUrl}/storage/v1/object/${BUCKET}/${encodeURIComponent(path).replace(/%2F/g, "/")}`);
    request.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    request.setRequestHeader("apikey", publishableKey);
    request.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(50 + Math.round((event.loaded / event.total) * 49));
    };
    request.onerror = () => reject(new Error("The upload network request failed."));
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) resolve();
      else {
        try {
          const body = JSON.parse(request.responseText);
          reject(new Error(body.message || body.error || `Supabase rejected the upload (${request.status}).`));
        } catch {
          reject(new Error(`Supabase rejected the upload (${request.status}).`));
        }
      }
    };
    request.send(file);
  }), UPLOAD_TIMEOUT, "The upload took longer than 30 seconds.");
}

export default function ListPropertyPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", city: cities[0], suburb: "", price_zar: "", room_type: "Single room", description: "", amenities: "", whatsapp_number: "", contact_email: "", image_url: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  function update(key: string, value: string) { setForm((f) => ({ ...f, [key]: value })); }

  async function uploadImage(file: File) {
    setSelectedFile(file); setUploadState("uploading"); setUploadProgress(5); setUploadError(null);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) throw new Error("Your session has expired. Please sign in again.");
      let uploadFile = file;
      try {
        setUploadProgress(15);
        uploadFile = await withTimeout(compressImage(file), COMPRESSION_TIMEOUT, "Image compression took longer than 15 seconds.");
        setUploadProgress(45);
      } catch {
        uploadFile = file;
        setUploadProgress(45);
      }
      const path = `${user.id}/${Date.now()}-${file.name}`;
      await uploadWithProgress(uploadFile, path, setUploadProgress);
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      update("image_url", data.publicUrl);
      setUploadProgress(100); setUploadState("done");
    } catch (uploadFailure) {
      setUploadState("error"); setUploadProgress(0);
      setUploadError(uploadFailure instanceof Error ? uploadFailure.message : "The image upload failed.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError(null);
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) { router.push("/signin?next=/list-property"); return; }
    const { error: insertError } = await supabase.from("listings").insert({ owner_id: user.id, title: form.title, city: form.city, suburb: form.suburb, price_zar: Number(form.price_zar), room_type: form.room_type, description: form.description, amenities: form.amenities.split(",").map((a) => a.trim()).filter(Boolean), whatsapp_number: form.whatsapp_number, contact_email: form.contact_email, image_url: form.image_url || null, verified: false });
    setLoading(false);
    if (insertError) { setError(insertError.message); return; }
    router.push("/dashboard");
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-14">
      <h1 className="font-display font-800 text-3xl mb-2">List Your Room</h1>
      <p className="text-white/50 mb-8">New listings are reviewed before being marked &quot;Verified&quot;, but go live immediately.</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input required placeholder="Listing title" value={form.title} onChange={(e) => update("title", e.target.value)} className="bg-transparent border border-panelborder rounded-lg px-4 py-3 text-sm placeholder:text-white/40 focus:border-gold outline-none" />
        <div className="grid grid-cols-2 gap-4"><select value={form.city} onChange={(e) => update("city", e.target.value)} className="bg-ink border border-panelborder rounded-lg px-4 py-3 text-sm focus:border-gold outline-none">{cities.map((c) => <option key={c} value={c}>{c}</option>)}</select><input required placeholder="Suburb" value={form.suburb} onChange={(e) => update("suburb", e.target.value)} className="bg-transparent border border-panelborder rounded-lg px-4 py-3 text-sm placeholder:text-white/40 focus:border-gold outline-none" /></div>
        <div className="grid grid-cols-2 gap-4"><input required type="number" min={0} placeholder="Price per month (R)" value={form.price_zar} onChange={(e) => update("price_zar", e.target.value)} className="bg-transparent border border-panelborder rounded-lg px-4 py-3 text-sm placeholder:text-white/40 focus:border-gold outline-none" /><select value={form.room_type} onChange={(e) => update("room_type", e.target.value)} className="bg-ink border border-panelborder rounded-lg px-4 py-3 text-sm focus:border-gold outline-none"><option>Single room</option><option>Studio apartment</option><option>Shared house</option><option>Full apartment</option></select></div>
        <textarea required rows={4} placeholder="Description" value={form.description} onChange={(e) => update("description", e.target.value)} className="bg-transparent border border-panelborder rounded-lg px-4 py-3 text-sm placeholder:text-white/40 focus:border-gold outline-none" />
        <input placeholder="Amenities, comma separated (Wifi, Furnished, Parking...)" value={form.amenities} onChange={(e) => update("amenities", e.target.value)} className="bg-transparent border border-panelborder rounded-lg px-4 py-3 text-sm placeholder:text-white/40 focus:border-gold outline-none" />
        <div className="flex flex-col gap-2"><label htmlFor="property-image" className="text-sm text-white/70">Upload Images</label><input id="property-image" type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) void uploadImage(file); }} className="text-sm text-white/70 file:mr-3 file:rounded-lg file:border-0 file:bg-gold file:px-3 file:py-2 file:text-ink" />{selectedFile && <p className="text-xs text-white/50">{selectedFile.name}</p>}{uploadState === "uploading" && <div role="status" aria-live="polite"><div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-gold transition-[width]" style={{ width: `${uploadProgress}%` }} /></div><p className="mt-1 text-xs text-white/60">Uploading &amp; Compressing... {uploadProgress}%</p></div>}{uploadState === "done" && <p className="text-xs text-green-400">Photo uploaded successfully.</p>}{uploadState === "error" && <div className="flex items-center justify-between gap-3 text-sm text-red-400"><span>{uploadError}</span><button type="button" onClick={() => selectedFile && void uploadImage(selectedFile)} className="rounded border border-white/20 px-3 py-1 text-white hover:border-gold">Retry</button></div>}</div>
        <div className="grid grid-cols-2 gap-4"><input required placeholder="WhatsApp number (27...)" value={form.whatsapp_number} onChange={(e) => update("whatsapp_number", e.target.value)} className="bg-transparent border border-panelborder rounded-lg px-4 py-3 text-sm placeholder:text-white/40 focus:border-gold outline-none" /><input required type="email" placeholder="Contact email" value={form.contact_email} onChange={(e) => update("contact_email", e.target.value)} className="bg-transparent border border-panelborder rounded-lg px-4 py-3 text-sm placeholder:text-white/40 focus:border-gold outline-none" /></div>
        {error && <p className="text-red-400 text-sm">{error}</p>}<button disabled={loading || uploadState === "uploading"} className="gold-btn rounded-lg py-3 font-medium disabled:opacity-60">{loading ? "Publishing..." : "Publish Listing"}</button>
      </form>
    </div>
  );
}
