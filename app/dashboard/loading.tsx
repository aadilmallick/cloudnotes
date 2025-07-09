import { Spinner } from "@/components/utilities/Spinner";
import React from "react";

const loading = () => {
  return (
    <section className="h-screen flex items-center justify-center">
      <Spinner />
    </section>
  );
};

export default loading;
