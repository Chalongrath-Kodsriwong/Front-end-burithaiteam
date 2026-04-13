"use client";
import "flowbite";
import { FaFacebook, FaLine, FaPhoneAlt } from "react-icons/fa";
import { SiWechat } from "react-icons/si";

export default function ContactForm() {
  const socialLinks = [
    {
      name: "Facebook",
      icon: FaFacebook,
      href: "https://www.facebook.com/LEDDisplaylightingSoundSystem",
    },
    // {
    //   name: "Line",
    //   icon: FaLine,
    //   href: "https://line.me/ti/p/~burithaiteam",
    // },
    // {
    //   name: "WeChat",
    //   icon: SiWechat,
    //   href: "https://wechat.com",
    // },
    {
      name: "Phone",
      icon: FaPhoneAlt,
      href: "tel:0912991970",
      phone: "091-299-1970",
    },
  ];

  return (
    <div className="container flex justify-center align-middle mx-auto p-2 mt-20">
      <div className="flex flex-col gap-10 items-start justify-start">
        {socialLinks.map((social) => {
          const Icon = social.icon;
          const colorClass =
            social.name === "Facebook"
              ? "text-blue-600"
              : social.name === "Line"
                ? "text-green-600"
                : social.name === "WeChat"
                  ? "text-green-700"
                  : social.name === "Phone"
                    ? "text-black"
                  : "text-black";

          return (
            <a
              key={social.name}
              href={social.href}
              target={social.name === "Phone" ? undefined : "_blank"}
              rel={social.name === "Phone" ? undefined : "noopener noreferrer"}
              title={social.name}
              aria-label={social.name}
              className={`inline-flex items-center gap-10 text-gray-900 ${
                social.name === "Phone" ? "ml-5" : ""
              }`}
            >
              <Icon
                className={`${social.name === "Phone" ? "h-12 w-12" : "h-20 w-20"} ${colorClass}`}
              />
              <div className={social.name === "Phone" ? "ml-4" : ""}>
                <span className="text-2xl font-medium">
                  {social.name === "Phone" ? "คุณ บุรี" : social.name}
                </span>
                <p className="text-lg">
                  {social.name === "Phone" ? social.phone : "BuriThaiTeam"}
                </p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
