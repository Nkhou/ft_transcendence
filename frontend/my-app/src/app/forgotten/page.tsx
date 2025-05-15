"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/app/services/api";
import { TextGenerateEffect } from "../components/styles/text-shadow"; // Assuming this is your custom component
import { Vortex } from "../components/login-signup/back"; // Assuming this is your custom component
import { useTranslation } from "react-i18next"; // Assuming you are using react-i18next for translations

const Page = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const { t } = useTranslation(); // Using the translation hook

  const handleSendEmail = async () => {
    if (email) {
      try {
        const response = await api.post("api/users/forgot-password/", { email });
        if (response.status === 200) {
          setMessage(`
            <div class="success-message">
              <h2>${t("forgotPassword.checkEmail")}</h2>
              <p>${t("forgotPassword.emailSentMessage")} <strong>${email}</strong>. ${t("forgotPassword.checkInbox")}</p>
            </div>
          `);
        } else {
          setMessage(`
            <div class="error-message">
              <p>${t("forgotPassword.errorSending")}</p>
            </div>
          `);
        }
      } catch (error) {
        setMessage(`
          <div class="error-message">
            <p>${t("forgotPassword.errorSending")}</p>
          </div>
        `);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen overflow-hidden bg-black">
      {/* Vortex Background */}
      {/* <Vortex particleCount={1000} className="top-0 left-0 w-full h-full " backgroundColor="rgba(6, 0, 9, 0.7)" /> */}

      {/* Foreground */}
      <div className="relative flex items-center justify-center w-screen h-screen text-white z-10">
        <div className="flex flex-col items-center gap-8 p-6 bg-opacity-80 bg-black rounded-lg shadow-lg">
          <TextGenerateEffect
            words={t("forgotPassword.title")}
            className="text-3xl font-bold text-purple-300 text-center animate-pulse font-[abelhid]"
          />

          {/* Input and Button */}
          <div className="flex flex-col items-center w-full gap-4">
            <input
              type="email"
              placeholder={t("forgotPassword.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-[20rem] h-10 px-4 text-black rounded-md outline-none focus:ring-2 focus:ring-purple-400 font-medium placeholder:text-gray-600 shadow-md hover:shadow-lg font-[abelhid]"
            />
            <button
              onClick={handleSendEmail}
              className="w-[10rem] h-10 font-semibold text-white transition-transform transform bg-purple-500 rounded-md hover:scale-105 hover:bg-purple-600 shadow-md font-[ssb]"
            >
              {t("forgotPassword.sendButton")}
            </button>
          </div>
          <div
            className="mt-4 text-sm text-center text-purple-300"
            dangerouslySetInnerHTML={{ __html: message }}
          />
        </div>
      </div>
    </div>
  );
};

export default Page;
