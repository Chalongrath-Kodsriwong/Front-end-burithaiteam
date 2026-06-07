"use client";
import "flowbite";
import { FaFacebook, FaLine } from "react-icons/fa";
import { Phone } from "lucide-react";
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
      icon: Phone,
      href: "tel:087-368-3548",
      phone: "087-368-3548",
    },
  ];

  return (
    <div className="container mx-auto p-2 mt-6">
      <h2 className="text-2xl font-bold text-gray-100 mb-6 section-title">ช่องทางการติดต่อ</h2>
      <div className="flex flex-col gap-5">
        {socialLinks.map((social) => {
          const Icon = social.icon;
          const iconColor =
            social.name === "Facebook" ? "text-blue-400" : "text-yellow-500";

          return (
            <a
              key={social.name}
              href={social.href}
              target={social.name === "Phone" ? undefined : "_blank"}
              rel={social.name === "Phone" ? undefined : "noopener noreferrer"}
              aria-label={social.name}
              className="flex items-center gap-5 p-4 rounded-xl bg-[#111827] border border-[rgba(212,175,55,0.15)]
                hover:border-yellow-500/60 hover:bg-[#1a2035] transition-all duration-300 group"
            >
              <Icon className={`h-10 w-10 shrink-0 ${iconColor} group-hover:scale-110 transition-transform duration-300`} />
              <div>
                <p className="text-base font-semibold text-gray-100">
                  {social.name === "Phone" ? "คุณ บุรี" : social.name}
                </p>
                <p className="text-sm text-gray-400">
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
