"use client";
import React from "react";
import { Vortex } from "@/app/components/login-signup/back";
import { useTranslation } from "react-i18next";


// "event": {
//   "events": "الأحداث",
//   "GameNight": "ليلة اللعبة",
//   "descriptionGameNight": "انضم إلينا لليلة لعبة ملحمية!",
//   "Tournament": "بطولة",
//   "descriptionTournament": "شارك في بطولتنا السنوية.",
//   "Holidaybash": "حفلة العطلات",
//   "descriptionHolidaybash": "احتفل بالموسم معنا!"
    
// }
const Events: React.FC = () => {
  const { t } = useTranslation();
  
  const events = [
    { date: "2024-11-30", title: t('event.GameNight'), description: t('event.descriptionGameNight') },
    { date: "2024-12-05", title: t('event.Tournament'), description: t('event.descriptionTournament') },
    { date: "2024-12-10", title: t('event.Holidaybash'), description: t('event.descriptionHolidaybash') },
  ];
  return (
    <>
      <div className="absolute flex-1 flex-col items-center justify-center rounded-lg overflow-hidden h-[30vh] z-0 w-[95%]">
        <div className="absolute top-0 left-0 w-full h-full object-cover opacity-90 z-[-1]">
          <Vortex
            particleCount={100}
            baseRadius={1}
            baseHue={700}
            baseSpeed={21}
            backgroundColor="rgba(6, 0, 9, 0.2)"
          />
        </div>

        <div className="relative z-10 text-center text-gray-800 dark:text-gray-100 font-[abelhid] flex flex-col items-center justify-center h-full w-full">
          <h2 className="font-[walo] text-[2rem] lg:text-[3rem] text-gradient tracking-lg">
            
          </h2>
          <p className="font-[walo] text-[2rem] lg:text-[5rem] font-light mb-6 max-w-[70rem] text-pink-300">
          {t('event.events')}
          </p>
          <div className="flex flex-row gap-8 fle-wrap ">
            {events.map((event, index) => (
              <div key={index} className="flex flex-col items-center justify-center">
                <div className="text-xl lg:text-2xl font-[walo] text-gradient">{event.title}</div>
                <div className="text-white text-sm lg:text-base">{event.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Events;
