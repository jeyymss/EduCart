"use client";

import { useEffect, useState } from "react";

export default function UserWalletPage() {
    const [balance, setBalance] = useState<number | null>(null);

    useEffect(() => {
        async function load() {
            const res = await fetch("api/wallet/get");
            const data = await res.json();

            setBalance(data.balance);
        }

        load();
    }, []);

    return (
        <div className="text-center p-10">
            <div>
                <h1>Wallet Dashboard</h1>
            </div>
            <div>
                <h3>Current Balance</h3>
                <p>Available Funds</p>
                <p>Balance: ₱{balance?.toFixed(2)}</p>
            </div>
        </div>
        
    );
}
