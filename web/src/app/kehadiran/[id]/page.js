"use client";
import Navbar from "../../../components/Navbar";
import { useParams } from "next/navigation";

const names = {
  kbm: "KBM (Kegiatan Belajar Mengajar)",
  shalat: "Kehadiran Shalat",
  halaqoh: "Halaqoh Qur'an",
  "amal-jamai": "Amal Jama'i",
};

export default function KehadiranDetailPage() {
  const { id } = useParams();
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-3xl mx-auto p-4 py-8">
        <h1 className="text-2xl font-bold text-primary-dark mb-2">{names[id] || "Kehadiran"}</h1>
        <p className="text-text-secondary">Detail kehadiran akan ditampilkan di sini.</p>
      </main>
    </div>
  );
}
