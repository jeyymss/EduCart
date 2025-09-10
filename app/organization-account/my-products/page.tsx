"use client";

import Image from "next/image";
import { useCurrentOrganization } from "@/hooks/queries/useCurrentOrg";

export default function OrgMyProducts() {
    const { data: org, isLoading, error } = useCurrentOrganization();

    return (
        <div>
            
        </div>
    )
}