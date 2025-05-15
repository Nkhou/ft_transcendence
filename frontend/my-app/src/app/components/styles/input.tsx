"use client";
import "@/app/components/slider.css"
import React from "react";
import {Input} from "@nextui-org/react";

export default function Inpp() {
    const variants = ["flat", "bordered", "underlined", "faded"];
    return (
        <div className="w-full flex flex-col gap-4">
          {variants.map((variant) => (
            <div key={variant} className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4">
              <Input type="email" variant={"flat"} label="Email" placeholder="Enter your email" />
            </div>
          ))}  
        </div>  
      );
}