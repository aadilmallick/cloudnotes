import Link from "next/link";
import { SubmitButton } from "../Buttons";
import { signInAction } from "@/actions/actions";

const SigninForm = () => {
  return (
    <form
      action={signInAction}
      className="border border-white/30 bg-white backdrop-blur-3xl shadow-lg rounded-3xl px-3 py-6 space-y-2 max-w-md w-[95vw]"
    >
      <h3 className="text-3xl font-bold text-center">Sign in</h3>
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-base text-gray-800 font-semibold"
        >
          Email
        </label>
        <input
          required
          placeholder="Email"
          // autoComplete="email"
          id="email"
          name="email"
          type="email"
          className="form-input w-full block overflow-hidden rounded-xl text-gray-900 focus:outline-0 focus:ring-2 focus:ring-blue-400 border border-gray-300 bg-gray-50 focus:outline-none h-14 placeholder:text-gray-500 p-[15px] text-base font-normal leading-normal"
        />
      </div>
      <div className="space-y-2 mt-4">
        <label
          htmlFor="password"
          className="text-base text-gray-800 font-semibold"
        >
          Password
        </label>
        <input
          name="password"
          className="form-input w-full block overflow-hidden rounded-xl text-gray-900 focus:outline-0 focus:ring-2 focus:ring-blue-400 border border-gray-300 bg-gray-50 focus:outline-none h-14 placeholder:text-gray-500 p-[15px] text-base font-normal leading-normal"
          required
          type="password"
          id="password"
          placeholder="Password"
        />
      </div>
      <SubmitButton
        label="Sign In"
        className="mt-12 bg-blue-500 rounded-full px-6 py-3 text-base cursor-pointer hover:opacity-75 transition-opacity text-white font-semibold w-full disabled:opacity-50 disabled:cursor-not-allowed"
      />

      <div className="text-center">
        <p>
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="text-blue-700/50 capitalize font-medium"
          >
            sign up
          </Link>
        </p>
      </div>
    </form>
  );
};

export default SigninForm;
