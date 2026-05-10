"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const ChildContext = createContext(null);

export function ChildProvider({ children }) {
  const [santriList, setSantriList] = useState([]);
  const [selectedSantri, setSelectedSantriState] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSantriList = useCallback(async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/portal/children`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        const list = data.children || [];
        setSantriList(list);

        // Pulihkan pilihan terakhir dari localStorage
        const savedId = localStorage.getItem("selected_santri_id");
        const restored = list.find((s) => s.id === savedId) || list[0] || null;
        setSelectedSantriState(restored);
      } else {
        setSantriList([]);
        setSelectedSantriState(null);
      }
    } catch (error) {
      console.error("Gagal mengambil data anak:", error);
      setSantriList([]);
      setSelectedSantriState(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSantriList();
  }, [fetchSantriList]);

  const setSelectedSantri = (santri) => {
    setSelectedSantriState(santri);
    localStorage.setItem("selected_santri_id", santri.id);
  };

  return (
    <ChildContext.Provider value={{ santriList, selectedSantri, setSelectedSantri, loading, refetch: fetchSantriList }}>
      {children}
    </ChildContext.Provider>
  );
}

export function useChild() {
  const ctx = useContext(ChildContext);
  if (!ctx) throw new Error("useChild harus digunakan di dalam ChildProvider");
  return ctx;
}
