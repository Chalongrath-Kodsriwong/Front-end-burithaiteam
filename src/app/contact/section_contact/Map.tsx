"use client";
import { useEffect, useState } from "react";

export default function Map() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="container px-0 mx-auto p-2">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3874.930924379733!2d100.5789439!3d14.3132509!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x311d892d62668531%3A0xaccda8798f8eeb2a!2z4LiV4Li14Lii4LmA4LiI4Liy4Lij4Liw4Lih4LiK4Li1IOC4leC4suC4m-C4o-C4seC4meC5gOC4n-C4sOC5gOC4lOC4hOC4qg!5e0!3m2!1sth!2sth!4v1697040000000!5m2!1sth!2sth"
        width="100%"
        height="400"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
