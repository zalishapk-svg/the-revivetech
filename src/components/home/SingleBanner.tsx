import React from "react";
import { motion } from "framer-motion";

export const SingleBanner: React.FC = () => {
  const imageUrl = "https://cdn.shopify.com/s/files/1/0610/4642/3631/files/govee.jpg?v=1786431339";

  return (
    <section className="w-full bg-[#161616] overflow-hidden my-2 border-t border-b border-emerald-900/30">
      <motion.a
        href={imageUrl}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="block w-full cursor-pointer relative group overflow-hidden"
        title="View Govee Collection"
      >
        <img
          src={imageUrl}
          alt="Govee Ambient Lighting Banner"
          referrerPolicy="no-referrer"
          className="w-full h-auto object-cover sm:object-contain object-center transition-transform duration-700 group-hover:scale-[1.015]"
        />
        <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-colors duration-500 pointer-events-none" />
      </motion.a>
    </section>
  );
};
