"use client";

import { redirect } from "next/navigation";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useEffect, useState } from "react";

export default function Home() {
  redirect("/calendar");
}
