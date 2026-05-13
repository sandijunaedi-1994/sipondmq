"use client";

import { useState, useEffect } from "react";

export function usePermissions() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("admin_permissions");
      if (stored) {
        setPermissions(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse admin permissions from localStorage", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const hasAccess = (permissionId) => {
    // If permissionId is null, it means it's publicly accessible to any logged-in admin
    if (!permissionId) return true;
    // MANAJEMEN_ADMIN is the Superadmin bypass permission
    if (permissions.includes("MANAJEMEN_ADMIN")) return true;
    return permissions.includes(permissionId);
  };

  return { permissions, hasAccess, loading };
}
