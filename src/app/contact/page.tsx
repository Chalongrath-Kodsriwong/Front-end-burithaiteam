"use client";
import "flowbite";
import { useEffect, useState } from "react";
import ContactForm from "./section_contact/Contactform";
import ContactAddress from "./section_contact/Contactaddress";
import Map from "./section_contact/Map";

export default function ContactPage() {
    const [isClient, setIsClient] = useState(false);
    
    useEffect(() => {
        setIsClient(true);
    }, []);
    
    return (
        <div className="container px-0 mx-auto p-2">
        {isClient && (
            <div className="flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
            <div className="content flex flex-col md:flex-row gap-8 w-full max-w-1xl">
                <div className="left md:w-1/2">
                    <div>
                        <Map />
                    </div>
                    <div>
                        <ContactAddress />
                    </div>
                </div>
                <div className="right md:w-1/2">
                    <ContactForm />
                </div>
            </div>
            </div>
        )}
        </div>
    );
}