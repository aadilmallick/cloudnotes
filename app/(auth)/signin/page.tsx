import SigninForm from "@/components/auth/SignInForm";
import { Spinner } from "@/components/utilities/Spinner";
import {
  NextJSSearchParamsZod,
  SearchParamsType,
} from "@/utils/NextJSSearchParams";
import React, { Suspense } from "react";
import { z } from "zod";

const signinSPModel = new NextJSSearchParamsZod(
  z.object({
    error: z.string(),
  })
);

const SignInPage = ({ searchParams }: { searchParams: SearchParamsType }) => {
  return (
    <section className="h-screen main-gradient-bg grid place-items-center">
      <Suspense fallback={<Spinner />}>
        <SuspensePage searchParams={searchParams} />
      </Suspense>
    </section>
  );
};

async function SuspensePage({
  searchParams,
}: {
  searchParams: SearchParamsType;
}) {
  const sparams = await searchParams;
  const payload = signinSPModel.getSearchParams(sparams);
  return (
    <>
      {payload && (
        <div className=" bg-red-200 max-w-md w-[90vw] p-4 rounded-md shadow-2xl">
          <p className="text-red-700/75 font-semibold text-base">
            Error: {payload.error}
          </p>
        </div>
      )}
      <SigninForm />
    </>
  );
}

export default SignInPage;
