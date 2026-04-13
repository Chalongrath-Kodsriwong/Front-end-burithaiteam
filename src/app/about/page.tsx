"use client";
import "flowbite";
import { useEffect, useState } from "react";

import Banner from "./section_about/Banner";
import Ourservice from "./section_about/Ourservice";
import Ourmission from "./section_about/Ourmission";

export default function AboutPage() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    return (
        <div className="container mx-auto px-4 py-4 my-2 rounded-lg">
            <h1 className="text-3xl font-bold text-center">เกี่ยวกับเรา</h1>
            {isClient && (
                <>
                    <div className="section_promote">
                        <Banner />
                    </div>
                    <div className="section_ourservice">
                        <Ourservice />
                    </div>
                    <div className="section_mission">
                        <Ourmission />
                    </div>
                </>
            )}
        </div>
    );
}